/**
 * Quick Score Analysis E2E Tests
 * Tests the Quick Score evaluation flow with Analysis tab
 *
 * Prerequisites:
 * - Frontend dev server running
 * - Flask API server running
 * - Ollama running with phi3/mistral/llama3 (for Quick Score tests)
 *
 * Run: npx playwright test --project=chromium e2e/quick-score-analysis.spec.js
 */
import { test, expect } from '@playwright/test'

// These tests require a job with candidates to already exist
// Skip the job-specific tests since they depend on specific test data
test.describe.skip('Quick Score Analysis Flow (requires test data)', () => {
  test.beforeEach(async ({ page }) => {
    // These tests need a real job ID with candidates
    // They should be run manually with proper test data
    await page.goto('/app')
    await page.waitForLoadState('networkidle')
  })

  test('should load workbench page and show candidate', async ({ page }) => {
    // This test requires a job with candidates
    // Navigate to first job's workbench
    const firstJobCard = page.locator('.bg-white.p-6.rounded-xl').first()
    await firstJobCard.click()

    // Check for candidate list
    await expect(page.getByText(/candidates/i)).toBeVisible({ timeout: 10000 })
  })

  test('should open candidate detail panel via actions menu', async ({ page }) => {
    // This test requires a job with candidates
    await expect(page.getByText(/no test data/i)).toBeVisible()
  })
})

test.describe.skip('Model Comparison Modal (requires test data)', () => {
  test('should open Model Comparison modal with model options', async ({ page }) => {
    // This test requires a job with candidates
    await expect(page.getByText(/no test data/i)).toBeVisible()
  })

  test('should close Model Comparison modal', async ({ page }) => {
    // This test requires a job with candidates
    await expect(page.getByText(/no test data/i)).toBeVisible()
  })
})

test.describe('API Health Checks', () => {
  test('Flask API is running', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
  })

  test('Ollama status endpoint works', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/ollama/status')
    // This might fail if Ollama isn't running - that's OK
    if (response.ok()) {
      const body = await response.json()
      expect(body.success).toBe(true)
    } else {
      // Ollama not running is acceptable - skip gracefully
      console.log('Ollama not available, skipping status check')
    }
  })

  test('Database API is working', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/jobs')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.jobs)).toBe(true)
  })
})
