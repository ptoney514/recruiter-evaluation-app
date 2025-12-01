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
  priorities: 'Must have strong communication skills, SaaS experience preferred',
}

test.describe('Create Job Flow (Authenticated)', () => {
  // Helper to get form fields
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  const getPrioritiesInput = (page) => page.locator('textarea[name="priorities"]')
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })
  const getCancelButton = (page) => page.getByRole('button', { name: /cancel/i })

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
    // Match both patterns: "(X/3)" for production, "(X)" for dev bypass mode with unlimited
    const initialMatch = initialText.match(/\((\d+)(?:\/\d+)?\)/)
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
    // Match both patterns: "(X/3)" for production, "(X)" for dev bypass mode with unlimited
    const finalMatch = finalText.match(/\((\d+)(?:\/\d+)?\)/)
    const finalCount = finalMatch ? parseInt(finalMatch[1]) : 0

    expect(finalCount).toBe(initialCount + 1)
  })
})

test.describe('Create Role Form Validation', () => {
  // Helper to get form fields
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  const getPrioritiesInput = (page) => page.locator('textarea[name="priorities"]')
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })

  test('should render all form fields on create role page', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Verify page title
    await expect(page.getByRole('heading', { name: /create new position/i })).toBeVisible()

    // Verify all form fields are visible
    await expect(getJobTitleInput(page)).toBeVisible()
    await expect(getDescriptionInput(page)).toBeVisible()
    await expect(getPrioritiesInput(page)).toBeVisible()
    await expect(getSubmitButton(page)).toBeVisible()

    // Verify tabs are present
    await expect(page.getByText('Job Description (Paste)')).toBeVisible()
    await expect(page.getByText('Performance Profile (Upload)')).toBeVisible()
  })

  test('should have submit button disabled when title is empty', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill description but not title
    await getDescriptionInput(page).fill('This is a detailed job description with sufficient length')

    // Submit button should be disabled
    await expect(getSubmitButton(page)).toBeDisabled()
  })

  test('should enable submit button when title is provided', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill title
    await getJobTitleInput(page).fill('Test Job Title')

    // Submit button should be enabled
    await expect(getSubmitButton(page)).toBeEnabled()
  })

  test('should show error when description is empty', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill only title
    await getJobTitleInput(page).fill('Test Job Title')
    await getSubmitButton(page).click()

    // Should show error
    await expect(page.getByText(/job description is required/i)).toBeVisible()
  })

  test('should show error when description is too short', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill title and short description
    await getJobTitleInput(page).fill('Test Job Title')
    await getDescriptionInput(page).fill('Short')
    await getSubmitButton(page).click()

    // Should show error about minimum length
    await expect(page.getByText(/at least 30 characters/i)).toBeVisible()
  })

  test('should clear error when user starts typing', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Trigger validation error
    await getJobTitleInput(page).fill('Test Job Title')
    await getDescriptionInput(page).fill('Short')
    await getSubmitButton(page).click()

    // Verify error is shown
    await expect(page.getByText(/at least 30 characters/i)).toBeVisible()

    // Type more in description
    await getDescriptionInput(page).fill('This is now a much longer description that should pass validation')

    // Error should be cleared
    await expect(page.getByText(/at least 30 characters/i)).not.toBeVisible()
  })

  test('should create job with priorities field', async ({ page }) => {
    const uniqueTitle = `Priorities Test Job ${Date.now()}`
    const priorities = 'Must have SaaS experience, leadership skills preferred'

    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Fill all fields including priorities
    await getJobTitleInput(page).fill(uniqueTitle)
    await getDescriptionInput(page).fill('This is a detailed job description with all requirements listed.')
    await getPrioritiesInput(page).fill(priorities)

    // Submit form
    await getSubmitButton(page).click()

    // Should redirect to workbench on success
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })

    // Verify job was created
    await expect(page.getByText(uniqueTitle)).toBeVisible()
  })

  test('should navigate back to dashboard when cancel is clicked', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Should navigate to dashboard
    await expect(page).toHaveURL('/app')
  })

  test('should navigate back to dashboard when back button is clicked', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Click back to dashboard
    await page.getByText('Back to Dashboard').click()

    // Should navigate to dashboard
    await expect(page).toHaveURL('/app')
  })

  test('should switch between paste and upload tabs', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Paste tab should be active by default
    const pasteTab = page.getByText('Job Description (Paste)')
    await expect(pasteTab).toHaveClass(/border-teal-500/)

    // Click upload tab
    const uploadTab = page.getByText('Performance Profile (Upload)')
    await uploadTab.click()

    // Upload tab should be active
    await expect(uploadTab).toHaveClass(/border-teal-500/)
    await expect(page.getByText('Upload a Performance Profile document')).toBeVisible()

    // Switch back to paste tab
    await pasteTab.click()
    await expect(pasteTab).toHaveClass(/border-teal-500/)
    await expect(getDescriptionInput(page)).toBeVisible()
  })
})
