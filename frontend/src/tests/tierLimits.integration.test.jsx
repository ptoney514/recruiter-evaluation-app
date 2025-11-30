/**
 * Tier Limits Integration Tests
 * Tests tier limit calculations with real job/candidate data from Supabase
 *
 * Prerequisites: Local Supabase running via `supabase start`
 * Run: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import {
  signInTestUser,
  cleanupDatabase,
  seedJob,
  seedCandidate,
  getUserId,
} from './testDbUtils'

// Get admin client for querying jobs
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Tier configuration (same as useTierLimits hook)
const TIER_LIMITS = {
  free: {
    jobs: 3,
    candidatesPerJob: 5
  },
  pro: {
    jobs: Infinity,
    candidatesPerJob: Infinity
  },
  enterprise: {
    jobs: Infinity,
    candidatesPerJob: Infinity
  }
}

/**
 * Calculate tier limits based on jobs data (mimics useTierLimits logic)
 */
function calculateTierLimits(jobs, tier = 'free') {
  const limits = TIER_LIMITS[tier]

  // Calculate usage (exclude archived jobs)
  const jobsUsed = jobs.filter(j => j.status !== 'archived').length
  const jobsAvailable = limits.jobs - jobsUsed

  // Per-job candidate limits
  const candidateCounts = jobs.map(job => ({
    jobId: job.id,
    count: job.candidates_count || 0,
    available: limits.candidatesPerJob - (job.candidates_count || 0)
  }))

  return {
    jobsUsed,
    jobsLimit: limits.jobs,
    jobsAvailable,
    jobsAtLimit: jobsUsed >= limits.jobs,
    candidateCounts,
    getCandidateCountForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      return job?.count ?? 0
    },
    getCandidateAvailableForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      // Use ?? instead of || to properly handle 0 as a valid value
      return job?.available ?? limits.candidatesPerJob
    },
    isCandidateAtLimitForJob: (jobId) => {
      const job = candidateCounts.find(c => c.jobId === jobId)
      return job && job.count >= limits.candidatesPerJob
    }
  }
}

/**
 * Get jobs with candidate counts from database
 */
async function getJobsWithCounts(userId) {
  const { data, error } = await adminClient
    .from('jobs')
    .select(`
      id,
      title,
      status,
      candidates (count)
    `)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get jobs: ${error.message}`)
  }

  // Transform to include candidate count
  return data.map(job => ({
    ...job,
    candidates_count: job.candidates?.[0]?.count || 0
  }))
}

describe('Tier Limits Integration', () => {
  let userId

  beforeAll(async () => {
    // Sign in test user
    userId = await signInTestUser()
  })

  afterEach(async () => {
    // Clean up test data
    await cleanupDatabase()
  })

  it('returns correct limits for free tier (3 jobs, 5 candidates per job)', async () => {
    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Verify free tier limits
    expect(tierLimits.jobsLimit).toBe(3)
  })

  it('returns correct limits for pro tier (Infinity)', async () => {
    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'pro')

    // Verify pro tier limits
    expect(tierLimits.jobsLimit).toBe(Infinity)
  })

  it('calculates jobsUsed from real job count (excludes archived)', async () => {
    // Create 2 open jobs and 1 archived job
    await seedJob({ title: 'Open Job 1', status: 'open' })
    await seedJob({ title: 'Open Job 2', status: 'open' })
    await seedJob({ title: 'Archived Job', status: 'archived' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Should count only non-archived jobs
    expect(tierLimits.jobsUsed).toBe(2)
  })

  it('calculates jobsAvailable correctly (limit - used)', async () => {
    // Create 1 open job
    await seedJob({ title: 'Test Job', status: 'open' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Free tier: 3 jobs - 1 used = 2 available
    expect(tierLimits.jobsUsed).toBe(1)
    expect(tierLimits.jobsAvailable).toBe(2)
  })

  it('sets jobsAtLimit true when at free tier limit (3 jobs)', async () => {
    // Create exactly 3 jobs (free tier limit)
    await seedJob({ title: 'Job 1', status: 'open' })
    await seedJob({ title: 'Job 2', status: 'open' })
    await seedJob({ title: 'Job 3', status: 'open' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    expect(tierLimits.jobsUsed).toBe(3)
    expect(tierLimits.jobsAtLimit).toBe(true)
    expect(tierLimits.jobsAvailable).toBe(0)
  })

  it('calculates candidate counts per job from candidates_count field', async () => {
    // Create a job with candidates
    const job = await seedJob({ title: 'Job with Candidates' })
    await seedCandidate(job.id, { full_name: 'Candidate 1' })
    await seedCandidate(job.id, { full_name: 'Candidate 2' })
    await seedCandidate(job.id, { full_name: 'Candidate 3' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Find the job in candidateCounts
    const jobCounts = tierLimits.candidateCounts.find(c => c.jobId === job.id)
    expect(jobCounts).toBeDefined()
    expect(jobCounts.count).toBe(3)
  })

  it('getCandidateCountForJob returns correct count', async () => {
    // Create a job with 4 candidates
    const job = await seedJob({ title: 'Count Test Job' })
    await seedCandidate(job.id, { full_name: 'Candidate 1' })
    await seedCandidate(job.id, { full_name: 'Candidate 2' })
    await seedCandidate(job.id, { full_name: 'Candidate 3' })
    await seedCandidate(job.id, { full_name: 'Candidate 4' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Use helper function
    const count = tierLimits.getCandidateCountForJob(job.id)
    expect(count).toBe(4)
  })

  it('getCandidateAvailableForJob returns remaining slots (limit - count)', async () => {
    // Create a job with 2 candidates
    const job = await seedJob({ title: 'Available Slots Test Job' })
    await seedCandidate(job.id, { full_name: 'Candidate 1' })
    await seedCandidate(job.id, { full_name: 'Candidate 2' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Free tier allows 5 candidates per job - 2 used = 3 available
    const available = tierLimits.getCandidateAvailableForJob(job.id)
    expect(available).toBe(3)
  })

  it('isCandidateAtLimitForJob returns true at limit (5 candidates)', async () => {
    // Create a job with exactly 5 candidates (free tier limit)
    const job = await seedJob({ title: 'At Limit Test Job' })
    await seedCandidate(job.id, { full_name: 'Candidate 1' })
    await seedCandidate(job.id, { full_name: 'Candidate 2' })
    await seedCandidate(job.id, { full_name: 'Candidate 3' })
    await seedCandidate(job.id, { full_name: 'Candidate 4' })
    await seedCandidate(job.id, { full_name: 'Candidate 5' })

    const jobs = await getJobsWithCounts(userId)
    const tierLimits = calculateTierLimits(jobs, 'free')

    // Should be at limit
    const isAtLimit = tierLimits.isCandidateAtLimitForJob(job.id)
    expect(isAtLimit).toBe(true)

    // Available should be 0
    const available = tierLimits.getCandidateAvailableForJob(job.id)
    expect(available).toBe(0)
  })
})
