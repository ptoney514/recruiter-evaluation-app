/**
 * Evaluation Service
 * Handles calls to regex and AI evaluation endpoints
 */
import { API_BASE_URL } from '../constants/config'

/**
 * Convert snake_case keys to camelCase
 * @param {Object} obj - Object with snake_case keys
 * @returns {Object} Object with camelCase keys
 */
function snakeToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item))
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = snakeToCamel(obj[key])
      return result
    }, {})
  }

  return obj
}

/**
 * Fetch with timeout to prevent hanging requests
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds (default 30s)
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout / 1000} seconds. The API server may be unresponsive.`)
    }
    throw error
  }
}

/**
 * Run regex-based evaluation on candidates
 * @param {Object} job - Job description data
 * @param {Array} candidates - Array of {name, text} objects
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateWithRegex(job, candidates) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/evaluate_regex`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job,
      candidates: candidates.map(c => ({
        name: c.name,
        text: c.text
      }))
    })
  }, 30000) // 30 second timeout for regex evaluation

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Regex evaluation failed')
  }

  const data = await response.json()

  // Convert snake_case to camelCase for frontend consistency
  return snakeToCamel(data)
}

/**
 * Run AI-based evaluation on candidates
 * @param {Object} job - Job description data
 * @param {Array} candidates - Array of {name, text} objects
 * @param {Object} options - Additional options (stage, instructions, etc.)
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateWithAI(job, candidates, options = {}) {
  // TODO: Implement AI evaluation (Issue #18)
  throw new Error('AI evaluation not yet implemented. Use regex mode for now.')
}

export const evaluationService = {
  evaluateWithRegex,
  evaluateWithAI
}
