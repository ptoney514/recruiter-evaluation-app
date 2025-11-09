import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardPage } from '../DashboardPage'
import * as useJobsModule from '../../hooks/useJobs'

// Mock the useJobs hooks
vi.mock('../../hooks/useJobs', () => ({
  useJobs: vi.fn(),
  useCreateJob: vi.fn(),
}))

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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for useCreateJob
    vi.spyOn(useJobsModule, 'useCreateJob').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    })
  })

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Loading projects...')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when fetch fails', () => {
      const errorMessage = 'Failed to fetch jobs'
      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error(errorMessage),
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should reload page when retry button is clicked', async () => {
      const user = userEvent.setup()
      const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {})

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Test error'),
      })

      renderWithProviders(<DashboardPage />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      expect(reloadSpy).toHaveBeenCalled()

      reloadSpy.mockRestore()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no jobs exist', () => {
      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('No projects yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first project to start evaluating resumes')).toBeInTheDocument()
    })

    it('should open create modal when clicking create button in empty state', async () => {
      const user = userEvent.setup()

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      const createButton = screen.getAllByRole('button', { name: /create project/i })[0]
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument()
      })
    })
  })

  describe('Projects Display', () => {
    it('should display list of projects when jobs exist', () => {
      const mockJobs = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          candidates_count: 5,
          evaluated_count: 2,
          status: 'open',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'Remote',
          candidates_count: 10,
          evaluated_count: 10,
          status: 'draft',
          created_at: new Date().toISOString(),
        },
      ]

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: mockJobs,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    it('should display correct candidate counts', () => {
      const mockJobs = [
        {
          id: '1',
          title: 'Test Job',
          department: 'Test',
          candidates_count: 15,
          evaluated_count: 7,
          status: 'open',
          created_at: new Date().toISOString(),
        },
      ]

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: mockJobs,
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('15')).toBeInTheDocument() // candidates_count
      expect(screen.getByText('7')).toBeInTheDocument()  // evaluated_count
    })
  })

  describe('Create Project Modal', () => {
    it('should open modal when New Project button is clicked', async () => {
      const user = userEvent.setup()

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      const newProjectButton = screen.getByRole('button', { name: /new project/i })
      await user.click(newProjectButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument()
      })
    })

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup()

      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      // Open modal
      const newProjectButton = screen.getByRole('button', { name: /new project/i })
      await user.click(newProjectButton)

      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument()
      })

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Create New Project')).not.toBeInTheDocument()
      })
    })
  })

  describe('Page Header', () => {
    it('should display correct page title', () => {
      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Manage your resume evaluation projects')).toBeInTheDocument()
    })

    it('should have New Project button in header', () => {
      vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      renderWithProviders(<DashboardPage />)

      const newProjectButton = screen.getByRole('button', { name: /new project/i })
      expect(newProjectButton).toBeInTheDocument()
    })
  })
})
