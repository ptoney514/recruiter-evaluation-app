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
 * @returns {Promise<Object>} Evaluation results with rankings and cost
 */
export async function evaluateWithAI(job, candidates, options = {}) {
  const { stage = 1, additionalInstructions } = options

  console.log(`[AI Evaluation] Starting evaluation for ${candidates.length} candidates...`)

  const results = []
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCost = 0

  // Evaluate each candidate individually
  // Note: We could parallelize this, but sequential is safer for rate limiting
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    console.log(`[AI Evaluation] Evaluating candidate ${i + 1}/${candidates.length}: ${candidate.name}`)

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/evaluate_candidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job,
            candidate: {
              name: candidate.name,
              text: candidate.text,
              full_name: candidate.name,
              email: candidate.email || ''
            },
            stage,
            additional_instructions: additionalInstructions
          })
        },
        90000 // 90 second timeout for AI evaluation (Claude API can be slow)
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `AI evaluation failed for ${candidate.name}`)
      }

      const data = await response.json()

      // Convert snake_case to camelCase
      const camelData = snakeToCamel(data)

      // Add candidate name to the evaluation result
      const evaluation = {
        name: candidate.name,
        ...camelData.evaluation
      }

      results.push(evaluation)

      // Accumulate usage metrics
      if (camelData.usage) {
        totalInputTokens += camelData.usage.inputTokens || 0
        totalOutputTokens += camelData.usage.outputTokens || 0
        totalCost += camelData.usage.cost || 0
      }

      console.log(`[AI Evaluation] ✓ ${candidate.name}: Score ${evaluation.score}/100`)

    } catch (error) {
      console.error(`[AI Evaluation] ✗ Failed for ${candidate.name}:`, error.message)
      // Add a failed result so we don't lose track of this candidate
      results.push({
        name: candidate.name,
        score: 0,
        recommendation: 'ERROR',
        error: error.message,
        keyStrengths: [],
        keyConcerns: [`Evaluation failed: ${error.message}`],
        interviewQuestions: [],
        reasoning: 'AI evaluation failed. Please try again or use regex evaluation.'
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  // Generate summary
  const advanceCount = results.filter(r => r.recommendation === 'ADVANCE TO INTERVIEW').length
  const phoneCount = results.filter(r => r.recommendation === 'PHONE SCREEN FIRST').length
  const declineCount = results.filter(r => r.recommendation === 'DECLINE').length
  const errorCount = results.filter(r => r.recommendation === 'ERROR').length

  const summary = {
    totalCandidates: results.length,
    advanceToInterview: advanceCount,
    phoneScreen: phoneCount,
    declined: declineCount,
    errors: errorCount,
    topCandidate: results.length > 0 ? results[0].name : null,
    topScore: results.length > 0 ? results[0].score : 0
  }

  console.log('[AI Evaluation] Complete:', {
    total: results.length,
    advance: advanceCount,
    phoneScreen: phoneCount,
    decline: declineCount,
    errors: errorCount,
    totalCost: totalCost.toFixed(4)
  })

  return {
    success: true,
    results,
    summary,
    usage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      cost: totalCost,
      avgCostPerCandidate: totalCost / (results.length || 1)
    }
  }
}

export const evaluationService = {
  evaluateWithRegex,
  evaluateWithAI
}
