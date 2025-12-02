/**
 * Auth Setup for E2E Tests
 * Creates a test user and saves authenticated state for reuse
 *
 * This runs before other tests and saves browser storage state
 * so tests can start already authenticated.
 */
import { test as setup, expect } from '@playwright/test'

// Test user credentials
const TEST_USER = {
  email: `e2e.test.${Date.now()}@example.com`,
  password: 'TestPassword123!',
}

// Path to save authenticated state
const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Navigate to signup page
  await page.goto('/signup')

  // Fill in signup form
  await page.locator('input[name="email"]').fill(TEST_USER.email)
  await page.locator('input[name="password"]').fill(TEST_USER.password)
  await page.locator('input[name="confirmPassword"]').fill(TEST_USER.password)
  await page.locator('input[name="agreeToTerms"]').check()

  // Submit form
  await page.getByRole('button', { name: /create account/i }).click()

  // Wait for redirect to /app (successful signup)
  await expect(page).toHaveURL('/app', { timeout: 10000 })

  // Verify we're logged in by checking for dashboard elements
  await expect(page.getByRole('button', { name: /create new position/i })).toBeVisible()

  // Save authenticated browser state
  await page.context().storageState({ path: authFile })
})
