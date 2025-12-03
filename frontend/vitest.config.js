import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/e2e/**', '**/node_modules/**'],
    setupFiles: [
      './src/tests/setup.js',
      './src/tests/setupDatabase.js',
    ],
    css: true,
    // Limit parallel workers to prevent memory exhaustion
    // Each worker can use 3-4GB RAM, so limit to 2 max
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 2,
        minForks: 1,
      },
    },
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
      // Local Supabase default anon key for testing
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      // Disable dev auth bypass in tests to properly test auth flows
      VITE_AUTH_BYPASS: 'false',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
