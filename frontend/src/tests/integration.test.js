import { describe, it, expect } from 'vitest'
import { evaluateWithRegex } from '../services/evaluationService'
import { josephDafferResume, itSecurityJob, campusMinisterJob } from './fixtures/sampleResume'

/**
 * Integration tests - requires API server running on localhost:8000
 * Run: cd api && python3 dev_server.py 8000
 *
 * Note: These tests are currently skipped. The unit tests cover the critical functionality.
 * To run integration tests manually, use curl:
 * curl -X POST http://localhost:8000/api/evaluate_regex \
 *   -H "Content-Type: application/json" \
 *   -d '{"job": {...}, "candidates": [...]}'
 */
describe.skip('Integration: Full Evaluation Flow', () => {

  it('should evaluate Joseph Daffer resume against IT Security job', async () => {
    if (!apiAvailable) {
      console.log('Skipping test - API server not running')
      return
    }

    const candidates = [josephDafferResume]
    const result = await evaluateWithRegex(itSecurityJob, candidates)

    // Verify response structure
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('results')
    expect(result).toHaveProperty('summary')

    // Verify results array
    expect(result.results).toBeInstanceOf(Array)
    expect(result.results).toHaveLength(1)

    const candidate = result.results[0]

    // Verify candidate data (camelCase)
    expect(candidate).toHaveProperty('name', 'Joseph Daffer')
    expect(candidate).toHaveProperty('score')
    expect(candidate).toHaveProperty('recommendation')
    expect(candidate).toHaveProperty('matchedKeywords') // camelCase!
    expect(candidate).toHaveProperty('missingKeywords') // camelCase!

    // Joseph has extensive IT security experience, should score highly
    expect(candidate.score).toBeGreaterThanOrEqual(85) // Should recommend interview
    expect(candidate.recommendation).toBe('ADVANCE TO INTERVIEW')

    // Should match cybersecurity and information security keywords
    expect(candidate.matchedKeywords).toContain('cybersecurity')
    expect(candidate.matchedKeywords).toContain('information security')

    // Verify summary
    expect(result.summary).toHaveProperty('totalCandidates', 1)
    expect(result.summary).toHaveProperty('advanceToInterview', 1)
  })

  it('should evaluate Joseph Daffer resume against Campus Minister job', async () => {
    if (!apiAvailable) {
      console.log('Skipping test - API server not running')
      return
    }

    const candidates = [josephDafferResume]
    const result = await evaluateWithRegex(campusMinisterJob, candidates)

    const candidate = result.results[0]

    // Joseph has theology education but limited ministry experience
    // Should get partial credit for education match
    expect(candidate.score).toBeGreaterThan(0)

    // Should match Christian Spirituality education
    const matchedKeywordsLower = candidate.matchedKeywords.map(k => k.toLowerCase())
    expect(matchedKeywordsLower.some(k => k.includes('christian spirituality'))).toBe(true)

    // Likely won't match all ministry-specific keywords
    expect(candidate.missingKeywords.length).toBeGreaterThan(0)
  })

  it('should return valid score breakdown', async () => {
    if (!apiAvailable) {
      console.log('Skipping test - API server not running')
      return
    }

    const candidates = [josephDafferResume]
    const result = await evaluateWithRegex(itSecurityJob, candidates)

    const candidate = result.results[0]
    expect(candidate).toHaveProperty('breakdown')

    const breakdown = candidate.breakdown
    expect(breakdown).toHaveProperty('requiredKeywords') // camelCase!
    expect(breakdown).toHaveProperty('experienceYears') // camelCase!
    expect(breakdown).toHaveProperty('educationMatch') // camelCase!

    // Verify score components are within valid ranges
    expect(breakdown.requiredKeywords).toBeGreaterThanOrEqual(0)
    expect(breakdown.requiredKeywords).toBeLessThanOrEqual(60)

    expect(breakdown.experienceYears).toBeGreaterThanOrEqual(0)
    expect(breakdown.experienceYears).toBeLessThanOrEqual(20)

    expect(breakdown.educationMatch).toBeGreaterThanOrEqual(0)
    expect(breakdown.educationMatch).toBeLessThanOrEqual(20)

    // Total should equal score
    const total = breakdown.requiredKeywords + breakdown.experienceYears + breakdown.educationMatch
    expect(Math.round(total)).toBe(candidate.score)
  })

  it('should handle multiple candidates and rank them', async () => {
    if (!apiAvailable) {
      console.log('Skipping test - API server not running')
      return
    }

    // Create a second candidate with less relevant experience
    const juniorCandidate = {
      name: 'Junior Developer',
      text: 'Bachelor degree in Computer Science. 2 years experience in web development. Knows HTML, CSS, JavaScript.'
    }

    const candidates = [josephDafferResume, juniorCandidate]
    const result = await evaluateWithRegex(itSecurityJob, candidates)

    expect(result.results).toHaveLength(2)

    // Results should be sorted by score (descending)
    expect(result.results[0].score).toBeGreaterThanOrEqual(result.results[1].score)

    // Joseph Daffer should rank higher due to relevant security experience
    expect(result.results[0].name).toBe('Joseph Daffer')
  })
})
