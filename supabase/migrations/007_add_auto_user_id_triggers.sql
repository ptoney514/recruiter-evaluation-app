-- Migration: Add triggers to automatically set user_id on insert
-- Description: Auto-populate user_id with auth.uid() on INSERT to simplify client code

-- Function to set user_id to current authenticated user
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set user_id if not already provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  -- Ensure user_id matches authenticated user (security check)
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id must match authenticated user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to all tables with user_id
CREATE TRIGGER set_user_id_jobs
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_candidates
  BEFORE INSERT ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_evaluations
  BEFORE INSERT ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_rankings
  BEFORE INSERT ON candidate_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_interview_ratings
  BEFORE INSERT ON interview_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_user_id_reference_checks
  BEFORE INSERT ON reference_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

-- Add comment
COMMENT ON FUNCTION public.set_user_id() IS 'Automatically sets user_id to auth.uid() on INSERT and validates it matches the authenticated user';
