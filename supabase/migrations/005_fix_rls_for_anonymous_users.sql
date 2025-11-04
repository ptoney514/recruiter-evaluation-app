-- Migration: Enable Anonymous User Access with Session-Based Security
-- Description: Implements secure anonymous access using session tokens while maintaining authenticated user isolation
-- Author: Supabase Dev Admin
-- Date: 2025-11-03

-- ============================================================================
-- PART 1: SESSION MANAGEMENT INFRASTRUCTURE
-- ============================================================================

-- Create table to track anonymous sessions
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  migrated_to_user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_anonymous_sessions_token ON anonymous_sessions(session_token);
CREATE INDEX idx_anonymous_sessions_expires ON anonymous_sessions(expires_at);
CREATE INDEX idx_anonymous_sessions_migrated ON anonymous_sessions(migrated_to_user_id);

-- Enable RLS on anonymous_sessions
ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous sessions are only manageable via RPC functions (no direct access)
-- No RLS policies needed - all operations go through secure functions

-- ============================================================================
-- PART 2: ADD SESSION SUPPORT TO EXISTING TABLES
-- ============================================================================

-- Add session_id columns to all user data tables
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);
ALTER TABLE candidate_rankings ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);
ALTER TABLE interview_ratings ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);
ALTER TABLE reference_checks ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES anonymous_sessions(session_token);

-- Create indexes for session_id lookups
CREATE INDEX IF NOT EXISTS idx_jobs_session_id ON jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_candidates_session_id ON candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id ON evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_rankings_session_id ON candidate_rankings(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_ratings_session_id ON interview_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_reference_checks_session_id ON reference_checks(session_id);

-- Add check constraints to ensure data has either user_id OR session_id (not both, not neither)
ALTER TABLE jobs ADD CONSTRAINT jobs_owner_check
  CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));

ALTER TABLE candidates ADD CONSTRAINT candidates_owner_check
  CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));

ALTER TABLE evaluations ADD CONSTRAINT evaluations_owner_check
  CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));

-- ============================================================================
-- PART 3: RPC FUNCTIONS FOR SESSION MANAGEMENT
-- ============================================================================

-- Function to create a new anonymous session
CREATE OR REPLACE FUNCTION create_anonymous_session(
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  session_token UUID,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_token UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate new session
  v_session_token := gen_random_uuid();
  v_expires_at := NOW() + INTERVAL '7 days';

  -- Insert session record
  INSERT INTO anonymous_sessions (
    session_token,
    ip_address,
    user_agent,
    expires_at,
    metadata
  ) VALUES (
    v_session_token,
    inet_client_addr(),
    COALESCE(current_setting('request.headers', true)::json->>'user-agent', NULL),
    v_expires_at,
    p_metadata
  );

  -- Return session details
  RETURN QUERY SELECT v_session_token, v_expires_at;
END;
$$;

-- Function to validate and refresh session activity
CREATE OR REPLACE FUNCTION validate_session(
  p_session_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if session exists and not expired
  UPDATE anonymous_sessions
  SET last_activity_at = NOW()
  WHERE session_token = p_session_token
    AND expires_at > NOW()
    AND migrated_to_user_id IS NULL
  RETURNING TRUE INTO v_valid;

  RETURN COALESCE(v_valid, FALSE);
END;
$$;

-- Function to get current session token from request
CREATE OR REPLACE FUNCTION get_session_token()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_session_token UUID;
BEGIN
  -- Try to get session token from request headers
  v_session_token := (current_setting('request.headers', true)::json->>'x-session-token')::UUID;

  -- Validate if provided
  IF v_session_token IS NOT NULL THEN
    IF NOT validate_session(v_session_token) THEN
      RETURN NULL;
    END IF;
  END IF;

  RETURN v_session_token;
END;
$$;

-- Function to migrate anonymous session data to authenticated user
CREATE OR REPLACE FUNCTION migrate_session_to_user(
  p_session_token UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_session_token IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Session token and user ID are required';
  END IF;

  -- Check session exists and not already migrated
  IF NOT EXISTS (
    SELECT 1 FROM anonymous_sessions
    WHERE session_token = p_session_token
      AND migrated_to_user_id IS NULL
      AND expires_at > NOW()
  ) THEN
    RAISE EXCEPTION 'Invalid or already migrated session';
  END IF;

  -- Migrate jobs
  UPDATE jobs
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Migrate candidates
  UPDATE candidates
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Migrate evaluations
  UPDATE evaluations
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Migrate rankings
  UPDATE candidate_rankings
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Migrate interview ratings
  UPDATE interview_ratings
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Migrate reference checks
  UPDATE reference_checks
  SET user_id = p_user_id, session_id = NULL
  WHERE session_id = p_session_token;

  -- Mark session as migrated
  UPDATE anonymous_sessions
  SET migrated_to_user_id = p_user_id
  WHERE session_token = p_session_token;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- PART 4: UPDATE RLS POLICIES FOR DUAL-MODE ACCESS
-- ============================================================================

-- Drop existing policies (they only support authenticated users)
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

DROP POLICY IF EXISTS "Users can view their own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can insert their own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can update their own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can delete their own candidates" ON candidates;

DROP POLICY IF EXISTS "Users can view their own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can insert their own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can update their own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can delete their own evaluations" ON evaluations;

DROP POLICY IF EXISTS "Users can view their own rankings" ON candidate_rankings;
DROP POLICY IF EXISTS "Users can insert their own rankings" ON candidate_rankings;
DROP POLICY IF EXISTS "Users can update their own rankings" ON candidate_rankings;
DROP POLICY IF EXISTS "Users can delete their own rankings" ON candidate_rankings;

DROP POLICY IF EXISTS "Users can view their own interview ratings" ON interview_ratings;
DROP POLICY IF EXISTS "Users can insert their own interview ratings" ON interview_ratings;
DROP POLICY IF EXISTS "Users can update their own interview ratings" ON interview_ratings;
DROP POLICY IF EXISTS "Users can delete their own interview ratings" ON interview_ratings;

DROP POLICY IF EXISTS "Users can view their own reference checks" ON reference_checks;
DROP POLICY IF EXISTS "Users can insert their own reference checks" ON reference_checks;
DROP POLICY IF EXISTS "Users can update their own reference checks" ON reference_checks;
DROP POLICY IF EXISTS "Users can delete their own reference checks" ON reference_checks;

-- ============================================================================
-- JOBS TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

-- SELECT: Authenticated users see their data, anonymous users see their session data
CREATE POLICY "jobs_select_policy" ON jobs FOR SELECT
USING (
  -- Authenticated user access
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Anonymous session access (with validation)
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- INSERT: Users can create with either user_id or session_id
CREATE POLICY "jobs_insert_policy" ON jobs FOR INSERT
WITH CHECK (
  -- Authenticated user insert
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  -- Anonymous session insert
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

-- UPDATE: Can only update own records
CREATE POLICY "jobs_update_policy" ON jobs FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

-- DELETE: Can only delete own records
CREATE POLICY "jobs_delete_policy" ON jobs FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- CANDIDATES TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

CREATE POLICY "candidates_select_policy" ON candidates FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

CREATE POLICY "candidates_insert_policy" ON candidates FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "candidates_update_policy" ON candidates FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "candidates_delete_policy" ON candidates FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- EVALUATIONS TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

CREATE POLICY "evaluations_select_policy" ON evaluations FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

CREATE POLICY "evaluations_insert_policy" ON evaluations FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "evaluations_update_policy" ON evaluations FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "evaluations_delete_policy" ON evaluations FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- CANDIDATE_RANKINGS TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

CREATE POLICY "rankings_select_policy" ON candidate_rankings FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

CREATE POLICY "rankings_insert_policy" ON candidate_rankings FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "rankings_update_policy" ON candidate_rankings FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "rankings_delete_policy" ON candidate_rankings FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- INTERVIEW_RATINGS TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

CREATE POLICY "interview_select_policy" ON interview_ratings FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

CREATE POLICY "interview_insert_policy" ON interview_ratings FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "interview_update_policy" ON interview_ratings FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "interview_delete_policy" ON interview_ratings FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- REFERENCE_CHECKS TABLE - NEW DUAL-MODE POLICIES
-- ============================================================================

CREATE POLICY "reference_select_policy" ON reference_checks FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

CREATE POLICY "reference_insert_policy" ON reference_checks FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "reference_update_policy" ON reference_checks FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND session_id IS NULL)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token() AND user_id IS NULL)
);

CREATE POLICY "reference_delete_policy" ON reference_checks FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (auth.uid() IS NULL AND session_id = get_session_token())
);

-- ============================================================================
-- PART 5: CLEANUP & MAINTENANCE
-- ============================================================================

-- Function to clean up expired anonymous sessions and their data
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete data associated with expired sessions
  DELETE FROM jobs WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  DELETE FROM candidates WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  DELETE FROM evaluations WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  DELETE FROM candidate_rankings WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  DELETE FROM interview_ratings WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  DELETE FROM reference_checks WHERE session_id IN (
    SELECT session_token FROM anonymous_sessions
    WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  );

  -- Delete expired sessions
  DELETE FROM anonymous_sessions
  WHERE expires_at < NOW() AND migrated_to_user_id IS NULL
  RETURNING * INTO v_deleted_count;

  RETURN v_deleted_count;
END;
$$;

-- Create a scheduled job to clean up expired sessions (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- ============================================================================
-- PART 6: GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for RPC functions
GRANT EXECUTE ON FUNCTION create_anonymous_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_session_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION migrate_session_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO service_role;

-- ============================================================================
-- PART 7: DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE anonymous_sessions IS 'Tracks anonymous user sessions for secure temporary access without authentication';
COMMENT ON COLUMN anonymous_sessions.session_token IS 'Unique token identifying the anonymous session';
COMMENT ON COLUMN anonymous_sessions.expires_at IS 'Session expiration time (7 days by default)';
COMMENT ON COLUMN anonymous_sessions.migrated_to_user_id IS 'User ID if session was migrated after signup';

COMMENT ON COLUMN jobs.session_id IS 'Anonymous session token for unauthenticated users';
COMMENT ON COLUMN candidates.session_id IS 'Anonymous session token for unauthenticated users';
COMMENT ON COLUMN evaluations.session_id IS 'Anonymous session token for unauthenticated users';

COMMENT ON FUNCTION create_anonymous_session IS 'Creates a new anonymous session with unique token';
COMMENT ON FUNCTION validate_session IS 'Validates session token and updates last activity';
COMMENT ON FUNCTION get_session_token IS 'Retrieves and validates session token from request headers';
COMMENT ON FUNCTION migrate_session_to_user IS 'Migrates anonymous session data to authenticated user account';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired sessions and associated data';

-- ============================================================================
-- ROLLBACK SCRIPT (Save separately)
-- ============================================================================
/*
-- To rollback this migration, run:

-- Remove session columns
ALTER TABLE jobs DROP COLUMN IF EXISTS session_id;
ALTER TABLE candidates DROP COLUMN IF EXISTS session_id;
ALTER TABLE evaluations DROP COLUMN IF EXISTS session_id;
ALTER TABLE candidate_rankings DROP COLUMN IF EXISTS session_id;
ALTER TABLE interview_ratings DROP COLUMN IF EXISTS session_id;
ALTER TABLE reference_checks DROP COLUMN IF EXISTS session_id;

-- Drop functions
DROP FUNCTION IF EXISTS create_anonymous_session;
DROP FUNCTION IF EXISTS validate_session;
DROP FUNCTION IF EXISTS get_session_token;
DROP FUNCTION IF EXISTS migrate_session_to_user;
DROP FUNCTION IF EXISTS cleanup_expired_sessions;

-- Drop anonymous_sessions table
DROP TABLE IF EXISTS anonymous_sessions;

-- Restore original RLS policies (from migration 004)
-- [Copy original policies here]
*/