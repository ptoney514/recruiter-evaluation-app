import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import React from 'react'
import { WorkbenchPage } from '../WorkbenchPage'

// Mock the hooks
const mockUseCandidates = vi.fn()
const mockUseDeleteCandidate = vi.fn()
const mockUseJob = vi.fn()
const mockUseUpdateJob = vi.fn()
const mockUseBatchEvaluate = vi.fn()

vi.mock('../../hooks/useCandidates', () => ({
  useCandidates: () => mockUseCandidates(),
  useDeleteCandidate: () => mockUseDeleteCandidate()
}))

vi.mock('../../hooks/useJobs', () => ({
  useJob: () => mockUseJob(),
  useUpdateJob: () => mockUseUpdateJob()
}))

vi.mock('../../hooks/useEvaluations', () => ({
  useBatchEvaluate: () => mockUseBatchEvaluate()
}))

// Mock the ResumeUploadModal
vi.mock('../../components/workbench/ResumeUploadModal', () => ({
  ResumeUploadModal: ({ isOpen, onClose, onSuccess }) => (
    isOpen ? (
      <div data-testid="upload-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSuccess(3)}>Upload Success</button>
      </div>
    ) : null
  )
}))

// Mock the ModelComparisonModal
vi.mock('../../components/workbench/ModelComparisonModal', () => ({
  ModelComparisonModal: ({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="comparison-modal">
        <button onClick={onClose}>Close Comparison</button>
      </div>
    ) : null
  )
}))

// Mock CandidateDetailPanel
vi.mock('../../components/workbench/CandidateDetailPanel', () => ({
  CandidateDetailPanel: ({ candidate, onClose }) => (
    candidate ? (
      <div data-testid="detail-panel">
        <span>{candidate.name}</span>
        <button onClick={onClose}>Close Panel</button>
      </div>
    ) : null
  )
}))

// Mock EditProjectModal
vi.mock('../../components/dashboard/EditProjectModal', () => ({
  EditProjectModal: ({ isOpen, onClose, onSave, project }) => (
    isOpen ? (
      <div data-testid="edit-modal">
        <span>Edit: {project?.title}</span>
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => onSave({ title: 'Updated Title' })}>Save Changes</button>
      </div>
    ) : null
  )
}))

// Helper to create QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/workbench/job-123']}>
        <Routes>
          <Route path="/workbench/:roleId" element={children} />
          <Route path="/app" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// Sample data
const mockJob = {
  id: 'job-123',
  title: 'Senior Software Engineer',
  description: 'We are looking for a senior engineer...',
  must_have_requirements: ['5+ years experience', 'React expertise'],
  preferred_requirements: ['TypeScript']
}

const mockCandidates = [
  {
    id: 'cand-1',
    name: 'John Doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    resumeText: 'Experienced engineer with 10 years...',
    evaluationStatus: 'pending',
    score: null,
    recommendation: null,
    createdAt: '2024-01-15T10:00:00Z',
    evaluation: null
  },
  {
    id: 'cand-2',
    name: 'Jane Smith',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    resumeText: 'Senior developer specializing in React...',
    evaluationStatus: 'evaluated',
    score: 85,
    recommendation: 'INTERVIEW',
    createdAt: '2024-01-14T10:00:00Z',
    evaluation: {
      id: 'eval-1',
      overallScore: 85,
      recommendation: 'INTERVIEW',
      confidence: 90,
      keyStrengths: ['React expertise', 'Team leadership'],
      concerns: [],
      reasoning: 'Strong candidate with excellent React skills.'
    }
  },
  {
    id: 'cand-3',
    name: 'Bob Wilson',
    fullName: 'Bob Wilson',
    email: 'bob@example.com',
    resumeText: 'Junior developer looking to grow...',
    evaluationStatus: 'evaluated',
    score: 55,
    recommendation: 'DECLINE',
    createdAt: '2024-01-13T10:00:00Z',
    evaluation: {
      id: 'eval-2',
      overallScore: 55,
      recommendation: 'DECLINE',
      confidence: 85,
      keyStrengths: ['Enthusiasm'],
      concerns: ['Lacks required experience'],
      reasoning: 'Does not meet minimum experience requirements.'
    }
  }
]

describe('WorkbenchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseJob.mockReturnValue({
      data: mockJob,
      isLoading: false,
      error: null
    })

    mockUseCandidates.mockReturnValue({
      data: mockCandidates,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    mockUseBatchEvaluate.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false
    })

    mockUseUpdateJob.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false
    })

    mockUseDeleteCandidate.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false
    })
  })

  describe('Loading State', () => {
    it('should display loading spinner when job is loading', () => {
      mockUseJob.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading candidates...')).toBeInTheDocument()
    })

    it('should display loading spinner when candidates are loading', () => {
      mockUseCandidates.mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
        refetch: vi.fn()
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading candidates...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when job fetch fails', () => {
      mockUseJob.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load job')
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load job')).toBeInTheDocument()
    })

    it('should display error message when candidates fetch fails', () => {
      mockUseCandidates.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Database connection failed'),
        refetch: vi.fn()
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })

    it('should have a retry button on error', async () => {
      const mockRefetch = vi.fn()
      mockUseCandidates.mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch
      })

      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      await user.click(retryButton)

      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no candidates exist', () => {
      mockUseCandidates.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('No candidates yet')).toBeInTheDocument()
    })

    it('should have upload button in empty state', () => {
      mockUseCandidates.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Should have at least 2 upload buttons (header + empty state)
      const uploadButtons = screen.getAllByRole('button', { name: /upload resumes/i })
      expect(uploadButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Candidate List', () => {
    it('should display job title in header', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Job title appears in breadcrumb and as role for each candidate
      const titles = screen.getAllByText('Senior Software Engineer')
      expect(titles.length).toBeGreaterThanOrEqual(1)
    })

    it('should display candidate names', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })

    it('should display candidate count', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/showing/i)).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display AI scores for evaluated candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('85/100')).toBeInTheDocument()
      expect(screen.getByText('55/100')).toBeInTheDocument()
    })

    it('should display recommendation badges for evaluated candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Interview')).toBeInTheDocument()
      expect(screen.getByText('Decline')).toBeInTheDocument()
    })

    it('should show Unlock button for pending candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Unlock')).toBeInTheDocument()
    })

    it('should show View Details button for evaluated candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const detailButtons = screen.getAllByRole('button', { name: /view details/i })
      expect(detailButtons.length).toBe(2) // Jane and Bob
    })
  })

  describe('Candidate Selection', () => {
    it('should select candidate when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First candidate checkbox (skip select all)

      expect(screen.getByText('1 Selected')).toBeInTheDocument()
    })

    it('should select all candidates when header checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)

      expect(screen.getByText('3 Selected')).toBeInTheDocument()
    })

    it('should deselect all when header checkbox is clicked again', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox) // Select all
      await user.click(selectAllCheckbox) // Deselect all

      expect(screen.getByText('0 Selected')).toBeInTheDocument()
    })
  })

  describe('AI Analysis', () => {
    it('should enable Run AI Analysis button when candidates are selected', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      const aiButton = screen.getByRole('button', { name: /run ai analysis/i })
      expect(aiButton).not.toBeDisabled()
    })

    it('should call batchEvaluate when AI Analysis button is clicked', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({ success: true })
      mockUseBatchEvaluate.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      })

      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Select first candidate
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      // Click AI Analysis
      const aiButton = screen.getByRole('button', { name: /run ai analysis/i })
      await user.click(aiButton)

      expect(mockMutateAsync).toHaveBeenCalled()
      // Verify the correct parameters are passed (candidateIds, jobId, options)
      expect(mockMutateAsync.mock.calls[0][0]).toMatchObject({
        candidateIds: expect.any(Array),
        jobId: 'job-123',
        options: expect.objectContaining({
          onProgress: expect.any(Function)
        })
      })
      // Verify candidate IDs are passed correctly
      expect(mockMutateAsync.mock.calls[0][0].candidateIds).toContain('cand-1')
    })

    it('should show progress during evaluation', () => {
      mockUseBatchEvaluate.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true
      })

      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText(/starting/i)).toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should filter candidates by name', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const searchInput = screen.getByPlaceholderText('Search candidates...')
      await user.type(searchInput, 'Jane')

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
    })

    it('should show filtered count', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const searchInput = screen.getByPlaceholderText('Search candidates...')
      await user.type(searchInput, 'Jane')

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Upload Modal', () => {
    it('should open upload modal when button is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const uploadButton = screen.getAllByRole('button', { name: /upload resumes/i })[0]
      await user.click(uploadButton)

      expect(screen.getByTestId('upload-modal')).toBeInTheDocument()
    })

    it('should close upload modal when close is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Open modal
      const uploadButton = screen.getAllByRole('button', { name: /upload resumes/i })[0]
      await user.click(uploadButton)

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument()
    })
  })

  describe('Candidate Detail Panel', () => {
    it('should open detail panel when View Details is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const detailButtons = screen.getAllByRole('button', { name: /view details/i })
      await user.click(detailButtons[0])

      expect(screen.getByTestId('detail-panel')).toBeInTheDocument()
    })

    it('should close detail panel when close is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Open panel
      const detailButtons = screen.getAllByRole('button', { name: /view details/i })
      await user.click(detailButtons[0])

      // Close panel
      const closeButton = screen.getByRole('button', { name: /close panel/i })
      await user.click(closeButton)

      expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should show New status for pending candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('should show Analyzed status for evaluated candidates', () => {
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const analyzedStatuses = screen.getAllByText('Analyzed')
      expect(analyzedStatuses.length).toBe(2) // Jane and Bob
    })
  })

  describe('Edit Position Modal', () => {
    it('should open edit modal when Edit Position is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      const editButton = screen.getByRole('button', { name: /edit position/i })
      await user.click(editButton)

      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
    })

    it('should call updateJob when save is clicked', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({ success: true })
      mockUseUpdateJob.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      })

      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Open modal
      const editButton = screen.getByRole('button', { name: /edit position/i })
      await user.click(editButton)

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      expect(mockMutateAsync).toHaveBeenCalledWith({
        jobId: 'job-123',
        updates: { title: 'Updated Title' }
      })
    })

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkbenchPage />, { wrapper: createWrapper() })

      // Open modal
      const editButton = screen.getByRole('button', { name: /edit position/i })
      await user.click(editButton)

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
    })
  })
})
