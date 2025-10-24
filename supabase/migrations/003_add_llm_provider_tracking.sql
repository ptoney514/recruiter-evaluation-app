-- Add LLM provider tracking to evaluations table
-- This migration adds fields to track which LLM provider and model were used

ALTER TABLE evaluations
  ADD COLUMN llm_provider VARCHAR(50) DEFAULT 'anthropic',
  ADD COLUMN llm_model VARCHAR(100) DEFAULT 'claude-3-5-haiku-20241022';

-- Update claude_model column to be more generic (keep for backwards compatibility)
COMMENT ON COLUMN evaluations.claude_model IS 'Deprecated: Use llm_model instead. Kept for backwards compatibility.';
COMMENT ON COLUMN evaluations.llm_provider IS 'LLM provider used for evaluation (anthropic, openai, etc.)';
COMMENT ON COLUMN evaluations.llm_model IS 'Specific model used for evaluation (e.g., claude-3-5-haiku-20241022, gpt-4o)';

-- Create index for querying by provider
CREATE INDEX idx_evaluations_llm_provider ON evaluations(llm_provider);
CREATE INDEX idx_evaluations_llm_model ON evaluations(llm_model);
