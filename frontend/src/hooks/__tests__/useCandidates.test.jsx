/**
 * Tests for useCandidates hooks
 * Tests candidate CRUD operations with React Query and Supabase
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Create mock functions at module scope - these will be available after vi.mock hoisting
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

// Mock Supabase - factory must not reference external variables
vi.mock('../../lib/supabase', async () => {
  return {
    supabase: {
      auth: {
        getUser: () => mockGetUser(),
      },
      from: (...args) => mockFrom(...args),
    },
  }
})

// Import hooks after mocking
import {
  useCandidates,
  useCandidate,
  useCreateCandidate,
  useBulkCreateCandidates,
  useUpdateCandidate,
  useDeleteCandidate,
  useToggleShortlist,
} from '../useCandidates'

// Test fixtures
const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockJobId = 'job-456'
const mockCandidateId = 'candidate-789'

const mockCandidateData = {
  id: mockCandidateId,
  job_id: mockJobId,
  user_id: mockUser.id,
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  location: 'New York',
  resume_text: 'Experienced software engineer...',
  resume_file_url: null,
  resume_file_name: 'john_doe_resume.pdf',
  current_title: 'Senior Engineer',
  current_company: 'Tech Corp',
  years_experience: 8,
  linkedin_url: 'https://linkedin.com/in/johndoe',
  portfolio_url: null,
  skills: ['JavaScript', 'React', 'Node.js'],
  education: [{ degree: 'BS Computer Science', school: 'MIT' }],
  additional_notes: null,
  evaluation_status: 'evaluated',
  recommendation: 'INTERVIEW',
  score: 85.5,
  evaluated_at: '2025-01-15T10:00:00Z',
  evaluation_count: 1,
  shortlisted: false,
  recruiter_notes: null,
  created_at: '2025-01-10T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  evaluations: [
    {
      id: 'eval-123',
      overall_score: 8.5,
      recommendation: 'ADVANCE TO INTERVIEW',
      confidence: 'High',
      key_strengths: ['Strong technical skills', 'Great communication'],
      concerns: ['Limited management experience'],
      reasoning: 'Strong candidate overall.',
      version: 1,
      created_at: '2025-01-15T10:00:00Z',
    },
  ],
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

// Helper to create chainable Supabase mock
function createChainableMock(finalData, finalError = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: finalData, error: finalError }),
  }

  // Make the last call resolve with data
  chain.eq.mockImplementation(() => {
    const newChain = { ...chain }
    newChain.order = vi.fn().mockResolvedValue({ data: finalData, error: finalError })
    newChain.single = vi.fn().mockResolvedValue({ data: finalData, error: finalError })
    return newChain
  })

  return chain
}

describe('useCandidates hooks', () => {
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

  describe('useCandidates', () => {
    it('should fetch candidates for a job when authenticated', async () => {
      // Setup mock chain for select query
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockCandidateData],
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Check that data is transformed correctly
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].name).toBe('John Doe')
      expect(result.current.data[0].fullName).toBe('John Doe')
      expect(result.current.data[0].email).toBe('john@example.com')
      expect(result.current.data[0].evaluationStatus).toBe('evaluated')
      expect(result.current.data[0].score).toBe(85.5)
      expect(result.current.data[0].skills).toEqual(['JavaScript', 'React', 'Node.js'])

      // Check evaluation transformation
      expect(result.current.data[0].evaluation).not.toBeNull()
      expect(result.current.data[0].evaluation.keyStrengths).toEqual([
        'Strong technical skills',
        'Great communication',
      ])
    })

    it('should not fetch when jobId is not provided', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidates(null), { wrapper })

      // Should not be loading because query is disabled
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

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
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error.message).toBe('Database connection failed')
    })

    it('should return empty array when no candidates exist', async () => {
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
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
    })
  })

  describe('useCandidate', () => {
    it('should fetch single candidate with full details', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCandidateData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidate(mockCandidateId), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data.id).toBe(mockCandidateId)
      expect(result.current.data.fullName).toBe('John Doe')
      expect(result.current.data.evaluations).toHaveLength(1)
      expect(result.current.data.latestEvaluation).not.toBeNull()
    })

    it('should not fetch when candidateId is not provided', async () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidate(null), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('useCreateCandidate', () => {
    it('should create a new candidate', async () => {
      const newCandidateData = {
        id: 'new-candidate-123',
        job_id: mockJobId,
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        evaluation_status: 'pending',
      }

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: newCandidateData,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateCandidate(), { wrapper })

      let createdCandidate
      await act(async () => {
        createdCandidate = await result.current.mutateAsync({
          jobId: mockJobId,
          name: 'Jane Smith',
          email: 'jane@example.com',
        })
      })

      expect(createdCandidate.full_name).toBe('Jane Smith')
      expect(mockChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          job_id: mockJobId,
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          user_id: mockUser.id,
          evaluation_status: 'pending',
        }),
      ])
    })

    it('should throw error when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateCandidate(), { wrapper })

      await expect(
        result.current.mutateAsync({
          jobId: mockJobId,
          name: 'Jane Smith',
        })
      ).rejects.toThrow('User not authenticated')
    })
  })

  describe('useBulkCreateCandidates', () => {
    it('should create multiple candidates at once', async () => {
      const bulkCandidates = [
        { id: 'bulk-1', job_id: mockJobId, full_name: 'Candidate 1' },
        { id: 'bulk-2', job_id: mockJobId, full_name: 'Candidate 2' },
        { id: 'bulk-3', job_id: mockJobId, full_name: 'Candidate 3' },
      ]

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: bulkCandidates,
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useBulkCreateCandidates(), { wrapper })

      let response
      await act(async () => {
        response = await result.current.mutateAsync({
          jobId: mockJobId,
          candidates: [
            { name: 'Candidate 1', text: 'Resume text 1' },
            { name: 'Candidate 2', text: 'Resume text 2' },
            { name: 'Candidate 3', text: 'Resume text 3' },
          ],
        })
      })

      expect(response.candidates).toHaveLength(3)
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ full_name: 'Candidate 1' }),
          expect.objectContaining({ full_name: 'Candidate 2' }),
          expect.objectContaining({ full_name: 'Candidate 3' }),
        ])
      )
    })
  })

  describe('useUpdateCandidate', () => {
    it('should update candidate fields', async () => {
      const updatedData = {
        ...mockCandidateData,
        recruiter_notes: 'Great interview performance',
        shortlisted: true,
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
      const { result } = renderHook(() => useUpdateCandidate(), { wrapper })

      let updated
      await act(async () => {
        updated = await result.current.mutateAsync({
          candidateId: mockCandidateId,
          updates: {
            recruiterNotes: 'Great interview performance',
            shortlisted: true,
          },
        })
      })

      expect(updated.recruiter_notes).toBe('Great interview performance')
      expect(updated.shortlisted).toBe(true)
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          recruiter_notes: 'Great interview performance',
          shortlisted: true,
        })
      )
    })

    it('should handle partial updates correctly', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockCandidateData, score: 92 },
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateCandidate(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          candidateId: mockCandidateId,
          updates: { score: 92 },
        })
      })

      // Should only update the score field, not include undefined fields
      expect(mockChain.update).toHaveBeenCalledWith({ score: 92 })
    })
  })

  describe('useDeleteCandidate', () => {
    it('should delete a candidate', async () => {
      // Need to handle chained .eq().eq() calls
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
      const { result } = renderHook(() => useDeleteCandidate(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          candidateId: mockCandidateId,
          jobId: mockJobId,
        })
      })

      expect(mockChain.delete).toHaveBeenCalled()
      // Mutation completed without throwing
      expect(result.current.isError).toBe(false)
    })
  })

  describe('useToggleShortlist', () => {
    it('should toggle shortlist status to true', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockCandidateData, shortlisted: true },
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useToggleShortlist(), { wrapper })

      let updated
      await act(async () => {
        updated = await result.current.mutateAsync({
          candidateId: mockCandidateId,
          shortlisted: true,
        })
      })

      expect(updated.shortlisted).toBe(true)
      expect(mockChain.update).toHaveBeenCalledWith({ shortlisted: true })
    })

    it('should toggle shortlist status to false', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockCandidateData, shortlisted: false },
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useToggleShortlist(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          candidateId: mockCandidateId,
          shortlisted: false,
        })
      })

      expect(mockChain.update).toHaveBeenCalledWith({ shortlisted: false })
    })
  })

  describe('data transformation', () => {
    it('should transform snake_case to camelCase correctly', async () => {
      const snakeCaseData = {
        id: 'test-123',
        job_id: mockJobId,
        full_name: 'Test User',
        resume_text: 'Resume content',
        resume_file_url: 'https://example.com/resume.pdf',
        resume_file_name: 'resume.pdf',
        current_title: 'Developer',
        current_company: 'Company Inc',
        years_experience: 5,
        linkedin_url: 'https://linkedin.com',
        portfolio_url: 'https://portfolio.com',
        evaluation_status: 'pending',
        recruiter_notes: 'Good candidate',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
        evaluated_at: null,
        evaluation_count: 0,
        evaluations: [],
      }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [snakeCaseData],
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const candidate = result.current.data[0]

      // Check camelCase transformation
      expect(candidate.jobId).toBe(mockJobId)
      expect(candidate.fullName).toBe('Test User')
      expect(candidate.resumeText).toBe('Resume content')
      expect(candidate.resumeFileUrl).toBe('https://example.com/resume.pdf')
      expect(candidate.resumeFileName).toBe('resume.pdf')
      expect(candidate.currentTitle).toBe('Developer')
      expect(candidate.currentCompany).toBe('Company Inc')
      expect(candidate.yearsExperience).toBe(5)
      expect(candidate.linkedinUrl).toBe('https://linkedin.com')
      expect(candidate.portfolioUrl).toBe('https://portfolio.com')
      expect(candidate.evaluationStatus).toBe('pending')
      expect(candidate.recruiterNotes).toBe('Good candidate')
      expect(candidate.createdAt).toBe('2025-01-01T00:00:00Z')
      expect(candidate.updatedAt).toBe('2025-01-02T00:00:00Z')
      expect(candidate.evaluationCount).toBe(0)
    })

    it('should handle candidates without evaluations', async () => {
      const candidateNoEval = {
        ...mockCandidateData,
        evaluations: [],
        evaluation_status: 'pending',
        recommendation: null,
        score: null,
      }

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [candidateNoEval],
          error: null,
        }),
      }
      mockFrom.mockReturnValue(mockChain)

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCandidates(mockJobId), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data[0].evaluation).toBeNull()
      expect(result.current.data[0].evaluationStatus).toBe('pending')
    })
  })
})
