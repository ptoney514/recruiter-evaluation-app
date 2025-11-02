-- Migration: Add Interview Ratings and Reference Checks tables
-- Description: Support two-stage evaluation framework with interview and reference data

-- Interview ratings table
CREATE TABLE interview_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,

  -- Interview metadata
  interviewer_name VARCHAR(255),
  interview_date DATE,
  interview_type VARCHAR(50), -- phone_screen, in_person, panel

  -- Core competency ratings (1-10 scale)
  technical_skills_rating INTEGER CHECK (technical_skills_rating BETWEEN 1 AND 10),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 10),
  problem_solving_rating INTEGER CHECK (problem_solving_rating BETWEEN 1 AND 10),
  cultural_fit_rating INTEGER CHECK (cultural_fit_rating BETWEEN 1 AND 10),

  -- Scenario ratings (flexible JSONB array)
  scenario_ratings JSONB DEFAULT '[]'::jsonb,

  -- Overall assessment
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  recommendation VARCHAR(50), -- STRONG_HIRE, HIRE, MARGINAL, DO_NOT_HIRE

  -- Red flags and notes
  red_flags JSONB DEFAULT '[]'::jsonb,
  strengths TEXT,
  concerns TEXT,
  notes TEXT,

  -- Comparison to resume
  vs_resume_expectations VARCHAR(50), -- exceeded, matched, below

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference checks table
CREATE TABLE reference_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,

  -- Reference information
  reference_name VARCHAR(255),
  reference_title VARCHAR(255),
  relationship VARCHAR(100), -- supervisor, colleague, direct_report
  dates_worked_together VARCHAR(100),

  -- Performance assessment
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
  would_rehire VARCHAR(50), -- yes_definitely, yes_probably, unsure, probably_not, definitely_not

  -- Qualitative feedback
  strengths TEXT,
  areas_for_development TEXT,
  working_relationship_notes TEXT,
  notes TEXT,

  -- Red flags and themes
  red_flags_level VARCHAR(20), -- none, minor, significant
  key_themes JSONB DEFAULT '{}'::jsonb,

  -- Check metadata
  checked_by VARCHAR(255),
  check_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_interview_ratings_candidate ON interview_ratings(candidate_id);
CREATE INDEX idx_interview_ratings_date ON interview_ratings(interview_date);
CREATE INDEX idx_reference_checks_candidate ON reference_checks(candidate_id);
CREATE INDEX idx_reference_checks_date ON reference_checks(check_date);

-- Comments for documentation
COMMENT ON TABLE interview_ratings IS 'Interview evaluation data for Stage 2 candidate assessment (50% weight)';
COMMENT ON TABLE reference_checks IS 'Reference check data for Stage 2 candidate assessment (25% weight)';

COMMENT ON COLUMN interview_ratings.overall_rating IS 'Average of all competency and scenario ratings (1-10 scale)';
COMMENT ON COLUMN interview_ratings.recommendation IS 'Interviewer recommendation: STRONG_HIRE, HIRE, MARGINAL, DO_NOT_HIRE';
COMMENT ON COLUMN reference_checks.overall_rating IS 'Overall reference rating (1-10 scale) averaged into Stage 2 score';
COMMENT ON COLUMN reference_checks.would_rehire IS 'Critical indicator: would_rehire tells truth about candidate';

-- Update evaluations table to track evaluation stage
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluation_stage INTEGER DEFAULT 1 CHECK (evaluation_stage IN (1, 2));
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS interview_rating_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS reference_check_ids JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN evaluations.evaluation_stage IS '1 = Resume Screening, 2 = Final Hiring Decision';
COMMENT ON COLUMN evaluations.interview_rating_ids IS 'Array of interview_ratings.id UUIDs used in Stage 2';
COMMENT ON COLUMN evaluations.reference_check_ids IS 'Array of reference_checks.id UUIDs used in Stage 2';
