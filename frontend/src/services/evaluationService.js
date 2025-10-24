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
 * Evaluate a single candidate with retry logic
 * @param {Object} job - Job description
 * @param {Object} candidate - Candidate data
 * @param {Object} options - Evaluation options
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} Evaluation result
 */
async function evaluateSingleCandidate(job, candidate, options, retryCount = 0) {
  const { stage = 1, additionalInstructions, maxRetries = 2 } = options

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
      90000 // 90 second timeout
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `AI evaluation failed for ${candidate.name}`)
    }

    const data = await response.json()
    const camelData = snakeToCamel(data)

    return {
      success: true,
      evaluation: {
        name: candidate.name,
        ...camelData.evaluation
      },
      usage: camelData.usage
    }
  } catch (error) {
    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`[AI Evaluation] Retrying ${candidate.name} (attempt ${retryCount + 1}/${maxRetries})...`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s before retry
      return evaluateSingleCandidate(job, candidate, options, retryCount + 1)
    }

    // Max retries reached, return error result
    return {
      success: false,
      evaluation: {
        name: candidate.name,
        score: 0,
        recommendation: 'ERROR',
        error: error.message,
        keyStrengths: [],
        keyConcerns: [`Evaluation failed after ${maxRetries + 1} attempts: ${error.message}`],
        interviewQuestions: [],
        reasoning: 'AI evaluation failed. You can retry this candidate later.'
      },
      usage: { inputTokens: 0, outputTokens: 0, cost: 0 }
    }
  }
}

/**
 * Process candidates in parallel with concurrency control
 * @param {Array} candidates - Candidates to evaluate
 * @param {Function} evaluateFn - Evaluation function
 * @param {number} concurrency - Max parallel requests (default: 3)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of results
 */
async function processBatch(candidates, evaluateFn, concurrency = 3, onProgress = null) {
  const results = []
  const executing = []

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]

    const promise = evaluateFn(candidate, i).then(result => {
      results[i] = result
      if (onProgress) {
        onProgress({
          current: results.filter(r => r !== undefined).length,
          total: candidates.length,
          currentCandidate: candidate.name,
          result
        })
      }
      return result
    })

    executing.push(promise)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(0, executing.findIndex(p => p === promise) + 1)
    }
  }

  await Promise.all(executing)
  return results
}

/**
 * Run AI-based evaluation on candidates
 * @param {Object} job - Job description data
 * @param {Array} candidates - Array of {name, text} objects
 * @param {Object} options - Additional options (stage, instructions, onProgress, etc.)
 * @returns {Promise<Object>} Evaluation results with rankings and cost
 */
export async function evaluateWithAI(job, candidates, options = {}) {
  const {
    stage = 1,
    additionalInstructions,
    onProgress = null,
    concurrency = 3, // Max 3 parallel requests (respects 10/min rate limit)
    maxRetries = 2
  } = options

  console.log(`[AI Evaluation] Starting evaluation for ${candidates.length} candidates...`)
  console.log(`[AI Evaluation] Concurrency: ${concurrency}, Max retries: ${maxRetries}`)

  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCost = 0

  // Evaluate candidates with parallel processing and concurrency control
  const evaluationResults = await processBatch(
    candidates,
    async (candidate, index) => {
      console.log(`[AI Evaluation] Evaluating candidate ${index + 1}/${candidates.length}: ${candidate.name}`)

      const result = await evaluateSingleCandidate(job, candidate, {
        stage,
        additionalInstructions,
        maxRetries
      })

      if (result.success) {
        console.log(`[AI Evaluation] ✓ ${candidate.name}: Score ${result.evaluation.score}/100`)
      } else {
        console.error(`[AI Evaluation] ✗ Failed for ${candidate.name}: ${result.evaluation.error}`)
      }

      return result
    },
    concurrency,
    onProgress
  )

  // Process results
  const results = evaluationResults.map(r => r.evaluation)

  // Accumulate usage metrics
  evaluationResults.forEach(r => {
    if (r.usage) {
      totalInputTokens += r.usage.inputTokens || 0
      totalOutputTokens += r.usage.outputTokens || 0
      totalCost += r.usage.cost || 0
    }
  })

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
