-- Migration: Add performance indexes for common queries
-- Description: Additional composite indexes to optimize query performance

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_candidates_job_user ON candidates(job_id, user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_candidate_user ON evaluations(candidate_id, user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_job_user ON evaluations(job_id, user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_job_candidate ON candidate_rankings(job_id, candidate_id);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_overall_score ON evaluations(overall_score DESC);

-- Full text search index on resume text (for future search features)
CREATE INDEX IF NOT EXISTS idx_candidates_resume_text_search ON candidates USING gin(to_tsvector('english', resume_text));

-- Index for email lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_candidates_email_lower ON candidates(lower(email));

-- JSONB indexes for querying skills and requirements
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_must_have_requirements ON jobs USING gin(must_have_requirements);
CREATE INDEX IF NOT EXISTS idx_jobs_preferred_requirements ON jobs USING gin(preferred_requirements);