/**
 * Job Deletion Integration Tests
 * Tests job deletion and cascade behavior with real Supabase database
 *
 * Prerequisites: Local Supabase running via `supabase start`
 * Run: npm run test:integration
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import {
  signInTestUser,
  cleanupDatabase,
  seedJob,
  seedCandidate,
  seedEvaluation,
  seedRanking,
  seedInterviewRating,
  seedReferenceCheck,
  getJobById,
  verifyJobDeleted,
  verifyCandidatesDeleted,
  verifyEvaluationsDeleted,
  verifyRankingsDeleted,
  verifyInterviewRatingsDeleted,
  verifyReferenceChecksDeleted,
} from './testDbUtils'

// Get admin client for delete operations
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Delete a job using the admin client
 */
async function deleteJob(jobId) {
  const { error } = await adminClient
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed to delete job: ${error.message}`)
  }

  return jobId
}

describe('Job Deletion Integration', () => {
  let testJob
  let testCandidate

  beforeAll(async () => {
    // Sign in test user
    await signInTestUser()
  })

  beforeEach(async () => {
    // Create base test data for most tests
    testJob = await seedJob({ title: 'Delete Test Job' })
    testCandidate = await seedCandidate(testJob.id, { full_name: 'Test Candidate' })
  })

  afterEach(async () => {
    // Clean up all test data
    await cleanupDatabase()
  })

  it('deletes job by ID - job removed from database', async () => {
    // Verify job exists before deletion
    const jobBefore = await getJobById(testJob.id)
    expect(jobBefore).toBeDefined()

    // Delete job
    await deleteJob(testJob.id)

    // Verify job is deleted
    const isDeleted = await verifyJobDeleted(testJob.id)
    expect(isDeleted).toBe(true)
  })

  it('cascade deletes candidates when job deleted', async () => {
    // Add more candidates
    await seedCandidate(testJob.id, { full_name: 'Candidate 2' })
    await seedCandidate(testJob.id, { full_name: 'Candidate 3' })

    // Delete job
    await deleteJob(testJob.id)

    // Verify all candidates are deleted (cascade)
    const candidatesDeleted = await verifyCandidatesDeleted(testJob.id)
    expect(candidatesDeleted).toBe(true)
  })

  it('cascade deletes evaluations when job deleted', async () => {
    // Create evaluation for the test candidate
    await seedEvaluation(testCandidate.id, testJob.id)

    // Delete job
    await deleteJob(testJob.id)

    // Verify evaluations are deleted
    const evaluationsDeleted = await verifyEvaluationsDeleted(testJob.id)
    expect(evaluationsDeleted).toBe(true)
  })

  it('cascade deletes rankings when job deleted', async () => {
    // Create ranking for the test candidate
    await seedRanking(testJob.id, testCandidate.id, { rank: 1 })

    // Delete job
    await deleteJob(testJob.id)

    // Verify rankings are deleted
    const rankingsDeleted = await verifyRankingsDeleted(testJob.id)
    expect(rankingsDeleted).toBe(true)
  })

  it('cascade deletes interview_ratings via candidates', async () => {
    // Create interview rating for the test candidate
    await seedInterviewRating(testCandidate.id, {
      interviewer_name: 'Test Interviewer',
      overall_rating: 8,
    })

    // Delete job - should cascade delete candidate, which cascades to interview_ratings
    await deleteJob(testJob.id)

    // Verify interview ratings are deleted
    const ratingsDeleted = await verifyInterviewRatingsDeleted(testCandidate.id)
    expect(ratingsDeleted).toBe(true)
  })

  it('cascade deletes reference_checks via candidates', async () => {
    // Create reference check for the test candidate
    await seedReferenceCheck(testCandidate.id, {
      reference_name: 'Test Reference',
      overall_rating: 9,
    })

    // Delete job - should cascade delete candidate, which cascades to reference_checks
    await deleteJob(testJob.id)

    // Verify reference checks are deleted
    const checksDeleted = await verifyReferenceChecksDeleted(testCandidate.id)
    expect(checksDeleted).toBe(true)
  })

  it('returns successfully when deleting job that does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000'

    // Should not throw - just does nothing
    await deleteJob(nonExistentId)

    // Verify no error occurred (test passes if we get here)
    expect(true).toBe(true)
  })

  it('only affects the specific job being deleted', async () => {
    // Create another job that should NOT be deleted
    const otherJob = await seedJob({ title: 'Other Job - Keep This' })
    const otherCandidate = await seedCandidate(otherJob.id, { full_name: 'Other Candidate' })

    // Delete first job
    await deleteJob(testJob.id)

    // Verify first job is deleted
    const firstDeleted = await verifyJobDeleted(testJob.id)
    expect(firstDeleted).toBe(true)

    // Verify second job still exists
    const secondJob = await getJobById(otherJob.id)
    expect(secondJob).toBeDefined()
    expect(secondJob.title).toBe('Other Job - Keep This')
  })

  it('handles multiple related records during cascade delete', async () => {
    // Create complex related data
    const candidate2 = await seedCandidate(testJob.id, { full_name: 'Candidate 2' })
    const candidate3 = await seedCandidate(testJob.id, { full_name: 'Candidate 3' })

    // Multiple evaluations
    await seedEvaluation(testCandidate.id, testJob.id)
    await seedEvaluation(candidate2.id, testJob.id)
    await seedEvaluation(candidate3.id, testJob.id)

    // Rankings
    await seedRanking(testJob.id, testCandidate.id, { rank: 1 })
    await seedRanking(testJob.id, candidate2.id, { rank: 2 })
    await seedRanking(testJob.id, candidate3.id, { rank: 3 })

    // Interview ratings
    await seedInterviewRating(testCandidate.id)
    await seedInterviewRating(candidate2.id)

    // Reference checks
    await seedReferenceCheck(testCandidate.id)

    // Delete job
    await deleteJob(testJob.id)

    // Verify all related data is deleted
    expect(await verifyJobDeleted(testJob.id)).toBe(true)
    expect(await verifyCandidatesDeleted(testJob.id)).toBe(true)
    expect(await verifyEvaluationsDeleted(testJob.id)).toBe(true)
    expect(await verifyRankingsDeleted(testJob.id)).toBe(true)
    expect(await verifyInterviewRatingsDeleted(testCandidate.id)).toBe(true)
    expect(await verifyInterviewRatingsDeleted(candidate2.id)).toBe(true)
    expect(await verifyReferenceChecksDeleted(testCandidate.id)).toBe(true)
  })

  it('verifies job ID is returned after delete', async () => {
    const deletedId = await deleteJob(testJob.id)
    expect(deletedId).toBe(testJob.id)
  })
})
