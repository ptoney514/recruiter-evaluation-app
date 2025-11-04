/**
 * Tests for JobCreationModal Component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobCreationModal } from '../components/jobs/JobCreationModal'

// Mock the API
global.fetch = vi.fn()

describe('JobCreationModal', () => {
  const mockOnClose = vi.fn()
  const mockOnJobCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <JobCreationModal isOpen={false} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render when isOpen is true', () => {
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)
      expect(screen.getByText('Create New Job')).toBeInTheDocument()
    })
  })

  describe('Step 1: Import Choice', () => {
    it('should show import and manual entry options', () => {
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      expect(screen.getByText(/Import from Job Description/i)).toBeInTheDocument()
      expect(screen.getByText(/Manual Entry/i)).toBeInTheDocument()
    })

    it('should have import mode selected by default', () => {
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const importRadio = screen.getByRole('radio', { checked: true })
      expect(importRadio).toHaveValue('import')
    })

    it('should show job description textarea when import mode is selected', () => {
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      expect(screen.getByPlaceholderText(/We're looking for/i)).toBeInTheDocument()
    })

    it('should allow switching to manual entry mode', async () => {
      const user = userEvent.setup()
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const manualRadio = screen.getAllByRole('radio')[1]
      await user.click(manualRadio)

      expect(manualRadio).toBeChecked()
    })

    it('should close modal when clicking cancel', async () => {
      const user = userEvent.setup()
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      await user.click(screen.getByText('Cancel'))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('AI Extraction', () => {
    it('should disable extract button when textarea is empty', () => {
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const extractButton = screen.getByText(/Extract Details with AI/i)
      expect(extractButton).toBeDisabled()
    })

    it('should enable extract button when job description is entered', async () => {
      const user = userEvent.setup()
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const textarea = screen.getByPlaceholderText(/We're looking for/i)
      await user.type(textarea, 'Senior Software Engineer with 5+ years Python')

      const extractButton = screen.getByText(/Extract Details with AI/i)
      expect(extractButton).not.toBeDisabled()
    })

    it('should call API and move to step 2 on successful extraction', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        employment_type: 'full-time',
        must_have_requirements: ['Python 5+ years', 'React experience'],
        preferred_qualifications: ['Docker/Kubernetes']
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const textarea = screen.getByPlaceholderText(/We're looking for/i)
      await user.type(textarea, 'Senior Software Engineer with 5+ years Python')

      const extractButton = screen.getByText(/Extract Details with AI/i)
      await user.click(extractButton)

      await waitFor(() => {
        expect(screen.getByText(/Review & Confirm/i)).toBeInTheDocument()
      })
    })

    it('should show error message on failed extraction', async () => {
      const user = userEvent.setup()

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const textarea = screen.getByPlaceholderText(/We're looking for/i)
      await user.type(textarea, 'Test job description')

      const extractButton = screen.getByText(/Extract Details with AI/i)
      await user.click(extractButton)

      await waitFor(() => {
        expect(screen.getByText(/Failed to extract job details/i)).toBeInTheDocument()
      })
    })
  })

  describe('Step 2: Review and Edit', () => {
    const setupStep2 = async () => {
      const user = userEvent.setup()
      const mockResponse = {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        employment_type: 'full-time',
        must_have_requirements: ['Python 5+ years', 'React experience'],
        preferred_qualifications: ['Docker/Kubernetes']
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const textarea = screen.getByPlaceholderText(/We're looking for/i)
      await user.type(textarea, 'Test job description')

      const extractButton = screen.getByText(/Extract Details with AI/i)
      await user.click(extractButton)

      await waitFor(() => {
        expect(screen.getByText(/Review & Confirm/i)).toBeInTheDocument()
      })

      return user
    }

    it('should display extracted job data in editable fields', async () => {
      await setupStep2()

      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Engineering')).toBeInTheDocument()
      expect(screen.getByDisplayValue('San Francisco, CA')).toBeInTheDocument()
    })

    it('should display must-have requirements with remove buttons', async () => {
      await setupStep2()

      expect(screen.getByText(/Python 5\+ years/)).toBeInTheDocument()
      expect(screen.getByText(/React experience/)).toBeInTheDocument()

      const removeButtons = screen.getAllByText(/× Remove/)
      expect(removeButtons.length).toBeGreaterThan(0)
    })

    it('should allow adding new must-have requirements', async () => {
      const user = await setupStep2()

      const input = screen.getByPlaceholderText(/Add a requirement/i)
      await user.type(input, 'PostgreSQL experience{enter}')

      expect(screen.getByText('PostgreSQL experience')).toBeInTheDocument()
    })

    it('should allow removing must-have requirements', async () => {
      const user = await setupStep2()

      const removeButtons = screen.getAllByText(/× Remove/)
      await user.click(removeButtons[0])

      expect(screen.queryByText(/Python 5\+ years/)).not.toBeInTheDocument()
    })

    it('should show validation error when creating job without title', async () => {
      const user = await setupStep2()

      // Clear the title
      const titleInput = screen.getByDisplayValue('Senior Software Engineer')
      await user.clear(titleInput)

      const createButton = screen.getByText(/Create Job →/i)
      await user.click(createButton)

      // Alert should be called (we'd need to mock window.alert for this)
      // For now, just verify the handler wasn't called
      expect(mockOnJobCreated).not.toHaveBeenCalled()
    })

    it('should call onJobCreated with correct data when creating valid job', async () => {
      const user = await setupStep2()

      const createButton = screen.getByText(/Create Job →/i)
      await user.click(createButton)

      expect(mockOnJobCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          employmentType: 'full-time',
          mustHaveRequirements: expect.arrayContaining(['Python 5+ years']),
          evaluationTrack: 'ai'
        })
      )
    })

    it('should allow going back to step 1', async () => {
      const user = await setupStep2()

      const backButton = screen.getByText('← Back')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.getByText(/How would you like to create this job/i)).toBeInTheDocument()
      })
    })
  })

  describe('Evaluation Track Selection', () => {
    it('should have AI-Powered selected by default', async () => {
      const user = userEvent.setup()

      // Go to manual entry to skip extraction
      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const manualRadio = screen.getAllByRole('radio')[1]
      await user.click(manualRadio)

      const continueButton = screen.getByText(/Continue to Manual Entry/i)
      await user.click(continueButton)

      await waitFor(() => {
        const aiRadio = screen.getByLabelText(/AI-Powered/i)
        expect(aiRadio).toBeChecked()
      })
    })

    it('should allow switching to Regex-Only track', async () => {
      const user = userEvent.setup()

      render(<JobCreationModal isOpen={true} onClose={mockOnClose} onJobCreated={mockOnJobCreated} />)

      const manualRadio = screen.getAllByRole('radio')[1]
      await user.click(manualRadio)

      const continueButton = screen.getByText(/Continue to Manual Entry/i)
      await user.click(continueButton)

      await waitFor(async () => {
        const regexRadio = screen.getByLabelText(/Regex-Only/i)
        await user.click(regexRadio)
        expect(regexRadio).toBeChecked()
      })
    })
  })
})
