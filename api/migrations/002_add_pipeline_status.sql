-- Migration 002: Add pipeline status and recruiter workflow fields
-- Adds recruitment pipeline status (separate from evaluation status)
-- Enables recruiter notes and quick tags for workflow management

-- Note: ALTER TABLE ADD COLUMN IF NOT EXISTS is only available in SQLite 3.35+
-- Using PRAGMA to check column existence first

-- Add pipeline_status column (recruitment pipeline: new/meets-reqs/doesnt-meet/reviewed-forward/reviewed-maybe/reviewed-decline)
PRAGMA foreign_keys = OFF;

-- Column 1: pipeline_status
ALTER TABLE candidates ADD COLUMN pipeline_status TEXT DEFAULT 'new';

-- Column 2: recruiter notes field
ALTER TABLE candidates ADD COLUMN recruiter_notes TEXT;

-- Column 3: quick tags (JSON array for common tagging)
ALTER TABLE candidates ADD COLUMN quick_tags TEXT DEFAULT '[]';

-- Column 4: Track when notes were last updated
ALTER TABLE candidates ADD COLUMN notes_updated_at TEXT;

PRAGMA foreign_keys = ON;

-- Indexes for performance
CREATE INDEX idx_candidates_pipeline_status ON candidates(pipeline_status);
CREATE INDEX idx_candidates_job_pipeline ON candidates(job_id, pipeline_status);
