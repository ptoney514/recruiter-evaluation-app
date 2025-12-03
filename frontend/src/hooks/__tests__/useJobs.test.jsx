/**
 * useJobs Hook Unit Tests
 * Tests React Query hooks with mocked databaseService
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as dbService from '../../services/databaseService'
import { useJobs, useJob, useCreateJob, useUpdateJob, useDeleteJob } from '../useJobs'

// Mock the database service
vi.mock('../../services/databaseService')

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Wrapper component with QueryClientProvider
function createWrapper() {
  const queryClient = createTestQueryClient()
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useJobs hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============ useJobs ============

  describe('useJobs', () => {
    const mockJobs = [
      {
        id: 'job-1',
        title: 'Software Engineer',
        department: 'Engineering',
        location: 'Remote',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        candidates_count: 5,
        evaluated_count: 3,
      },
      {
        id: 'job-2',
        title: 'Product Manager',
        department: 'Product',
        location: 'NYC',
        status: 'draft',
        created_at: '2024-01-02T00:00:00Z',
        candidates_count: 0,
        evaluated_count: 0,
      },
    ]

    it('should fetch jobs successfully', async () => {
      dbService.getJobs.mockResolvedValueOnce({
        success: true,
        jobs: mockJobs,
      })

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(2)
      expect(result.current.data[0].title).toBe('Software Engineer')
      expect(result.current.data[0].candidates_count).toBe(5)
    })

    it('should handle empty jobs list', async () => {
      dbService.getJobs.mockResolvedValueOnce({
        success: true,
        jobs: [],
      })

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      dbService.getJobs.mockResolvedValueOnce({
        success: false,
        error: 'Unauthorized',
      })

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Unauthorized')
    })

    it('should set default status to draft for jobs without status', async () => {
      dbService.getJobs.mockResolvedValueOnce({
        success: true,
        jobs: [{ id: 'job-1', title: 'Test Job' }],
      })

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data[0].status).toBe('draft')
    })
  })

  // ============ useJob ============

  describe('useJob', () => {
    const mockJob = {
      id: 'job-123',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'SF',
      must_have_requirements: ['5+ years experience', 'Python'],
      preferred_requirements: ['AWS'],
    }

    it('should fetch a single job by ID', async () => {
      dbService.getJob.mockResolvedValueOnce({
        success: true,
        job: mockJob,
      })

      const { result } = renderHook(() => useJob('job-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.getJob).toHaveBeenCalledWith('job-123')
      expect(result.current.data.title).toBe('Senior Software Engineer')
      expect(result.current.data.must_have_requirements).toContain('Python')
    })

    it('should not fetch when jobId is null', async () => {
      const { result } = renderHook(() => useJob(null), {
        wrapper: createWrapper(),
      })

      // Should not be loading because query is disabled
      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
      expect(dbService.getJob).not.toHaveBeenCalled()
    })

    it('should handle job not found', async () => {
      dbService.getJob.mockResolvedValueOnce({
        success: false,
        error: 'Job not found',
      })

      const { result } = renderHook(() => useJob('nonexistent'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Job not found')
    })
  })

  // ============ useCreateJob ============

  describe('useCreateJob', () => {
    it('should create a new job', async () => {
      const newJob = {
        title: 'New Position',
        department: 'Sales',
      }

      const createdJob = {
        id: 'job-new',
        ...newJob,
        created_at: '2024-01-03T00:00:00Z',
      }

      dbService.createJob.mockResolvedValueOnce({
        success: true,
        job: createdJob,
      })

      const { result } = renderHook(() => useCreateJob(), {
        wrapper: createWrapper(),
      })

      // Execute mutation
      result.current.mutate(newJob)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.createJob).toHaveBeenCalledWith(newJob)
      expect(result.current.data.id).toBe('job-new')
    })

    it('should handle creation errors', async () => {
      dbService.createJob.mockResolvedValueOnce({
        success: false,
        error: 'Validation error',
      })

      const { result } = renderHook(() => useCreateJob(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ title: '' })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Validation error')
    })
  })

  // ============ useUpdateJob ============

  describe('useUpdateJob', () => {
    it('should update an existing job', async () => {
      const updates = { title: 'Updated Title' }
      const updatedJob = {
        id: 'job-123',
        title: 'Updated Title',
        department: 'Engineering',
      }

      dbService.updateJob.mockResolvedValueOnce({
        success: true,
        job: updatedJob,
      })

      const { result } = renderHook(() => useUpdateJob(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ jobId: 'job-123', updates })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.updateJob).toHaveBeenCalledWith('job-123', updates)
      expect(result.current.data.title).toBe('Updated Title')
    })

    it('should handle update errors', async () => {
      dbService.updateJob.mockResolvedValueOnce({
        success: false,
        error: 'Job not found',
      })

      const { result } = renderHook(() => useUpdateJob(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ jobId: 'nonexistent', updates: {} })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Job not found')
    })
  })

  // ============ useDeleteJob ============

  describe('useDeleteJob', () => {
    it('should delete a job', async () => {
      dbService.deleteJob.mockResolvedValueOnce({
        success: true,
      })

      const { result } = renderHook(() => useDeleteJob(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('job-123')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.deleteJob).toHaveBeenCalledWith('job-123')
      expect(result.current.data).toBe('job-123')
    })

    it('should handle deletion errors', async () => {
      dbService.deleteJob.mockResolvedValueOnce({
        success: false,
        error: 'Cannot delete job with candidates',
      })

      const { result } = renderHook(() => useDeleteJob(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('job-with-candidates')

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Cannot delete job with candidates')
    })
  })
})
