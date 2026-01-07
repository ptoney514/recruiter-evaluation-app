-- Migration 001: Create requirements table
-- Separates job requirements from JSON to normalized table format
-- Enables editing, reordering, and categorizing requirements

CREATE TABLE IF NOT EXISTS requirements (
  id TEXT PRIMARY KEY NOT NULL,
  job_id TEXT NOT NULL,
  text TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT 1,
  category TEXT DEFAULT 'other',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requirements_job_id ON requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_requirements_category ON requirements(category);
CREATE INDEX IF NOT EXISTS idx_requirements_sort_order ON requirements(job_id, sort_order);
