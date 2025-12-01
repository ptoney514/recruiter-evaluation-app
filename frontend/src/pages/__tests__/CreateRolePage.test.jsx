/**
 * Unit Tests for CreateRolePage
 * Tests form rendering, validation, submission, and error handling
 * Updated to match simplified form (title, description, priorities)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { CreateRolePage } from '../CreateRolePage'

// Mock useNavigate hook
const mockNavigateFn = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigateFn,
  }
})

// Mock useCreateJob hook
vi.mock('../../hooks/useJobs', () => ({
  useCreateJob: vi.fn(),
}))

// Mock extractRequirements
vi.mock('../../utils/requirementExtraction', () => ({
  extractRequirements: vi.fn((description) => {
    // Simple mock: extract bullet points as must-have
    const lines = description.split('\n').filter(line => line.includes('-') || line.includes('•'))
    const requirements = lines.map(line => line.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)
    return {
      mustHave: requirements.slice(0, 5),
      niceToHave: requirements.slice(5, 10),
    }
  }),
}))

import { useCreateJob } from '../../hooks/useJobs'

// Helper to render with router context
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

// Helper to get form inputs by name attribute
const getInputByName = (name) => {
  return document.querySelector(`[name="${name}"]`)
}

describe('CreateRolePage', () => {
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigate function
    mockNavigateFn.mockClear()

    // Mock useCreateJob
    useCreateJob.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  describe('Form Rendering', () => {
    it('should render page title and description', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Create New Position')).toBeInTheDocument()
      expect(screen.getByText(/Paste the job description and let Evala intelligently evaluate/i)).toBeInTheDocument()
    })

    it('should render back to dashboard button', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    })

    it('should render position title input field', () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = getInputByName('title')
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveValue('')
    })

    it('should render job description textarea', () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = getInputByName('description')
      expect(descInput).toBeInTheDocument()
      expect(descInput).toHaveValue('')
    })

    it('should render "What Matters Most" priorities field', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText(/What Matters Most/i)).toBeInTheDocument()
      const prioritiesInput = getInputByName('priorities')
      expect(prioritiesInput).toBeInTheDocument()
    })

    it('should render Save & Start Uploading submit button', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Save & Start Uploading')).toBeInTheDocument()
    })

    it('should render Cancel button', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render tabs for Job Description and Performance Profile', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Job Description (Paste)')).toBeInTheDocument()
      expect(screen.getByText('Performance Profile (Upload)')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should disable submit button when title is empty', async () => {
      renderWithRouter(<CreateRolePage />)
      // Fill description first
      const descInput = getInputByName('description')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      // Button should be disabled when title is empty (validation happens via disabled state)
      expect(submitButton).toBeDisabled()
    })

    it('should show error when description is empty on submit', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = getInputByName('title')
      await userEvent.type(titleInput, 'Test Job')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description is required')).toBeInTheDocument()
    })

    it('should show error when description is less than 30 characters', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'Short desc')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description must be at least 30 characters')).toBeInTheDocument()
    })

    it('should clear error when user starts typing', async () => {
      renderWithRouter(<CreateRolePage />)
      // First fill title and short description to trigger validation error
      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'Short')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      // Expect description error
      expect(screen.getByText('Job description must be at least 30 characters')).toBeInTheDocument()

      // Clear error by typing more
      await userEvent.type(descInput, ' - adding more text to make it longer')

      await waitFor(() => {
        expect(screen.queryByText('Job description must be at least 30 characters')).not.toBeInTheDocument()
      })
    })

    it('should not allow submit when title is missing', () => {
      renderWithRouter(<CreateRolePage />)
      const submitButton = screen.getByText('Save & Start Uploading')

      // Button should be disabled when title is empty
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit when title is provided', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = getInputByName('title')

      await userEvent.type(titleInput, 'Senior Marketing Manager')

      const submitButton = screen.getByText('Save & Start Uploading')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length for validation')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Marketing Manager',
            description: 'This is a detailed job description with sufficient length for validation',
            status: 'open',
          })
        )
      })
    })

    it('should include priorities when provided', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')
      const prioritiesInput = getInputByName('priorities')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')
      await userEvent.type(prioritiesInput, 'Must have SaaS experience')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            priorities: 'Must have SaaS experience',
          })
        )
      })
    })

    it('should set priorities to null when empty', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            priorities: null,
          })
        )
      })
    })

    it('should trim whitespace from title and description', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, '  Senior Marketing Manager  ')
      await userEvent.type(descInput, '  Detailed description with spaces  ')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Marketing Manager',
            description: 'Detailed description with spaces',
          })
        )
      })
    })

    it('should extract requirements from description', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, `About the Role:
- 5+ years marketing experience
- Team leadership skills
- Budget management`)

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            must_have_requirements: expect.any(Array),
            preferred_requirements: expect.any(Array),
          })
        )
      })
    })

    it('should navigate to workbench on successful creation', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-456' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith('/app/role/job-456/workbench')
      })
    })

    it('should show error message on creation failure', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'))
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      // The component shows the error message from the API error
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should show specific error message from API', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Could not find the \'priorities\' column'))
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Could not find the 'priorities' column/)).toBeInTheDocument()
      })
    })

    it('should disable submit button while creating', async () => {
      mockMutateAsync.mockImplementation(() => new Promise(() => {})) // Never resolves
      useCreateJob.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      })

      renderWithRouter(<CreateRolePage />)
      const submitButton = screen.getByText('Creating...')

      expect(submitButton).toBeDisabled()
    })
  })

  describe('Tab Navigation', () => {
    it('should show paste tab by default', () => {
      renderWithRouter(<CreateRolePage />)
      const pasteTab = screen.getByText('Job Description (Paste)')
      expect(pasteTab).toHaveClass('border-b-2', 'border-teal-500')
    })

    it('should switch to upload tab when clicked', async () => {
      renderWithRouter(<CreateRolePage />)
      const uploadTab = screen.getByText('Performance Profile (Upload)')
      fireEvent.click(uploadTab)

      expect(uploadTab).toHaveClass('border-b-2', 'border-teal-500')
      expect(screen.getByText('Upload a Performance Profile document')).toBeInTheDocument()
    })

    it('should show textarea in paste tab', () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = getInputByName('description')
      expect(descInput).toBeInTheDocument()
    })

    it('should show upload placeholder in upload tab', async () => {
      renderWithRouter(<CreateRolePage />)
      const uploadTab = screen.getByText('Performance Profile (Upload)')
      fireEvent.click(uploadTab)

      expect(screen.getByText('Upload a Performance Profile document')).toBeInTheDocument()
    })
  })

  describe('Back Button Navigation', () => {
    it('should navigate to dashboard when back button clicked', () => {
      renderWithRouter(<CreateRolePage />)
      const backButton = screen.getByText('Back to Dashboard')
      fireEvent.click(backButton)

      expect(mockNavigateFn).toHaveBeenCalledWith('/app')
    })

    it('should navigate to dashboard when Cancel button clicked', () => {
      renderWithRouter(<CreateRolePage />)
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockNavigateFn).toHaveBeenCalledWith('/app')
    })
  })

  describe('Edge Cases', () => {
    it('should handle description with only whitespace as invalid', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, '     ')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description is required')).toBeInTheDocument()
    })

    it('should handle very long job titles gracefully', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-789' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')
      const longTitle = 'Senior Vice President of Product Management and Strategic Growth Initiatives'

      await userEvent.type(titleInput, longTitle)
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: longTitle,
          })
        )
      })
    })

    it('should handle null return from createJob', async () => {
      mockMutateAsync.mockResolvedValue(null)
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      // Should not navigate if newJob is null
      await waitFor(() => {
        expect(mockNavigateFn).not.toHaveBeenCalled()
      })
    })
  })

  describe('Authentication Integration', () => {
    it('should call mutateAsync which handles auth internally', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        // useCreateJob hook handles user_id internally
        expect(mockMutateAsync).toHaveBeenCalled()
      })
    })

    it('should show auth error when useCreateJob fails due to auth', async () => {
      mockMutateAsync.mockRejectedValue(new Error('User not authenticated'))
      renderWithRouter(<CreateRolePage />)

      const titleInput = getInputByName('title')
      const descInput = getInputByName('description')

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('User not authenticated')).toBeInTheDocument()
      })
    })
  })
})
