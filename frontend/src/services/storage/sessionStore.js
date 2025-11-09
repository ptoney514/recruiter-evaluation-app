/**
 * Session Storage Service
 *
 * @deprecated This file is DEPRECATED as of Nov 2024
 *
 * The app now uses a B2B signup-first model where ALL users must be authenticated.
 * All data is stored in Supabase (see supabaseStore.js).
 *
 * This file is kept for backwards compatibility but should not be used in new code.
 * It will be removed in a future version.
 *
 * ---
 *
 * OLD PURPOSE (no longer applicable):
 * Stores evaluation state in browser sessionStorage (no database needed)
 * Data persists during browser session but clears when browser closes
 */

const STORAGE_KEY = 'resume_ranker_evaluation'

/**
 * Generate a unique ID for each evaluation
 */
function generateId() {
  return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get current evaluation from session storage
 */
export function getCurrentEvaluation() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error reading from session storage:', error)
    return null
  }
}

/**
 * Save evaluation to session storage
 */
export function saveEvaluation(evaluationData) {
  try {
    const evaluation = {
      id: evaluationData.id || generateId(),
      timestamp: Date.now(),
      ...evaluationData
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(evaluation))
    return evaluation
  } catch (error) {
    console.error('Error saving to session storage:', error)
    throw new Error('Failed to save evaluation. Storage may be full.')
  }
}

/**
 * Update specific fields of current evaluation
 */
export function updateEvaluation(updates) {
  const current = getCurrentEvaluation()
  if (!current) {
    throw new Error('No active evaluation found')
  }
  return saveEvaluation({ ...current, ...updates })
}

/**
 * Clear current evaluation
 */
export function clearEvaluation() {
  sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if there's an active evaluation
 */
export function hasActiveEvaluation() {
  return getCurrentEvaluation() !== null
}

/**
 * Get evaluation structure template
 */
export function createNewEvaluation() {
  return {
    id: generateId(),
    timestamp: Date.now(),
    job: {
      title: '',
      summary: '',
      requirements: [],
      duties: [],
      education: '',
      licenses: ''
    },
    resumes: [], // Array of { name, text, filename }
    regexResults: null,
    aiResults: null,
    stage: 1,
    interviewNotes: {}, // For Stage 2: { candidateName: notes }
    additionalInstructions: ''
  }
}

/**
 * Estimate storage usage (in MB)
 */
export function getStorageUsage() {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return 0
  return (new Blob([stored]).size / (1024 * 1024)).toFixed(2)
}

/**
 * Check if adding more data would exceed limits
 * Most browsers limit sessionStorage to 5-10MB
 */
export function canAddMoreData(estimatedSizeKB) {
  const currentSizeMB = parseFloat(getStorageUsage())
  const estimatedTotalMB = currentSizeMB + (estimatedSizeKB / 1024)
  return estimatedTotalMB < 5 // Conservative 5MB limit
}

export const sessionStore = {
  getCurrentEvaluation,
  saveEvaluation,
  updateEvaluation,
  clearEvaluation,
  hasActiveEvaluation,
  createNewEvaluation,
  getStorageUsage,
  canAddMoreData
}
