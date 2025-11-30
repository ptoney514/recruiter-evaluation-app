/**
 * Create Job Flow E2E Tests (Authenticated)
 * Tests job creation with a logged-in user
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - Frontend dev server running via `npm run dev`
 * - Auth setup has run (creates test user)
 *
 * Run: npx playwright test --project=chromium-auth e2e/create-job-flow.auth.spec.js
 */
import { test, expect } from '@playwright/test'

// Test data
const TEST_JOB = {
  title: `E2E Auth Test Job ${Date.now()}`,
  description: `This is an authenticated E2E test job created during automated testing.

Requirements:
- Requirement 1 for testing
- Requirement 2 for testing
- Requirement 3 for testing
- At least 3 years of experience

Nice to have:
- Bonus skill 1
- Bonus skill 2`,
}

test.describe('Create Job Flow (Authenticated)', () => {
  // Helper to get form fields
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })

  test('should be logged in and see dashboard', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify we're on the dashboard (not redirected to login)
    await expect(page).toHaveURL('/app')

    // Verify Create New Role button is visible
    const createButton = page.getByRole('button', { name: /create new role/i })
    await expect(createButton).toBeVisible()
  })

  test('should create job successfully with auth', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill the form
    await getJobTitleInput(page).fill(TEST_JOB.title)
    await getDescriptionInput(page).fill(TEST_JOB.description)

    // Wait for keywords to be detected
    await page.waitForTimeout(500)

    // Submit the form
    await getSubmitButton(page).click()

    // Should redirect to workbench on success
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Verify job title is shown on workbench
    await expect(page.getByText(TEST_JOB.title)).toBeVisible()
  })

  test('should show created job in dashboard', async ({ page }) => {
    const uniqueTitle = `Dashboard Test Job ${Date.now()}`

    // Create a job
    await page.goto('/app/create-role')
    await getJobTitleInput(page).fill(uniqueTitle)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()

    // Wait for redirect to workbench
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify job appears in the list
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 })
  })

  test('should increment job count after creation', async ({ page }) => {
    // Get initial count
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    const createButton = page.getByRole('button', { name: /create new role/i })
    const initialText = await createButton.textContent()
    const initialMatch = initialText.match(/\((\d+)\/3\)/)
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0

    // Create a job
    const uniqueTitle = `Count Test Job ${Date.now()}`
    await page.goto('/app/create-role')
    await getJobTitleInput(page).fill(uniqueTitle)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()

    // Wait for redirect
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Go back to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify count increased
    const finalText = await createButton.textContent()
    const finalMatch = finalText.match(/\((\d+)\/3\)/)
    const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0

    expect(finalCount).toBe(initialCount + 1)
  })
})
