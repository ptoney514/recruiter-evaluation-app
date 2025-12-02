import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Helper to get the current user ID from Supabase auth
 * Works with both normal auth and dev bypass mode (which now uses real auth)
 */
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * React Query hook to fetch all candidates for a specific job
 * Includes latest evaluation data via LEFT JOIN
 *
 * @param {string} jobId - Job ID to fetch candidates for
 * @returns {Object} React Query result with candidates data, loading state, and error
 */
export function useCandidates(jobId) {
  return useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Fetch candidates with their latest evaluation
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          id,
          job_id,
          full_name,
          email,
          phone,
          location,
          resume_text,
          resume_file_url,
          resume_file_name,
          current_title,
          current_company,
          years_experience,
          linkedin_url,
          portfolio_url,
          skills,
          education,
          additional_notes,
          evaluation_status,
          recommendation,
          score,
          evaluated_at,
          evaluation_count,
          shortlisted,
          recruiter_notes,
          created_at,
          updated_at,
          quick_score,
          quick_score_at,
          quick_score_model,
          quick_score_reasoning,
          quick_score_analysis,
          stage1_score,
          stage1_evaluated_at,
          stage2_score,
          stage2_evaluated_at,
          evaluations (
            id,
            overall_score,
            recommendation,
            confidence,
            key_strengths,
            concerns,
            reasoning,
            version,
            created_at
          )
        `)
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to include the latest evaluation
      const candidatesWithEvaluation = data.map(candidate => {
        // Get the latest evaluation (highest version)
        const latestEvaluation = candidate.evaluations && candidate.evaluations.length > 0
          ? candidate.evaluations.sort((a, b) => b.version - a.version)[0]
          : null

        return {
          id: candidate.id,
          jobId: candidate.job_id,
          name: candidate.full_name,
          fullName: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          resumeText: candidate.resume_text,
          resumeFileUrl: candidate.resume_file_url,
          resumeFileName: candidate.resume_file_name,
          currentTitle: candidate.current_title,
          currentCompany: candidate.current_company,
          yearsExperience: candidate.years_experience,
          linkedinUrl: candidate.linkedin_url,
          portfolioUrl: candidate.portfolio_url,
          skills: candidate.skills || [],
          education: candidate.education || [],
          additionalNotes: candidate.additional_notes,
          evaluationStatus: candidate.evaluation_status || 'pending',
          recommendation: candidate.recommendation,
          score: candidate.score,
          evaluatedAt: candidate.evaluated_at,
          evaluationCount: candidate.evaluation_count || 0,
          shortlisted: candidate.shortlisted || false,
          recruiterNotes: candidate.recruiter_notes,
          createdAt: candidate.created_at,
          updatedAt: candidate.updated_at,
          // Three-tier scoring
          quickScore: candidate.quick_score,
          quickScoreAt: candidate.quick_score_at,
          quickScoreModel: candidate.quick_score_model,
          quickScoreReasoning: candidate.quick_score_reasoning,
          stage1Score: candidate.stage1_score,
          stage1EvaluatedAt: candidate.stage1_evaluated_at,
          stage2Score: candidate.stage2_score,
          stage2EvaluatedAt: candidate.stage2_evaluated_at,
          // Latest evaluation details
          evaluation: latestEvaluation ? {
            id: latestEvaluation.id,
            overallScore: latestEvaluation.overall_score,
            recommendation: latestEvaluation.recommendation,
            confidence: latestEvaluation.confidence,
            keyStrengths: latestEvaluation.key_strengths || [],
            concerns: latestEvaluation.concerns || [],
            reasoning: latestEvaluation.reasoning,
            version: latestEvaluation.version,
            createdAt: latestEvaluation.created_at
          } : null
        }
      })

      return candidatesWithEvaluation
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * React Query hook to fetch a single candidate by ID
 *
 * @param {string} candidateId - Candidate ID to fetch
 * @returns {Object} React Query result with candidate data, loading state, and error
 */
export function useCandidate(candidateId) {
  return useQuery({
    queryKey: ['candidates', 'detail', candidateId],
    queryFn: async () => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('candidates')
        .select(`
          id,
          job_id,
          full_name,
          email,
          phone,
          location,
          resume_text,
          resume_file_url,
          resume_file_name,
          cover_letter,
          current_title,
          current_company,
          years_experience,
          linkedin_url,
          portfolio_url,
          skills,
          education,
          additional_notes,
          evaluation_status,
          recommendation,
          score,
          evaluated_at,
          evaluation_count,
          shortlisted,
          recruiter_notes,
          created_at,
          updated_at,
          quick_score,
          quick_score_at,
          quick_score_model,
          quick_score_reasoning,
          quick_score_analysis,
          stage1_score,
          stage1_evaluated_at,
          stage2_score,
          stage2_evaluated_at,
          evaluations (
            id,
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
            created_at
          )
        `)
        .eq('id', candidateId)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw error
      }

      // Get all evaluations sorted by version (newest first)
      const evaluations = (data.evaluations || [])
        .sort((a, b) => b.version - a.version)
        .map(e => ({
          id: e.id,
          overallScore: e.overall_score,
          recommendation: e.recommendation,
          confidence: e.confidence,
          keyStrengths: e.key_strengths || [],
          concerns: e.concerns || [],
          requirementsMatch: e.requirements_match || {},
          reasoning: e.reasoning,
          claudeModel: e.claude_model,
          promptTokens: e.evaluation_prompt_tokens,
          completionTokens: e.evaluation_completion_tokens,
          cost: e.evaluation_cost,
          version: e.version,
          contextIncluded: e.context_included || ['resume'],
          scoreChange: e.score_change,
          changeReason: e.change_reason,
          createdAt: e.created_at
        }))

      return {
        id: data.id,
        jobId: data.job_id,
        name: data.full_name,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        resumeText: data.resume_text,
        resumeFileUrl: data.resume_file_url,
        resumeFileName: data.resume_file_name,
        coverLetter: data.cover_letter,
        currentTitle: data.current_title,
        currentCompany: data.current_company,
        yearsExperience: data.years_experience,
        linkedinUrl: data.linkedin_url,
        portfolioUrl: data.portfolio_url,
        skills: data.skills || [],
        education: data.education || [],
        additionalNotes: data.additional_notes,
        evaluationStatus: data.evaluation_status || 'pending',
        recommendation: data.recommendation,
        score: data.score,
        evaluatedAt: data.evaluated_at,
        evaluationCount: data.evaluation_count || 0,
        shortlisted: data.shortlisted || false,
        recruiterNotes: data.recruiter_notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        evaluations,
        latestEvaluation: evaluations[0] || null
      }
    },
    enabled: !!candidateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React Query mutation hook to create a new candidate
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useCreateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (candidateData) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Transform camelCase to snake_case for database
      const dbCandidate = {
        job_id: candidateData.jobId,
        user_id: userId,
        full_name: candidateData.name || candidateData.fullName,
        email: candidateData.email || null,
        phone: candidateData.phone || null,
        location: candidateData.location || null,
        resume_text: candidateData.resumeText || candidateData.text || null,
        resume_file_url: candidateData.resumeFileUrl || null,
        resume_file_name: candidateData.resumeFileName || null,
        cover_letter: candidateData.coverLetter || null,
        current_title: candidateData.currentTitle || null,
        current_company: candidateData.currentCompany || null,
        years_experience: candidateData.yearsExperience || null,
        linkedin_url: candidateData.linkedinUrl || null,
        portfolio_url: candidateData.portfolioUrl || null,
        skills: candidateData.skills || [],
        education: candidateData.education || [],
        additional_notes: candidateData.additionalNotes || null,
        evaluation_status: candidateData.evaluationStatus || 'pending',
        shortlisted: candidateData.shortlisted || false,
        recruiter_notes: candidateData.recruiterNotes || null
      }

      const { data, error } = await supabase
        .from('candidates')
        .insert([dbCandidate])
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate candidates query for this job to refetch the list
      queryClient.invalidateQueries({ queryKey: ['candidates', data.job_id] })
      // Also invalidate jobs query to update candidate counts
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to create multiple candidates at once
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useBulkCreateCandidates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, candidates }) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Transform all candidates to snake_case
      const dbCandidates = candidates.map(candidate => ({
        job_id: jobId,
        user_id: userId,
        full_name: candidate.name || candidate.fullName || 'Unknown',
        email: candidate.email || null,
        phone: candidate.phone || null,
        location: candidate.location || null,
        resume_text: candidate.resumeText || candidate.resume_text || candidate.text || null,
        resume_file_url: candidate.resumeFileUrl || candidate.resume_file_url || null,
        resume_file_name: candidate.resumeFileName || candidate.resume_file_name || null,
        cover_letter: candidate.coverLetter || candidate.cover_letter || null,
        current_title: candidate.currentTitle || candidate.current_title || null,
        current_company: candidate.currentCompany || candidate.current_company || null,
        years_experience: candidate.yearsExperience || candidate.years_experience || null,
        linkedin_url: candidate.linkedinUrl || candidate.linkedin_url || null,
        portfolio_url: candidate.portfolioUrl || candidate.portfolio_url || null,
        skills: candidate.skills || [],
        education: candidate.education || [],
        additional_notes: candidate.additionalNotes || candidate.additional_notes || null,
        evaluation_status: candidate.evaluationStatus || candidate.evaluation_status || 'pending',
        shortlisted: candidate.shortlisted || false,
        recruiter_notes: candidate.recruiterNotes || candidate.recruiter_notes || null
      }))

      const { data, error } = await supabase
        .from('candidates')
        .insert(dbCandidates)
        .select()

      if (error) {
        throw error
      }

      return { jobId, candidates: data }
    },
    onSuccess: ({ jobId }) => {
      // Invalidate candidates query for this job to refetch the list
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
      // Also invalidate jobs query to update candidate counts
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to update an existing candidate
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useUpdateCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, updates }) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Transform camelCase updates to snake_case
      const dbUpdates = {}
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
      if (updates.name !== undefined) dbUpdates.full_name = updates.name
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.location !== undefined) dbUpdates.location = updates.location
      if (updates.resumeText !== undefined) dbUpdates.resume_text = updates.resumeText
      if (updates.resumeFileUrl !== undefined) dbUpdates.resume_file_url = updates.resumeFileUrl
      if (updates.resumeFileName !== undefined) dbUpdates.resume_file_name = updates.resumeFileName
      if (updates.coverLetter !== undefined) dbUpdates.cover_letter = updates.coverLetter
      if (updates.currentTitle !== undefined) dbUpdates.current_title = updates.currentTitle
      if (updates.currentCompany !== undefined) dbUpdates.current_company = updates.currentCompany
      if (updates.yearsExperience !== undefined) dbUpdates.years_experience = updates.yearsExperience
      if (updates.linkedinUrl !== undefined) dbUpdates.linkedin_url = updates.linkedinUrl
      if (updates.portfolioUrl !== undefined) dbUpdates.portfolio_url = updates.portfolioUrl
      if (updates.skills !== undefined) dbUpdates.skills = updates.skills
      if (updates.education !== undefined) dbUpdates.education = updates.education
      if (updates.additionalNotes !== undefined) dbUpdates.additional_notes = updates.additionalNotes
      if (updates.evaluationStatus !== undefined) dbUpdates.evaluation_status = updates.evaluationStatus
      if (updates.recommendation !== undefined) dbUpdates.recommendation = updates.recommendation
      if (updates.score !== undefined) dbUpdates.score = updates.score
      if (updates.evaluatedAt !== undefined) dbUpdates.evaluated_at = updates.evaluatedAt
      if (updates.evaluationCount !== undefined) dbUpdates.evaluation_count = updates.evaluationCount
      if (updates.shortlisted !== undefined) dbUpdates.shortlisted = updates.shortlisted
      if (updates.recruiterNotes !== undefined) dbUpdates.recruiter_notes = updates.recruiterNotes

      const { data, error } = await supabase
        .from('candidates')
        .update(dbUpdates)
        .eq('id', candidateId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate candidates queries
      queryClient.invalidateQueries({ queryKey: ['candidates', data.job_id] })
      queryClient.invalidateQueries({ queryKey: ['candidates', 'detail', data.id] })
      // Also invalidate jobs query to update counts if status changed
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to delete a candidate
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useDeleteCandidate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, jobId }) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return { candidateId, jobId }
    },
    onSuccess: ({ jobId }) => {
      // Invalidate candidates query for this job to refetch the list
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
      // Also invalidate jobs query to update candidate counts
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

/**
 * React Query mutation hook to toggle candidate shortlist status
 *
 * @returns {Object} React Query mutation with mutate function and status
 */
export function useToggleShortlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ candidateId, shortlisted }) => {
      const userId = await getCurrentUserId()

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('candidates')
        .update({ shortlisted })
        .eq('id', candidateId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate candidates queries
      queryClient.invalidateQueries({ queryKey: ['candidates', data.job_id] })
      queryClient.invalidateQueries({ queryKey: ['candidates', 'detail', data.id] })
    },
  })
}
