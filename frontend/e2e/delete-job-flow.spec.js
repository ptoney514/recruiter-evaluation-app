/**
 * Delete Job Flow E2E Tests
 * Tests the complete flow of deleting a job role
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - Frontend dev server running via `npm run dev`
 *
 * Run: npx playwright test e2e/delete-job-flow.spec.js
 */
import { test, expect } from '@playwright/test'

// Test data
const TEST_JOB = {
  title: `Delete Test Job ${Date.now()}`,
  description: `This is a test job that will be deleted during E2E testing.

Requirements:
- Test requirement 1
- Test requirement 2
- Test requirement 3
- At least 5 years of experience

Nice to have:
- Additional skill 1
- Additional skill 2`,
}

// NOTE: All tests in this file require authentication (RLS policies).
// They will fail with "User not authenticated" error without a logged-in user.
// Skip all tests until auth setup is implemented.
test.describe.skip('Delete Job Flow (requires auth)', () => {
  // Helper to get form fields by their actual structure
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })

  // Create a job before each test that needs one
  let createdJobTitle

  async function createTestJob(page) {
    const uniqueTitle = `Delete Test ${Date.now()}`
    await page.goto('/app/create-role')
    await getJobTitleInput(page).fill(uniqueTitle)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/)
    return uniqueTitle
  }

  test('should show delete button on job cards', async ({ page }) => {
    // Create a test job first
    createdJobTitle = await createTestJob(page)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify delete button is visible on job card
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: createdJobTitle })
    await expect(jobCard).toBeVisible()

    // Check for trash icon button
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await expect(deleteButton).toBeVisible()
  })

  test('should show confirmation dialog when clicking delete', async ({ page }) => {
    // Create a test job first
    createdJobTitle = await createTestJob(page)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Set up dialog handler to capture the confirmation
    let dialogMessage = ''
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss() // Don't actually delete
    })

    // Find the job card and click delete
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: createdJobTitle })
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await deleteButton.click()

    // Verify dialog was shown with job title
    expect(dialogMessage).toContain('Delete')
    expect(dialogMessage).toContain(createdJobTitle)
  })

  test('should not delete job when canceling confirmation', async ({ page }) => {
    // Create a test job first
    createdJobTitle = await createTestJob(page)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Set up dialog handler to dismiss (cancel)
    page.on('dialog', async (dialog) => {
      await dialog.dismiss()
    })

    // Find the job card and click delete
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: createdJobTitle })
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await deleteButton.click()

    // Wait a moment for any potential deletion to occur
    await page.waitForTimeout(500)

    // Verify job still exists
    await expect(page.getByText(createdJobTitle)).toBeVisible()
  })

  test('should delete job when accepting confirmation', async ({ page }) => {
    // Create a test job first
    createdJobTitle = await createTestJob(page)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Verify job exists before deletion
    await expect(page.getByText(createdJobTitle)).toBeVisible()

    // Set up dialog handler to accept (confirm delete)
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Find the job card and click delete
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: createdJobTitle })
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await deleteButton.click()

    // Wait for deletion to complete
    await page.waitForTimeout(1000)

    // Verify job is removed from the list
    await expect(page.getByText(createdJobTitle)).not.toBeVisible()
  })

  test('should update job count after deletion', async ({ page }) => {
    // Create a test job first
    createdJobTitle = await createTestJob(page)

    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Get initial job count from button text (e.g., "Create New Role (1/3)")
    const createButton = page.getByRole('button', { name: /create new role/i })
    const initialText = await createButton.textContent()
    const initialMatch = initialText.match(/\((\d+)\//)
    const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0

    // Set up dialog handler to accept deletion
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Delete the job
    const jobCard = page.locator('.bg-white.p-6.rounded-xl').filter({ hasText: createdJobTitle })
    const deleteButton = jobCard.locator('button[title="Delete role"]')
    await deleteButton.click()

    // Wait for deletion and UI update
    await page.waitForTimeout(1500)

    // Refresh to ensure count is updated
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Get new job count
    const finalText = await createButton.textContent()
    const finalMatch = finalText.match(/\((\d+)\//)
    const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0

    // Verify count decreased by 1
    expect(finalCount).toBe(initialCount - 1)
  })

  test('should show empty state when all jobs deleted', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Set up dialog handler to accept all deletions
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    // Delete all existing jobs
    let deleteButtons = await page.locator('button[title="Delete role"]').all()
    for (const button of deleteButtons) {
      await button.click()
      await page.waitForTimeout(500)
    }

    // Wait for all deletions
    await page.waitForTimeout(1000)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if empty state is shown (when no jobs exist)
    const noJobsText = page.getByText(/no roles yet/i)
    const hasJobs = await page.locator('.bg-white.p-6.rounded-xl').first().isVisible().catch(() => false)

    if (!hasJobs) {
      await expect(noJobsText).toBeVisible()
    }
  })
})
