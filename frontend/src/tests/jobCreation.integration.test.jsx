/**
 * Job Creation Integration Tests
 * Tests job creation with real Supabase database operations
 *
 * Prerequisites: Local Supabase running via `supabase start`
 * Run: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import {
  signInTestUser,
  cleanupDatabase,
  seedJob,
  getJobById,
  getSupabaseClient,
} from './testDbUtils'

describe('Job Creation Integration', () => {
  let userId

  beforeAll(async () => {
    // Sign in test user - required for all tests
    userId = await signInTestUser()
  })

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupDatabase()
  })

  it('creates job with minimal required fields (title only)', async () => {
    const job = await seedJob({
      title: 'Minimal Test Job',
    })

    // Verify job was created
    expect(job).toBeDefined()
    expect(job.id).toBeDefined()
    expect(job.title).toBe('Minimal Test Job')

    // Verify in database
    const dbJob = await getJobById(job.id)
    expect(dbJob).toBeDefined()
    expect(dbJob.title).toBe('Minimal Test Job')
  })

  it('creates job with all fields including requirements', async () => {
    const fullJobData = {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      employment_type: 'Full-time',
      compensation_min: 150000,
      compensation_max: 200000,
      description: 'We are looking for a senior engineer to lead our team.',
      must_have_requirements: ['JavaScript', 'React', '5+ years experience'],
      preferred_requirements: ['TypeScript', 'Node.js', 'AWS'],
      status: 'open',
    }

    const job = await seedJob(fullJobData)

    // Verify all fields
    expect(job.title).toBe('Senior Software Engineer')
    expect(job.department).toBe('Engineering')
    expect(job.location).toBe('San Francisco, CA')
    expect(job.employment_type).toBe('Full-time')
    expect(job.compensation_min).toBe(150000)
    expect(job.compensation_max).toBe(200000)
    expect(job.description).toBe('We are looking for a senior engineer to lead our team.')
    expect(job.status).toBe('open')

    // Verify in database
    const dbJob = await getJobById(job.id)
    expect(dbJob.title).toBe('Senior Software Engineer')
    expect(dbJob.department).toBe('Engineering')
  })

  it('returns created job with auto-generated fields (id, created_at, user_id)', async () => {
    const job = await seedJob({
      title: 'Auto-fields Test Job',
    })

    // Verify auto-generated fields
    expect(job.id).toBeDefined()
    expect(typeof job.id).toBe('string')
    expect(job.id.length).toBeGreaterThan(0)

    expect(job.created_at).toBeDefined()
    expect(new Date(job.created_at)).toBeInstanceOf(Date)

    expect(job.user_id).toBe(userId)
  })

  it('creates multiple jobs for same user', async () => {
    // Create multiple jobs
    const job1 = await seedJob({ title: 'First Job' })
    const job2 = await seedJob({ title: 'Second Job' })
    const job3 = await seedJob({ title: 'Third Job' })

    // Verify all three jobs exist
    expect(job1.id).toBeDefined()
    expect(job2.id).toBeDefined()
    expect(job3.id).toBeDefined()

    // All have same user_id
    expect(job1.user_id).toBe(userId)
    expect(job2.user_id).toBe(userId)
    expect(job3.user_id).toBe(userId)

    // All have different IDs
    expect(job1.id).not.toBe(job2.id)
    expect(job2.id).not.toBe(job3.id)
    expect(job1.id).not.toBe(job3.id)

    // Verify all exist in database
    const dbJob1 = await getJobById(job1.id)
    const dbJob2 = await getJobById(job2.id)
    const dbJob3 = await getJobById(job3.id)

    expect(dbJob1).toBeDefined()
    expect(dbJob2).toBeDefined()
    expect(dbJob3).toBeDefined()
  })

  it('stores JSONB requirements correctly (must_have and preferred arrays)', async () => {
    const requirementsData = {
      title: 'JSONB Requirements Test Job',
      must_have_requirements: [
        'Bachelor degree in Computer Science',
        '5+ years of software development',
        'Experience with React and Node.js',
      ],
      preferred_requirements: [
        'Master degree preferred',
        'Experience with AWS or GCP',
        'Open source contributions',
      ],
    }

    const job = await seedJob(requirementsData)

    // Verify requirements are stored as arrays
    expect(Array.isArray(job.must_have_requirements)).toBe(true)
    expect(Array.isArray(job.preferred_requirements)).toBe(true)

    // Verify content
    expect(job.must_have_requirements).toHaveLength(3)
    expect(job.preferred_requirements).toHaveLength(3)

    expect(job.must_have_requirements).toContain('Bachelor degree in Computer Science')
    expect(job.preferred_requirements).toContain('Experience with AWS or GCP')

    // Verify in database
    const dbJob = await getJobById(job.id)
    expect(dbJob.must_have_requirements).toEqual(requirementsData.must_have_requirements)
    expect(dbJob.preferred_requirements).toEqual(requirementsData.preferred_requirements)
  })

  it('handles duplicate job titles gracefully (no unique constraint)', async () => {
    const duplicateTitle = 'Duplicate Title Job'

    // Create first job with title
    const job1 = await seedJob({ title: duplicateTitle })

    // Create second job with same title - should succeed
    const job2 = await seedJob({ title: duplicateTitle })

    // Both should exist with same title
    expect(job1.title).toBe(duplicateTitle)
    expect(job2.title).toBe(duplicateTitle)

    // But different IDs
    expect(job1.id).not.toBe(job2.id)

    // Both should exist in database
    const dbJob1 = await getJobById(job1.id)
    const dbJob2 = await getJobById(job2.id)

    expect(dbJob1.title).toBe(duplicateTitle)
    expect(dbJob2.title).toBe(duplicateTitle)
  })

  it('stores null values correctly for optional fields', async () => {
    const job = await seedJob({
      title: 'Optional Fields Test',
      // All other fields left as default (null)
    })

    // Verify optional fields are null
    expect(job.department).toBeNull()
    expect(job.location).toBeNull()
    expect(job.compensation_min).toBeNull()
    expect(job.compensation_max).toBeNull()

    // Verify in database
    const dbJob = await getJobById(job.id)
    expect(dbJob.department).toBeNull()
    expect(dbJob.location).toBeNull()
  })

  it('defaults status to open for new jobs', async () => {
    const job = await seedJob({
      title: 'Status Default Test',
      // Don't set status
    })

    // seedJob sets default status to 'open'
    expect(job.status).toBe('open')

    // Verify in database
    const dbJob = await getJobById(job.id)
    expect(dbJob.status).toBe('open')
  })
})
