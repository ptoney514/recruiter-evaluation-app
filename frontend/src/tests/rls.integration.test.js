/**
 * Row Level Security (RLS) Integration Tests
 *
 * Tests that RLS policies are properly enforced:
 * - Users can only access their own data
 * - Unauthenticated requests are rejected
 * - auth.uid() matches the user_id being inserted
 *
 * Prerequisites: Local Supabase running via `supabase start`
 * Run: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Dev user credentials (from seed.sql)
const DEV_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev-admin@localhost',
  password: 'devpassword123',
}

// Create a second test user for isolation tests
const TEST_USER_2 = {
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

// Clients
let devUserClient = null
let testUser2Client = null
let adminClient = null
let testUser2Id = null

// Track created resources for cleanup
const createdJobIds = []

/**
 * Create a fresh Supabase client
 */
function createFreshClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    }
  })
}

/**
 * Create admin client (bypasses RLS)
 */
function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return adminClient
}

describe('RLS Policy Integration Tests', () => {
  beforeAll(async () => {
    // Sign in as dev user
    devUserClient = createFreshClient()
    const { data: devData, error: devError } = await devUserClient.auth.signInWithPassword({
      email: DEV_USER.email,
      password: DEV_USER.password,
    })

    if (devError) {
      throw new Error(`Failed to sign in dev user: ${devError.message}. Make sure you ran 'supabase db reset'.`)
    }

    expect(devData.user.id).toBe(DEV_USER.id)

    // Create and sign in as second test user
    testUser2Client = createFreshClient()
    const { data: signUpData, error: signUpError } = await testUser2Client.auth.signUp({
      email: TEST_USER_2.email,
      password: TEST_USER_2.password,
    })

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw new Error(`Failed to create test user 2: ${signUpError.message}`)
    }

    // Sign in test user 2
    const { data: user2Data, error: user2Error } = await testUser2Client.auth.signInWithPassword({
      email: TEST_USER_2.email,
      password: TEST_USER_2.password,
    })

    if (user2Error) {
      throw new Error(`Failed to sign in test user 2: ${user2Error.message}`)
    }

    testUser2Id = user2Data.user.id
  })

  afterEach(async () => {
    // Clean up created jobs after each test
    const admin = getAdminClient()
    for (const jobId of createdJobIds) {
      await admin.from('jobs').delete().eq('id', jobId)
    }
    createdJobIds.length = 0
  })

  afterAll(async () => {
    // Clean up test user 2's data
    if (testUser2Id) {
      const admin = getAdminClient()
      await admin.from('jobs').delete().eq('user_id', testUser2Id)
      await admin.from('candidates').delete().eq('user_id', testUser2Id)
      await admin.from('evaluations').delete().eq('user_id', testUser2Id)
    }
  })

  describe('Jobs table RLS', () => {
    it('allows authenticated user to create a job with their own user_id', async () => {
      const { data, error } = await devUserClient
        .from('jobs')
        .insert([{
          title: 'RLS Test Job - Own User',
          description: 'Testing RLS policy for job creation',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.title).toBe('RLS Test Job - Own User')
      expect(data.user_id).toBe(DEV_USER.id)

      createdJobIds.push(data.id)
    })

    it('rejects job creation with a different user_id (RLS violation)', async () => {
      const fakeUserId = '99999999-9999-9999-9999-999999999999'

      const { data, error } = await devUserClient
        .from('jobs')
        .insert([{
          title: 'RLS Test Job - Wrong User',
          description: 'This should fail due to RLS',
          user_id: fakeUserId,
          status: 'open',
        }])
        .select()
        .single()

      // RLS or trigger should reject this
      expect(error).not.toBeNull()
      // The error can come from RLS policy or from the auto_user_id trigger
      expect(
        error.message.includes('row-level security policy') ||
        error.message.includes('user_id must match authenticated user')
      ).toBe(true)
      expect(data).toBeNull()
    })

    it('allows user to read only their own jobs', async () => {
      // Create a job for dev user via admin (bypasses RLS)
      const admin = getAdminClient()
      const { data: devJob } = await admin
        .from('jobs')
        .insert([{
          title: 'Dev User Job',
          description: 'Job owned by dev user',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(devJob.id)

      // Create a job for test user 2 via admin
      const { data: user2Job } = await admin
        .from('jobs')
        .insert([{
          title: 'Test User 2 Job',
          description: 'Job owned by test user 2',
          user_id: testUser2Id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(user2Job.id)

      // Dev user should only see their own job
      const { data: devUserJobs } = await devUserClient
        .from('jobs')
        .select('id, title, user_id')
        .eq('id', devJob.id)

      expect(devUserJobs).toHaveLength(1)
      expect(devUserJobs[0].user_id).toBe(DEV_USER.id)

      // Dev user should NOT see test user 2's job
      const { data: devUserView } = await devUserClient
        .from('jobs')
        .select('id, title')
        .eq('id', user2Job.id)

      expect(devUserView).toHaveLength(0)

      // Test user 2 should only see their own job
      const { data: user2Jobs } = await testUser2Client
        .from('jobs')
        .select('id, title, user_id')
        .eq('id', user2Job.id)

      expect(user2Jobs).toHaveLength(1)
      expect(user2Jobs[0].user_id).toBe(testUser2Id)
    })

    it('allows user to update only their own jobs', async () => {
      // Create jobs for both users
      const admin = getAdminClient()
      const { data: devJob } = await admin
        .from('jobs')
        .insert([{
          title: 'Dev Job to Update',
          description: 'Original description',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(devJob.id)

      const { data: user2Job } = await admin
        .from('jobs')
        .insert([{
          title: 'User 2 Job',
          description: 'Should not be updatable by dev user',
          user_id: testUser2Id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(user2Job.id)

      // Dev user CAN update their own job
      const { data: updatedJob, error: updateError } = await devUserClient
        .from('jobs')
        .update({ title: 'Updated Dev Job' })
        .eq('id', devJob.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedJob.title).toBe('Updated Dev Job')

      // Dev user CANNOT update test user 2's job (RLS blocks it)
      const { data: blockedUpdate, error: blockedError } = await devUserClient
        .from('jobs')
        .update({ title: 'Hacked Title' })
        .eq('id', user2Job.id)
        .select()

      // RLS silently returns empty result for unauthorized updates
      expect(blockedUpdate).toHaveLength(0)

      // Verify user 2's job was NOT modified
      const { data: verifyJob } = await admin
        .from('jobs')
        .select('title')
        .eq('id', user2Job.id)
        .single()

      expect(verifyJob.title).toBe('User 2 Job')
    })

    it('allows user to delete only their own jobs', async () => {
      const admin = getAdminClient()

      // Create jobs for both users
      const { data: devJob } = await admin
        .from('jobs')
        .insert([{
          title: 'Dev Job to Delete',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      const { data: user2Job } = await admin
        .from('jobs')
        .insert([{
          title: 'User 2 Job - Do Not Delete',
          user_id: testUser2Id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(user2Job.id)

      // Dev user CAN delete their own job
      const { error: deleteError } = await devUserClient
        .from('jobs')
        .delete()
        .eq('id', devJob.id)

      expect(deleteError).toBeNull()

      // Verify deletion
      const { data: deletedJob } = await admin
        .from('jobs')
        .select('id')
        .eq('id', devJob.id)

      expect(deletedJob).toHaveLength(0)

      // Dev user CANNOT delete test user 2's job
      const { error: blockedDelete } = await devUserClient
        .from('jobs')
        .delete()
        .eq('id', user2Job.id)

      // RLS silently ignores unauthorized deletes (no error, just no effect)
      expect(blockedDelete).toBeNull()

      // Verify user 2's job was NOT deleted
      const { data: verifyJob } = await admin
        .from('jobs')
        .select('id')
        .eq('id', user2Job.id)

      expect(verifyJob).toHaveLength(1)
    })
  })

  describe('Unauthenticated access', () => {
    it('rejects job creation from unauthenticated client', async () => {
      // Create a fresh client with no auth
      const unauthClient = createFreshClient()

      const { data, error } = await unauthClient
        .from('jobs')
        .insert([{
          title: 'Unauthenticated Job',
          description: 'This should fail',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      expect(error).not.toBeNull()
      expect(error.message).toContain('row-level security policy')
      expect(data).toBeNull()
    })

    it('returns no jobs for unauthenticated client', async () => {
      // Create a job via admin first
      const admin = getAdminClient()
      const { data: job } = await admin
        .from('jobs')
        .insert([{
          title: 'Job That Should Be Hidden',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      createdJobIds.push(job.id)

      // Unauthenticated client should see nothing
      const unauthClient = createFreshClient()
      const { data: jobs, error } = await unauthClient
        .from('jobs')
        .select('*')

      expect(error).toBeNull()
      expect(jobs).toHaveLength(0)
    })
  })

  describe('Dev auth bypass mode', () => {
    it('dev user can create jobs when signed in with real auth', async () => {
      // This test verifies the fix for the RLS violation error
      // The dev bypass mode now uses real Supabase auth instead of fake tokens

      const { data, error } = await devUserClient
        .from('jobs')
        .insert([{
          title: 'Dev Bypass Test Job',
          description: 'Testing that dev auth bypass works with RLS',
          user_id: DEV_USER.id,
          status: 'open',
        }])
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.user_id).toBe(DEV_USER.id)
      expect(data.id).toBeDefined()

      createdJobIds.push(data.id)
    })

    it('auth.uid() matches the signed-in user ID', async () => {
      // Verify that auth.uid() is properly set when using signInWithPassword
      const { data: sessionData } = await devUserClient.auth.getSession()

      expect(sessionData.session).not.toBeNull()
      expect(sessionData.session.user.id).toBe(DEV_USER.id)

      // The JWT token should contain the correct user ID (sub claim)
      const token = sessionData.session.access_token
      const payload = JSON.parse(atob(token.split('.')[1]))

      expect(payload.sub).toBe(DEV_USER.id)
    })
  })
})
