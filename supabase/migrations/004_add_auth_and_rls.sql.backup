-- Migration: Add user authentication and Row Level Security (RLS)
-- Description: Add user_id columns and RLS policies to enable multi-tenant data isolation

-- Add user_id columns to all user-owned tables
ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE candidates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE evaluations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE candidate_rankings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE interview_ratings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE reference_checks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes on user_id columns for performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_rankings_user_id ON candidate_rankings(user_id);
CREATE INDEX idx_interview_ratings_user_id ON interview_ratings(user_id);
CREATE INDEX idx_reference_checks_user_id ON reference_checks(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_checks ENABLE ROW LEVEL SECURITY;

-- Jobs table RLS policies
CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Candidates table RLS policies
CREATE POLICY "Users can view their own candidates"
  ON candidates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidates"
  ON candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates"
  ON candidates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates"
  ON candidates FOR DELETE
  USING (auth.uid() = user_id);

-- Evaluations table RLS policies
CREATE POLICY "Users can view their own evaluations"
  ON evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evaluations"
  ON evaluations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evaluations"
  ON evaluations FOR DELETE
  USING (auth.uid() = user_id);

-- Candidate rankings table RLS policies
CREATE POLICY "Users can view their own rankings"
  ON candidate_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rankings"
  ON candidate_rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings"
  ON candidate_rankings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings"
  ON candidate_rankings FOR DELETE
  USING (auth.uid() = user_id);

-- Interview ratings table RLS policies
CREATE POLICY "Users can view their own interview ratings"
  ON interview_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview ratings"
  ON interview_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview ratings"
  ON interview_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview ratings"
  ON interview_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Reference checks table RLS policies
CREATE POLICY "Users can view their own reference checks"
  ON reference_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reference checks"
  ON reference_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reference checks"
  ON reference_checks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reference checks"
  ON reference_checks FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON COLUMN jobs.user_id IS 'User who created this job (FK to auth.users)';
COMMENT ON COLUMN candidates.user_id IS 'User who owns this candidate data (FK to auth.users)';
COMMENT ON COLUMN evaluations.user_id IS 'User who owns this evaluation (FK to auth.users)';
COMMENT ON COLUMN candidate_rankings.user_id IS 'User who created this ranking (FK to auth.users)';
COMMENT ON COLUMN interview_ratings.user_id IS 'User who created this interview rating (FK to auth.users)';
COMMENT ON COLUMN reference_checks.user_id IS 'User who created this reference check (FK to auth.users)';
