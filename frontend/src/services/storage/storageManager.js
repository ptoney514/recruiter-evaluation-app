/**
 * Storage Manager
 * Unified storage API that automatically routes to sessionStorage or Supabase
 * based on authentication status
 *
 * Usage:
 *   - Anonymous users: Data stored in sessionStorage (cleared on browser close)
 *   - Authenticated users: Data stored in Supabase (persistent across devices)
 */
import { sessionStore } from './sessionStore'
import { supabaseStore } from './supabaseStore'
import { isSupabaseConfigured } from '../../lib/supabase'

/**
 * Get storage mode (session or database)
 * @returns {Promise<'session'|'database'>}
 */
async function getStorageMode() {
  if (!isSupabaseConfigured()) {
    return 'session'
  }

  const isAuth = await supabaseStore.isAuthenticated()
  return isAuth ? 'database' : 'session'
}

/**
 * Save evaluation (routes to appropriate storage)
 * @param {Object} evaluationData - Evaluation data
 * @returns {Promise<Object>} Saved evaluation
 */
export async function saveEvaluation(evaluationData) {
  const mode = await getStorageMode()

  if (mode === 'database') {
    // Save to Supabase
    return await supabaseStore.saveBatchEvaluation(evaluationData)
  } else {
    // Save to sessionStorage
    return sessionStore.saveEvaluation(evaluationData)
  }
}

/**
 * Get current/active evaluation
 * @returns {Promise<Object|null>}
 */
export async function getCurrentEvaluation() {
  const mode = await getStorageMode()

  if (mode === 'database') {
    // Get most recent evaluation from Supabase
    const history = await supabaseStore.getEvaluationHistory({ limit: 1 })
    return history.length > 0 ? history[0] : null
  } else {
    // Get from sessionStorage
    return sessionStore.getCurrentEvaluation()
  }
}

/**
 * Update evaluation
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateEvaluation(updates) {
  const mode = await getStorageMode()

  if (mode === 'database') {
    // For database mode, we need to implement update logic
    // For now, get current and save updated version
    const current = await getCurrentEvaluation()
    return await saveEvaluation({ ...current, ...updates })
  } else {
    return sessionStore.updateEvaluation(updates)
  }
}

/**
 * Clear current evaluation
 * @returns {Promise<void>}
 */
export async function clearEvaluation() {
  const mode = await getStorageMode()

  if (mode === 'database') {
    // For database, we don't delete - just clear session reference if any
    sessionStore.clearEvaluation()
  } else {
    sessionStore.clearEvaluation()
  }
}

/**
 * Check if there's an active evaluation
 * @returns {Promise<boolean>}
 */
export async function hasActiveEvaluation() {
  const mode = await getStorageMode()

  if (mode === 'database') {
    const history = await supabaseStore.getEvaluationHistory({ limit: 1 })
    return history.length > 0
  } else {
    return sessionStore.hasActiveEvaluation()
  }
}

/**
 * Create new evaluation structure
 * @returns {Object}
 */
export function createNewEvaluation() {
  return sessionStore.createNewEvaluation()
}

/**
 * Get evaluation history (database only)
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getEvaluationHistory(options = {}) {
  const mode = await getStorageMode()

  if (mode === 'database') {
    return await supabaseStore.getEvaluationHistory(options)
  } else {
    // Session storage doesn't have history - return current eval as array
    const current = sessionStore.getCurrentEvaluation()
    return current ? [current] : []
  }
}

/**
 * Get all jobs (database only)
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getJobs(options = {}) {
  const mode = await getStorageMode()

  if (mode === 'database') {
    return await supabaseStore.getJobs(options)
  } else {
    return []
  }
}

/**
 * Get job with evaluations (database only)
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>}
 */
export async function getJobWithEvaluations(jobId) {
  const mode = await getStorageMode()

  if (mode === 'database') {
    return await supabaseStore.getJobWithEvaluations(jobId)
  } else {
    return null
  }
}

/**
 * Check current storage mode
 * @returns {Promise<Object>} Storage info
 */
export async function getStorageInfo() {
  const mode = await getStorageMode()
  const isAuth = await supabaseStore.isAuthenticated()
  const userId = await supabaseStore.getCurrentUserId()

  return {
    mode,
    isAuthenticated: isAuth,
    userId,
    isSupabaseConfigured: isSupabaseConfigured(),
    sessionStorageUsageMB: sessionStore.getStorageUsage()
  }
}

/**
 * Migrate session data to database (after user logs in)
 * @returns {Promise<Object>} Migration result
 */
export async function migrateSessionToDatabase() {
  const isAuth = await supabaseStore.isAuthenticated()
  if (!isAuth) {
    throw new Error('User must be authenticated to migrate data')
  }

  const sessionData = sessionStore.getCurrentEvaluation()
  if (!sessionData) {
    return { success: true, message: 'No session data to migrate' }
  }

  try {
    const result = await supabaseStore.saveBatchEvaluation(sessionData)

    // Clear session storage after successful migration
    sessionStore.clearEvaluation()

    return {
      success: true,
      message: 'Data migrated successfully',
      data: result
    }
  } catch (error) {
    console.error('Migration failed:', error)
    throw new Error(`Failed to migrate data: ${error.message}`)
  }
}

export const storageManager = {
  saveEvaluation,
  getCurrentEvaluation,
  updateEvaluation,
  clearEvaluation,
  hasActiveEvaluation,
  createNewEvaluation,
  getEvaluationHistory,
  getJobs,
  getJobWithEvaluations,
  getStorageInfo,
  migrateSessionToDatabase
}
