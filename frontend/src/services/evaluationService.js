/**
 * Evaluation Service
 * Handles calls to regex and AI evaluation endpoints
 */
import { API_BASE_URL } from '../constants/config'

/**
 * Run regex-based evaluation on candidates
 * @param {Object} job - Job description data
 * @param {Array} candidates - Array of {name, text} objects
 * @returns {Promise<Object>} Evaluation results
 */
export async function evaluateWithRegex(job, candidates) {
  const response = await fetch(`${API_BASE_URL}/api/evaluate_regex`, {
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
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Regex evaluation failed')
  }

  return await response.json()
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
