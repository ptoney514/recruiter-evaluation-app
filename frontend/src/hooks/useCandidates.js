import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as dbService from '../services/databaseService'

/**
 * React Query hook to fetch all candidates for a specific job
 * Includes latest evaluation data
 *
 * @param {string} jobId - Job ID to fetch candidates for
 * @returns {Object} React Query result with candidates data, loading state, and error
 */
export function useCandidates(jobId) {
  return useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      const result = await dbService.getCandidates(jobId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch candidates')
      }

      // Transform the data to camelCase for frontend use
      const candidatesWithEvaluation = (result.candidates || []).map(candidate => ({
        id: candidate.id,
        jobId: candidate.job_id,
        name: candidate.name || candidate.full_name,
        fullName: candidate.name || candidate.full_name,
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
        // Three-tier scoring (A-T-Q)
        quickScore: candidate.quick_score,
        quickScoreAt: candidate.quick_score_at,
        quickScoreModel: candidate.quick_score_model,
        quickScoreReasoning: candidate.quick_score_reasoning,
        quickScoreAnalysis: candidate.quick_score_analysis,
        stage1Score: candidate.stage1_score,
        stage1AScore: candidate.stage1_a_score,
        stage1TScore: candidate.stage1_t_score,
        stage1QScore: candidate.stage1_q_score,
        stage1EvaluatedAt: candidate.stage1_evaluated_at,
        stage2Score: candidate.stage2_score,
        stage2EvaluatedAt: candidate.stage2_evaluated_at,
        scoringModel: candidate.scoring_model || 'ATQ',
        // Latest evaluation details (if included)
        evaluation: candidate.evaluation || null
      }))

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
      const result = await dbService.getCandidate(candidateId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch candidate')
      }

      const data = result.candidate

      return {
        id: data.id,
        jobId: data.job_id,
        name: data.name || data.full_name,
        fullName: data.name || data.full_name,
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
        // Three-tier scoring
        quickScore: data.quick_score,
        quickScoreAt: data.quick_score_at,
        quickScoreModel: data.quick_score_model,
        quickScoreReasoning: data.quick_score_reasoning,
        quickScoreAnalysis: data.quick_score_analysis,
        stage1Score: data.stage1_score,
        stage1AScore: data.stage1_a_score,
        stage1TScore: data.stage1_t_score,
        stage1QScore: data.stage1_q_score,
        stage1EvaluatedAt: data.stage1_evaluated_at,
        stage2Score: data.stage2_score,
        stage2EvaluatedAt: data.stage2_evaluated_at,
        scoringModel: data.scoring_model || 'ATQ',
        evaluations: data.evaluations || [],
        latestEvaluation: data.evaluations?.[0] || null
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
      const { jobId, ...data } = candidateData

      // Transform camelCase to snake_case for API
      const apiData = {
        name: data.name || data.fullName,
        email: data.email || null,
        phone: data.phone || null,
        location: data.location || null,
        resume_text: data.resumeText || data.text || null,
        resume_file_url: data.resumeFileUrl || null,
        resume_file_name: data.resumeFileName || null,
        cover_letter: data.coverLetter || null,
        current_title: data.currentTitle || null,
        current_company: data.currentCompany || null,
        years_experience: data.yearsExperience || null,
        linkedin_url: data.linkedinUrl || null,
        portfolio_url: data.portfolioUrl || null,
        skills: data.skills || [],
        education: data.education || [],
        additional_notes: data.additionalNotes || null,
        evaluation_status: data.evaluationStatus || 'pending',
        shortlisted: data.shortlisted || false,
        recruiter_notes: data.recruiterNotes || null
      }

      const result = await dbService.createCandidate(jobId, apiData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create candidate')
      }

      return result.candidate
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
      // Create candidates one by one (API doesn't have batch endpoint yet)
      const createdCandidates = []
      const errors = []

      for (const candidate of candidates) {
        try {
          const apiData = {
            name: candidate.name || candidate.fullName || 'Unknown',
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
          }

          const result = await dbService.createCandidate(jobId, apiData)
          if (result.success) {
            createdCandidates.push(result.candidate)
          } else {
            errors.push({ candidate: apiData.name, error: result.error })
          }
        } catch (err) {
          errors.push({ candidate: candidate.name || 'Unknown', error: err.message })
        }
      }

      if (createdCandidates.length === 0 && errors.length > 0) {
        throw new Error(`Failed to create candidates: ${errors[0].error}`)
      }

      return { jobId, candidates: createdCandidates, errors }
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
      // Transform camelCase updates to snake_case
      const dbUpdates = {}
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
      if (updates.name !== undefined) dbUpdates.name = updates.name
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
      // A-T-Q scoring fields
      if (updates.quickScore !== undefined) dbUpdates.quick_score = updates.quickScore
      if (updates.quickScoreAt !== undefined) dbUpdates.quick_score_at = updates.quickScoreAt
      if (updates.quickScoreModel !== undefined) dbUpdates.quick_score_model = updates.quickScoreModel
      if (updates.quickScoreReasoning !== undefined) dbUpdates.quick_score_reasoning = updates.quickScoreReasoning
      if (updates.stage1AScore !== undefined) dbUpdates.stage1_a_score = updates.stage1AScore
      if (updates.stage1TScore !== undefined) dbUpdates.stage1_t_score = updates.stage1TScore
      if (updates.stage1QScore !== undefined) dbUpdates.stage1_q_score = updates.stage1QScore

      const result = await dbService.updateCandidate(candidateId, dbUpdates)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update candidate')
      }

      return result.candidate
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
      const result = await dbService.deleteCandidate(candidateId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete candidate')
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
      const result = await dbService.updateCandidate(candidateId, { shortlisted })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update shortlist status')
      }

      return result.candidate
    },
    onSuccess: (data) => {
      // Invalidate candidates queries
      queryClient.invalidateQueries({ queryKey: ['candidates', data.job_id] })
      queryClient.invalidateQueries({ queryKey: ['candidates', 'detail', data.id] })
    },
  })
}
