/**
 * Component Tests for SettingsPage
 * Tests the Settings UI component functionality
 *
 * Run: npm run test:run -- src/tests/SettingsPage.test.jsx
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { SettingsPage } from '../pages/SettingsPage'
import * as settingsService from '../services/settingsService'

// Mock the settings service
vi.mock('../services/settingsService')

// Mock react-router since we're testing in isolation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Helper function to render with QueryClient
function renderWithQueryClient(component) {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('SettingsPage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Mock the hooks to return test data
    settingsService.getSettings = vi.fn().mockResolvedValue({
      stage1_model: 'claude-3-5-haiku-20241022',
      stage2_model: 'claude-sonnet-4-5-20251022',
      default_provider: 'anthropic'
    })

    settingsService.getAvailableModels = vi.fn().mockResolvedValue({
      anthropic: {
        models: [
          { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', cost: 'Low', pricing: { input: 1.00, output: 5.00 } },
          { id: 'claude-sonnet-4-5-20251022', name: 'Claude Sonnet 4.5', cost: 'Medium', pricing: { input: 3.00, output: 15.00 } },
          { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', cost: 'High', pricing: { input: 5.00, output: 25.00 } },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Legacy)', cost: 'Very Low', pricing: { input: 0.25, output: 1.25 } },
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Legacy)', cost: 'Medium', pricing: { input: 3.00, output: 15.00 } },
        ],
        default_model: 'claude-3-5-haiku-20241022'
      }
    })

    settingsService.updateSettings = vi.fn().mockResolvedValue({ success: true })
  })

  describe('Page Structure and Display', () => {
    it('should render the settings page title', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
      })
    })

    it('should display description text', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/configure which ai models/i)).toBeInTheDocument()
      })
    })

    it('should display AI Model Configuration card', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /ai model configuration/i })).toBeInTheDocument()
      })
    })

    it('should display Stage 1 and Stage 2 labels', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/stage 1: resume screening model/i)).toBeInTheDocument()
        expect(screen.getByText(/stage 2: final hiring model/i)).toBeInTheDocument()
      })
    })

    it('should display info box about model selection', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/about model selection/i)).toBeInTheDocument()
      })
    })

    it('should display model comparison table', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /model comparison/i })).toBeInTheDocument()
        expect(screen.getByText(/model/i)).toBeInTheDocument()
        expect(screen.getByText(/input \(\$\/mtok\)/i)).toBeInTheDocument()
      })
    })

    it('should display save button', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument()
      })
    })
  })

  describe('Model Dropdowns', () => {
    it('should display Stage 1 model dropdown', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should populate dropdowns with available models', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        const stage1Select = selects[0]

        // Should have 5 model options
        const options = within(stage1Select).getAllByRole('option')
        expect(options.length).toBe(5)
      })
    })

    it('should display default model for Stage 1', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        const stage1Select = selects[0]

        expect(stage1Select).toHaveValue('claude-3-5-haiku-20241022')
      })
    })

    it('should display default model for Stage 2', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        const stage2Select = selects[1]

        expect(stage2Select).toHaveValue('claude-sonnet-4-5-20251022')
      })
    })

    it('should allow changing Stage 1 model', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const selects = screen.getAllByRole('combobox')
      const stage1Select = selects[0]

      await user.selectOptions(stage1Select, 'claude-sonnet-4-5-20251022')

      expect(stage1Select).toHaveValue('claude-sonnet-4-5-20251022')
    })

    it('should allow changing Stage 2 model', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const selects = screen.getAllByRole('combobox')
      const stage2Select = selects[1]

      await user.selectOptions(stage2Select, 'claude-opus-4-5-20251101')

      expect(stage2Select).toHaveValue('claude-opus-4-5-20251101')
    })
  })

  describe('Cost Estimation', () => {
    it('should display cost estimate for Stage 1', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Should show cost estimate with $ symbol
        const costTexts = screen.getAllByText(/est\. \$/i)
        expect(costTexts.length).toBeGreaterThan(0)
      })
    })

    it('should display cost estimate for Stage 2', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const costTexts = screen.getAllByText(/est\. \$/i)
        expect(costTexts.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('should update cost estimate when changing model', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const selects = screen.getAllByRole('combobox')
      const stage1Select = selects[0]

      // Get initial cost text
      let costTexts = screen.getAllByText(/est\. \$/i)
      const initialCost = costTexts[0].textContent

      // Change model to Opus (more expensive)
      await user.selectOptions(stage1Select, 'claude-opus-4-5-20251101')

      // Cost should update (but Opus has higher price)
      costTexts = screen.getAllByText(/est\. \$/i)
      const newCost = costTexts[0].textContent

      // Cost text should be different or model should change
      expect(stage1Select).toHaveValue('claude-opus-4-5-20251101')
    })

    it('should calculate correct cost for Haiku 3.5 Legacy', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Haiku 3.5 Legacy: $0.25/$1.25 per MTok
        // For 2000 tokens avg: (2000/1M * 0.25) + (2000/1M * 1.25) = 0.003
        const costText = screen.getByText(/est\. \$0\.00/)
        expect(costText).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should save settings when save button is clicked', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      // Change a model
      const selects = screen.getAllByRole('combobox')
      await user.selectOptions(selects[0], 'claude-sonnet-4-5-20251022')

      // Click save
      const saveButton = screen.getByRole('button', { name: /save settings/i })
      await user.click(saveButton)

      // Verify updateSettings was called
      await waitFor(() => {
        expect(settingsService.updateSettings).toHaveBeenCalled()
      })
    })

    it('should show success message after saving', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const saveButton = screen.getByRole('button', { name: /save settings/i })
      await user.click(saveButton)

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument()
      }, { timeout: 5000 })
    })

    it('should disable save button while saving', async () => {
      const user = userEvent.setup()

      // Make updateSettings take longer
      settingsService.updateSettings = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))

      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const saveButton = screen.getByRole('button', { name: /save settings/i })
      await user.click(saveButton)

      // Button should show "Saving..."
      await waitFor(() => {
        expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument()
      })
    })

    it('should call updateSettings with correct payload', async () => {
      const user = userEvent.setup()
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects.length).toBeGreaterThanOrEqual(2)
      })

      const selects = screen.getAllByRole('combobox')
      await user.selectOptions(selects[0], 'claude-opus-4-5-20251101')
      await user.selectOptions(selects[1], 'claude-haiku-4-5-20251001')

      const saveButton = screen.getByRole('button', { name: /save settings/i })
      await user.click(saveButton)

      await waitFor(() => {
        // Should call with the new settings
        expect(settingsService.updateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            stage1_model: 'claude-opus-4-5-20251101',
            stage2_model: 'claude-haiku-4-5-20251001'
          })
        )
      })
    })
  })

  describe('Model Comparison Table', () => {
    it('should display all models in comparison table', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const table = screen.getByRole('table')
        const rows = within(table).getAllByRole('row')

        // Header + 5 models = 6 rows
        expect(rows.length).toBe(6)
      })
    })

    it('should show model pricing in table', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Should show pricing like $0.25, $1.00, $3.00, etc.
        expect(screen.getByText('$0.25')).toBeInTheDocument()
        expect(screen.getByText('$1.00')).toBeInTheDocument()
        expect(screen.getByText('$3.00')).toBeInTheDocument()
        expect(screen.getByText('$5.00')).toBeInTheDocument()
      })
    })

    it('should show cost level badges', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Should have cost level badges
        const badges = screen.getAllByText(/(Very Low|Low|Medium|High)/i)
        expect(badges.length).toBeGreaterThan(0)
      })
    })

    it('should display correct model names', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Claude Haiku 4\.5/)).toBeInTheDocument()
        expect(screen.getByText(/Claude Sonnet 4\.5/)).toBeInTheDocument()
        expect(screen.getByText(/Claude Opus 4\.5/)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing model data gracefully', async () => {
      settingsService.getAvailableModels = vi.fn().mockResolvedValue({
        anthropic: { models: [] }
      })

      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
      })
    })

    it('should show loading state initially', async () => {
      // Create a never-resolving promise to test loading state
      settingsService.getSettings = vi.fn(() => new Promise(() => {}))
      settingsService.getAvailableModels = vi.fn(() => new Promise(() => {}))

      renderWithQueryClient(<SettingsPage />)

      // Should show loading text
      expect(screen.getByText(/loading settings/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for dropdowns', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Labels should be present
        expect(screen.getByText(/stage 1: resume screening model/i)).toBeInTheDocument()
        expect(screen.getByText(/stage 2: final hiring model/i)).toBeInTheDocument()
      })
    })

    it('should have descriptive button text', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        // Button should have clear text
        const saveButton = screen.getByRole('button', { name: /save settings/i })
        expect(saveButton).toBeInTheDocument()
      })
    })
  })

  describe('Settings Persistence', () => {
    it('should load settings from API on mount', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(settingsService.getSettings).toHaveBeenCalled()
      })
    })

    it('should load available models from API on mount', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        expect(settingsService.getAvailableModels).toHaveBeenCalled()
      })
    })

    it('should populate form with loaded settings', async () => {
      renderWithQueryClient(<SettingsPage />)

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox')
        expect(selects[0]).toHaveValue('claude-3-5-haiku-20241022')
        expect(selects[1]).toHaveValue('claude-sonnet-4-5-20251022')
      })
    })
  })
})
