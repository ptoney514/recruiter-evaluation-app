/**
 * Unit Tests for CreateRolePage
 * Tests form rendering, validation, submission, and error handling
 * 24 test cases covering all user scenarios
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
      expect(screen.getByText('Create New Role')).toBeInTheDocument()
      expect(screen.getByText(/Define the success criteria/i)).toBeInTheDocument()
    })

    it('should render back to dashboard button', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    })

    it('should render job title input field', () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      expect(titleInput).toBeInTheDocument()
      expect(titleInput).toHaveValue('')
    })

    it('should render department input field', () => {
      renderWithRouter(<CreateRolePage />)
      const deptInput = screen.getByPlaceholderText(/Sales, Engineering/i)
      expect(deptInput).toBeInTheDocument()
      expect(deptInput).toHaveValue('')
    })

    it('should render job description textarea', () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)
      expect(descInput).toBeInTheDocument()
      expect(descInput).toHaveValue('')
    })

    it('should render education dropdown with default value "Bachelor\'s Degree"', () => {
      renderWithRouter(<CreateRolePage />)
      const educationSelect = screen.getByDisplayValue(/Bachelor.s Degree/i)
      expect(educationSelect).toBeInTheDocument()
    })

    it('should render all education options', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText(/No Preference/i)).toBeInTheDocument()
      expect(screen.getByText(/High School/i)).toBeInTheDocument()
      expect(screen.getByText(/Associate.s Degree/i)).toBeInTheDocument()
      expect(screen.getByText(/Master.s Degree/i)).toBeInTheDocument()
      expect(screen.getByText(/PhD/i)).toBeInTheDocument()
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

    it('should render auto-detected keywords section', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText('Must-Have Keywords (Auto-detected)')).toBeInTheDocument()
      expect(screen.getByText(/Enter a job description to auto-detect keywords/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when title is empty on submit', async () => {
      renderWithRouter(<CreateRolePage />)
      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job title is required')).toBeInTheDocument()
    })

    it('should show error when description is empty on submit', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      await userEvent.type(titleInput, 'Test Job')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description is required')).toBeInTheDocument()
    })

    it('should show error when description is less than 30 characters', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, 'Short desc')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description must be at least 30 characters')).toBeInTheDocument()
    })

    it('should clear error when user starts typing', async () => {
      renderWithRouter(<CreateRolePage />)
      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job title is required')).toBeInTheDocument()

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      await userEvent.type(titleInput, 'T')

      await waitFor(() => {
        expect(screen.queryByText('Job title is required')).not.toBeInTheDocument()
      })
    })

    it('should not allow submit when title is missing', () => {
      renderWithRouter(<CreateRolePage />)
      const submitButton = screen.getByText('Save & Start Uploading')

      // Button should be disabled when title is empty
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit when title and description are valid', async () => {
      renderWithRouter(<CreateRolePage />)
      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const deptInput = screen.getByPlaceholderText(/Sales, Engineering/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(deptInput, 'Marketing')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length for validation')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Marketing Manager',
            department: 'Marketing',
            status: 'open',
          })
        )
      })
    })

    it('should trim whitespace from title and description', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

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

    it('should set department to null when empty', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-123' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            department: null,
          })
        )
      })
    })

    it('should navigate to workbench on successful creation', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-456' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

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

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create job. Please try again.')).toBeInTheDocument()
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
      expect(screen.getByPlaceholderText(/About the Role:/i)).toBeInTheDocument()
    })

    it('should show upload placeholder in upload tab', async () => {
      renderWithRouter(<CreateRolePage />)
      const uploadTab = screen.getByText('Performance Profile (Upload)')
      fireEvent.click(uploadTab)

      expect(screen.getByText('Upload a Performance Profile document')).toBeInTheDocument()
    })
  })

  describe('Auto-Detection of Keywords', () => {
    it('should display no keywords placeholder when description is empty', () => {
      renderWithRouter(<CreateRolePage />)
      expect(screen.getByText(/Enter a job description to auto-detect keywords/i)).toBeInTheDocument()
    })

    it('should auto-detect and display keywords when description contains requirements', async () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(descInput, `Must Have:
- 5+ years experience
- Team leadership
- Communication skills`)

      await waitFor(() => {
        expect(screen.getByText('5+ years experience')).toBeInTheDocument()
      })
    })

    it('should limit displayed keywords to first 5', async () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(descInput, `Must Have:
- Requirement 1
- Requirement 2
- Requirement 3
- Requirement 4
- Requirement 5
- Requirement 6
- Requirement 7`)

      await waitFor(() => {
        expect(screen.getByText('Requirement 1')).toBeInTheDocument()
        expect(screen.getByText('Requirement 5')).toBeInTheDocument()
        expect(screen.queryByText('Requirement 6')).not.toBeInTheDocument()
      })
    })

    it('should update keywords as user types description', async () => {
      renderWithRouter(<CreateRolePage />)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(descInput, '- First skill')

      await waitFor(() => {
        expect(screen.getByText('First skill')).toBeInTheDocument()
      })

      await userEvent.type(descInput, '\n- Second skill')

      await waitFor(() => {
        expect(screen.getByText('Second skill')).toBeInTheDocument()
      })
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
      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)

      await userEvent.type(titleInput, 'Test Job')
      await userEvent.type(descInput, '     ')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      expect(screen.getByText('Job description is required')).toBeInTheDocument()
    })

    it('should handle very long job titles gracefully', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-789' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)
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

    it('should change education requirement when selected', async () => {
      mockMutateAsync.mockResolvedValue({ id: 'job-999' })
      renderWithRouter(<CreateRolePage />)

      const titleInput = screen.getByPlaceholderText(/Senior Marketing Manager/i)
      const descInput = screen.getByPlaceholderText(/About the Role:/i)
      const educationSelect = screen.getByDisplayValue(/Bachelor.s Degree/i)

      await userEvent.type(titleInput, 'Senior Marketing Manager')
      await userEvent.type(descInput, 'This is a detailed job description with sufficient length')
      await userEvent.selectOptions(educationSelect, 'masters')

      const submitButton = screen.getByText('Save & Start Uploading')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            education: 'masters',
          })
        )
      })
    })
  })
})
