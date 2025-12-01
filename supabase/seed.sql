-- Seed file for local development
-- This creates the dev user that matches the frontend dev bypass configuration
-- IMPORTANT: This seed is ONLY for local development, not production

-- ============================================================================
-- DEV USER SETUP
-- ============================================================================
-- Create a dev user with the same UUID used by the frontend dev bypass
-- This allows RLS policies to work correctly when VITE_AUTH_BYPASS=true

-- Insert dev user into auth.users (uses the same ID as frontend/src/hooks/useAuth.js)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- DEV_USER_ID
  '00000000-0000-0000-0000-000000000000',
  'dev-admin@localhost',
  -- Password: 'devpassword123' (bcrypt hash)
  crypt('devpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"email": "dev-admin@localhost", "full_name": "Dev Admin"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Create an identity for the dev user (required for auth to work)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at,
  last_sign_in_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub": "00000000-0000-0000-0000-000000000001", "email": "dev-admin@localhost"}'::jsonb,
  'email',
  'dev-admin@localhost',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO UPDATE SET
  updated_at = NOW(),
  last_sign_in_at = NOW();

-- ============================================================================
-- SAMPLE DATA (optional)
-- ============================================================================
-- Uncomment below to add sample jobs for testing

-- INSERT INTO jobs (id, user_id, title, description, status, created_at)
-- VALUES
--   (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Senior Software Engineer', 'We are looking for a Senior Software Engineer...', 'open', NOW()),
--   (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Product Manager', 'We are hiring a Product Manager...', 'open', NOW())
-- ON CONFLICT DO NOTHING;
