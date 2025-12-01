-- Migration: Add priorities column to jobs table
-- Description: Stores recruiter's "what matters most" hints for AI evaluation
-- Created: 2025-12-01

-- ============================================================================
-- JOBS TABLE: Add Priorities Field
-- ============================================================================

-- Add priorities column for storing evaluation hints
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priorities TEXT;

COMMENT ON COLUMN jobs.priorities IS 'Recruiter hints for AI evaluation - what matters most when screening candidates';
