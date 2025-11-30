/**
 * Tier Limits E2E Tests
 * Tests tier limit enforcement in the UI
 *
 * Free tier limits:
 * - 3 jobs maximum
 * - 5 candidates per job
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - Frontend dev server running via `npm run dev`
 *
 * Run: npx playwright test e2e/tier-limits.spec.js
 */
import { test, expect } from '@playwright/test'

// Test data
const TEST_JOB = {
  description: `This is a test job for tier limit testing.

Requirements:
- Test requirement 1
- Test requirement 2
- Test requirement 3
- At least 5 years of experience in software development

Nice to have:
- Additional skill 1
- Additional skill 2`,
}

// NOTE: Tests that create/delete jobs require authentication (RLS policies).
// Separate UI-only tests from auth-required tests.
test.describe('Tier Limits', () => {
  // Helper to get form fields by their actual structure
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })

  // Helper to create a job
  async function createJob(page, title) {
    await page.goto('/app/create-role')
    await getJobTitleInput(page).fill(title)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/)
  }

  // Helper to delete all jobs
  async function deleteAllJobs(page) {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    let deleteButtons = await page.locator('button[title="Delete role"]').all()
    for (const button of deleteButtons) {
      try {
        await button.click()
        await page.waitForTimeout(500)
      } catch (e) {
        // Button may have been removed
      }
    }
    await page.waitForTimeout(500)
  }

  // UI-only test - no auth required
  test('should display job count in Create New Role button', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify button shows count format (X/3)
    const createButton = page.getByRole('button', { name: /create new role/i })
    await expect(createButton).toBeVisible()

    const buttonText = await createButton.textContent()
    expect(buttonText).toMatch(/\(\d+\/3\)/)
  })

  // All tests below require authentication for job creation/deletion
  // Skip until auth setup is implemented
  test.skip('should allow creating jobs up to the limit (requires auth)', async ({ page }) => {
    // Create first job
    await createJob(page, `Tier Test Job 1 - ${Date.now()}`)

    // Navigate to dashboard and verify count
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    let createButton = page.getByRole('button', { name: /create new role/i })
    let buttonText = await createButton.textContent()
    expect(buttonText).toContain('(1/3)')

    // Create second job
    await createJob(page, `Tier Test Job 2 - ${Date.now()}`)

    // Verify count
    await page.goto('/app')
    await page.waitForLoadState('networkidle')
    createButton = page.getByRole('button', { name: /create new role/i })
    buttonText = await createButton.textContent()
    expect(buttonText).toContain('(2/3)')

    // Create third job
    await createJob(page, `Tier Test Job 3 - ${Date.now()}`)

    // Verify count at limit
    await page.goto('/app')
    await page.waitForLoadState('networkidle')
    createButton = page.getByRole('button', { name: /create new role/i })
    buttonText = await createButton.textContent()
    expect(buttonText).toContain('(3/3)')
  })

  test.skip('should disable Create New Role button when at limit (requires auth)', async ({ page }) => {
    // Create 3 jobs to reach the limit
    await createJob(page, `Limit Test Job 1 - ${Date.now()}`)
    await createJob(page, `Limit Test Job 2 - ${Date.now()}`)
    await createJob(page, `Limit Test Job 3 - ${Date.now()}`)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify button is disabled
    const createButton = page.getByRole('button', { name: /create new role/i })
    await expect(createButton).toBeDisabled()
  })

  test.skip('should show warning message when at job limit (requires auth)', async ({ page }) => {
    // Create 3 jobs to reach the limit
    await createJob(page, `Warning Test Job 1 - ${Date.now()}`)
    await createJob(page, `Warning Test Job 2 - ${Date.now()}`)
    await createJob(page, `Warning Test Job 3 - ${Date.now()}`)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify warning message is displayed
    const warningText = page.getByText(/job limit reached/i)
    await expect(warningText).toBeVisible()

    // Verify upgrade message
    const upgradeText = page.getByText(/delete a job or upgrade/i)
    await expect(upgradeText).toBeVisible()
  })

  test.skip('should re-enable button after deleting a job (requires auth)', async ({ page }) => {
    // Create 3 jobs to reach the limit
    await createJob(page, `Re-enable Test Job 1 - ${Date.now()}`)
    await createJob(page, `Re-enable Test Job 2 - ${Date.now()}`)
    const thirdJobTitle = `Re-enable Test Job 3 - ${Date.now()}`
    await createJob(page, thirdJobTitle)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify button is disabled
    let createButton = page.getByRole('button', { name: /create new role/i })
    await expect(createButton).toBeDisabled()

    // Set up dialog handler to accept deletion
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Delete one job
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: thirdJobTitle })
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await deleteButton.click()

    // Wait for deletion
    await page.waitForTimeout(1000)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify button is now enabled
    createButton = page.getByRole('button', { name: /create new role/i })
    await expect(createButton).toBeEnabled()

    // Verify count updated
    const buttonText = await createButton.textContent()
    expect(buttonText).toContain('(2/3)')

    // Verify warning is gone
    const warningText = page.getByText(/job limit reached/i)
    await expect(warningText).not.toBeVisible()
  })
})
