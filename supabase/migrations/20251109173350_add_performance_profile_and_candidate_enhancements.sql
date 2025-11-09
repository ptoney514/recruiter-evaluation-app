-- Migration: Add Performance Profile and Candidate Enhancement Fields
-- Description: Add Lou Adler Performance-Based Hiring fields and three-status candidate system
-- Created: 2025-11-09

-- ============================================================================
-- JOBS TABLE: Add Performance Profile
-- ============================================================================

-- Performance Profile (Lou Adler 8 Questions)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS performance_profile JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN jobs.performance_profile IS 'Lou Adler Performance-Based Hiring profile with 8 questions: year_1_outcomes, biggest_challenge, comparable_experience, dealbreakers, motivation_drivers, must_have_requirements (duplicates column for PP context), nice_to_have_requirements, trajectory_patterns, context_notes';

-- Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_jobs_performance_profile ON jobs USING GIN(performance_profile);

-- ============================================================================
-- CANDIDATES TABLE: Add Three-Status System Fields
-- ============================================================================

-- Evaluation Status (Not Evaluated, Recommended, Not Recommended)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS evaluation_status VARCHAR(50) DEFAULT 'pending';
COMMENT ON COLUMN candidates.evaluation_status IS 'Three-status system: pending (not evaluated), evaluating (in progress), evaluated (complete), failed (error)';

-- AI Recommendation
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS recommendation VARCHAR(50);
COMMENT ON COLUMN candidates.recommendation IS 'AI recommendation: NULL (not evaluated), INTERVIEW, PHONE_SCREEN, DECLINE';

-- AI Score
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS score DECIMAL(5,2);
COMMENT ON COLUMN candidates.score IS 'AI evaluation score: 0-100';

-- Evaluation Tracking
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS evaluation_count INTEGER DEFAULT 0;
COMMENT ON COLUMN candidates.evaluation_count IS 'Number of times re-evaluated (tracks evaluation versions)';

-- Manual Recruiter Actions
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS shortlisted BOOLEAN DEFAULT false;
COMMENT ON COLUMN candidates.shortlisted IS 'Manually marked by recruiter as top candidate for hiring manager';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS recruiter_notes TEXT;
COMMENT ON COLUMN candidates.recruiter_notes IS 'Quick notes from recruiter (separate from formal context)';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_evaluation_status ON candidates(evaluation_status);
CREATE INDEX IF NOT EXISTS idx_candidates_recommendation ON candidates(recommendation);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_shortlisted ON candidates(shortlisted);

-- ============================================================================
-- EVALUATIONS TABLE: Add Versioning and Context Tracking
-- ============================================================================

-- Add version column and context tracking to existing evaluations table
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
COMMENT ON COLUMN evaluations.version IS 'Evaluation version number (1, 2, 3...) - increments with each re-evaluation';

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS context_included JSONB DEFAULT '["resume"]'::jsonb;
COMMENT ON COLUMN evaluations.context_included IS 'Array of context types included: ["resume", "phone_screen", "interview", "reference"]';

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS score_change DECIMAL(5,2);
COMMENT ON COLUMN evaluations.score_change IS 'Change from previous version (e.g., +7 or -3)';

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS change_reason TEXT;
COMMENT ON COLUMN evaluations.change_reason IS 'AI explanation of why score/recommendation changed from previous version';

-- Add index for version queries
CREATE INDEX IF NOT EXISTS idx_evaluations_version ON evaluations(candidate_id, version DESC);

-- ============================================================================
-- CANDIDATE CONTEXT TABLE: Phone Screens, Interviews, Notes
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidate_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Context Type
  context_type VARCHAR(50) NOT NULL,
  -- 'phone_screen', 'interview', 'reference', 'portfolio', 'note'

  content TEXT NOT NULL,
  -- The actual notes/feedback

  added_by VARCHAR(255),
  -- Recruiter name

  context_date DATE,
  -- Date of phone screen/interview (may differ from created_at)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_context_candidate_id ON candidate_context(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_context_type ON candidate_context(context_type);
CREATE INDEX IF NOT EXISTS idx_candidate_context_date ON candidate_context(context_date DESC);

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS update_candidate_context_updated_at ON candidate_context;
CREATE TRIGGER update_candidate_context_updated_at BEFORE UPDATE ON candidate_context
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY: Candidate Context
-- ============================================================================

ALTER TABLE candidate_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own candidate context" ON candidate_context;
CREATE POLICY "Users can view their own candidate context"
  ON candidate_context FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own candidate context" ON candidate_context;
CREATE POLICY "Users can insert their own candidate context"
  ON candidate_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own candidate context" ON candidate_context;
CREATE POLICY "Users can update their own candidate context"
  ON candidate_context FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own candidate context" ON candidate_context;
CREATE POLICY "Users can delete their own candidate context"
  ON candidate_context FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get candidate stats for a job (three-status system)
CREATE OR REPLACE FUNCTION get_candidate_stats(job_uuid UUID)
RETURNS TABLE (
  total_candidates BIGINT,
  evaluated_count BIGINT,
  recommended_count BIGINT,
  not_recommended_count BIGINT,
  pending_count BIGINT,
  shortlisted_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_candidates,
    COUNT(CASE WHEN evaluation_status = 'evaluated' THEN 1 END) as evaluated_count,
    COUNT(CASE WHEN recommendation IN ('INTERVIEW', 'PHONE_SCREEN') THEN 1 END) as recommended_count,
    COUNT(CASE WHEN recommendation = 'DECLINE' THEN 1 END) as not_recommended_count,
    COUNT(CASE WHEN evaluation_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN shortlisted = true THEN 1 END) as shortlisted_count
  FROM candidates
  WHERE job_id = job_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get next evaluation version for a candidate
CREATE OR REPLACE FUNCTION get_next_evaluation_version(candidate_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO max_version
  FROM evaluations
  WHERE candidate_id = candidate_uuid;

  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE candidate_context IS 'Phone screens, interview feedback, notes added by recruiters to candidate packages - enables versioned re-evaluation with new context';

COMMENT ON FUNCTION get_candidate_stats IS 'Returns candidate statistics for a job using three-status system (total, evaluated, recommended, not recommended, pending, shortlisted)';

COMMENT ON FUNCTION get_next_evaluation_version IS 'Returns the next version number for a candidate evaluation (used when re-evaluating with new context)';
