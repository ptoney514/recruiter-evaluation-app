import { describe, it, expect, vi, beforeEach } from 'vitest'
import { evaluateWithRegex, evaluateWithAI } from '../services/evaluationService'
import { josephDafferResume, itSecurityJob } from './fixtures/sampleResume'

describe('Evaluation Service', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks()
  })

  describe('evaluateWithRegex', () => {
    it('should call the API with correct payload', async () => {
      const mockResponse = {
        success: true,
        results: [
          {
            name: 'Joseph Daffer',
            score: 92,
            recommendation: 'ADVANCE TO INTERVIEW',
            matched_keywords: ['cybersecurity', 'information security'],
            missing_keywords: [],
            breakdown: {
              required_keywords: 55,
              experience_years: 20,
              education_match: 20
            }
          }
        ],
        summary: {
          total_candidates: 1,
          advance_to_interview: 1,
          phone_screen: 0,
          declined: 0
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithRegex(itSecurityJob, candidates)

      // Verify fetch was called with correct URL and method
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/evaluate_regex'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )

      // Verify the request body includes job and candidates
      const callArgs = fetch.mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body)
      expect(requestBody).toHaveProperty('job')
      expect(requestBody).toHaveProperty('candidates')
      expect(requestBody.candidates[0].name).toBe('Joseph Daffer')
    })

    it('should convert snake_case to camelCase in response', async () => {
      const mockResponse = {
        success: true,
        results: [
          {
            name: 'Joseph Daffer',
            score: 92,
            recommendation: 'ADVANCE TO INTERVIEW',
            matched_keywords: ['cybersecurity', 'information security'],
            missing_keywords: [],
            breakdown: {
              required_keywords: 55,
              experience_years: 20,
              education_match: 20
            },
            experience_years_found: 25,
            experience_years_required: 5
          }
        ],
        summary: {
          total_candidates: 1,
          advance_to_interview: 1,
          phone_screen: 0,
          declined: 0
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithRegex(itSecurityJob, candidates)

      // Verify snake_case was converted to camelCase
      expect(result.results[0]).toHaveProperty('matchedKeywords')
      expect(result.results[0]).toHaveProperty('missingKeywords')
      expect(result.results[0]).not.toHaveProperty('matched_keywords')
      expect(result.results[0]).not.toHaveProperty('missing_keywords')

      expect(result.results[0].breakdown).toHaveProperty('requiredKeywords')
      expect(result.results[0].breakdown).toHaveProperty('experienceYears')
      expect(result.results[0].breakdown).toHaveProperty('educationMatch')

      expect(result.summary).toHaveProperty('totalCandidates')
      expect(result.summary).toHaveProperty('advanceToInterview')
      expect(result.summary).toHaveProperty('phoneScreen')
    })

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'API failed' }),
        })
      )

      const candidates = [josephDafferResume]

      await expect(
        evaluateWithRegex(itSecurityJob, candidates)
      ).rejects.toThrow('API failed')
    })

    it('should handle network errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      const candidates = [josephDafferResume]

      await expect(
        evaluateWithRegex(itSecurityJob, candidates)
      ).rejects.toThrow('Network error')
    })
  })

  describe('evaluateWithAI', () => {
    it('should call the API for each candidate and aggregate results', async () => {
      const mockAIResponse = {
        success: true,
        stage: 1,
        evaluation: {
          score: 88,
          qualifications_score: 90,
          experience_score: 85,
          risk_flags_score: 88,
          recommendation: 'ADVANCE TO INTERVIEW',
          key_strengths: ['Strong Python skills', 'React experience', 'Leadership'],
          key_concerns: ['Verify PostgreSQL depth', 'Check team size'],
          interview_questions: ['Q1', 'Q2', 'Q3'],
          reasoning: 'Candidate shows strong qualifications...'
        },
        usage: {
          input_tokens: 1200,
          output_tokens: 400,
          cost: 0.0035
        },
        model: 'claude-3-5-haiku-20241022'
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAIResponse),
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithAI(itSecurityJob, candidates, { stage: 1 })

      // Verify fetch was called once per candidate
      expect(fetch).toHaveBeenCalledTimes(1)

      // Verify correct endpoint
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/evaluate_candidate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )

      // Verify response structure
      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('results')
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('usage')

      // Verify results
      expect(result.results).toHaveLength(1)
      expect(result.results[0].name).toBe('Joseph Daffer')
      expect(result.results[0].score).toBe(88)

      // Verify usage aggregation
      expect(result.usage.inputTokens).toBe(1200)
      expect(result.usage.outputTokens).toBe(400)
      expect(result.usage.cost).toBe(0.0035)
    })

    it('should convert snake_case to camelCase in AI response', async () => {
      const mockAIResponse = {
        success: true,
        stage: 1,
        evaluation: {
          score: 88,
          qualifications_score: 90,
          experience_score: 85,
          risk_flags_score: 88,
          recommendation: 'ADVANCE TO INTERVIEW',
          key_strengths: ['Strength 1'],
          key_concerns: ['Concern 1'],
          interview_questions: ['Q1'],
          reasoning: 'Test reasoning'
        },
        usage: {
          input_tokens: 1200,
          output_tokens: 400,
          cost: 0.0035
        }
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAIResponse),
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithAI(itSecurityJob, candidates)

      // Verify snake_case was converted
      expect(result.results[0]).toHaveProperty('qualificationsScore')
      expect(result.results[0]).toHaveProperty('experienceScore')
      expect(result.results[0]).toHaveProperty('riskFlagsScore')
      expect(result.results[0]).toHaveProperty('keyStrengths')
      expect(result.results[0]).toHaveProperty('keyConcerns')
      expect(result.results[0]).toHaveProperty('interviewQuestions')

      expect(result.usage).toHaveProperty('inputTokens')
      expect(result.usage).toHaveProperty('outputTokens')
    })

    it('should handle API errors gracefully for individual candidates', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'API key invalid' }),
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithAI(itSecurityJob, candidates)

      // Should still return a result structure, but with error recommendation
      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].recommendation).toBe('ERROR')
      expect(result.results[0].error).toBeDefined()
      expect(result.summary.errors).toBe(1)
    })

    it('should evaluate multiple candidates in parallel', async () => {
      const mockAIResponse = (score) => ({
        success: true,
        stage: 1,
        evaluation: {
          score,
          qualifications_score: score,
          experience_score: score,
          risk_flags_score: score,
          recommendation: 'ADVANCE TO INTERVIEW',
          key_strengths: ['Strength'],
          key_concerns: [],
          interview_questions: ['Q1'],
          reasoning: 'Test'
        },
        usage: {
          input_tokens: 1000,
          output_tokens: 300,
          cost: 0.003
        }
      })

      // Return different scores for each candidate
      const scores = [92, 78, 85]
      let callIndex = 0
      global.fetch = vi.fn(() => {
        const score = scores[callIndex % scores.length]
        callIndex++
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAIResponse(score)),
        })
      })

      const candidates = [
        { name: 'Candidate 1', text: 'Resume 1' },
        { name: 'Candidate 2', text: 'Resume 2' },
        { name: 'Candidate 3', text: 'Resume 3' }
      ]

      const result = await evaluateWithAI(itSecurityJob, candidates)

      // Verify all candidates were evaluated
      expect(fetch).toHaveBeenCalledTimes(3)
      expect(result.results).toHaveLength(3)

      // Verify results are sorted by score descending (92, 85, 78)
      expect(result.results[0].score).toBe(92)
      expect(result.results[1].score).toBe(85)
      expect(result.results[2].score).toBe(78)

      // Verify cost aggregation (use toBeCloseTo for floating point comparison)
      expect(result.usage.cost).toBeCloseTo(0.009, 5) // 3 candidates × 0.003
    })

    it('should generate accurate summary statistics', async () => {
      const mockResponse = (recommendation) => ({
        success: true,
        stage: 1,
        evaluation: {
          score: 75,
          qualifications_score: 75,
          experience_score: 75,
          risk_flags_score: 75,
          recommendation,
          key_strengths: [],
          key_concerns: [],
          interview_questions: [],
          reasoning: 'Test'
        },
        usage: {
          input_tokens: 1000,
          output_tokens: 300,
          cost: 0.003
        }
      })

      let callCount = 0
      const recommendations = ['ADVANCE TO INTERVIEW', 'PHONE SCREEN FIRST', 'DECLINE']
      global.fetch = vi.fn(() => {
        const rec = recommendations[callCount % 3]
        callCount++
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse(rec)),
        })
      })

      const candidates = [
        { name: 'C1', text: 'R1' },
        { name: 'C2', text: 'R2' },
        { name: 'C3', text: 'R3' }
      ]

      const result = await evaluateWithAI(itSecurityJob, candidates)

      expect(result.summary.totalCandidates).toBe(3)
      expect(result.summary.advanceToInterview).toBe(1)
      expect(result.summary.phoneScreen).toBe(1)
      expect(result.summary.declined).toBe(1)
    })

    it('should handle timeout errors', async () => {
      global.fetch = vi.fn(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out after 90 seconds')), 100)
        })
      )

      const candidates = [josephDafferResume]
      const result = await evaluateWithAI(itSecurityJob, candidates)

      // Should handle timeout gracefully
      expect(result.results[0].recommendation).toBe('ERROR')
      expect(result.results[0].error).toContain('timed out')
    })
  })
})
