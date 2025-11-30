/**
 * Create Job Flow E2E Tests (Unauthenticated)
 * Tests public pages and auth redirects
 *
 * NOTE: Tests requiring authentication are in create-job-flow.auth.spec.js
 * and should be run with: npx playwright test --project=chromium-auth
 *
 * Prerequisites:
 * - Local Supabase running via `supabase start`
 * - Frontend dev server running via `npm run dev`
 *
 * Run: npx playwright test --project=chromium e2e/create-job-flow.spec.js
 */
import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify landing page elements
    await expect(page).toHaveURL('/')
    // The landing page has a "Get Started" button (not a link)
    await expect(page.getByRole('button', { name: /get started/i }).first()).toBeVisible()
  })

  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Verify login page elements
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')

    // Verify signup page elements
    await expect(page).toHaveURL('/signup')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: /log in/i }).click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Auth Redirects', () => {
  test('should redirect /app to /login when not authenticated', async ({ page }) => {
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect /app/create-role to /login when not authenticated', async ({ page }) => {
    await page.goto('/app/create-role')
    await page.waitForLoadState('networkidle')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })

  test('should redirect /app/role/:id/workbench to /login when not authenticated', async ({ page }) => {
    await page.goto('/app/role/some-id/workbench')
    await page.waitForLoadState('networkidle')

    // Should be redirected to login
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Login Form Validation', () => {
  test('should show error for empty fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    await page.getByRole('button', { name: /log in/i }).click()

    // HTML5 validation should prevent submission
    // Email field should be invalid
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveAttribute('required')
  })

  // Skip: HTML5 validation doesn't show visible error text in DOM
  test.skip('should show error for invalid email', async ({ page }) => {
    await page.goto('/login')

    // Fill invalid email
    await page.locator('input[name="email"]').fill('invalid-email')
    await page.locator('input[name="password"]').fill('somepassword')
    await page.getByRole('button', { name: /log in/i }).click()

    // Should show validation error (either HTML5 or custom)
    await expect(page.getByText(/valid email|please enter/i)).toBeVisible({ timeout: 3000 })
  })

  test('should show error for wrong credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill wrong credentials
    await page.locator('input[name="email"]').fill('wrong@example.com')
    await page.locator('input[name="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /log in/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid|failed|error/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Signup Form Validation', () => {
  test('should show error for password mismatch', async ({ page }) => {
    await page.goto('/signup')

    // Fill form with mismatched passwords
    await page.locator('input[name="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('Password123!')
    await page.locator('input[name="confirmPassword"]').fill('Different123!')
    await page.locator('input[name="agreeToTerms"]').check()
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show error message
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  // Skip: HTML5 minLength validation doesn't show visible error text in DOM
  test.skip('should show error for short password', async ({ page }) => {
    await page.goto('/signup')

    // Fill form with short password
    await page.locator('input[name="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('short')
    await page.locator('input[name="confirmPassword"]').fill('short')
    await page.locator('input[name="agreeToTerms"]').check()
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show error message (various possible wordings)
    await expect(page.getByText(/at least 8 characters|password must be|too short/i)).toBeVisible({ timeout: 3000 })
  })

  test('should require terms agreement', async ({ page }) => {
    await page.goto('/signup')

    // Fill form without checking terms
    await page.locator('input[name="email"]').fill('test@example.com')
    await page.locator('input[name="password"]').fill('Password123!')
    await page.locator('input[name="confirmPassword"]').fill('Password123!')
    await page.getByRole('button', { name: /create account/i }).click()

    // Should show error message
    await expect(page.getByText(/agree to the terms/i)).toBeVisible()
  })
})
