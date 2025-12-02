/**
 * AI Analysis Flow E2E Tests
 * Tests the Run AI Analysis feature on the Workbench page
 *
 * Prerequisites:
 * - Frontend running at localhost:3000
 * - API server running at localhost:8000
 * - User already logged in (or dev bypass enabled)
 * - ANTHROPIC_API_KEY configured in api/.env
 *
 * Run: npx playwright test e2e/ai-analysis.spec.js --headed
 */
import { test, expect } from '@playwright/test'

test.describe('AI Analysis Flow', () => {

  test('should show workbench with candidates and AI button', async ({ page }) => {
    // Go to the app - should redirect to login or dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Check if we're on the dashboard or login page
    const url = page.url()

    if (url.includes('/login') || url.includes('/signup')) {
      test.skip(true, 'Not logged in - skipping test')
      return
    }

    // Look for a position card and click it
    const positionCard = page.locator('text=Open Workbench').first()

    if (await positionCard.isVisible({ timeout: 5000 })) {
      await positionCard.click()
      await page.waitForLoadState('networkidle')

      // Should be on workbench page
      await expect(page).toHaveURL(/\/workbench/)

      // Check for key elements
      await expect(page.getByPlaceholder(/search/i)).toBeVisible()
      await expect(page.getByText(/selected/i)).toBeVisible()
    } else {
      console.log('No positions found - create a position first')
    }
  })

  test('should enable AI button when candidate selected', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    const url = page.url()
    if (url.includes('/login') || url.includes('/signup')) {
      test.skip(true, 'Not logged in')
      return
    }

    // Click first position
    const openWorkbench = page.locator('text=Open Workbench').first()
    if (await openWorkbench.isVisible({ timeout: 5000 })) {
      await openWorkbench.click()
      await page.waitForLoadState('networkidle')

      // Check if there are candidates
      const candidateRow = page.locator('tbody tr').first()
      if (await candidateRow.isVisible({ timeout: 5000 })) {
        // Select candidate
        const checkbox = candidateRow.locator('input[type="checkbox"]')
        await checkbox.click()

        // AI button should show credits
        const aiButton = page.getByRole('button', { name: /run ai analysis/i })
        await expect(aiButton).toBeVisible()
        await expect(aiButton).toContainText(/credits/i)
      }
    }
  })

  test('should run AI analysis on selected candidate', async ({ page }) => {
    // Increase timeout for AI evaluation
    test.setTimeout(120000)

    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    const url = page.url()
    if (url.includes('/login') || url.includes('/signup')) {
      test.skip(true, 'Not logged in')
      return
    }

    // Click first position
    const openWorkbench = page.locator('text=Open Workbench').first()
    if (!(await openWorkbench.isVisible({ timeout: 5000 }))) {
      test.skip(true, 'No positions found')
      return
    }

    await openWorkbench.click()
    await page.waitForLoadState('networkidle')

    // Check if there are candidates
    const candidateRow = page.locator('tbody tr').first()
    if (!(await candidateRow.isVisible({ timeout: 5000 }))) {
      test.skip(true, 'No candidates found')
      return
    }

    // Select candidate
    const checkbox = candidateRow.locator('input[type="checkbox"]')
    await checkbox.click()

    // Click Run AI Analysis
    const aiButton = page.getByRole('button', { name: /run ai analysis/i })
    await aiButton.click()

    // Should show loading state
    await expect(page.getByText(/evaluating|starting/i)).toBeVisible({ timeout: 10000 })

    // Wait for completion (up to 90 seconds)
    await expect(page.getByText(/evaluating|starting/i)).not.toBeVisible({ timeout: 90000 })

    // Candidate should now have a score
    console.log('AI Analysis completed!')
  })
})
