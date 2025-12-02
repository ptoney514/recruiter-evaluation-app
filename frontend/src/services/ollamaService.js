/**
 * Ollama Service
 * Handles communication with local Ollama LLM for quick scoring
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Available Ollama models for quick scoring
 */
export const OLLAMA_MODELS = [
  { id: 'phi3', name: 'Phi-3 (Fast)', description: 'Fastest, good for simple roles' },
  { id: 'mistral', name: 'Mistral (Balanced)', description: 'Good balance of speed and quality' },
  { id: 'llama3', name: 'Llama 3 (Best)', description: 'Highest quality, slower' },
];

export const DEFAULT_MODEL = 'mistral';

/**
 * Check if Ollama is available
 * @returns {Promise<{available: boolean, models: string[], error?: string}>}
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/ollama/status`);
    const data = await response.json();

    return {
      available: data.available,
      models: data.models || [],
      configuredModels: data.configured_models || OLLAMA_MODELS,
      error: data.error
    };
  } catch (error) {
    console.error('Failed to check Ollama status:', error);
    return {
      available: false,
      models: [],
      configuredModels: OLLAMA_MODELS,
      error: error.message
    };
  }
}

/**
 * Run quick evaluation on a single candidate
 * @param {Object} job - Job data
 * @param {Object} candidate - Candidate data with resumeText
 * @param {string} model - Ollama model to use (default: mistral)
 * @returns {Promise<{success: boolean, score?: number, reasoning?: string, error?: string}>}
 */
export async function evaluateQuick(job, candidate, model = DEFAULT_MODEL) {
  try {
    const response = await fetch(`${API_BASE}/api/evaluate_quick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, candidate, model })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return {
      success: data.success,
      score: data.score,
      reasoning: data.reasoning,
      model: data.model,
      usage: data.usage,
      ollamaAvailable: data.ollama_available
    };
  } catch (error) {
    console.error('Quick evaluation failed:', error);
    return {
      success: false,
      error: error.message,
      ollamaAvailable: false
    };
  }
}

/**
 * Run quick evaluation on multiple candidates
 * @param {Object} job - Job data
 * @param {Array<Object>} candidates - Array of candidates with resumeText
 * @param {string} model - Ollama model to use
 * @param {Function} onProgress - Progress callback (current, total, candidateName)
 * @returns {Promise<{success: boolean, results?: Array, error?: string}>}
 */
export async function evaluateQuickBatch(job, candidates, model = DEFAULT_MODEL, onProgress = null) {
  try {
    const response = await fetch(`${API_BASE}/api/evaluate_quick/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, candidates, model })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return {
      success: data.success,
      results: data.results,
      model: data.model,
      ollamaAvailable: data.ollama_available
    };
  } catch (error) {
    console.error('Batch quick evaluation failed:', error);
    return {
      success: false,
      error: error.message,
      ollamaAvailable: false
    };
  }
}

/**
 * Compare multiple models on the same candidate
 * @param {Object} job - Job data
 * @param {Object} candidate - Candidate data
 * @param {Array<string>} models - Array of model IDs to compare
 * @returns {Promise<{success: boolean, results?: Array, error?: string}>}
 */
export async function compareModels(job, candidate, models = ['phi3', 'mistral', 'llama3']) {
  try {
    const response = await fetch(`${API_BASE}/api/evaluate_quick/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, candidate, models })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return {
      success: data.success,
      candidateId: data.candidate_id,
      results: data.results,
      ollamaAvailable: data.ollama_available
    };
  } catch (error) {
    console.error('Model comparison failed:', error);
    return {
      success: false,
      error: error.message,
      ollamaAvailable: false
    };
  }
}
