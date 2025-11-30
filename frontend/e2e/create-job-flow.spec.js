/**
 * Create Job Flow E2E Tests
 * Tests the complete flow of creating a new job role
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - Frontend dev server running via `npm run dev`
 *
 * Run: npx playwright test e2e/create-job-flow.spec.js
 */
import { test, expect } from '@playwright/test'

// Test data
const TEST_JOB = {
  title: 'Senior Software Engineer',
  department: 'Engineering',
  description: `We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript and React
- Experience with Node.js and PostgreSQL
- Excellent problem-solving skills
- Bachelor's degree in Computer Science or related field

Nice to have:
- Experience with TypeScript
- Knowledge of AWS or cloud platforms
- Experience with CI/CD pipelines`,
}

test.describe('Create Job Flow', () => {
  // Helper to get form fields by their actual structure
  // Job title is an input with name="title"
  const getJobTitleInput = (page) => page.locator('input[name="title"]')
  // Department is an input with name="department"
  const getDepartmentInput = (page) => page.locator('input[name="department"]')
  // Description is a textarea with name="description"
  const getDescriptionInput = (page) => page.locator('textarea[name="description"]')
  // Submit button says "Save & Start Uploading"
  const getSubmitButton = (page) => page.getByRole('button', { name: /save.*start.*uploading/i })

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/app')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display dashboard with Create New Role button', async ({ page }) => {
    // Verify dashboard elements
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /create new role/i })).toBeVisible()
  })

  test('should navigate to create role page when clicking Create New Role', async ({ page }) => {
    // Click create role button
    await page.getByRole('button', { name: /create new role/i }).click()

    // Verify navigation to create role page
    await expect(page).toHaveURL('/app/create-role')
    await expect(page.getByRole('heading', { name: /create new role/i })).toBeVisible()
  })

  test('should disable submit button when title is empty', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')

    // Fill only description, leave title empty
    await getDescriptionInput(page).fill(TEST_JOB.description)

    // Verify submit button is disabled (form validates on client side)
    await expect(getSubmitButton(page)).toBeDisabled()
  })

  test('should show validation error for empty description', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')

    // Fill only title, leave description empty
    await getJobTitleInput(page).fill(TEST_JOB.title)

    // Click submit
    await getSubmitButton(page).click()

    // Verify error message
    await expect(page.getByText(/job description is required/i)).toBeVisible()
  })

  test('should show validation error for short description', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')

    // Fill title and short description
    await getJobTitleInput(page).fill(TEST_JOB.title)
    await getDescriptionInput(page).fill('Too short')

    // Click submit
    await getSubmitButton(page).click()

    // Verify error message
    await expect(page.getByText(/at least 30 characters/i)).toBeVisible()
  })

  test('should detect keywords from job description', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')

    // Fill description with keywords
    await getDescriptionInput(page).fill(TEST_JOB.description)

    // Wait for keywords to be detected
    await page.waitForTimeout(500)

    // Verify at least one keyword is detected (shown as badge)
    const keywordBadges = page.locator('.px-2.py-1.rounded-md.text-xs')
    await expect(keywordBadges.first()).toBeVisible()
  })

  // NOTE: The following tests require authentication (RLS policies).
  // They will show "User not authenticated" error without a logged-in user.
  // To run these tests properly, implement auth setup in beforeEach or use test fixtures.

  test('should show auth error when creating job without login', async ({ page }) => {
    // Navigate to create role page
    await page.goto('/app/create-role')

    // Fill the form
    await getJobTitleInput(page).fill(TEST_JOB.title)
    await getDescriptionInput(page).fill(TEST_JOB.description)

    // Submit the form
    await getSubmitButton(page).click()

    // Expect auth error (RLS policy requires authentication)
    await expect(page.getByText('User not authenticated')).toBeVisible({ timeout: 10000 })
  })

  // Skip tests that require authenticated user until auth setup is implemented
  test.skip('should create job and navigate to workbench (requires auth)', async ({ page }) => {
    // TODO: Implement auth setup - login before running this test
    await page.goto('/app/create-role')
    await getJobTitleInput(page).fill(TEST_JOB.title)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })
    await expect(page.getByText(TEST_JOB.title)).toBeVisible()
  })

  test.skip('should show created job in dashboard (requires auth)', async ({ page }) => {
    // TODO: Implement auth setup - login before running this test
    await page.goto('/app/create-role')
    const uniqueTitle = `Test Job ${Date.now()}`
    await getJobTitleInput(page).fill(uniqueTitle)
    await getDescriptionInput(page).fill(TEST_JOB.description)
    await getSubmitButton(page).click()
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })
    await page.goto('/app')
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 })
  })
})
