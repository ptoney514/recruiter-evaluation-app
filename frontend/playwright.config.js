/**
 * Playwright Configuration for E2E Tests
 * Configures browser automation for end-to-end testing
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Global timeout for all tests
  globalTimeout: 30 * 60 * 1000,

  // Fail on console errors during tests
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test in Firefox and WebKit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    //
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web Server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse existing server for faster tests
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
  workers: 1, // Use 1 worker for consistency since tests share Supabase instance
})
