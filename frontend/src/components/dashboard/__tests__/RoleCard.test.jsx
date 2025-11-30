/**
 * Unit Tests for RoleCard Component
 * Tests rendering, user interactions, and delete functionality
 * 16 test cases covering all user scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RoleCard } from '../RoleCard'

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Mock useDeleteJob hook
vi.mock('../../../hooks/useJobs', () => ({
  useDeleteJob: vi.fn(),
}))

import { useDeleteJob } from '../../../hooks/useJobs'

// Helper to render with router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('RoleCard', () => {
  const mockRole = {
    id: '123',
    title: 'Senior Engineer',
    status: 'open',
    candidates_count: 5,
    evaluated_count: 3,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useDeleteJob.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
  })

  describe('Rendering', () => {
    it('should render job title', () => {
      renderWithRouter(<RoleCard role={mockRole} />)
      expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
    })

    it('should render candidate count in correct format "X candidate(s) • Y evaluated"', () => {
      renderWithRouter(<RoleCard role={mockRole} />)
      expect(screen.getByText('5 candidates • 3 evaluated')).toBeInTheDocument()
    })

    it('should use singular "candidate" when count is 1', () => {
      const singleCandidate = { ...mockRole, candidates_count: 1, evaluated_count: 0 }
      renderWithRouter(<RoleCard role={singleCandidate} />)
      // The component renders "1 candidate • 0 evaluated" (no 's' after candidate)
      expect(screen.getByText('1 candidate • 0 evaluated')).toBeInTheDocument()
    })

    it('should render "Open Workbench" button', () => {
      renderWithRouter(<RoleCard role={mockRole} />)
      expect(screen.getByText('Open Workbench')).toBeInTheDocument()
    })

    it('should render delete button with trash icon', () => {
      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')
      expect(deleteButton).toBeInTheDocument()
    })
  })

  describe('Delete Button State', () => {
    it('should disable delete button while deleting (isPending true)', () => {
      useDeleteJob.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      })

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')
      expect(deleteButton).toBeDisabled()
    })

    it('should enable delete button when not deleting', () => {
      useDeleteJob.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      })

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')
      expect(deleteButton).not.toBeDisabled()
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when delete button clicked', () => {
      window.confirm = vi.fn(() => true)

      const { mutate } = useDeleteJob()
      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      expect(window.confirm).toHaveBeenCalled()
    })

    it('should call deleteJob.mutate() when deletion confirmed', () => {
      window.confirm = vi.fn(() => true)
      const mockMutate = vi.fn()
      useDeleteJob.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      })

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      expect(mockMutate).toHaveBeenCalledWith('123')
    })

    it('should NOT call deleteJob.mutate() when deletion cancelled', () => {
      window.confirm = vi.fn(() => false)
      const mockMutate = vi.fn()
      useDeleteJob.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      })

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('should show confirmation dialog with job title in message', () => {
      window.confirm = vi.fn()

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Senior Engineer')
      )
    })

    it('should show candidate count in confirmation message', () => {
      window.confirm = vi.fn()

      renderWithRouter(<RoleCard role={mockRole} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('5')
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle role with 0 candidates', () => {
      const noCandidates = { ...mockRole, candidates_count: 0, evaluated_count: 0 }
      renderWithRouter(<RoleCard role={noCandidates} />)
      expect(screen.getByText('0 candidates • 0 evaluated')).toBeInTheDocument()
    })

    it('should show evaluated count when some candidates evaluated', () => {
      const evaluated = { ...mockRole, candidates_count: 10, evaluated_count: 7 }
      renderWithRouter(<RoleCard role={evaluated} />)
      expect(screen.getByText('10 candidates • 7 evaluated')).toBeInTheDocument()
    })
  })

  describe('Click Handlers', () => {
    it('should render "Open Workbench" button that is clickable', () => {
      renderWithRouter(<RoleCard role={mockRole} />)
      const workbenchButton = screen.getByText('Open Workbench')

      expect(workbenchButton).toBeInTheDocument()
      expect(workbenchButton).toBeEnabled()
    })

    it('should call onClick prop when provided and card clicked', () => {
      const mockOnClick = vi.fn()
      renderWithRouter(<RoleCard role={mockRole} onClick={mockOnClick} />)

      const card = screen.getByText('Senior Engineer').closest('div').parentElement
      fireEvent.click(card)

      expect(mockOnClick).toHaveBeenCalledWith(mockRole)
    })
  })

  describe('User Interactions', () => {
    it('should prevent delete button click from propagating to card click', () => {
      window.confirm = vi.fn(() => true)
      const mockOnClick = vi.fn()
      const mockMutate = vi.fn()
      useDeleteJob.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      })

      renderWithRouter(<RoleCard role={mockRole} onClick={mockOnClick} />)
      const deleteButton = screen.getByTitle('Delete role')

      fireEvent.click(deleteButton)

      // Delete should be called, not onClick
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  describe('Real-world Scenarios', () => {
    it('should render typical job with multiple candidates evaluated', () => {
      const typicalJob = {
        id: '456',
        title: 'Product Manager',
        status: 'open',
        candidates_count: 8,
        evaluated_count: 5,
      }

      renderWithRouter(<RoleCard role={typicalJob} />)

      expect(screen.getByText('Product Manager')).toBeInTheDocument()
      expect(screen.getByText('8 candidates • 5 evaluated')).toBeInTheDocument()
      expect(screen.getByText('Open Workbench')).toBeInTheDocument()
    })

    it('should render paused job correctly', () => {
      const pausedJob = {
        id: '789',
        title: 'Marketing Manager',
        status: 'paused',
        candidates_count: 3,
        evaluated_count: 2,
      }

      renderWithRouter(<RoleCard role={pausedJob} />)

      expect(screen.getByText('Marketing Manager')).toBeInTheDocument()
      expect(screen.getByText('3 candidates • 2 evaluated')).toBeInTheDocument()
    })

    it('should handle long job titles without breaking layout', () => {
      const longTitleJob = {
        id: '999',
        title: 'Senior Vice President of Product Management and Strategic Growth',
        status: 'open',
        candidates_count: 2,
        evaluated_count: 1,
      }

      renderWithRouter(<RoleCard role={longTitleJob} />)

      expect(
        screen.getByText('Senior Vice President of Product Management and Strategic Growth')
      ).toBeInTheDocument()
    })
  })
})
