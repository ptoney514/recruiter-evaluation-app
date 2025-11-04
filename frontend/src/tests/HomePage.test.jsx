/**
 * Tests for HomePage Component - Job Creation Flow
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { sessionStore } from '../services/storage/sessionStore'

// Mock the router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock the API
global.fetch = vi.fn()

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('HomePage - Job Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.clear()
  })

  it('should open JobCreationModal when Start New Evaluation is clicked', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const startButton = screen.getByText('Start New Evaluation')
    await user.click(startButton)

    // Modal should open
    expect(screen.getByText('Create New Job')).toBeInTheDocument()
  })

  it('should create new evaluation in sessionStore when starting new evaluation', async () => {
    const user = userEvent.setup()
    const clearSpy = vi.spyOn(sessionStore, 'clearEvaluation')
    const saveSpy = vi.spyOn(sessionStore, 'saveEvaluation')

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const startButton = screen.getByText('Start New Evaluation')
    await user.click(startButton)

    expect(clearSpy).toHaveBeenCalled()
    expect(saveSpy).toHaveBeenCalled()
  })

  it('should properly transform and save job data when job is created', async () => {
    const user = userEvent.setup()
    const mockJobData = {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      employmentType: 'full-time',
      mustHaveRequirements: ['Python 5+ years', 'React experience'],
      preferredQualifications: ['Docker/Kubernetes'],
      evaluationTrack: 'ai'
    }

    // Mock the API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockJobData,
        must_have_requirements: mockJobData.mustHaveRequirements,
        preferred_qualifications: mockJobData.preferredQualifications,
        employment_type: mockJobData.employmentType
      })
    })

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Start new evaluation
    const startButton = screen.getByText('Start New Evaluation')
    await user.click(startButton)

    // Fill in job description and extract
    const textarea = screen.getByPlaceholderText(/We're looking for/i)
    await user.type(textarea, 'Test job description')

    const extractButton = screen.getByText(/Extract Details with AI/i)
    await user.click(extractButton)

    // Wait for step 2 to appear
    await waitFor(() => {
      expect(screen.getByText(/Review & Confirm/i)).toBeInTheDocument()
    })

    // Create the job
    const createButton = screen.getByText(/Create Job →/i)
    await user.click(createButton)

    // Verify navigation to resume upload
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/upload-resumes')
    })

    // Verify job data was saved correctly
    const savedEvaluation = sessionStore.getCurrentEvaluation()
    expect(savedEvaluation).toBeDefined()
    expect(savedEvaluation.job).toEqual(
      expect.objectContaining({
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        employmentType: 'full-time',
        requirements: expect.arrayContaining(['Python 5+ years']),
        preferredQualifications: expect.arrayContaining(['Docker/Kubernetes']),
        evaluationTrack: 'ai'
      })
    )
  })

  it('should handle getCurrentEvaluation correctly (regression test for bug)', async () => {
    const user = userEvent.setup()

    // Create a mock evaluation first
    sessionStore.saveEvaluation(sessionStore.createNewEvaluation())

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: 'Test Job',
        department: 'Engineering',
        location: 'Remote',
        employment_type: 'full-time',
        must_have_requirements: ['Test requirement'],
        preferred_qualifications: []
      })
    })

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const startButton = screen.getByText('Start New Evaluation')
    await user.click(startButton)

    const textarea = screen.getByPlaceholderText(/We're looking for/i)
    await user.type(textarea, 'Test job description')

    const extractButton = screen.getByText(/Extract Details with AI/i)
    await user.click(extractButton)

    await waitFor(() => {
      expect(screen.getByText(/Review & Confirm/i)).toBeInTheDocument()
    })

    const createButton = screen.getByText(/Create Job →/i)

    // This should NOT throw an error about getEvaluation not being a function
    await expect(async () => {
      await user.click(createButton)
    }).not.toThrow()

    // Should successfully navigate
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/upload-resumes')
    })
  })

  it('should close modal when clicking close button', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const startButton = screen.getByText('Start New Evaluation')
    await user.click(startButton)

    expect(screen.getByText('Create New Job')).toBeInTheDocument()

    // Click the X close button
    const closeButton = screen.getByText('×')
    await user.click(closeButton)

    // Modal should close
    expect(screen.queryByText('Create New Job')).not.toBeInTheDocument()
  })
})
