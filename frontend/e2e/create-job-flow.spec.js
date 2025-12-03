/**
 * Create Job Flow E2E Tests
 * Tests job creation in single-user mode (no auth)
 *
 * Prerequisites:
 * - API server running via `cd api && python3 flask_server.py`
 * - Frontend dev server running via `npm run dev`
 *
 * Run: npx playwright test e2e/create-job-flow.spec.js
 */
import { test, expect } from '@playwright/test'

// Test data
const TEST_JOB = {
  title: `E2E Test Job ${Date.now()}`,
  description: `This is an E2E test job created during automated testing.

Requirements:
- Requirement 1 for testing
- Requirement 2 for testing
- Requirement 3 for testing
- At least 3 years of experience

Nice to have:
- Bonus skill 1
- Bonus skill 2`,
}

test.describe('App Navigation', () => {
  test('should redirect root to dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should redirect to /app (dashboard)
    await expect(page).toHaveURL('/app')
  })

  test('should display dashboard page', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify dashboard elements
    await expect(page).toHaveURL('/app')
    await expect(page.getByRole('button', { name: /create new position/i })).toBeVisible()
  })

  test('should navigate to create role page', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Click create new position button
    await page.getByRole('button', { name: /create new position/i }).click()

    // Should navigate to create-role page
    await expect(page).toHaveURL('/app/create-role')
  })
})

test.describe('Create Role Form', () => {
  test('should render create role page with form fields', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Verify page title
    await expect(page.getByRole('heading', { name: /create new position/i })).toBeVisible()

    // Verify form fields
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('textarea[name="description"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /save.*start.*uploading/i })).toBeVisible()
  })

  test('should have submit button disabled when title is empty', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill description but not title
    await page.locator('textarea[name="description"]').fill('This is a detailed job description')

    // Submit button should be disabled
    await expect(page.getByRole('button', { name: /save.*start.*uploading/i })).toBeDisabled()
  })

  test('should enable submit button when title is provided', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill title
    await page.locator('input[name="title"]').fill('Test Job Title')

    // Submit button should be enabled
    await expect(page.getByRole('button', { name: /save.*start.*uploading/i })).toBeEnabled()
  })

  test('should create job and redirect to workbench', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill the form
    await page.locator('input[name="title"]').fill(TEST_JOB.title)
    await page.locator('textarea[name="description"]').fill(TEST_JOB.description)

    // Submit the form
    await page.getByRole('button', { name: /save.*start.*uploading/i }).click()

    // Should redirect to workbench on success
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Verify job title is shown on workbench
    await expect(page.getByText(TEST_JOB.title)).toBeVisible()
  })

  test('should navigate back to dashboard when cancel is clicked', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Should navigate to dashboard
    await expect(page).toHaveURL('/app')
  })

  test('should navigate back to dashboard via back link', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Click back to dashboard link
    await page.getByText('Back to Dashboard').click()

    // Should navigate to dashboard
    await expect(page).toHaveURL('/app')
  })
})

test.describe('Job List on Dashboard', () => {
  test('should show created job in dashboard', async ({ page }) => {
    const uniqueTitle = `Dashboard Test Job ${Date.now()}`

    // Create a job
    await page.goto('/app/create-role')
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('textarea[name="description"]').fill(TEST_JOB.description)
    await page.getByRole('button', { name: /save.*start.*uploading/i }).click()

    // Wait for redirect to workbench
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify job appears in the list
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 })
  })
})
