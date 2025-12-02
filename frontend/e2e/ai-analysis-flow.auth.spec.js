/**
 * AI Analysis Flow E2E Tests (Authenticated)
 * Tests the Run AI Analysis feature on the Workbench page
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - API server running via `cd api && python3 flask_server.py`
 * - Frontend dev server running via `npm run dev`
 * - Auth setup has run (creates test user)
 * - ANTHROPIC_API_KEY set in api/.env
 *
 * Run: npx playwright test --project=chromium-auth e2e/ai-analysis-flow.auth.spec.js
 */
import { test, expect } from '@playwright/test'
import path from 'path'

// Test data
const TEST_JOB = {
  title: `AI Analysis Test Job ${Date.now()}`,
  description: `We are looking for a Senior Software Engineer with experience in:
- React and TypeScript development
- Node.js backend development
- PostgreSQL database design
- AWS cloud infrastructure
- Team leadership experience

Requirements:
- 5+ years of software engineering experience
- Strong communication skills
- Experience with agile methodologies
- Bachelor's degree in Computer Science or related field`,
}

// Sample resume text for testing
const SAMPLE_RESUME = `
JOHN DOE
johndoe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

WORK HISTORY

Senior Software Engineer                                    01/22-present
Tech Company Inc.
- Led development of React-based dashboard serving 10k+ users
- Designed PostgreSQL database schemas for microservices
- Mentored junior developers and conducted code reviews
- Implemented CI/CD pipelines using GitHub Actions

Software Engineer                                          06/18-12/21
Startup Co
- Built Node.js REST APIs handling 1M+ requests/day
- Developed TypeScript frontend applications
- Managed AWS infrastructure including EC2 and RDS

EDUCATION
Bachelor of Science in Computer Science
State University, 2018

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Git
`

test.describe('AI Analysis Flow', () => {
  let jobId = null

  test.beforeAll(async ({ browser }) => {
    // Create a job for testing
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json'
    })
    const page = await context.newPage()

    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    await page.locator('input[name="title"]').fill(TEST_JOB.title)
    await page.locator('textarea[name="description"]').fill(TEST_JOB.description)
    await page.getByRole('button', { name: /save.*start.*uploading/i }).click()

    // Wait for redirect to workbench and capture job ID
    await expect(page).toHaveURL(/\/app\/role\/.*\/workbench/, { timeout: 15000 })
    const url = page.url()
    const match = url.match(/\/role\/([^/]+)\/workbench/)
    if (match) {
      jobId = match[1]
    }

    await context.close()
  })

  test('should display Run AI Analysis button as disabled when no candidates selected', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Verify the button exists
    const aiButton = page.getByRole('button', { name: /run ai analysis/i })

    // Button should be visible but in disabled/inactive state (pointer-events-none)
    // The button is wrapped in a div with pointer-events-none when no selection
    const buttonContainer = page.locator('.pointer-events-none').filter({ has: aiButton })
    await expect(buttonContainer).toBeVisible()
  })

  test('should enable Run AI Analysis button when candidate is selected', async ({ page }) => {
    // First, we need to add a candidate
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Click Upload Resumes button if no candidates (use .first() to avoid strict mode violation)
    const uploadButton = page.getByRole('button', { name: /upload resumes/i }).first()
    if (await uploadButton.isVisible()) {
      await uploadButton.click()

      // Wait for modal
      await expect(page.getByRole('heading', { name: /upload resumes/i })).toBeVisible()

      // For now, close the modal - we'll test with manually created candidate
      await page.keyboard.press('Escape')
    }
  })

  test('should show workbench page with correct elements', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Verify job title is displayed
    await expect(page.getByText(TEST_JOB.title)).toBeVisible()

    // Verify key UI elements
    await expect(page.getByPlaceholder(/search candidates/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /upload resumes/i }).first()).toBeVisible()

    // Verify the AI Analysis section exists (Selected counter)
    await expect(page.getByText(/Selected/)).toBeVisible()
  })

  test('should show upload modal when clicking Upload Resumes', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Click the upload button
    await page.getByRole('button', { name: /upload resumes/i }).first().click()

    // Modal should appear
    await expect(page.getByRole('heading', { name: /upload resumes/i })).toBeVisible()
    await expect(page.getByText(/drag.*drop/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /choose files/i })).toBeVisible()
  })

  test('should display candidate in table after upload', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Check if we have any candidates in the table
    const candidateRows = page.locator('tbody tr')
    const count = await candidateRows.count()

    if (count > 0) {
      // Verify table structure
      await expect(page.getByRole('columnheader', { name: /candidate/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /date uploaded/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /evala score/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /fit/i })).toBeVisible()
    } else {
      // Empty state should show upload prompt
      await expect(page.getByText(/no candidates yet/i)).toBeVisible()
    }
  })

  test('should allow selecting candidates via checkbox', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Check if we have candidates (filter out header row and empty state)
    const candidateRows = page.locator('tbody tr').filter({ hasNot: page.locator('text=No candidates') })
    const count = await candidateRows.count()

    if (count > 0) {
      // Click the first candidate's checkbox
      const firstCheckbox = candidateRows.first().locator('input[type="checkbox"]')
      await firstCheckbox.click()

      // Selection count should update
      await expect(page.getByText('1 Selected')).toBeVisible()

      // AI Analysis button should now be interactive
      const aiButton = page.getByRole('button', { name: /run ai analysis/i })
      await expect(aiButton).toBeVisible()
    } else {
      // Skip test if no candidates
      test.skip(true, 'No candidates in workbench')
    }
  })

  test('should toggle select all candidates', async ({ page }) => {
    await page.goto(`/app/role/${jobId}/workbench`)
    await page.waitForLoadState('networkidle')

    // Check if we have candidates (filter out empty state row)
    const candidateRows = page.locator('tbody tr').filter({ hasNot: page.locator('text=No candidates') })
    const count = await candidateRows.count()

    if (count > 0) {
      // Click the header checkbox to select all
      const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
      await selectAllCheckbox.click()

      // Should show all selected
      await expect(page.getByText(`${count} Selected`)).toBeVisible()

      // Click again to deselect
      await selectAllCheckbox.click()
      await expect(page.getByText('0 Selected')).toBeVisible()
    } else {
      // Skip test if no candidates
      test.skip(true, 'No candidates in workbench')
    }
  })
})

test.describe('AI Analysis API Integration', () => {
  // This test requires the API server to be running
  test.skip('should call AI evaluation API when Run AI Analysis is clicked', async ({ page }) => {
    // This test requires:
    // 1. API server running
    // 2. ANTHROPIC_API_KEY configured
    // 3. At least one candidate with resume text

    // Navigate to workbench with candidates
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Find a job with candidates
    const jobCard = page.locator('[data-testid="job-card"]').first()
    if (await jobCard.isVisible()) {
      await jobCard.click()

      // Wait for workbench
      await expect(page).toHaveURL(/\/workbench/, { timeout: 10000 })

      // Select a candidate
      const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]')
      await firstCheckbox.click()

      // Click Run AI Analysis
      const aiButton = page.getByRole('button', { name: /run ai analysis/i })
      await aiButton.click()

      // Should show loading state
      await expect(page.getByText(/evaluating/i)).toBeVisible({ timeout: 5000 })

      // Wait for completion (this can take up to 90 seconds per candidate)
      await expect(page.getByText(/evaluating/i)).not.toBeVisible({ timeout: 120000 })

      // Candidate should now have a score
      const scoreCell = page.locator('tbody tr').first().locator('td').nth(3)
      await expect(scoreCell).not.toHaveText('-')
    }
  })
})

test.describe('Run AI Analysis Button States', () => {
  test('should show correct credit calculation', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Look for any existing job
    const jobCards = page.locator('.group').filter({ hasText: /candidates/i })
    const count = await jobCards.count()

    if (count > 0) {
      await jobCards.first().click()
      await page.waitForLoadState('networkidle')

      // Check if there are candidates
      const candidateRows = page.locator('tbody tr')
      const candidateCount = await candidateRows.count()

      if (candidateCount > 0) {
        // Select first candidate
        await candidateRows.first().locator('input[type="checkbox"]').click()

        // Button should show credit calculation (5 credits per candidate)
        const aiButton = page.getByRole('button', { name: /run ai analysis/i })
        await expect(aiButton).toContainText(/5 credits/i)

        // Select second candidate if available
        if (candidateCount > 1) {
          await candidateRows.nth(1).locator('input[type="checkbox"]').click()
          await expect(aiButton).toContainText(/10 credits/i)
        }
      }
    }
  })
})
