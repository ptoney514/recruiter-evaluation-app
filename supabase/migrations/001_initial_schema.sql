-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(100),
  employment_type VARCHAR(50) DEFAULT 'Full-time',

  -- Job requirements (stored as JSONB for flexibility)
  must_have_requirements JSONB DEFAULT '[]'::jsonb,
  preferred_requirements JSONB DEFAULT '[]'::jsonb,
  years_experience_min INTEGER,
  years_experience_max INTEGER,

  -- Additional details
  description TEXT,
  compensation_min DECIMAL(10,2),
  compensation_max DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'open',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  -- Basic info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(100),

  -- Resume/materials
  resume_text TEXT,
  resume_file_url VARCHAR(500),
  resume_file_name VARCHAR(255),
  cover_letter TEXT,

  -- Application details
  current_title VARCHAR(255),
  current_company VARCHAR(255),
  years_experience DECIMAL(4,1),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),

  -- Additional data (flexible JSONB)
  skills JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  additional_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  -- AI Evaluation results
  recommendation VARCHAR(50) NOT NULL, -- ADVANCE, DISPOSITION, HOLD, REQUEST_INTERVIEW
  confidence VARCHAR(20), -- High, Medium, Low
  overall_score DECIMAL(3,1), -- 0.0 - 10.0

  -- Detailed analysis (JSONB for structured data)
  key_strengths JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  requirements_match JSONB DEFAULT '{}'::jsonb,
  reasoning TEXT,

  -- Metadata
  claude_model VARCHAR(50),
  evaluation_prompt_tokens INTEGER,
  evaluation_completion_tokens INTEGER,
  evaluation_cost DECIMAL(10,4),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rankings table (for manual overrides)
CREATE TABLE candidate_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,

  rank INTEGER NOT NULL,
  manual_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(job_id, candidate_id)
);

-- Create indexes for performance
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_job_id ON evaluations(job_id);
CREATE INDEX idx_rankings_job_id ON candidate_rankings(job_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_candidates_email ON candidates(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON candidate_rankings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE jobs IS 'Job postings and positions';
COMMENT ON TABLE candidates IS 'Candidate profiles and applications';
COMMENT ON TABLE evaluations IS 'AI-generated candidate evaluations';
COMMENT ON TABLE candidate_rankings IS 'Manual candidate rankings per job';

COMMENT ON COLUMN evaluations.recommendation IS 'Recommendation: ADVANCE, DISPOSITION, HOLD, or REQUEST_INTERVIEW';
COMMENT ON COLUMN evaluations.claude_model IS 'Claude model used for evaluation (e.g., claude-haiku-3-5-20241022)';
COMMENT ON COLUMN evaluations.evaluation_cost IS 'API cost in USD for this evaluation';
