/**
 * useCandidates Hook Unit Tests
 * Tests React Query hooks with mocked databaseService
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as dbService from '../../services/databaseService'
import {
  useCandidates,
  useCandidate,
  useCreateCandidate,
  useBulkCreateCandidates,
  useUpdateCandidate,
  useDeleteCandidate,
  useToggleShortlist
} from '../useCandidates'

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

describe('useCandidates hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ============ useCandidates ============

  describe('useCandidates', () => {
    const mockCandidates = [
      {
        id: 'cand-1',
        job_id: 'job-123',
        name: 'John Developer',
        email: 'john@example.com',
        resume_text: 'Experienced software engineer...',
        quick_score: 85,
        evaluation_status: 'evaluated',
        stage1_a_score: 80,
        stage1_t_score: 85,
        stage1_q_score: 90,
      },
      {
        id: 'cand-2',
        job_id: 'job-123',
        name: 'Jane Engineer',
        email: 'jane@example.com',
        resume_text: 'Full-stack developer...',
        quick_score: 78,
        evaluation_status: 'pending',
      },
    ]

    it('should fetch candidates for a job', async () => {
      dbService.getCandidates.mockResolvedValueOnce({
        success: true,
        candidates: mockCandidates,
      })

      const { result } = renderHook(() => useCandidates('job-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.getCandidates).toHaveBeenCalledWith('job-123')
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data[0].name).toBe('John Developer')
      expect(result.current.data[0].quickScore).toBe(85)
      expect(result.current.data[0].stage1AScore).toBe(80)
    })

    it('should not fetch when jobId is null', async () => {
      const { result } = renderHook(() => useCandidates(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(dbService.getCandidates).not.toHaveBeenCalled()
    })

    it('should handle empty candidates list', async () => {
      dbService.getCandidates.mockResolvedValueOnce({
        success: true,
        candidates: [],
      })

      const { result } = renderHook(() => useCandidates('job-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(0)
    })

    it('should transform snake_case to camelCase', async () => {
      dbService.getCandidates.mockResolvedValueOnce({
        success: true,
        candidates: [{
          id: 'cand-1',
          job_id: 'job-123',
          full_name: 'Test User',
          resume_text: 'Resume...',
          current_title: 'Engineer',
          current_company: 'Tech Co',
          years_experience: 5,
          linkedin_url: 'https://linkedin.com/in/test',
          evaluation_status: 'pending',
        }],
      })

      const { result } = renderHook(() => useCandidates('job-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data[0].jobId).toBe('job-123')
      expect(result.current.data[0].fullName).toBe('Test User')
      expect(result.current.data[0].resumeText).toBe('Resume...')
      expect(result.current.data[0].currentTitle).toBe('Engineer')
      expect(result.current.data[0].currentCompany).toBe('Tech Co')
      expect(result.current.data[0].yearsExperience).toBe(5)
      expect(result.current.data[0].linkedinUrl).toBe('https://linkedin.com/in/test')
    })

    it('should handle API errors', async () => {
      dbService.getCandidates.mockResolvedValueOnce({
        success: false,
        error: 'Job not found',
      })

      const { result } = renderHook(() => useCandidates('nonexistent'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error.message).toBe('Job not found')
    })
  })

  // ============ useCandidate ============

  describe('useCandidate', () => {
    const mockCandidate = {
      id: 'cand-123',
      job_id: 'job-123',
      name: 'John Developer',
      email: 'john@example.com',
      resume_text: 'Experienced software engineer with 10 years...',
      quick_score: 85,
      stage1_score: 82,
      stage1_a_score: 80,
      stage1_t_score: 85,
      stage1_q_score: 80,
      scoring_model: 'ATQ',
      evaluation_status: 'evaluated',
      evaluations: [],
    }

    it('should fetch a single candidate', async () => {
      dbService.getCandidate.mockResolvedValueOnce({
        success: true,
        candidate: mockCandidate,
      })

      const { result } = renderHook(() => useCandidate('cand-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.getCandidate).toHaveBeenCalledWith('cand-123')
      expect(result.current.data.name).toBe('John Developer')
      expect(result.current.data.scoringModel).toBe('ATQ')
    })

    it('should not fetch when candidateId is null', async () => {
      const { result } = renderHook(() => useCandidate(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
      expect(dbService.getCandidate).not.toHaveBeenCalled()
    })
  })

  // ============ useCreateCandidate ============

  describe('useCreateCandidate', () => {
    it('should create a new candidate', async () => {
      const newCandidate = {
        jobId: 'job-123',
        name: 'New Candidate',
        email: 'new@example.com',
        resumeText: 'New resume text...',
      }

      const createdCandidate = {
        id: 'cand-new',
        job_id: 'job-123',
        name: 'New Candidate',
        email: 'new@example.com',
        resume_text: 'New resume text...',
      }

      dbService.createCandidate.mockResolvedValueOnce({
        success: true,
        candidate: createdCandidate,
      })

      const { result } = renderHook(() => useCreateCandidate(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newCandidate)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.createCandidate).toHaveBeenCalledWith('job-123', expect.objectContaining({
        name: 'New Candidate',
        email: 'new@example.com',
      }))
    })

    it('should transform camelCase to snake_case', async () => {
      const newCandidate = {
        jobId: 'job-123',
        fullName: 'Test User',
        currentTitle: 'Developer',
        currentCompany: 'Tech Co',
        yearsExperience: 5,
        resumeText: 'Resume...',
        linkedinUrl: 'https://linkedin.com/in/test',
      }

      dbService.createCandidate.mockResolvedValueOnce({
        success: true,
        candidate: { id: 'cand-new', job_id: 'job-123' },
      })

      const { result } = renderHook(() => useCreateCandidate(), {
        wrapper: createWrapper(),
      })

      result.current.mutate(newCandidate)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.createCandidate).toHaveBeenCalledWith('job-123', expect.objectContaining({
        current_title: 'Developer',
        current_company: 'Tech Co',
        years_experience: 5,
        resume_text: 'Resume...',
        linkedin_url: 'https://linkedin.com/in/test',
      }))
    })
  })

  // ============ useBulkCreateCandidates ============

  describe('useBulkCreateCandidates', () => {
    it('should create multiple candidates', async () => {
      const candidates = [
        { name: 'Candidate 1', resumeText: 'Resume 1...' },
        { name: 'Candidate 2', resumeText: 'Resume 2...' },
      ]

      dbService.createCandidate
        .mockResolvedValueOnce({ success: true, candidate: { id: 'c1', job_id: 'job-123' } })
        .mockResolvedValueOnce({ success: true, candidate: { id: 'c2', job_id: 'job-123' } })

      const { result } = renderHook(() => useBulkCreateCandidates(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ jobId: 'job-123', candidates })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.createCandidate).toHaveBeenCalledTimes(2)
      expect(result.current.data.candidates).toHaveLength(2)
    })

    it('should handle partial failures', async () => {
      const candidates = [
        { name: 'Candidate 1', resumeText: 'Resume 1...' },
        { name: 'Candidate 2', resumeText: 'Resume 2...' },
      ]

      dbService.createCandidate
        .mockResolvedValueOnce({ success: true, candidate: { id: 'c1', job_id: 'job-123' } })
        .mockResolvedValueOnce({ success: false, error: 'Duplicate email' })

      const { result } = renderHook(() => useBulkCreateCandidates(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ jobId: 'job-123', candidates })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data.candidates).toHaveLength(1)
      expect(result.current.data.errors).toHaveLength(1)
    })
  })

  // ============ useUpdateCandidate ============

  describe('useUpdateCandidate', () => {
    it('should update a candidate', async () => {
      const updates = { shortlisted: true, recruiterNotes: 'Good candidate' }

      dbService.updateCandidate.mockResolvedValueOnce({
        success: true,
        candidate: { id: 'cand-123', job_id: 'job-123', shortlisted: true },
      })

      const { result } = renderHook(() => useUpdateCandidate(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ candidateId: 'cand-123', updates })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.updateCandidate).toHaveBeenCalledWith('cand-123', expect.objectContaining({
        shortlisted: true,
        recruiter_notes: 'Good candidate',
      }))
    })

    it('should update A-T-Q scores', async () => {
      const updates = {
        quickScore: 85,
        stage1AScore: 80,
        stage1TScore: 85,
        stage1QScore: 90,
      }

      dbService.updateCandidate.mockResolvedValueOnce({
        success: true,
        candidate: { id: 'cand-123', job_id: 'job-123' },
      })

      const { result } = renderHook(() => useUpdateCandidate(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ candidateId: 'cand-123', updates })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.updateCandidate).toHaveBeenCalledWith('cand-123', expect.objectContaining({
        quick_score: 85,
        stage1_a_score: 80,
        stage1_t_score: 85,
        stage1_q_score: 90,
      }))
    })
  })

  // ============ useDeleteCandidate ============

  describe('useDeleteCandidate', () => {
    it('should delete a candidate', async () => {
      dbService.deleteCandidate.mockResolvedValueOnce({
        success: true,
      })

      const { result } = renderHook(() => useDeleteCandidate(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ candidateId: 'cand-123', jobId: 'job-123' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.deleteCandidate).toHaveBeenCalledWith('cand-123')
      expect(result.current.data).toEqual({ candidateId: 'cand-123', jobId: 'job-123' })
    })
  })

  // ============ useToggleShortlist ============

  describe('useToggleShortlist', () => {
    it('should toggle shortlist status', async () => {
      dbService.updateCandidate.mockResolvedValueOnce({
        success: true,
        candidate: { id: 'cand-123', job_id: 'job-123', shortlisted: true },
      })

      const { result } = renderHook(() => useToggleShortlist(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({ candidateId: 'cand-123', shortlisted: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(dbService.updateCandidate).toHaveBeenCalledWith('cand-123', { shortlisted: true })
    })
  })
})
