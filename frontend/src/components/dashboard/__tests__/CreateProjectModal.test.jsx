import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateProjectModal } from '../CreateProjectModal'
import * as useJobsModule from '../../../hooks/useJobs'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the useJobs hook
vi.mock('../../../hooks/useJobs')

// Helper to wrap component with required providers
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('CreateProjectModal', () => {
  const mockOnClose = vi.fn()
  const mockMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useJobsModule, 'useCreateJob').mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={false} onClose={mockOnClose} />
      )
      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should render all required form fields', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/min compensation/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/max compensation/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/job description/i)).toBeInTheDocument()
    })

    it('should have correct placeholders', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      expect(screen.getByPlaceholderText('e.g., Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g., Engineering')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g., San Francisco, CA')).toBeInTheDocument()
    })

    it('should have default employment type as Full-time', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const employmentSelect = screen.getByLabelText(/employment type/i)
      expect(employmentSelect).toHaveValue('Full-time')
    })
  })

  describe('Form Validation', () => {
    it('should show error when job title is empty', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Job title is required')).toBeInTheDocument()
      })
    })

    it('should show error when department is empty', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      // Fill title but not department
      const titleInput = screen.getByLabelText(/job title/i)
      await user.type(titleInput, 'Test Job')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Department is required')).toBeInTheDocument()
      })
    })

    it('should not submit form when required fields are missing', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      expect(mockMutateAsync).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      const mockNewJob = { id: '123', title: 'Test Job' }
      mockMutateAsync.mockResolvedValue(mockNewJob)

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      // Fill in required fields
      await user.type(screen.getByLabelText(/job title/i), 'Senior Engineer')
      await user.type(screen.getByLabelText(/department/i), 'Engineering')

      // Submit
      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Engineer',
            department: 'Engineering',
          })
        )
      })
    })

    it('should navigate to job input page after successful creation', async () => {
      const user = userEvent.setup()
      const mockNewJob = { id: '123', title: 'Test Job' }
      mockMutateAsync.mockResolvedValue(mockNewJob)

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      await user.type(screen.getByLabelText(/job title/i), 'Test Job')
      await user.type(screen.getByLabelText(/department/i), 'Test Dept')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/job-input?jobId=123')
      })
    })

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup()
      const mockNewJob = { id: '123', title: 'Test Job' }
      mockMutateAsync.mockResolvedValue(mockNewJob)

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      await user.type(screen.getByLabelText(/job title/i), 'Test Job')
      await user.type(screen.getByLabelText(/department/i), 'Test Dept')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show error message when submission fails', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to create job'
      mockMutateAsync.mockRejectedValue(new Error(errorMessage))

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      await user.type(screen.getByLabelText(/job title/i), 'Test Job')
      await user.type(screen.getByLabelText(/department/i), 'Test Dept')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup()
      mockMutateAsync.mockImplementation(() => new Promise(() => {})) // Never resolves

      vi.spyOn(useJobsModule, 'useCreateJob').mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      })

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const submitButton = screen.getByRole('button', { name: /creating.../i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Input', () => {
    it('should update form fields when typing', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const titleInput = screen.getByLabelText(/job title/i)
      await user.type(titleInput, 'New Title')

      expect(titleInput).toHaveValue('New Title')
    })

    it('should accept numeric input for compensation fields', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const minCompInput = screen.getByLabelText(/min compensation/i)
      await user.type(minCompInput, '120000')

      expect(minCompInput).toHaveValue(120000)
    })

    it('should accept multiline text in description', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const descInput = screen.getByLabelText(/job description/i)
      await user.type(descInput, 'Line 1\nLine 2')

      expect(descInput).toHaveValue('Line 1\nLine 2')
    })
  })

  describe('Cancel Behavior', () => {
    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when X button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      // Find the X button (close icon)
      const closeButton = screen.getByRole('button', { name: '' })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should reset form when cancelled', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      // Fill in some data
      const titleInput = screen.getByLabelText(/job title/i)
      await user.type(titleInput, 'Test')

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Employment Type Select', () => {
    it('should have all employment type options', () => {
      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const select = screen.getByLabelText(/employment type/i)
      const options = Array.from(select.querySelectorAll('option')).map(o => o.value)

      expect(options).toEqual(['Full-time', 'Part-time', 'Contract', 'Internship'])
    })

    it('should update employment type when changed', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <CreateProjectModal isOpen={true} onClose={mockOnClose} />
      )

      const select = screen.getByLabelText(/employment type/i)
      await user.selectOptions(select, 'Contract')

      expect(select).toHaveValue('Contract')
    })
  })
})
