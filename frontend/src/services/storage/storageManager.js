/**
 * Storage Manager
 * Unified storage API that enforces authentication and uses Supabase
 *
 * B2B signup-first model: ALL users must be authenticated.
 * All operations require authentication and are stored in Supabase.
 *
 * Usage:
 *   - All users must be authenticated to use the app
 *   - Data is persistently stored in Supabase across devices
 *   - Protected by Row Level Security (RLS) policies
 *   - Uses sessionStorage for temporary draft state during multi-step form flow
 */
import { supabaseStore } from './supabaseStore'
import { sessionStore } from './sessionStore'
import { isSupabaseConfigured } from '../../lib/supabase'

/**
 * Ensure user is authenticated before proceeding
 * @throws {Error} If user is not authenticated or Supabase not configured
 */
async function requireAuth() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }

  const isAuth = await supabaseStore.isAuthenticated()
  if (!isAuth) {
    throw new Error('Authentication required. Please sign up or log in to continue.')
  }
}

/**
 * Save evaluation (requires authentication)
 * @param {Object} evaluationData - Evaluation data
 * @returns {Promise<Object>} Saved evaluation
 */
export async function saveEvaluation(evaluationData) {
  await requireAuth()
  return await supabaseStore.saveBatchEvaluation(evaluationData)
}

/**
 * Get evaluation history
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getEvaluationHistory(options = {}) {
  await requireAuth()
  return await supabaseStore.getEvaluationHistory(options)
}

/**
 * Get all jobs
 * @param {Object} options - Query options
 * @returns {Promise<Array>}
 */
export async function getJobs(options = {}) {
  await requireAuth()
  return await supabaseStore.getJobs(options)
}

/**
 * Get job with evaluations
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>}
 */
export async function getJobWithEvaluations(jobId) {
  await requireAuth()
  return await supabaseStore.getJobWithEvaluations(jobId)
}

/**
 * Get job evaluations
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>}
 */
export async function getJobEvaluations(jobId) {
  await requireAuth()
  return await supabaseStore.getJobEvaluations(jobId)
}

/**
 * Delete job and all associated data
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export async function deleteJob(jobId) {
  await requireAuth()
  return await supabaseStore.deleteJob(jobId)
}

/**
 * Update candidate ranking
 * @param {string} candidateId - Candidate ID
 * @param {number} manualRank - Manual rank override
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>}
 */
export async function updateCandidateRanking(candidateId, manualRank, notes = null) {
  await requireAuth()
  return await supabaseStore.updateCandidateRanking(candidateId, manualRank, notes)
}

/**
 * Get storage information
 * @returns {Promise<Object>} Storage info
 */
export async function getStorageInfo() {
  const isAuth = await supabaseStore.isAuthenticated()
  const userId = isAuth ? await supabaseStore.getCurrentUserId() : null

  return {
    mode: 'database',
    isAuthenticated: isAuth,
    userId,
    isSupabaseConfigured: isSupabaseConfigured()
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  return await supabaseStore.isAuthenticated()
}

/**
 * Get current user ID
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserId() {
  return await supabaseStore.getCurrentUserId()
}

/**
 * Draft State Management (Temporary sessionStorage for multi-step forms)
 * These methods use sessionStorage for temporary draft state while user fills out multi-step forms.
 * Final data is saved to Supabase when evaluation is submitted.
 */

/**
 * Get current draft evaluation from sessionStorage
 * @returns {Object|null}
 */
export function getCurrentEvaluation() {
  return sessionStore.getCurrentEvaluation()
}

/**
 * Update draft evaluation in sessionStorage
 * @param {Object} updates - Fields to update
 * @returns {Object}
 */
export function updateEvaluation(updates) {
  return sessionStore.updateEvaluation(updates)
}

/**
 * Clear draft evaluation from sessionStorage
 */
export function clearEvaluation() {
  sessionStore.clearEvaluation()
}

/**
 * Check if there's a draft evaluation in progress
 * @returns {boolean}
 */
export function hasActiveEvaluation() {
  return sessionStore.hasActiveEvaluation()
}

/**
 * Create new draft evaluation structure
 * @returns {Object}
 */
export function createNewEvaluation() {
  return sessionStore.createNewEvaluation()
}

export const storageManager = {
  // Persistent storage (Supabase)
  saveEvaluation,
  getEvaluationHistory,
  getJobs,
  getJobWithEvaluations,
  getJobEvaluations,
  deleteJob,
  updateCandidateRanking,
  getStorageInfo,
  isAuthenticated,
  getCurrentUserId,
  // Draft state (sessionStorage)
  getCurrentEvaluation,
  updateEvaluation,
  clearEvaluation,
  hasActiveEvaluation,
  createNewEvaluation
}
