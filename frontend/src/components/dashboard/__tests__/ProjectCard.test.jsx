import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ProjectCard } from '../ProjectCard'

// Helper to wrap component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProjectCard', () => {
  const mockProject = {
    id: '123',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    candidates_count: 10,
    evaluated_count: 5,
    created_at: '2025-11-01T10:00:00Z',
    status: 'active'
  }

  describe('Rendering', () => {
    it('should display project title', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    it('should display department and location', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    })

    it('should display candidate counts', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Candidates')).toBeInTheDocument()
      expect(screen.getByText('Evaluated')).toBeInTheDocument()
    })

    it('should display status badge', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      expect(screen.getByText('active')).toBeInTheDocument()
    })

    it('should display formatted creation date', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      // The date should be formatted as "Nov 1, 2025"
      expect(screen.getByText(/Created Nov 1, 2025/)).toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('should display correct completion percentage', () => {
      renderWithRouter(<ProjectCard project={mockProject} />)
      // 5 out of 10 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should display 100% when all candidates are evaluated', () => {
      const completeProject = {
        ...mockProject,
        candidates_count: 10,
        evaluated_count: 10
      }
      renderWithRouter(<ProjectCard project={completeProject} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should display 0% when no candidates are evaluated', () => {
      const newProject = {
        ...mockProject,
        candidates_count: 10,
        evaluated_count: 0
      }
      renderWithRouter(<ProjectCard project={newProject} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should not display progress bar when no candidates exist', () => {
      const emptyProject = {
        ...mockProject,
        candidates_count: 0,
        evaluated_count: 0
      }
      renderWithRouter(<ProjectCard project={emptyProject} />)
      expect(screen.queryByText('Progress')).not.toBeInTheDocument()
    })
  })

  describe('Status Variants', () => {
    it('should display draft status with secondary variant', () => {
      const draftProject = { ...mockProject, status: 'draft' }
      renderWithRouter(<ProjectCard project={draftProject} />)
      expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('should display active status with primary variant', () => {
      const activeProject = { ...mockProject, status: 'active' }
      renderWithRouter(<ProjectCard project={activeProject} />)
      expect(screen.getByText('active')).toBeInTheDocument()
    })

    it('should display completed status with success variant', () => {
      const completedProject = { ...mockProject, status: 'completed' }
      renderWithRouter(<ProjectCard project={completedProject} />)
      expect(screen.getByText('completed')).toBeInTheDocument()
    })
  })

  describe('Optional Fields', () => {
    it('should handle missing department', () => {
      const noDeptProject = { ...mockProject, department: null }
      renderWithRouter(<ProjectCard project={noDeptProject} />)
      expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    })

    it('should handle missing location', () => {
      const noLocProject = { ...mockProject, location: null }
      renderWithRouter(<ProjectCard project={noLocProject} />)
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument()
    })

    it('should handle both department and location missing', () => {
      const minimalProject = {
        ...mockProject,
        department: null,
        location: null
      }
      renderWithRouter(<ProjectCard project={minimalProject} />)
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    it('should default to 0 for missing candidate counts', () => {
      const noCandidatesProject = {
        ...mockProject,
        candidates_count: undefined,
        evaluated_count: undefined
      }
      renderWithRouter(<ProjectCard project={noCandidatesProject} />)
      expect(screen.getAllByText('0')).toHaveLength(2)
    })
  })

  describe('Navigation', () => {
    it('should be a clickable link', () => {
      const { container } = renderWithRouter(<ProjectCard project={mockProject} />)
      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/app/project/123')
    })

    it('should have hover effects', () => {
      const { container } = renderWithRouter(<ProjectCard project={mockProject} />)
      const card = container.querySelector('.hover\\:shadow-lg')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long titles with truncation', () => {
      const longTitleProject = {
        ...mockProject,
        title: 'This is an extremely long job title that should be truncated to prevent layout issues'
      }
      const { container } = renderWithRouter(<ProjectCard project={longTitleProject} />)
      const titleElement = container.querySelector('.truncate')
      expect(titleElement).toBeInTheDocument()
    })

    it('should handle high candidate counts', () => {
      const largeProject = {
        ...mockProject,
        candidates_count: 999,
        evaluated_count: 500
      }
      renderWithRouter(<ProjectCard project={largeProject} />)
      expect(screen.getByText('999')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('should handle future dates', () => {
      const futureProject = {
        ...mockProject,
        created_at: '2026-12-31T23:59:59Z'
      }
      renderWithRouter(<ProjectCard project={futureProject} />)
      expect(screen.getByText(/Created Dec 31, 2026/)).toBeInTheDocument()
    })
  })
})
