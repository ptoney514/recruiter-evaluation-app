import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesModal } from '../NotesModal'

describe('NotesModal', () => {
  const mockOnSave = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    candidateId: 'cand-123',
    candidateName: 'John Doe',
    initialNotes: '',
    initialTags: [],
    onSave: mockOnSave,
    onClose: mockOnClose,
    isLoading: false
  }

  beforeEach(() => {
    mockOnSave.mockClear()
    mockOnClose.mockClear()
    // Clear localStorage completely
    try {
      localStorage.clear()
    } catch (e) {
      // If clear doesn't work, manually remove
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i))
      }
      keys.forEach(key => {
        localStorage.removeItem(key)
      })
    }
  })

  describe('Rendering', () => {
    it('should render modal with candidate name', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Candidate Notes')).toBeInTheDocument()
    })

    it('should render notes textarea', () => {
      render(<NotesModal {...defaultProps} />)
      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      expect(textarea).toBeInTheDocument()
    })

    it('should render all quick tag buttons', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Strong Fit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Follow-up' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Culture Fit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Salary Mismatch' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Location Issue' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Overqualified' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Needs Interview' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reference Check' })).toBeInTheDocument()
    })

    it('should render Save and Cancel buttons', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Save/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('should display initial notes', () => {
      render(<NotesModal {...defaultProps} initialNotes="Test notes" />)
      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      expect(textarea).toHaveValue('Test notes')
    })

    it('should display initial tags as selected', () => {
      render(<NotesModal {...defaultProps} initialTags={['Strong Fit', 'Follow-up']} />)
      expect(screen.getByText(/Quick Tags \(2\)/)).toBeInTheDocument()
    })

    it('should display character count', () => {
      render(<NotesModal {...defaultProps} initialNotes="Test" />)
      expect(screen.getByText('4 characters')).toBeInTheDocument()
    })
  })

  describe('Notes Editing', () => {
    it('should update notes when typing', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'New notes')

      expect(textarea).toHaveValue('New notes')
    })

    it('should update character count', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Test')

      expect(screen.getByText('4 characters')).toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
      render(<NotesModal {...defaultProps} isLoading={true} />)
      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      expect(textarea).toBeDisabled()
    })
  })

  describe('Tag Selection', () => {
    it('should toggle tag selection', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const strongFitTag = screen.getByRole('button', { name: 'Strong Fit' })
      expect(strongFitTag).not.toHaveClass('bg-blue-100')

      await user.click(strongFitTag)

      expect(strongFitTag).toHaveClass('bg-blue-100')
      expect(screen.getByText(/Quick Tags \(1\)/)).toBeInTheDocument()
    })

    it('should deselect previously selected tag', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} initialTags={['Strong Fit']} />)

      const strongFitTag = screen.getByRole('button', { name: 'Strong Fit' })
      expect(strongFitTag).toHaveClass('bg-blue-100')

      await user.click(strongFitTag)

      expect(strongFitTag).not.toHaveClass('bg-blue-100')
      expect(screen.getByText(/Quick Tags \(0\)/)).toBeInTheDocument()
    })

    it('should support multiple tag selection', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Strong Fit' }))
      await user.click(screen.getByRole('button', { name: 'Follow-up' }))
      await user.click(screen.getByRole('button', { name: 'Culture Fit' }))

      expect(screen.getByText(/Quick Tags \(3\)/)).toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
      render(<NotesModal {...defaultProps} isLoading={true} />)
      const strongFitTag = screen.getByRole('button', { name: 'Strong Fit' })
      expect(strongFitTag).toBeDisabled()
    })
  })

  describe('Auto-Save Draft', () => {
    it('should save draft to localStorage after typing', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Draft notes')

      // Wait for auto-save
      await waitFor(() => {
        expect(localStorage.getItem('notes-draft-cand-123')).toBeTruthy()
      })

      const draft = JSON.parse(localStorage.getItem('notes-draft-cand-123'))
      expect(draft.notes).toBe('Draft notes')
      expect(draft.tags).toEqual([])
    })

    it('should save draft with selected tags', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'Strong Fit' }))

      // Wait for auto-save
      await waitFor(() => {
        const draft = JSON.parse(localStorage.getItem('notes-draft-cand-123'))
        expect(draft.tags).toEqual(['Strong Fit'])
      })
    })

    it('should show draft saved indicator', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Draft')

      // Wait for auto-save and indicator to show
      await waitFor(() => {
        expect(screen.getByText('✓ Draft saved')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('should not save draft if nothing changed from initialization', async () => {
      // Initialize with some notes and tags
      const initialNotes = "Initial notes"
      const initialTags = ['Strong Fit']

      render(<NotesModal
        {...defaultProps}
        initialNotes={initialNotes}
        initialTags={initialTags}
      />)

      // Wait a bit for auto-save timeout
      await new Promise(resolve => setTimeout(resolve, 700))

      // LocalStorage should remain empty since nothing changed
      expect(localStorage.getItem('notes-draft-cand-123')).toBeNull()
    })
  })

  describe('Save Functionality', () => {
    it('should call onSave with notes and tags', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Test notes')

      await user.click(screen.getByRole('button', { name: 'Strong Fit' }))

      const saveButton = screen.getByRole('button', { name: /Save/ })
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith('cand-123', 'Test notes', ['Strong Fit'])
    })

    it('should show loading state while saving', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<NotesModal {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: /Save/ })
      expect(saveButton).toHaveTextContent('Save')

      rerender(<NotesModal {...defaultProps} isLoading={true} />)
      expect(screen.getByRole('button', { name: /Saving/ })).toBeInTheDocument()
    })

    it('should clear draft after successful save', async () => {
      const user = userEvent.setup()
      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Notes')

      // Wait for draft save
      await waitFor(() => {
        expect(localStorage.getItem('notes-draft-cand-123')).toBeTruthy()
      })

      const saveButton = screen.getByRole('button', { name: /Save/ })
      await user.click(saveButton)

      expect(mockOnSave).toHaveBeenCalled()

      // Draft should be cleared
      expect(localStorage.getItem('notes-draft-cand-123')).toBeNull()
    })

    it('should be disabled when loading', () => {
      render(<NotesModal {...defaultProps} isLoading={true} />)
      const saveButton = screen.getByRole('button', { name: /Saving/ })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Modal Closing', () => {
    it('should call onClose when Cancel is clicked', () => {
      render(<NotesModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when X button is clicked', () => {
      render(<NotesModal {...defaultProps} />)

      const closeButton = screen.getByLabelText('Close modal')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when loading', () => {
      render(<NotesModal {...defaultProps} isLoading={true} />)

      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toBeDisabled()

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      mockOnSave.mockRejectedValueOnce(new Error('Save failed'))

      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<NotesModal {...defaultProps} />)

      const textarea = screen.getByPlaceholderText('Add notes about this candidate...')
      await user.type(textarea, 'Test')

      const saveButton = screen.getByRole('button', { name: /Save/ })
      await user.click(saveButton)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save notes:', expect.any(Error))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByText('Recruiter Notes')).toBeInTheDocument()
      expect(screen.getByText(/Quick Tags/)).toBeInTheDocument()
    })

    it('should have close button aria label', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })

    it('should announce modal purpose', () => {
      render(<NotesModal {...defaultProps} />)
      expect(screen.getByText('Candidate Notes')).toBeInTheDocument()
    })
  })
})
