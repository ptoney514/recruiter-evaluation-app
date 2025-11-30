import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Vitest configuration for integration tests
 * Does NOT mock Supabase - uses real local Supabase instance
 *
 * Run with: npm run test:integration
 * Prerequisites: supabase start
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Integration tests use a different setup that doesn't mock Supabase
    setupFiles: [
      './src/tests/setup.integration.js',
    ],
    // Only run integration tests
    include: ['src/tests/*.integration.test.{js,jsx}'],
    css: true,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
      // Local Supabase default anon key for testing
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    },
    // CRITICAL: Run test files sequentially, not in parallel
    // This prevents cleanup in one file from affecting tests in another
    fileParallelism: false,
    // Run tests sequentially within each file
    sequence: {
      concurrent: false,
    },
    // Increase timeout for database operations
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
