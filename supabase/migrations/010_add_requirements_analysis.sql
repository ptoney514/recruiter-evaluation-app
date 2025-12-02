-- Migration: Add Quick Score Analysis Storage
-- Purpose: Store detailed requirements analysis from Quick Score evaluations
-- This allows caching results so evaluations don't need to be re-run

-- Add quick_score_analysis JSONB column to candidates table
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS quick_score_analysis JSONB;

-- Add comment describing the expected structure
COMMENT ON COLUMN candidates.quick_score_analysis IS 'Stores detailed Quick Score analysis including:
{
  "requirements_identified": {
    "must_have": ["req1", "req2"],
    "preferred": ["pref1", "pref2"]
  },
  "match_analysis": [
    {"requirement": "5 years exp", "status": "MET", "evidence": "7 years at..."},
    {"requirement": "Python", "status": "NOT_MET", "evidence": "No Python mentioned"},
    {"requirement": "Leadership", "status": "PARTIAL", "evidence": "Team lead role"}
  ],
  "methodology": "Q(40%) + E(40%) + R(20%)",
  "model": "mistral",
  "evaluated_at": "2025-12-02T12:00:00Z"
}';

-- Create index for faster queries on candidates with analysis
CREATE INDEX IF NOT EXISTS idx_candidates_quick_score_analysis
  ON candidates USING GIN (quick_score_analysis)
  WHERE quick_score_analysis IS NOT NULL;
