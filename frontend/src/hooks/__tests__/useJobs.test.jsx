/**
 * Tests for useJobs hooks
 * Tests job CRUD operations with React Query and Supabase
 *
 * Note: VITE_AUTH_BYPASS is set to 'false' in vitest.config.js
 * so these tests properly test authentication flows
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Create mock functions at module scope
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

// Mock Supabase client - this must happen before the hook is imported
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args) => mockFrom(...args),
  },
}))

// Import hooks after mocking
import {
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
} from '../useJobs'

// Test fixtures
const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockJobId = 'job-456'

const mockJobData = {
  id: mockJobId,
  user_id: mockUser.id,
  title: 'Senior Software Engineer',
  department: 'Engineering',
  location: 'Remote',
  employment_type: 'Full-time',
  description: 'We are looking for a senior engineer...',
  must_have_requirements: ['5+ years experience', 'React', 'Node.js'],
  preferred_requirements: ['GraphQL', 'AWS'],
  status: 'open',
  created_at: '2025-01-10T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  candidates: [{ count: 5 }],
  evaluations: [{ count: 3 }],
}

// Helper to create query client wrapper
function createWrapper() {
  const queryClient = new QueryClient({
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

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useJobs hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useJobs', () => {
    it('should fetch jobs for authenticated user', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockJobData],
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useJobs(), { wrapper })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].title).toBe('Senior Software Engineer')
      expect(result.current.data[0].candidates_count).toBe(5)
      expect(result.current.data[0].evaluated_count).toBe(3)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useJobs(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error.message).toBe('User not authenticated')
    })

    it('should handle Supabase query errors', async () => {
      const mockError = new Error('Database connection failed')
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useJobs(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error.message).toBe('Database connection failed')
    })

    it('should return empty array when no jobs exist', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useJobs(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
    })
  })

  describe('useJob', () => {
    it('should fetch single job by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockJobData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useJob(mockJobId), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data.id).toBe(mockJobId)
      expect(result.current.data.title).toBe('Senior Software Engineer')
    })

    it('should not fetch when jobId is not provided', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useJob(null), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('useCreateJob', () => {
    it('should create a new job with user_id', async () => {
      const newJobData = {
        id: 'new-job-123',
        title: 'Product Manager',
        description: 'Looking for a PM',
        priorities: 'SaaS experience preferred',
        must_have_requirements: [],
        preferred_requirements: [],
        status: 'open',
        user_id: mockUser.id,
      }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newJobData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateJob(), { wrapper })

      let createdJob
      await act(async () => {
        createdJob = await result.current.mutateAsync({
          title: 'Product Manager',
          description: 'Looking for a PM',
          priorities: 'SaaS experience preferred',
          must_have_requirements: [],
          preferred_requirements: [],
          status: 'open',
        })
      })

      expect(createdJob.title).toBe('Product Manager')
      expect(createdJob.priorities).toBe('SaaS experience preferred')
      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'Product Manager',
          description: 'Looking for a PM',
          priorities: 'SaaS experience preferred',
          user_id: mockUser.id,
        }),
      ])
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateJob(), { wrapper })

      await expect(
        result.current.mutateAsync({
          title: 'Test Job',
          description: 'Test description',
        })
      ).rejects.toThrow('User not authenticated')
    })

    it('should handle Supabase insert errors', async () => {
      const mockError = new Error("Could not find the 'priorities' column")
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateJob(), { wrapper })

      await expect(
        result.current.mutateAsync({
          title: 'Test Job',
          description: 'Test description',
          priorities: 'Test priorities',
        })
      ).rejects.toThrow("Could not find the 'priorities' column")
    })

    it('should handle null priorities', async () => {
      const newJobData = {
        id: 'new-job-456',
        title: 'Engineer',
        description: 'Looking for an engineer',
        priorities: null,
        status: 'open',
        user_id: mockUser.id,
      }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newJobData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateJob(), { wrapper })

      let createdJob
      await act(async () => {
        createdJob = await result.current.mutateAsync({
          title: 'Engineer',
          description: 'Looking for an engineer',
          priorities: null,
          status: 'open',
        })
      })

      expect(createdJob.priorities).toBeNull()
      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          priorities: null,
        }),
      ])
    })
  })

  describe('useUpdateJob', () => {
    it('should update job fields', async () => {
      const updatedData = {
        ...mockJobData,
        title: 'Updated Title',
        priorities: 'New priorities',
      }

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateJob(), { wrapper })

      let updated
      await act(async () => {
        updated = await result.current.mutateAsync({
          jobId: mockJobId,
          updates: {
            title: 'Updated Title',
            priorities: 'New priorities',
          },
        })
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.priorities).toBe('New priorities')
      expect(mockChain.update).toHaveBeenCalledWith({
        title: 'Updated Title',
        priorities: 'New priorities',
      })
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateJob(), { wrapper })

      await expect(
        result.current.mutateAsync({
          jobId: mockJobId,
          updates: { title: 'New Title' },
        })
      ).rejects.toThrow('User not authenticated')
    })
  })

  describe('useDeleteJob', () => {
    it('should delete a job', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteJob(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(mockJobId)
      })

      expect(mockChain.delete).toHaveBeenCalled()
      expect(result.current.isError).toBe(false)
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteJob(), { wrapper })

      await expect(
        result.current.mutateAsync(mockJobId)
      ).rejects.toThrow('User not authenticated')
    })
  })

  describe('dev auth bypass mode', () => {
    // Note: In actual implementation, dev bypass is controlled by environment variable
    // These tests verify the hook works correctly when getCurrentUserId returns a dev user ID

    it('should use dev user ID when getCurrentUserId returns dev ID', async () => {
      const devUserId = '00000000-0000-0000-0000-000000000001'
      mockGetUser.mockResolvedValue({
        data: { user: { id: devUserId, email: 'dev-admin@localhost' } },
        error: null,
      })

      const newJobData = {
        id: 'dev-job-123',
        title: 'Dev Job',
        user_id: devUserId,
      }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newJobData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateJob(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          title: 'Dev Job',
          description: 'Test',
        })
      })

      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: devUserId,
        }),
      ])
    })
  })
})
