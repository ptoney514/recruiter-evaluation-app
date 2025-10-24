import { describe, it, expect, vi, beforeEach } from 'vitest'
import { evaluateWithRegex } from '../services/evaluationService'
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
})
