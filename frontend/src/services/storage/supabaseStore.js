/**
 * Supabase Storage Service
 * Handles database operations for authenticated users
 * Works in parallel with sessionStore for hybrid storage approach
 */
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  if (!isSupabaseConfigured()) return false

  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Get current user ID
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/**
 * Save job to database
 * @param {Object} jobData - Job data from form
 * @returns {Promise<Object>} Created job with ID
 */
export async function saveJob(jobData) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: jobData.title,
      department: jobData.department || null,
      location: jobData.location || null,
      employment_type: jobData.employmentType || 'Full-time',
      must_have_requirements: jobData.requirements || [],
      preferred_requirements: jobData.preferredRequirements || [],
      years_experience_min: jobData.yearsExperienceMin || null,
      years_experience_max: jobData.yearsExperienceMax || null,
      description: jobData.summary || null,
      status: 'open'
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving job:', error)
    throw new Error(`Failed to save job: ${error.message}`)
  }

  return data
}

/**
 * Save candidate to database
 * @param {string} jobId - Job ID
 * @param {Object} candidateData - Candidate data
 * @returns {Promise<Object>} Created candidate with ID
 */
export async function saveCandidate(jobId, candidateData) {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      job_id: jobId,
      full_name: candidateData.name,
      email: candidateData.email || null,
      phone: candidateData.phone || null,
      resume_text: candidateData.text,
      resume_file_url: candidateData.fileUrl || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving candidate:', error)
    throw new Error(`Failed to save candidate: ${error.message}`)
  }

  return data
}

/**
 * Save evaluation result to database
 * @param {string} candidateId - Candidate ID
 * @param {string} jobId - Job ID
 * @param {Object} evaluation - Evaluation result from AI
 * @param {Object} usage - Token usage and cost data
 * @returns {Promise<Object>} Created evaluation with ID
 */
export async function saveEvaluation(candidateId, jobId, evaluation, usage = {}) {
  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
      recommendation: evaluation.recommendation,
      confidence: evaluation.confidence || null,
      overall_score: evaluation.score || null,
      key_strengths: evaluation.keyStrengths || [],
      concerns: evaluation.keyConcerns || [],
      requirements_match: evaluation.requirementsMatch || {},
      reasoning: evaluation.reasoning || null,
      llm_provider: usage.provider || 'anthropic',
      llm_model: usage.model || 'claude-3-5-haiku-20241022',
      claude_model: usage.model || 'claude-3-5-haiku-20241022', // Backwards compatibility
      evaluation_prompt_tokens: usage.inputTokens || 0,
      evaluation_completion_tokens: usage.outputTokens || 0,
      evaluation_cost: usage.cost || 0,
      evaluation_stage: evaluation.stage || 1
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving evaluation:', error)
    throw new Error(`Failed to save evaluation: ${error.message}`)
  }

  return data
}

/**
 * Save batch evaluation (job + candidates + evaluations)
 * @param {Object} evaluationData - Complete evaluation data
 * @returns {Promise<Object>} Saved evaluation with all IDs
 */
export async function saveBatchEvaluation(evaluationData) {
  const { job, resumes, aiResults, regexResults } = evaluationData

  try {
    // 1. Save job
    const savedJob = await saveJob(job)

    // 2. Save candidates and their evaluations
    const savedCandidates = []
    const savedEvaluations = []

    for (const resume of resumes) {
      // Save candidate
      const candidate = await saveCandidate(savedJob.id, {
        name: resume.name,
        email: resume.email,
        text: resume.text,
        fileUrl: resume.fileUrl
      })
      savedCandidates.push(candidate)

      // Find matching evaluation result
      const evaluation = aiResults?.results?.find(r => r.name === resume.name) ||
                        regexResults?.results?.find(r => r.name === resume.name)

      if (evaluation) {
        const savedEval = await saveEvaluation(
          candidate.id,
          savedJob.id,
          evaluation,
          {
            provider: evaluationData.provider || 'anthropic',
            model: evaluationData.model,
            inputTokens: evaluation.inputTokens || 0,
            outputTokens: evaluation.outputTokens || 0,
            cost: evaluation.cost || 0
          }
        )
        savedEvaluations.push(savedEval)
      }
    }

    return {
      success: true,
      job: savedJob,
      candidates: savedCandidates,
      evaluations: savedEvaluations
    }
  } catch (error) {
    console.error('Error saving batch evaluation:', error)
    throw error
  }
}

/**
 * Get evaluation history for current user
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Array>} Array of evaluations with job and candidate data
 */
export async function getEvaluationHistory(options = {}) {
  const { limit = 50, offset = 0 } = options

  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      candidate:candidates(*),
      job:jobs(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching evaluation history:', error)
    throw new Error(`Failed to fetch evaluation history: ${error.message}`)
  }

  return data
}

/**
 * Get evaluations for a specific job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Array of evaluations with candidate data
 */
export async function getJobEvaluations(jobId) {
  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      *,
      candidate:candidates(*)
    `)
    .eq('job_id', jobId)
    .order('overall_score', { ascending: false })

  if (error) {
    console.error('Error fetching job evaluations:', error)
    throw new Error(`Failed to fetch job evaluations: ${error.message}`)
  }

  return data
}

/**
 * Get all jobs
 * @param {Object} options - Query options (status filter, limit, offset)
 * @returns {Promise<Array>} Array of jobs
 */
export async function getJobs(options = {}) {
  const { status = null, limit = 50, offset = 0 } = options

  let query = supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching jobs:', error)
    throw new Error(`Failed to fetch jobs: ${error.message}`)
  }

  return data
}

/**
 * Get job by ID with candidates and evaluations
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job with nested candidates and evaluations
 */
export async function getJobWithEvaluations(jobId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      candidates(
        *,
        evaluations(*)
      )
    `)
    .eq('id', jobId)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  return data
}

/**
 * Delete job and all associated data (cascades to candidates and evaluations)
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
export async function deleteJob(jobId) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    console.error('Error deleting job:', error)
    throw new Error(`Failed to delete job: ${error.message}`)
  }
}

/**
 * Update candidate ranking (manual override)
 * @param {string} candidateId - Candidate ID
 * @param {number} manualRank - Manual rank override
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} Updated ranking
 */
export async function updateCandidateRanking(candidateId, manualRank, notes = null) {
  const { data, error } = await supabase
    .from('candidate_rankings')
    .upsert({
      candidate_id: candidateId,
      manual_rank: manualRank,
      notes
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating candidate ranking:', error)
    throw new Error(`Failed to update ranking: ${error.message}`)
  }

  return data
}

export const supabaseStore = {
  isAuthenticated,
  getCurrentUserId,
  saveJob,
  saveCandidate,
  saveEvaluation,
  saveBatchEvaluation,
  getEvaluationHistory,
  getJobEvaluations,
  getJobs,
  getJobWithEvaluations,
  deleteJob,
  updateCandidateRanking
}
