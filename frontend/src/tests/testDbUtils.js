/**
 * Test Database Utilities
 * Functions for seeding test data and cleaning up in integration/E2E tests
 * Uses Supabase admin client (with service role key) to bypass RLS policies
 *
 * NOTE: Creates its own Supabase client to bypass the mocks in setup.js
 * For integration tests, we need real Supabase connections
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables - use local Supabase defaults
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Test user credentials (will be created via Supabase Auth)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
}

let anonClient = null
let adminClient = null
let testUserId = null

/**
 * Get the anon client (creates real client bypassing mocks)
 * This client should be used for auth and will share session with hooks via storage
 */
export function getSupabaseClient() {
  if (!anonClient) {
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    })
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
 * Will attempt sign up if sign in fails (user doesn't exist)
 */
export async function signInTestUser() {
  try {
    // First try to sign in
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    if (!error && data?.user) {
      testUserId = data.user.id
      return data.user.id
    }

    // If sign in failed, try to sign up first
    console.log('Sign in failed, attempting to create test user...')
    const { data: signUpData, error: signUpError } = await getSupabaseClient().auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw new Error(`Sign up failed: ${signUpError.message}`)
    }

    // Now try to sign in again
    const { data: retryData, error: retryError } = await getSupabaseClient().auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    })

    if (retryError) {
      throw new Error(`Sign in failed after signup: ${retryError.message}`)
    }

    testUserId = retryData.user.id
    return retryData.user.id
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
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultCandidate = {
    job_id: jobId,
    user_id: userId,
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

  const candidateToInsert = { ...defaultCandidate, ...candidateData, job_id: jobId, user_id: userId }

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

/**
 * Create test interview rating for a candidate
 */
export async function seedInterviewRating(candidateId, ratingData = {}) {
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultRating = {
    candidate_id: candidateId,
    user_id: userId,
    interviewer_name: 'Test Interviewer',
    interview_date: new Date().toISOString().split('T')[0],
    interview_type: 'phone_screen',
    technical_skills_rating: 8,
    communication_rating: 7,
    problem_solving_rating: 8,
    cultural_fit_rating: 9,
    overall_rating: 8,
    recommendation: 'HIRE',
    strengths: 'Good technical skills',
    concerns: 'None',
    notes: 'Test interview notes',
  }

  const ratingToInsert = { ...defaultRating, ...ratingData, candidate_id: candidateId, user_id: userId }

  const { data, error } = await admin
    .from('interview_ratings')
    .insert([ratingToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create interview rating: ${error.message}`)
  }

  return data
}

/**
 * Create test reference check for a candidate
 */
export async function seedReferenceCheck(candidateId, checkData = {}) {
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultCheck = {
    candidate_id: candidateId,
    user_id: userId,
    reference_name: 'Test Reference',
    reference_title: 'Former Manager',
    relationship: 'supervisor',
    dates_worked_together: '2020-2023',
    overall_rating: 8,
    would_rehire: 'yes_definitely',
    strengths: 'Great team player',
    areas_for_development: 'Could improve time management',
    notes: 'Test reference check notes',
    checked_by: 'Test Checker',
    check_date: new Date().toISOString().split('T')[0],
  }

  const checkToInsert = { ...defaultCheck, ...checkData, candidate_id: candidateId, user_id: userId }

  const { data, error } = await admin
    .from('reference_checks')
    .insert([checkToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create reference check: ${error.message}`)
  }

  return data
}

/**
 * Create test candidate ranking
 */
export async function seedRanking(jobId, candidateId, rankingData = {}) {
  const userId = await getUserId()
  const admin = getAdminClient()

  const defaultRanking = {
    job_id: jobId,
    candidate_id: candidateId,
    user_id: userId,
    rank: 1,
    manual_notes: 'Test ranking notes',
  }

  const rankingToInsert = { ...defaultRanking, ...rankingData, user_id: userId }

  const { data, error } = await admin
    .from('candidate_rankings')
    .insert([rankingToInsert])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create ranking: ${error.message}`)
  }

  return data
}

/**
 * Verify all evaluations for a job were deleted
 */
export async function verifyEvaluationsDeleted(jobId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('evaluations')
    .select('id')
    .eq('job_id', jobId)

  if (error) {
    throw new Error(`Failed to check evaluations: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Verify all interview ratings for a candidate were deleted
 */
export async function verifyInterviewRatingsDeleted(candidateId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('interview_ratings')
    .select('id')
    .eq('candidate_id', candidateId)

  if (error) {
    throw new Error(`Failed to check interview ratings: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Verify all reference checks for a candidate were deleted
 */
export async function verifyReferenceChecksDeleted(candidateId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('reference_checks')
    .select('id')
    .eq('candidate_id', candidateId)

  if (error) {
    throw new Error(`Failed to check reference checks: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Verify all rankings for a job were deleted
 */
export async function verifyRankingsDeleted(jobId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('candidate_rankings')
    .select('id')
    .eq('job_id', jobId)

  if (error) {
    throw new Error(`Failed to check rankings: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Get a job by ID (for verification)
 */
export async function getJobById(jobId) {
  const admin = getAdminClient()

  const { data, error } = await admin
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    throw new Error(`Failed to get job: ${error.message}`)
  }

  return data
}
