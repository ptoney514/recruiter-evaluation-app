import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/tests/setup.js',
      './src/tests/setupDatabase.js',
    ],
    css: true,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
