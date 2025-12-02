/**
 * Quick Score Analysis E2E Tests
 * Tests the Quick Score evaluation flow with Analysis tab
 *
 * Prerequisites:
 * - Local Supabase running with dev user seeded
 * - Frontend dev server running
 * - Flask API server running
 * - Ollama running with phi3/mistral/llama3
 * - VITE_AUTH_BYPASS=true in frontend/.env.local
 *
 * Run: npx playwright test --project=chromium e2e/quick-score-analysis.spec.js
 */
import { test, expect } from '@playwright/test'

test.describe('Quick Score Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to workbench with test job
    await page.goto('/app/role/82583847-ce11-46e3-ba91-1944f87e1672/workbench')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load workbench page and show candidate', async ({ page }) => {
    // Check for candidate name in the list
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })
  })

  test('should open candidate detail panel via actions menu', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown (three dots menu) in the candidate row
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "View Details" in the dropdown
    await page.getByText('View Details').click()

    // Wait for detail panel to appear - check for Overview and Analysis tabs
    await expect(page.getByText('Overview')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Analysis')).toBeVisible({ timeout: 5000 })
  })

  test('should have Analysis tab in candidate detail panel', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "View Details"
    await page.getByText('View Details').click()

    // Check for Analysis tab
    await expect(page.getByText('Analysis')).toBeVisible({ timeout: 5000 })
  })

  test('should show "No Analysis Available" before running Quick Score', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "View Details"
    await page.getByText('View Details').click()

    // Wait for panel to load
    await page.waitForTimeout(500)

    // Click Analysis tab
    await page.getByText('Analysis').click()

    // Should show no analysis message
    await expect(page.getByText('No Analysis Available')).toBeVisible({ timeout: 5000 })
  })

  test('should open Compare Models modal from actions menu', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "Compare Models"
    await page.getByText('Compare Models').click()

    // Modal should appear with model options
    await expect(page.getByText('Model Comparison')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Model Comparison Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/role/82583847-ce11-46e3-ba91-1944f87e1672/workbench')
    await page.waitForLoadState('networkidle')
  })

  test('should open Model Comparison modal with model options', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "Compare Models"
    await page.getByText('Compare Models').click()

    // Modal should appear with model options
    await expect(page.getByText('Model Comparison')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Phi-3')).toBeVisible()
    await expect(page.getByText('Mistral')).toBeVisible()
    await expect(page.getByText('Llama 3')).toBeVisible()
  })

  test('should close Model Comparison modal', async ({ page }) => {
    // Wait for candidate row to appear
    await expect(page.getByText('John Developer')).toBeVisible({ timeout: 10000 })

    // Click on the actions dropdown
    const actionsButton = page.locator('tr', { hasText: 'John Developer' }).getByRole('button').last()
    await actionsButton.click()

    // Click "Compare Models"
    await page.getByText('Compare Models').click()

    // Wait for modal
    await expect(page.getByText('Model Comparison')).toBeVisible({ timeout: 5000 })

    // Close the modal using the Close button at bottom
    await page.getByRole('button', { name: 'Close' }).click()

    // Modal should disappear
    await expect(page.getByText('Model Comparison')).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('API Health Checks', () => {
  test('Flask API is running', async ({ request }) => {
    const response = await request.get('http://localhost:8000/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('Ollama status endpoint works', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/ollama/status');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.available).toBe(true);
  });
});
