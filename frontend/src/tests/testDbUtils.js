/**
 * Test Database Utilities
 * Functions for seeding test data and cleaning up in integration/E2E tests
 * Uses Supabase admin client (with service role key) to bypass RLS policies
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFianZhYmN4eHd1Y3RydWdyYXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQ5NTMyNzcsImV4cCI6MTk5MDUyOTI3N30.2qQZ6BTsWqpM8V1rR2qmKGqZTTL5NRrFvQRKkMDxpEM'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFianZhYmN4eHd1Y3RydWdyYXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3NDk1MzI3NywiZXhwIjoxOTkwNTI5Mjc3fQ.BHNiHR7KVZxD6fDUfTwHZ2TZGsLBxQPDf6lWrKL_JCU'

// Test user credentials (will be created via Supabase Auth)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
}

let anonClient = null
let adminClient = null
let testUserId = null

/**
 * Get the anon client (for simulating authenticated user requests)
 */
export function getSupabaseClient() {
  if (!anonClient) {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return anonClient
}

/**
 * Get the admin client (for bypassing RLS policies)
 */
function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return adminClient
}

/**
 * Set up test database - creates test user and returns user ID
 */
export async function setupTestDatabase() {
  try {
    // Sign up test user
    const { data: authData, error: authError } = await getSupabaseClient().auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    if (authError && !authError.message.includes('already registered')) {
      throw new Error(`Auth signup failed: ${authError.message}`)
    }

    // Get user ID
    const { data: { user }, error: userError } = await getSupabaseClient().auth.getUser()
    if (userError || !user) {
      throw new Error(`Failed to get user: ${userError?.message}`)
    }

    testUserId = user.id
    return user.id
  } catch (error) {
    console.error('setupTestDatabase error:', error)
    throw error
  }
}

/**
 * Get authenticated test user ID
 */
export async function getUserId() {
  if (testUserId) {
    return testUserId
  }

  const { data: { user }, error } = await getSupabaseClient().auth.getUser()
  if (error || !user) {
    throw new Error(`Failed to get user ID: ${error?.message}`)
  }

  testUserId = user.id
  return testUserId
}

/**
 * Sign in test user (for tests that need fresh session)
 */
export async function signInTestUser() {
  try {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`)
    }

    testUserId = data.user.id
    return data.user.id
  } catch (error) {
    console.error('signInTestUser error:', error)
    throw error
  }
}

/**
 * Create test job
 */
export async function seedJob(jobData = {}) {
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultJob = {
    title: 'Test Job',
    description: 'Test description for testing purposes',
    department: null,
    location: null,
    employment_type: 'Full-time',
    must_have_requirements: [],
    preferred_requirements: [],
    years_experience_min: null,
    years_experience_max: null,
    compensation_min: null,
    compensation_max: null,
    status: 'open',
    user_id: userId,
  }

  const jobToInsert = { ...defaultJob, ...jobData, user_id: userId }

  const { data, error } = await admin
    .from('jobs')
    .insert([jobToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`)
  }

  return data
}

/**
 * Create test candidate linked to job
 */
export async function seedCandidate(jobId, candidateData = {}) {
  const admin = getAdminClient()

  const defaultCandidate = {
    job_id: jobId,
    full_name: 'Test Candidate',
    email: 'candidate@example.com',
    phone: '555-1234',
    location: 'Test City',
    resume_text: 'Sample resume text',
    resume_file_url: null,
    resume_file_name: null,
    cover_letter: null,
    current_title: 'Test Role',
    current_company: 'Test Company',
    years_experience: 5,
    linkedin_url: null,
    portfolio_url: null,
    skills: [],
    education: [],
    additional_notes: null,
  }

  const candidateToInsert = { ...defaultCandidate, ...candidateData, job_id: jobId }

  const { data, error } = await admin
    .from('candidates')
    .insert([candidateToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create candidate: ${error.message}`)
  }

  return data
}

/**
 * Create test evaluation for candidate
 */
export async function seedEvaluation(candidateId, jobId, evalData = {}) {
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultEval = {
    candidate_id: candidateId,
    job_id: jobId,
    user_id: userId,
    recommendation: 'ADVANCE',
    confidence: 'High',
    overall_score: 8.5,
    key_strengths: ['Strong technical skills', 'Good communication'],
    concerns: [],
    requirements_match: { required: ['✓'], preferred: ['✓'] },
    reasoning: 'Strong candidate who meets all requirements',
    claude_model: 'claude-3-5-haiku-20241022',
    evaluation_prompt_tokens: 1000,
    evaluation_completion_tokens: 500,
    evaluation_cost: 0.003,
  }

  const evalToInsert = { ...defaultEval, ...evalData, user_id: userId }

  const { data, error } = await admin
    .from('evaluations')
    .insert([evalToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create evaluation: ${error.message}`)
  }

  return data
}

/**
 * Clean up all test data for current user
 */
export async function cleanupDatabase() {
  try {
    const userId = await getUserId()
    const admin = getAdminClient()

    // Delete all related data for this user (order matters due to FK constraints)
    // 1. Evaluations (no FK dependencies)
    await admin.from('evaluations').delete().eq('user_id', userId)

    // 2. Interview ratings
    await admin.from('interview_ratings').delete().eq('user_id', userId)

    // 3. Reference checks
    await admin.from('reference_checks').delete().eq('user_id', userId)

    // 4. Candidate rankings
    await admin.from('candidate_rankings').delete().eq('user_id', userId)

    // 5. Candidates (cascades to evaluations, but we already deleted those)
    await admin.from('candidates').delete().eq('user_id', userId)

    // 6. Jobs (cascades to candidates and evaluations)
    await admin.from('jobs').delete().eq('user_id', userId)

    console.log(`Cleaned up all data for user ${userId}`)
  } catch (error) {
    console.error('cleanupDatabase error:', error)
    throw error
  }
}

/**
 * Get candidate count for a specific job (for testing aggregations)
 */
export async function getCandidateCountForJob(jobId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)

  if (error) {
    throw new Error(`Failed to count candidates: ${error.message}`)
  }

  return data?.length || 0
}

/**
 * Get evaluation count for a specific job
 */
export async function getEvaluationCountForJob(jobId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)

  if (error) {
    throw new Error(`Failed to count evaluations: ${error.message}`)
  }

  return data?.length || 0
}

/**
 * Get a job with candidate and evaluation counts (simulating the hook's behavior)
 */
export async function getJobWithCounts(jobId) {
  const admin = getAdminClient()

  // Get job
  const { data: job, error: jobError } = await admin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError) {
    throw new Error(`Failed to get job: ${jobError.message}`)
  }

  // Get candidate count
  const candidatesCount = await getCandidateCountForJob(jobId)

  // Get evaluation count
  const evaluatedCount = await getEvaluationCountForJob(jobId)

  return {
    ...job,
    candidates_count: candidatesCount,
    evaluated_count: evaluatedCount,
  }
}

/**
 * Verify cascade delete worked (check that related records were deleted)
 */
export async function verifyJobDeleted(jobId) {
  const admin = getAdminClient()

  const { data: job } = await admin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (job) {
    return false // Job still exists
  }

  return true // Job was deleted
}

/**
 * Verify all candidates for a job were deleted
 */
export async function verifyCandidatesDeleted(jobId) {
  const count = await getCandidateCountForJob(jobId)
  return count === 0
}
