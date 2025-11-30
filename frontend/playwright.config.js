/**
 * Playwright Configuration for E2E Tests
 * Configures browser automation for end-to-end testing
 *
 * Projects:
 * - setup: Creates authenticated user and saves session
 * - chromium: Runs unauthenticated tests (UI-only)
 * - chromium-auth: Runs authenticated tests (uses saved session)
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Global timeout for all tests
  globalTimeout: 30 * 60 * 1000,

  // Common settings for all projects
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Configure projects
  projects: [
    // Auth setup - runs first, creates test user
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Unauthenticated tests (UI-only, no login required)
    {
      name: 'chromium',
      testMatch: '**/*.spec.js',
      testIgnore: [/auth\.setup\.js/, /\.auth\.spec\.js/],
      use: { ...devices['Desktop Chrome'] },
    },

    // Authenticated tests (requires login)
    {
      name: 'chromium-auth',
      testMatch: '**/*.auth.spec.js',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],

  // Web Server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },

  // Reporter configuration
  reporter: [
    ['html'],
    ['list'],
  ],

  // Parallel execution
  fullyParallel: true,

  // Retry failed tests once
  retries: 1,

  // Number of workers
  workers: 1,
})
