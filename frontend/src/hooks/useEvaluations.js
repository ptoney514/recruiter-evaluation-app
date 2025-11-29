import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { evaluateWithAI, evaluateWithRegex } from '../services/evaluationService'

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
 * React Query hook to fetch a single evaluation by ID
 *
 * @param {string} evaluationId - Evaluation ID to fetch
 * @returns {Object} React Query result with evaluation data, loading state, and error
 */
export function useEvaluation(evaluationId) {
  return useQuery({
    queryKey: ['evaluations', evaluationId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          id,
          candidate_id,
          job_id,
          overall_score,
          recommendation,
          confidence,
          key_strengths,
          concerns,
          requirements_match,
          reasoning,
          claude_model,
          evaluation_prompt_tokens,
          evaluation_completion_tokens,
          evaluation_cost,
          version,
          context_included,
          score_change,
          change_reason,
          created_at,
          candidates (
            id,
            full_name,
            email
          ),
          jobs (
            id,
            title
          )
        `)
        .eq('id', evaluationId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id,
        candidateId: data.candidate_id,
        jobId: data.job_id,
        overallScore: data.overall_score,
        recommendation: data.recommendation,
        confidence: data.confidence,
        keyStrengths: data.key_strengths || [],
        concerns: data.concerns || [],
        requirementsMatch: data.requirements_match || {},
        reasoning: data.reasoning,
        claudeModel: data.claude_model,
        promptTokens: data.evaluation_prompt_tokens,
        completionTokens: data.evaluation_completion_tokens,
        cost: data.evaluation_cost,
        version: data.version,
        contextIncluded: data.context_included || ['resume'],
        scoreChange: data.score_change,
        changeReason: data.change_reason,
        createdAt: data.created_at,
        candidate: data.candidates ? {
          id: data.candidates.id,
          name: data.candidates.full_name,
          email: data.candidates.email
        } : null,
        job: data.jobs ? {
          id: data.jobs.id,
          title: data.jobs.title
        } : null
      }
    },
    enabled: !!evaluationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query hook to fetch all evaluations for a candidate
 *
 * @param {string} candidateId - Candidate ID to fetch evaluations for
 * @returns {Object} React Query result with evaluations array
 */
export function useEvaluationHistory(candidateId) {
  return useQuery({
    queryKey: ['evaluations', 'history', candidateId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          id,
          candidate_id,
          job_id,
          overall_score,
          recommendation,
          confidence,
          key_strengths,
          concerns,
          reasoning,
          claude_model,
          evaluation_cost,
          version,
          score_change,
          change_reason,
          created_at
        `)
        .eq('candidate_id', candidateId)
        .eq('user_id', user.id)
        .order('version', { ascending: false })

      if (error) {
        throw error
      }

      return data.map(e => ({
        id: e.id,
        candidateId: e.candidate_id,
        jobId: e.job_id,
        overallScore: e.overall_score,
        recommendation: e.recommendation,
        confidence: e.confidence,
        keyStrengths: e.key_strengths || [],
        concerns: e.concerns || [],
        reasoning: e.reasoning,
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
 * React Query mutation hook to evaluate a single candidate with AI
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useEvaluateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, jobId, options = {} }) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Fetch candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('id, full_name, email, resume_text')
        .eq('id', candidateId)
        .eq('user_id', user.id)
        .single()

      if (candidateError) {
        throw new Error(`Failed to fetch candidate: ${candidateError.message}`)
      }

      if (!candidate.resume_text) {
        throw new Error('Candidate has no resume text to evaluate')
      }

      // Fetch job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, description, must_have_requirements, preferred_requirements, performance_profile')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`)
      }

      // Update candidate status to 'evaluating'
      await supabase
        .from('candidates')
        .update({ evaluation_status: 'evaluating' })
        .eq('id', candidateId)
        .eq('user_id', user.id)

      // Format data for evaluation service
      const formattedJob = {
        title: job.title,
        description: job.description,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || [],
        performanceProfile: job.performance_profile
      }

      const formattedCandidate = {
        name: candidate.full_name,
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
        await supabase
          .from('candidates')
          .update({ evaluation_status: 'failed' })
          .eq('id', candidateId)
          .eq('user_id', user.id)

        throw new Error('AI evaluation failed')
      }

      const evaluation = result.results[0]
      const mappedRecommendation = mapRecommendation(evaluation.recommendation)

      // Get next version number for this candidate
      const { data: versionData } = await supabase
        .rpc('get_next_evaluation_version', { candidate_uuid: candidateId })

      const version = versionData || 1

      // Get previous evaluation for score comparison
      const { data: prevEvaluation } = await supabase
        .from('evaluations')
        .select('overall_score')
        .eq('candidate_id', candidateId)
        .eq('user_id', user.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      const scoreChange = prevEvaluation
        ? evaluation.score - prevEvaluation.overall_score
        : null

      // Insert evaluation record
      const { data: savedEvaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          candidate_id: candidateId,
          job_id: jobId,
          user_id: user.id,
          overall_score: evaluation.score,
          recommendation: mappedRecommendation,
          confidence: evaluation.confidence || null,
          key_strengths: evaluation.keyStrengths || [],
          concerns: evaluation.keyConcerns || [],
          requirements_match: evaluation.requirementsMatch || {},
          reasoning: evaluation.reasoning,
          claude_model: options.model || 'claude-3-5-haiku-20241022',
          evaluation_prompt_tokens: result.usage?.inputTokens || 0,
          evaluation_completion_tokens: result.usage?.outputTokens || 0,
          evaluation_cost: result.usage?.cost || 0,
          version,
          context_included: ['resume'],
          score_change: scoreChange,
          change_reason: version > 1 ? 'Re-evaluation' : null
        }])
        .select()
        .single()

      if (evalError) {
        throw new Error(`Failed to save evaluation: ${evalError.message}`)
      }

      // Update candidate with evaluation results
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          evaluation_status: 'evaluated',
          recommendation: mappedRecommendation,
          score: evaluation.score,
          evaluated_at: new Date().toISOString(),
          evaluation_count: version
        })
        .eq('id', candidateId)
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error(`Failed to update candidate: ${updateError.message}`)
      }

      return {
        evaluation: savedEvaluation,
        candidate: { id: candidateId, name: candidate.full_name },
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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!candidateIds || candidateIds.length === 0) {
        throw new Error('No candidates selected for evaluation')
      }

      // Fetch all candidates
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, full_name, email, resume_text')
        .in('id', candidateIds)
        .eq('user_id', user.id)

      if (candidatesError) {
        throw new Error(`Failed to fetch candidates: ${candidatesError.message}`)
      }

      // Filter out candidates without resume text
      const validCandidates = candidates.filter(c => c.resume_text)
      const skippedCandidates = candidates.filter(c => !c.resume_text)

      if (validCandidates.length === 0) {
        throw new Error('No candidates have resume text to evaluate')
      }

      // Fetch job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, description, must_have_requirements, preferred_requirements, performance_profile')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`)
      }

      // Update all candidates to 'evaluating' status
      await supabase
        .from('candidates')
        .update({ evaluation_status: 'evaluating' })
        .in('id', validCandidates.map(c => c.id))
        .eq('user_id', user.id)

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
        name: c.full_name,
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

            // Get next version number
            const { data: versionData } = await supabase
              .rpc('get_next_evaluation_version', { candidate_uuid: evaluatedCandidate.id })

            const version = versionData || 1

            if (isSuccess) {
              // Insert evaluation record
              await supabase
                .from('evaluations')
                .insert([{
                  candidate_id: evaluatedCandidate.id,
                  job_id: jobId,
                  user_id: user.id,
                  overall_score: evaluation.score,
                  recommendation: mappedRecommendation,
                  confidence: evaluation.confidence || null,
                  key_strengths: evaluation.keyStrengths || [],
                  concerns: evaluation.keyConcerns || [],
                  requirements_match: evaluation.requirementsMatch || {},
                  reasoning: evaluation.reasoning,
                  claude_model: options.model || 'claude-3-5-haiku-20241022',
                  evaluation_prompt_tokens: progress.result.usage?.inputTokens || 0,
                  evaluation_completion_tokens: progress.result.usage?.outputTokens || 0,
                  evaluation_cost: progress.result.usage?.cost || 0,
                  version,
                  context_included: ['resume']
                }])

              // Update candidate status
              await supabase
                .from('candidates')
                .update({
                  evaluation_status: 'evaluated',
                  recommendation: mappedRecommendation,
                  score: evaluation.score,
                  evaluated_at: new Date().toISOString(),
                  evaluation_count: version
                })
                .eq('id', evaluatedCandidate.id)
                .eq('user_id', user.id)
            } else {
              // Mark as failed
              await supabase
                .from('candidates')
                .update({ evaluation_status: 'failed' })
                .eq('id', evaluatedCandidate.id)
                .eq('user_id', user.id)
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
      if (skippedCandidates.length > 0) {
        await supabase
          .from('candidates')
          .update({
            evaluation_status: 'failed',
            recruiter_notes: 'Skipped: No resume text available'
          })
          .in('id', skippedCandidates.map(c => c.id))
          .eq('user_id', user.id)
      }

      return {
        success: true,
        results: progressResults,
        summary: result.summary,
        usage: result.usage,
        skipped: skippedCandidates.map(c => ({ id: c.id, name: c.full_name }))
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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!candidateIds || candidateIds.length === 0) {
        throw new Error('No candidates selected for evaluation')
      }

      // Fetch all candidates
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, full_name, email, resume_text')
        .in('id', candidateIds)
        .eq('user_id', user.id)

      if (candidatesError) {
        throw new Error(`Failed to fetch candidates: ${candidatesError.message}`)
      }

      // Filter out candidates without resume text
      const validCandidates = candidates.filter(c => c.resume_text)

      if (validCandidates.length === 0) {
        throw new Error('No candidates have resume text to evaluate')
      }

      // Fetch job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, description, must_have_requirements, preferred_requirements')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`)
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
        name: c.full_name,
        text: c.resume_text
      }))

      // Call regex evaluation
      const result = await evaluateWithRegex(formattedJob, formattedCandidates)

      // Update candidates with regex scores (no evaluation record created)
      for (const evalResult of result.results || []) {
        const candidate = validCandidates.find(c => c.full_name === evalResult.name)
        if (candidate) {
          // Map regex recommendation
          let recommendation = 'DECLINE'
          if (evalResult.score >= 85) recommendation = 'INTERVIEW'
          else if (evalResult.score >= 70) recommendation = 'PHONE_SCREEN'

          await supabase
            .from('candidates')
            .update({
              score: evalResult.score,
              recommendation,
              // Don't change evaluation_status - regex is just a pre-filter
            })
            .eq('id', candidate.id)
            .eq('user_id', user.id)
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

  return useMutation({
    mutationFn: async ({ candidateId, jobId, options = {} }) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Reset status to pending first
      await supabase
        .from('candidates')
        .update({ evaluation_status: 'pending' })
        .eq('id', candidateId)
        .eq('user_id', user.id)

      // Fetch candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('id, full_name, email, resume_text')
        .eq('id', candidateId)
        .eq('user_id', user.id)
        .single()

      if (candidateError) {
        throw new Error(`Failed to fetch candidate: ${candidateError.message}`)
      }

      if (!candidate.resume_text) {
        throw new Error('Candidate has no resume text to evaluate')
      }

      // Fetch job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, description, must_have_requirements, preferred_requirements, performance_profile')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`)
      }

      // Update candidate status to 'evaluating'
      await supabase
        .from('candidates')
        .update({ evaluation_status: 'evaluating' })
        .eq('id', candidateId)
        .eq('user_id', user.id)

      // Format data for evaluation service
      const formattedJob = {
        title: job.title,
        description: job.description,
        mustHaveRequirements: job.must_have_requirements || [],
        preferredRequirements: job.preferred_requirements || [],
        performanceProfile: job.performance_profile
      }

      const formattedCandidate = {
        name: candidate.full_name,
        text: candidate.resume_text,
        email: candidate.email || ''
      }

      // Call AI evaluation with extra retries
      const result = await evaluateWithAI(formattedJob, [formattedCandidate], {
        stage: options.stage || 1,
        additionalInstructions: options.additionalInstructions,
        provider: options.provider || 'anthropic',
        model: options.model,
        maxRetries: 3 // Extra retry for manual retry
      })

      if (!result.success || result.results.length === 0) {
        // Mark as failed
        await supabase
          .from('candidates')
          .update({ evaluation_status: 'failed' })
          .eq('id', candidateId)
          .eq('user_id', user.id)

        throw new Error('AI evaluation failed after retry')
      }

      const evaluation = result.results[0]
      const mappedRecommendation = mapRecommendation(evaluation.recommendation)

      // Get next version number for this candidate
      const { data: versionData } = await supabase
        .rpc('get_next_evaluation_version', { candidate_uuid: candidateId })

      const version = versionData || 1

      // Get previous evaluation for score comparison
      const { data: prevEvaluation } = await supabase
        .from('evaluations')
        .select('overall_score')
        .eq('candidate_id', candidateId)
        .eq('user_id', user.id)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      const scoreChange = prevEvaluation
        ? evaluation.score - prevEvaluation.overall_score
        : null

      // Insert evaluation record
      const { data: savedEvaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          candidate_id: candidateId,
          job_id: jobId,
          user_id: user.id,
          overall_score: evaluation.score,
          recommendation: mappedRecommendation,
          confidence: evaluation.confidence || null,
          key_strengths: evaluation.keyStrengths || [],
          concerns: evaluation.keyConcerns || [],
          requirements_match: evaluation.requirementsMatch || {},
          reasoning: evaluation.reasoning,
          claude_model: options.model || 'claude-3-5-haiku-20241022',
          evaluation_prompt_tokens: result.usage?.inputTokens || 0,
          evaluation_completion_tokens: result.usage?.outputTokens || 0,
          evaluation_cost: result.usage?.cost || 0,
          version,
          context_included: ['resume'],
          score_change: scoreChange,
          change_reason: 'Manual retry'
        }])
        .select()
        .single()

      if (evalError) {
        throw new Error(`Failed to save evaluation: ${evalError.message}`)
      }

      // Update candidate with evaluation results
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          evaluation_status: 'evaluated',
          recommendation: mappedRecommendation,
          score: evaluation.score,
          evaluated_at: new Date().toISOString(),
          evaluation_count: version
        })
        .eq('id', candidateId)
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error(`Failed to update candidate: ${updateError.message}`)
      }

      return {
        evaluation: savedEvaluation,
        candidate: { id: candidateId, name: candidate.full_name },
        usage: result.usage
      }
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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, department, location')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (jobError) {
        throw new Error(`Failed to fetch job: ${jobError.message}`)
      }

      // Fetch candidates with their latest evaluations
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          full_name,
          email,
          score,
          recommendation,
          evaluation_status,
          evaluated_at,
          evaluations (
            id,
            overall_score,
            recommendation,
            confidence,
            key_strengths,
            concerns,
            reasoning,
            claude_model,
            evaluation_cost,
            version,
            created_at
          )
        `)
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .eq('evaluation_status', 'evaluated')
        .order('score', { ascending: false })

      if (candidatesError) {
        throw new Error(`Failed to fetch candidates: ${candidatesError.message}`)
      }

      // Transform data for ResultsPage
      const results = candidates.map(c => {
        const latestEvaluation = c.evaluations && c.evaluations.length > 0
          ? c.evaluations.sort((a, b) => b.version - a.version)[0]
          : null

        return {
          name: c.full_name,
          email: c.email,
          score: latestEvaluation?.overall_score || c.score,
          recommendation: latestEvaluation?.recommendation || c.recommendation,
          confidence: latestEvaluation?.confidence,
          keyStrengths: latestEvaluation?.key_strengths || [],
          keyConcerns: latestEvaluation?.concerns || [],
          reasoning: latestEvaluation?.reasoning,
          model: latestEvaluation?.claude_model,
          cost: latestEvaluation?.evaluation_cost,
          evaluatedAt: c.evaluated_at
        }
      })

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
