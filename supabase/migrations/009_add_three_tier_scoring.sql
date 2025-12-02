-- Migration: Add Three-Tier Scoring System
-- Description: Add Quick Score (Ollama local), Stage 1, and Stage 2 scoring columns
-- Created: 2025-12-02

-- ============================================================================
-- CANDIDATES TABLE: Add Three-Tier Scoring Columns
-- ============================================================================

-- Quick Score (Ollama local LLM evaluation)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS quick_score INTEGER;
COMMENT ON COLUMN candidates.quick_score IS 'Quick screening score from local Ollama LLM (0-100)';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS quick_score_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN candidates.quick_score_at IS 'Timestamp when quick score was generated';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS quick_score_model VARCHAR(100);
COMMENT ON COLUMN candidates.quick_score_model IS 'Ollama model used for quick score (e.g., llama3, mistral, phi3)';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS quick_score_reasoning TEXT;
COMMENT ON COLUMN candidates.quick_score_reasoning IS 'Brief reasoning from quick score evaluation';

-- Stage 1 Score (Evala - Claude Haiku resume-only deep analysis)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage1_score DECIMAL(5,2);
COMMENT ON COLUMN candidates.stage1_score IS 'Evala Stage 1 score from Anthropic Claude (0-100) - resume only';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage1_evaluated_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN candidates.stage1_evaluated_at IS 'Timestamp when Stage 1 evaluation was completed';

-- Stage 2 Score (Evala - Claude Haiku resume+interview+references)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage2_score DECIMAL(5,2);
COMMENT ON COLUMN candidates.stage2_score IS 'Evala Stage 2 score from Anthropic Claude (0-100) - resume + interview + references';

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS stage2_evaluated_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN candidates.stage2_evaluated_at IS 'Timestamp when Stage 2 evaluation was completed';

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_candidates_quick_score ON candidates(quick_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_stage1_score ON candidates(stage1_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_stage2_score ON candidates(stage2_score DESC);

-- ============================================================================
-- EVALUATIONS TABLE: Add evaluation_type column
-- ============================================================================

ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evaluation_type VARCHAR(20) DEFAULT 'stage1';
COMMENT ON COLUMN evaluations.evaluation_type IS 'Type of evaluation: quick, stage1, stage2';

-- ============================================================================
-- HELPER FUNCTION: Get best available score for ranking
-- ============================================================================

CREATE OR REPLACE FUNCTION get_best_score(
  p_stage2_score DECIMAL,
  p_stage1_score DECIMAL,
  p_quick_score INTEGER
)
RETURNS DECIMAL AS $$
BEGIN
  -- Priority: Stage 2 > Stage 1 > Quick Score
  RETURN COALESCE(p_stage2_score, p_stage1_score, p_quick_score::DECIMAL);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_best_score IS 'Returns the highest-priority available score for candidate ranking (S2 > S1 > Quick)';

-- ============================================================================
-- NOTE: No data migration needed - candidates table didn't have score/evaluation_status
-- columns previously. The new three-tier scoring system is a fresh addition.
-- ============================================================================
