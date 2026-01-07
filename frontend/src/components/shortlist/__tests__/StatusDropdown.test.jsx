import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatusDropdown } from '../StatusDropdown'

describe('StatusDropdown', () => {
  const mockOnStatusChange = vi.fn()

  const defaultProps = {
    candidateId: 'cand-123',
    currentStatus: 'new',
    onStatusChange: mockOnStatusChange,
    disabled: false,
    size: 'md'
  }

  beforeEach(() => {
    mockOnStatusChange.mockClear()
  })

  describe('Rendering', () => {
    it('should render the current status button', () => {
      render(<StatusDropdown {...defaultProps} />)
      expect(screen.getByText('New - Needs Review')).toBeInTheDocument()
    })

    it('should render dropdown closed by default', () => {
      render(<StatusDropdown {...defaultProps} />)
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    it('should display correct icon for current status', () => {
      const { container } = render(<StatusDropdown {...defaultProps} />)
      // Circle icon should be present for 'new' status
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render all status options when opened', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /New - Needs Review/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Meets Reqs/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Doesn't Meet/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Move Forward/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Maybe/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Decline/ })).toBeInTheDocument()
      })
    })
  })

  describe('Status Selection', () => {
    it('should call onStatusChange when status is selected', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const meetsReqsOption = screen.getByRole('option', { name: /Meets Reqs/ })
      await user.click(meetsReqsOption)

      expect(mockOnStatusChange).toHaveBeenCalledWith('cand-123', 'meets-reqs')
    })

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const meetsReqsOption = screen.getByRole('option', { name: /Meets Reqs/ })
      await user.click(meetsReqsOption)

      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Meets Reqs/ })).not.toBeInTheDocument()
      })
    })

    it('should not call onStatusChange when selecting same status', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const newOption = screen.getByRole('option', { name: /New - Needs Review/ })
      await user.click(newOption)

      expect(mockOnStatusChange).not.toHaveBeenCalled()
    })

    it('should handle all 6 status options', async () => {
      const user = userEvent.setup()
      const statuses = [
        { key: 'meets-reqs', label: 'Meets Reqs' },
        { key: 'doesnt-meet', label: "Doesn't Meet" },
        { key: 'reviewed-forward', label: 'Move Forward' },
        { key: 'reviewed-maybe', label: 'Maybe' },
        { key: 'reviewed-decline', label: 'Decline' }
      ]

      render(<StatusDropdown {...defaultProps} currentStatus="new" />)
      const button = screen.getByRole('button', { name: /New - Needs Review/ })

      for (const status of statuses) {
        mockOnStatusChange.mockClear()

        await user.click(button)

        await waitFor(() => {
          const option = screen.getByRole('option', { name: new RegExp(status.label) })
          expect(option).toBeInTheDocument()
        })

        const option = screen.getByRole('option', { name: new RegExp(status.label) })
        await user.click(option)

        expect(mockOnStatusChange).toHaveBeenCalledWith('cand-123', status.key)

        // Close dropdown for next iteration
        await waitFor(() => {
          expect(screen.queryByRole('option', { name: new RegExp(status.label) })).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('should toggle dropdown with Enter key', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      button.focus()
      fireEvent.keyDown(button, { key: 'Enter' })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Meets Reqs/ })).toBeInTheDocument()
      })
    })

    it('should toggle dropdown with Space key', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      button.focus()
      fireEvent.keyDown(button, { key: ' ' })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Meets Reqs/ })).toBeInTheDocument()
      })
    })

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      expect(screen.getByText('Meets Reqs')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Meets Reqs/ })).not.toBeInTheDocument()
      })
    })

    it('should select option with Enter key', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const meetsReqsOption = screen.getByRole('option', { name: /Meets Reqs/ })

      fireEvent.keyDown(meetsReqsOption, { key: 'Enter' })

      expect(mockOnStatusChange).toHaveBeenCalledWith('cand-123', 'meets-reqs')
    })
  })

  describe('Click Outside', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <div>
          <StatusDropdown {...defaultProps} />
          <button>Outside Button</button>
        </div>
      )

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      expect(screen.getByText('Meets Reqs')).toBeInTheDocument()

      const outsideButton = screen.getByRole('button', { name: /Outside Button/ })
      await user.click(outsideButton)

      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Meets Reqs/ })).not.toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<StatusDropdown {...defaultProps} disabled={true} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toBeDisabled()
    })

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} disabled={true} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      expect(screen.queryByRole('option', { name: /Meets Reqs/ })).not.toBeInTheDocument()
    })

    it('should show updating state while onStatusChange is pending', async () => {
      mockOnStatusChange.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const meetsReqsOption = screen.getByRole('option', { name: /Meets Reqs/ })
      await user.click(meetsReqsOption)

      // Button should be disabled during update
      expect(button).toBeDisabled()

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Size Variants', () => {
    it('should render with small size', () => {
      const { container } = render(<StatusDropdown {...defaultProps} size="sm" />)
      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveClass('px-2', 'py-1', 'text-sm')
    })

    it('should render with medium size', () => {
      const { container } = render(<StatusDropdown {...defaultProps} size="md" />)
      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm')
    })

    it('should render with large size', () => {
      const { container } = render(<StatusDropdown {...defaultProps} size="lg" />)
      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-base')
    })
  })

  describe('Color Variants', () => {
    it('should apply correct color for new status', () => {
      const { container } = render(<StatusDropdown {...defaultProps} currentStatus="new" />)
      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveClass('bg-slate-100')
    })

    it('should apply correct color for meets-reqs status', () => {
      const { container } = render(<StatusDropdown {...defaultProps} currentStatus="meets-reqs" />)
      const button = screen.getByRole('button', { name: /Meets Reqs/ })
      expect(button).toHaveClass('bg-blue-100')
    })

    it('should apply correct color for reviewed-forward status', () => {
      const { container } = render(<StatusDropdown {...defaultProps} currentStatus="reviewed-forward" />)
      const button = screen.getByRole('button', { name: /Move Forward/ })
      expect(button).toHaveClass('bg-emerald-100')
    })

    it('should apply correct color for reviewed-decline status', () => {
      const { container } = render(<StatusDropdown {...defaultProps} currentStatus="reviewed-decline" />)
      const button = screen.getByRole('button', { name: /Decline/ })
      expect(button).toHaveClass('bg-rose-100')
    })
  })

  describe('Error Handling', () => {
    it('should reopen dropdown if status change fails', async () => {
      mockOnStatusChange.mockRejectedValueOnce(new Error('Update failed'))

      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      await user.click(button)

      const meetsReqsOption = screen.getByRole('option', { name: /Meets Reqs/ })
      await user.click(meetsReqsOption)

      await waitFor(() => {
        // Dropdown should reopen after error
        expect(screen.getByRole('option', { name: /Meets Reqs/ })).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveAttribute('aria-haspopup', 'listbox')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('should update aria-expanded when opened', async () => {
      const user = userEvent.setup()
      render(<StatusDropdown {...defaultProps} />)

      const button = screen.getByRole('button', { name: /New - Needs Review/ })
      expect(button).toHaveAttribute('aria-expanded', 'false')

      await user.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })
})
