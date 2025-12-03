import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as dbService from '../services/databaseService'
import { evaluateWithAI, evaluateWithRegex } from '../services/evaluationService'
import { checkOllamaStatus, evaluateQuick, evaluateQuickBatch, compareModels, OLLAMA_MODELS, DEFAULT_MODEL } from '../services/ollamaService'

/**
 * Map API recommendation to database value
 * API returns: "ADVANCE TO INTERVIEW", "PHONE SCREEN FIRST", "DECLINE", "ERROR"
 * Database expects: 'INTERVIEW', 'PHONE_SCREEN', 'DECLINE', 'ERROR'
 */
function mapRecommendation(apiRecommendation) {
  const mapping = {
    'ADVANCE TO INTERVIEW': 'INTERVIEW',
    'PHONE SCREEN FIRST': 'PHONE_SCREEN',
    'DECLINE': 'DECLINE',
    'ERROR': 'ERROR'
  }
  return mapping[apiRecommendation] || apiRecommendation
}

/**
 * React Query hook to fetch evaluations for a candidate
 *
 * @param {string} candidateId - Candidate ID to fetch evaluations for
 * @returns {Object} React Query result with evaluations array
 */
export function useEvaluationHistory(candidateId) {
  return useQuery({
    queryKey: ['evaluations', 'history', candidateId],
    queryFn: async () => {
      const result = await dbService.getEvaluations(candidateId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch evaluations')
      }

      return (result.evaluations || []).map(e => ({
        id: e.id,
        candidateId: e.candidate_id,
        jobId: e.job_id,
        overallScore: e.overall_score || e.score,
        recommendation: e.recommendation,
        confidence: e.confidence,
        // A-T-Q scores
        aScore: e.a_score,
        tScore: e.t_score,
        qScore: e.q_score,
        scoringModel: e.scoring_model || 'ATQ',
        keyStrengths: e.key_strengths || e.strengths || [],
        concerns: e.concerns || [],
        reasoning: e.reasoning,
        accomplishmentsAnalysis: e.accomplishments_analysis,
        trajectoryAnalysis: e.trajectory_analysis,
        claudeModel: e.claude_model,
        cost: e.evaluation_cost,
        version: e.version,
        scoreChange: e.score_change,
        changeReason: e.change_reason,
        createdAt: e.created_at
      }))
    },
    enabled: !!candidateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query hook to fetch a single evaluation by ID
 *
 * @param {string} evaluationId - Evaluation ID to fetch
 * @returns {Object} React Query result with evaluation data, loading state, and error
 */
export function useEvaluation(evaluationId) {
  return useQuery({
    queryKey: ['evaluations', evaluationId],
    queryFn: async () => {
      // For single evaluation, we need to fetch via candidate evaluations
      // The API might need an endpoint for this - for now return null
      // This can be enhanced when needed
      return null
    },
    enabled: !!evaluationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query mutation hook to evaluate a single candidate with AI
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useEvaluateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, jobId, options = {} }) => {
      // Fetch candidate data
      const candidateResult = await dbService.getCandidate(candidateId)
      if (!candidateResult.success) {
        throw new Error(`Failed to fetch candidate: ${candidateResult.error}`)
      }
      const candidate = candidateResult.candidate

      if (!candidate.resume_text) {
        throw new Error('Candidate has no resume text to evaluate')
      }

      // Fetch job data
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Update candidate status to 'evaluating'
      await dbService.updateCandidate(candidateId, { evaluation_status: 'evaluating' })

      // Format data for evaluation service
      const formattedJob = {
        title: job.title,
        description: job.description,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || [],
        performanceProfile: job.performance_profile
      }

      const formattedCandidate = {
        name: candidate.name || candidate.full_name,
        text: candidate.resume_text,
        email: candidate.email || ''
      }

      // Call AI evaluation
      const result = await evaluateWithAI(formattedJob, [formattedCandidate], {
        stage: options.stage || 1,
        additionalInstructions: options.additionalInstructions,
        provider: options.provider || 'anthropic',
        model: options.model
      })

      if (!result.success || result.results.length === 0) {
        // Mark as failed
        await dbService.updateCandidate(candidateId, { evaluation_status: 'failed' })
        throw new Error('AI evaluation failed')
      }

      const evaluation = result.results[0]
      const mappedRecommendation = mapRecommendation(evaluation.recommendation)

      // Create evaluation record
      const evalData = {
        score: evaluation.score,
        scoring_model: 'ATQ',
        a_score: evaluation.aScore || null,
        t_score: evaluation.tScore || null,
        q_score: evaluation.qScore || null,
        recommendation: mappedRecommendation,
        reasoning: evaluation.reasoning,
        strengths: evaluation.keyStrengths || [],
        concerns: evaluation.keyConcerns || [],
        accomplishments_analysis: evaluation.accomplishmentsAnalysis || null,
        trajectory_analysis: evaluation.trajectoryAnalysis || null
      }

      const evalResult = await dbService.createEvaluation(candidateId, evalData)

      // Update candidate with evaluation results
      await dbService.updateCandidate(candidateId, {
        evaluation_status: 'evaluated',
        recommendation: mappedRecommendation,
        score: evaluation.score,
        evaluated_at: new Date().toISOString(),
        stage1_score: evaluation.score,
        stage1_a_score: evaluation.aScore,
        stage1_t_score: evaluation.tScore,
        stage1_q_score: evaluation.qScore,
        stage1_evaluated_at: new Date().toISOString()
      })

      return {
        evaluation: evalResult.evaluation,
        candidate: { id: candidateId, name: candidate.name || candidate.full_name },
        usage: result.usage
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to evaluate multiple candidates with AI
 * Supports progress tracking via onProgress callback
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useBatchEvaluate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateIds, jobId, options = {} }) => {
      if (!candidateIds || candidateIds.length === 0) {
        throw new Error('No candidates selected for evaluation')
      }

      // Fetch job data first
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Fetch all candidates
      const candidatesResult = await dbService.getCandidates(jobId)
      if (!candidatesResult.success) {
        throw new Error(`Failed to fetch candidates: ${candidatesResult.error}`)
      }

      // Filter to selected candidates with resume text
      const allCandidates = candidatesResult.candidates || []
      const selectedCandidates = allCandidates.filter(c => candidateIds.includes(c.id))
      const validCandidates = selectedCandidates.filter(c => c.resume_text)
      const skippedCandidates = selectedCandidates.filter(c => !c.resume_text)

      if (validCandidates.length === 0) {
        throw new Error('No candidates have resume text to evaluate')
      }

      // Update all candidates to 'evaluating' status
      for (const c of validCandidates) {
        await dbService.updateCandidate(c.id, { evaluation_status: 'evaluating' })
      }

      // Format data for evaluation service
      const formattedJob = {
        title: job.title,
        description: job.description,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || [],
        performanceProfile: job.performance_profile
      }

      const formattedCandidates = validCandidates.map(c => ({
        id: c.id,
        name: c.name || c.full_name,
        text: c.resume_text,
        email: c.email || ''
      }))

      // Track progress for each candidate
      const progressResults = []
      const { onProgress } = options

      // Call AI evaluation with progress tracking
      const result = await evaluateWithAI(formattedJob, formattedCandidates, {
        stage: options.stage || 1,
        additionalInstructions: options.additionalInstructions,
        provider: options.provider || 'anthropic',
        model: options.model,
        concurrency: options.concurrency || 3,
        onProgress: async (progress) => {
          // Find the candidate that was just evaluated
          const evaluatedCandidate = formattedCandidates.find(
            c => c.name === progress.currentCandidate
          )

          if (evaluatedCandidate && progress.result) {
            const evaluation = progress.result.evaluation
            const mappedRecommendation = mapRecommendation(evaluation.recommendation)
            const isSuccess = evaluation.recommendation !== 'ERROR'

            if (isSuccess) {
              // Create evaluation record
              await dbService.createEvaluation(evaluatedCandidate.id, {
                score: evaluation.score,
                scoring_model: 'ATQ',
                a_score: evaluation.aScore || null,
                t_score: evaluation.tScore || null,
                q_score: evaluation.qScore || null,
                recommendation: mappedRecommendation,
                reasoning: evaluation.reasoning,
                strengths: evaluation.keyStrengths || [],
                concerns: evaluation.keyConcerns || []
              })

              // Update candidate status
              await dbService.updateCandidate(evaluatedCandidate.id, {
                evaluation_status: 'evaluated',
                recommendation: mappedRecommendation,
                score: evaluation.score,
                evaluated_at: new Date().toISOString(),
                stage1_score: evaluation.score,
                stage1_a_score: evaluation.aScore,
                stage1_t_score: evaluation.tScore,
                stage1_q_score: evaluation.qScore,
                stage1_evaluated_at: new Date().toISOString()
              })
            } else {
              // Mark as failed
              await dbService.updateCandidate(evaluatedCandidate.id, {
                evaluation_status: 'failed'
              })
            }

            progressResults.push({
              candidateId: evaluatedCandidate.id,
              candidateName: evaluatedCandidate.name,
              success: isSuccess,
              score: evaluation.score,
              recommendation: mappedRecommendation
            })
          }

          // Call user's progress callback
          if (onProgress) {
            onProgress({
              current: progress.current,
              total: progress.total,
              candidateName: progress.currentCandidate,
              result: progress.result
            })
          }
        }
      })

      // Mark skipped candidates
      for (const c of skippedCandidates) {
        await dbService.updateCandidate(c.id, {
          evaluation_status: 'failed',
          recruiter_notes: 'Skipped: No resume text available'
        })
      }

      return {
        success: true,
        results: progressResults,
        summary: result.summary,
        usage: result.usage,
        skipped: skippedCandidates.map(c => ({ id: c.id, name: c.name || c.full_name }))
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to evaluate candidates with regex (non-AI)
 * This is free and instant, used for initial keyword matching
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useRegexEvaluate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateIds, jobId }) => {
      if (!candidateIds || candidateIds.length === 0) {
        throw new Error('No candidates selected for evaluation')
      }

      // Fetch job data
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Fetch all candidates for this job
      const candidatesResult = await dbService.getCandidates(jobId)
      if (!candidatesResult.success) {
        throw new Error(`Failed to fetch candidates: ${candidatesResult.error}`)
      }

      // Filter to selected candidates with resume text
      const allCandidates = candidatesResult.candidates || []
      const selectedCandidates = allCandidates.filter(c => candidateIds.includes(c.id))
      const validCandidates = selectedCandidates.filter(c => c.resume_text)

      if (validCandidates.length === 0) {
        throw new Error('No candidates have resume text to evaluate')
      }

      // Format data for regex evaluation
      const formattedJob = {
        title: job.title,
        description: job.description,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || []
      }

      const formattedCandidates = validCandidates.map(c => ({
        id: c.id,
        name: c.name || c.full_name,
        text: c.resume_text
      }))

      // Call regex evaluation
      const result = await evaluateWithRegex(formattedJob, formattedCandidates)

      // Update candidates with regex scores (no evaluation record created)
      for (const evalResult of result.results || []) {
        const candidate = validCandidates.find(c => (c.name || c.full_name) === evalResult.name)
        if (candidate) {
          // Map regex recommendation
          let recommendation = 'DECLINE'
          if (evalResult.score >= 85) recommendation = 'INTERVIEW'
          else if (evalResult.score >= 70) recommendation = 'PHONE_SCREEN'

          await dbService.updateCandidate(candidate.id, {
            score: evalResult.score,
            recommendation
          })
        }
      }

      return {
        success: true,
        results: result.results || [],
        summary: result.summary
      }
    },
    onSuccess: () => {
      // Invalidate candidates query to refetch with new scores
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

/**
 * React Query mutation hook to retry a failed evaluation
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useRetryEvaluation() {
  const queryClient = useQueryClient()
  const evaluateMutation = useEvaluateCandidate()

  return useMutation({
    mutationFn: async ({ candidateId, jobId, options = {} }) => {
      // Reset status to pending first
      await dbService.updateCandidate(candidateId, { evaluation_status: 'pending' })

      // Use the standard evaluation mutation with extra retries
      return evaluateMutation.mutateAsync({
        candidateId,
        jobId,
        options: { ...options, maxRetries: 3 }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

/**
 * React Query hook to get evaluation results for display
 * Used by ResultsPage to fetch and display evaluation data
 *
 * @param {string} jobId - Job ID to fetch evaluations for
 * @returns {Object} React Query result with evaluation results
 */
export function useEvaluationResults(jobId) {
  return useQuery({
    queryKey: ['evaluations', 'results', jobId],
    queryFn: async () => {
      // Fetch job details
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Fetch candidates
      const candidatesResult = await dbService.getCandidates(jobId)
      if (!candidatesResult.success) {
        throw new Error(`Failed to fetch candidates: ${candidatesResult.error}`)
      }

      // Filter to evaluated candidates and sort by score
      const candidates = (candidatesResult.candidates || [])
        .filter(c => c.evaluation_status === 'evaluated')
        .sort((a, b) => (b.score || 0) - (a.score || 0))

      // Transform data for ResultsPage
      const results = candidates.map(c => ({
        name: c.name || c.full_name,
        email: c.email,
        score: c.stage1_score || c.score,
        aScore: c.stage1_a_score,
        tScore: c.stage1_t_score,
        qScore: c.stage1_q_score,
        recommendation: c.recommendation,
        evaluatedAt: c.evaluated_at || c.stage1_evaluated_at
      }))

      // Generate summary
      const advanceCount = results.filter(r => r.recommendation === 'INTERVIEW').length
      const phoneCount = results.filter(r => r.recommendation === 'PHONE_SCREEN').length
      const declineCount = results.filter(r => r.recommendation === 'DECLINE').length

      return {
        job: {
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location
        },
        results,
        summary: {
          totalCandidates: results.length,
          advanceToInterview: advanceCount,
          phoneScreen: phoneCount,
          declined: declineCount,
          topCandidate: results.length > 0 ? results[0].name : null,
          topScore: results.length > 0 ? results[0].score : 0
        }
      }
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ============================================================================
// OLLAMA QUICK SCORE HOOKS
// ============================================================================

/**
 * React Query hook to check Ollama availability
 * Polls every 30 seconds to keep status fresh
 *
 * @returns {Object} React Query result with Ollama status
 */
export function useOllamaStatus() {
  return useQuery({
    queryKey: ['ollama', 'status'],
    queryFn: checkOllamaStatus,
    staleTime: 30 * 1000, // Check every 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  })
}

/**
 * Get available Ollama models configuration
 * @returns {Array} Array of model objects with id, name, description
 */
export function getOllamaModels() {
  return OLLAMA_MODELS
}

/**
 * Get default Ollama model
 * @returns {string} Default model ID
 */
export function getDefaultOllamaModel() {
  return DEFAULT_MODEL
}

/**
 * React Query mutation hook to run quick score on a single candidate
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useQuickEvaluate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, jobId, model = DEFAULT_MODEL }) => {
      // Fetch candidate data
      const candidateResult = await dbService.getCandidate(candidateId)
      if (!candidateResult.success) {
        throw new Error(`Failed to fetch candidate: ${candidateResult.error}`)
      }
      const candidate = candidateResult.candidate

      if (!candidate.resume_text) {
        throw new Error('Candidate has no resume text to evaluate')
      }

      // Fetch job data
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Format data for Ollama evaluation
      const formattedJob = {
        title: job.title,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || []
      }

      const formattedCandidate = {
        id: candidate.id,
        name: candidate.name || candidate.full_name,
        resumeText: candidate.resume_text
      }

      // Call Ollama quick evaluation
      const result = await evaluateQuick(formattedJob, formattedCandidate, model)

      if (!result.success) {
        throw new Error(result.error || 'Quick evaluation failed')
      }

      // Build the analysis object for storage
      const quickScoreAnalysis = {
        requirements_identified: result.requirements_identified || { must_have: [], preferred: [] },
        match_analysis: result.match_analysis || [],
        methodology: result.methodology || 'A(50%) + T(30%) + Q(20%)',
        model: model,
        evaluated_at: result.evaluated_at || new Date().toISOString()
      }

      // Update candidate with quick score and analysis
      await dbService.updateCandidate(candidateId, {
        quick_score: result.score,
        quick_score_at: new Date().toISOString(),
        quick_score_model: model,
        quick_score_reasoning: result.reasoning,
        quick_score_analysis: JSON.stringify(quickScoreAnalysis)
      })

      return {
        candidateId,
        candidateName: candidate.name || candidate.full_name,
        score: result.score,
        reasoning: result.reasoning,
        requirements_identified: result.requirements_identified,
        match_analysis: result.match_analysis,
        methodology: result.methodology,
        model,
        usage: result.usage
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

/**
 * React Query mutation hook to run quick score on multiple candidates
 * Used after resume upload to auto-score all new candidates
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useBatchQuickEvaluate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateIds, jobId, model = DEFAULT_MODEL, onProgress = null }) => {
      if (!candidateIds || candidateIds.length === 0) {
        throw new Error('No candidates selected for evaluation')
      }

      // Fetch job data
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Fetch all candidates for this job
      const candidatesResult = await dbService.getCandidates(jobId)
      if (!candidatesResult.success) {
        throw new Error(`Failed to fetch candidates: ${candidatesResult.error}`)
      }

      // Filter to selected candidates with resume text
      const allCandidates = candidatesResult.candidates || []
      const selectedCandidates = allCandidates.filter(c => candidateIds.includes(c.id))
      const validCandidates = selectedCandidates.filter(c => c.resume_text)

      if (validCandidates.length === 0) {
        throw new Error('No candidates have resume text to evaluate')
      }

      // Format data
      const formattedJob = {
        title: job.title,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || []
      }

      const formattedCandidates = validCandidates.map(c => ({
        id: c.id,
        name: c.name || c.full_name,
        resumeText: c.resume_text
      }))

      // Call batch quick evaluation
      const result = await evaluateQuickBatch(formattedJob, formattedCandidates, model, onProgress)

      if (!result.success) {
        throw new Error(result.error || 'Batch quick evaluation failed')
      }

      // Update each candidate with their quick score and analysis
      for (const r of result.results.filter(r => r.success)) {
        const quickScoreAnalysis = {
          requirements_identified: r.requirements_identified || { must_have: [], preferred: [] },
          match_analysis: r.match_analysis || [],
          methodology: r.methodology || 'A(50%) + T(30%) + Q(20%)',
          model: model,
          evaluated_at: r.evaluated_at || new Date().toISOString()
        }

        await dbService.updateCandidate(r.candidate_id, {
          quick_score: r.score,
          quick_score_at: new Date().toISOString(),
          quick_score_model: model,
          quick_score_reasoning: r.reasoning,
          quick_score_analysis: JSON.stringify(quickScoreAnalysis)
        })
      }

      return {
        success: true,
        results: result.results,
        model,
        evaluated: result.results.filter(r => r.success).length,
        failed: result.results.filter(r => !r.success).length
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}

/**
 * React Query mutation hook to compare multiple Ollama models on the same candidate
 * Used in the ModelComparisonModal for testing/tuning
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useModelComparison() {
  return useMutation({
    mutationFn: async ({ candidateId, jobId, models = ['phi3', 'mistral', 'llama3'] }) => {
      // Fetch candidate data
      const candidateResult = await dbService.getCandidate(candidateId)
      if (!candidateResult.success) {
        throw new Error(`Failed to fetch candidate: ${candidateResult.error}`)
      }
      const candidate = candidateResult.candidate

      if (!candidate.resume_text) {
        throw new Error('Candidate has no resume text to evaluate')
      }

      // Fetch job data
      const jobResult = await dbService.getJob(jobId)
      if (!jobResult.success) {
        throw new Error(`Failed to fetch job: ${jobResult.error}`)
      }
      const job = jobResult.job

      // Format data
      const formattedJob = {
        title: job.title,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || []
      }

      const formattedCandidate = {
        id: candidate.id,
        name: candidate.name || candidate.full_name,
        resumeText: candidate.resume_text
      }

      // Call model comparison
      const result = await compareModels(formattedJob, formattedCandidate, models)

      if (!result.success) {
        throw new Error(result.error || 'Model comparison failed')
      }

      return {
        candidateId,
        candidateName: candidate.name || candidate.full_name,
        results: result.results
      }
    },
  })
}

/**
 * React Query mutation hook to save a selected model's score as the candidate's quick score
 * Used after model comparison to "accept" a particular result
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useSaveQuickScore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, score, reasoning, model, requirements_identified, match_analysis, methodology, evaluated_at }) => {
      // Build analysis object if analysis data provided
      const updateData = {
        quick_score: score,
        quick_score_at: new Date().toISOString(),
        quick_score_model: model,
        quick_score_reasoning: reasoning
      }

      // Include analysis if provided (from model comparison)
      if (requirements_identified || match_analysis) {
        const quickScoreAnalysis = {
          requirements_identified: requirements_identified || { must_have: [], preferred: [] },
          match_analysis: match_analysis || [],
          methodology: methodology || 'A(50%) + T(30%) + Q(20%)',
          model: model,
          evaluated_at: evaluated_at || new Date().toISOString()
        }
        updateData.quick_score_analysis = JSON.stringify(quickScoreAnalysis)
      }

      const result = await dbService.updateCandidate(candidateId, updateData)

      if (!result.success) {
        throw new Error(`Failed to save quick score: ${result.error}`)
      }

      return { candidateId, score, model }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })
}
