/**
 * Unit Tests for extractRequirements Utility
 * Tests requirement parsing from job descriptions
 * 18 test cases covering all parsing scenarios
 */

import { describe, it, expect } from 'vitest'
import { extractRequirements } from '../requirementExtraction'

describe('extractRequirements', () => {
  describe('Section Detection', () => {
    it('should extract must-have requirements from "Must Have:" section', () => {
      const description = `
Must Have:
- 5+ years experience
- Team leadership
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('5+ years experience')
      expect(result.mustHave).toContain('Team leadership')
      expect(result.niceToHave).toEqual([])
    })

    it('should extract nice-to-have requirements from "Preferred:" section', () => {
      const description = `
Preferred:
- Leadership experience
- Startup background
`
      const result = extractRequirements(description)

      expect(result.niceToHave).toContain('Leadership experience')
      expect(result.niceToHave).toContain('Startup background')
      expect(result.mustHave).toEqual([])
    })

    it('should detect "Required" section (case-insensitive)', () => {
      const description = `
REQUIRED:
- Python expertise
- SQL knowledge
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Python expertise')
      expect(result.mustHave).toContain('SQL knowledge')
    })

    it('should detect "Nice to have" section (case-insensitive)', () => {
      const description = `
NICE TO HAVE:
- AWS experience
- DevOps knowledge
`
      const result = extractRequirements(description)

      expect(result.niceToHave).toContain('AWS experience')
      expect(result.niceToHave).toContain('DevOps knowledge')
    })

    it('should detect "Essential" section', () => {
      const description = `
Essential:
- Communication skills
- Problem solving
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Communication skills')
      expect(result.mustHave).toContain('Problem solving')
    })

    it('should detect "Desired" section', () => {
      const description = `
Desired:
- Kubernetes experience
- GraphQL knowledge
`
      const result = extractRequirements(description)

      expect(result.niceToHave).toContain('Kubernetes experience')
      expect(result.niceToHave).toContain('GraphQL knowledge')
    })
  })

  describe('Bullet Point Parsing', () => {
    it('should handle bullet points with "-"', () => {
      const description = `
Must Have:
- Requirement 1
- Requirement 2
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
    })

    it('should handle bullet points with "•"', () => {
      const description = `
Must Have:
• Requirement 1
• Requirement 2
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
    })

    it('should handle bullet points with "*"', () => {
      const description = `
Must Have:
* Requirement 1
* Requirement 2
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
    })

    it('should handle numbered lists (1. 2. 3.)', () => {
      const description = `
Must Have:
1. Requirement 1
2. Requirement 2
3. Requirement 3
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
      expect(result.mustHave).toContain('Requirement 3')
    })

    it('should handle mixed bullet styles in same section', () => {
      const description = `
Must Have:
- Requirement 1
• Requirement 2
* Requirement 3
1. Requirement 4
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
      expect(result.mustHave).toContain('Requirement 3')
      expect(result.mustHave).toContain('Requirement 4')
    })
  })

  describe('Limit and Array Handling', () => {
    it('should limit to 10 items per category', () => {
      const description = `
Must Have:
- Req 1
- Req 2
- Req 3
- Req 4
- Req 5
- Req 6
- Req 7
- Req 8
- Req 9
- Req 10
- Req 11
- Req 12
`
      const result = extractRequirements(description)

      expect(result.mustHave.length).toBe(10)
      expect(result.mustHave).not.toContain('Req 11')
      expect(result.mustHave).not.toContain('Req 12')
    })

    it('should return correct structure: { mustHave: [], niceToHave: [] }', () => {
      const result = extractRequirements('Any text')

      expect(result).toHaveProperty('mustHave')
      expect(result).toHaveProperty('niceToHave')
      expect(Array.isArray(result.mustHave)).toBe(true)
      expect(Array.isArray(result.niceToHave)).toBe(true)
    })
  })

  describe('Edge Cases and Whitespace', () => {
    it('should handle empty description (returns empty arrays)', () => {
      const result = extractRequirements('')

      expect(result.mustHave).toEqual([])
      expect(result.niceToHave).toEqual([])
    })

    it('should handle null/undefined description', () => {
      expect(extractRequirements(null).mustHave).toEqual([])
      expect(extractRequirements(undefined).niceToHave).toEqual([])
    })

    it('should strip leading/trailing whitespace from requirements', () => {
      const description = `
Must Have:
-   Requirement with spaces
-     More spaces
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement with spaces')
      expect(result.mustHave).toContain('More spaces')
    })

    it('should skip empty lines between requirements', () => {
      const description = `
Must Have:
- Requirement 1

- Requirement 2


- Requirement 3
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
      expect(result.mustHave).toContain('Requirement 3')
    })

    it('should handle whitespace around section keywords', () => {
      const description = `
   Must Have:
- Requirement 1

   Preferred:
- Nice-to-have
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('Requirement 1')
      expect(result.niceToHave).toContain('Nice-to-have')
    })
  })

  describe('Fallback Behavior', () => {
    it('should extract requirements without bullet points (no sections detected)', () => {
      const description = `
No sections here
Just plain requirements:
- Requirement 1
- Requirement 2
`
      const result = extractRequirements(description)

      // When no section detected, bullets become must-have
      expect(result.mustHave).toContain('Requirement 1')
      expect(result.mustHave).toContain('Requirement 2')
    })

    it('should handle description with no sections and no bullets', () => {
      const result = extractRequirements('Just some random text with no bullets')

      expect(result.mustHave).toEqual([])
      expect(result.niceToHave).toEqual([])
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle multiline descriptions with multiple sections', () => {
      const description = `
About the Role:
We are looking for a talented engineer.

Must Have:
- 5+ years experience
- React expertise
- TypeScript knowledge

Preferred:
- AWS experience
- Team leadership
- Startup background
`
      const result = extractRequirements(description)

      expect(result.mustHave).toContain('5+ years experience')
      expect(result.mustHave).toContain('React expertise')
      expect(result.mustHave).toContain('TypeScript knowledge')
      expect(result.niceToHave).toContain('AWS experience')
      expect(result.niceToHave).toContain('Team leadership')
      expect(result.niceToHave).toContain('Startup background')
    })

    it('should gracefully handle malformed input (no crash)', () => {
      const malformedInputs = [
        '- - - broken bullets',
        '1. 2. 3. numbered wrong',
        'Section without bullet:',
        '   \n   \n   ', // Whitespace only
      ]

      for (const input of malformedInputs) {
        expect(() => extractRequirements(input)).not.toThrow()
      }
    })

    it('should handle real job description format', () => {
      const description = `Senior Marketing Manager

About the Role:
We are looking for a Senior Marketing Manager to lead our digital growth strategy.

Must Have:
- 5+ years in digital marketing
- Experience with Marketo and Salesforce
- Proven track record of managing $500k+ budgets
- Leadership experience managing small teams

Nice to Have:
- SaaS B2B experience
- Startup background`

      const result = extractRequirements(description)

      expect(result.mustHave).toContain('5+ years in digital marketing')
      expect(result.mustHave).toContain('Experience with Marketo and Salesforce')
      expect(result.mustHave).toContain('Proven track record of managing $500k+ budgets')
      expect(result.mustHave).toContain('Leadership experience managing small teams')
      expect(result.niceToHave).toContain('SaaS B2B experience')
      expect(result.niceToHave).toContain('Startup background')
      expect(result.mustHave.length).toBe(4)
      expect(result.niceToHave.length).toBe(2)
    })
  })

  describe('Case Sensitivity', () => {
    it('should handle case-insensitive section matching ("required" vs "REQUIRED")', () => {
      const lowercase = extractRequirements('required:\n- Skill 1')
      const uppercase = extractRequirements('REQUIRED:\n- Skill 1')
      const mixed = extractRequirements('Required:\n- Skill 1')

      expect(lowercase.mustHave).toContain('Skill 1')
      expect(uppercase.mustHave).toContain('Skill 1')
      expect(mixed.mustHave).toContain('Skill 1')
    })
  })

  describe('Real-world Examples', () => {
    it('should parse Senior Marketing Manager job description', () => {
      const description = `Senior Marketing Manager

About the Role:
We are looking for a Senior Marketing Manager to lead our digital growth strategy.

Must Have:
- 5+ years in digital marketing
- Experience with Marketo and Salesforce
- Proven track record of managing $500k+ budgets
- Leadership experience managing small teams

Nice to Have:
- SaaS B2B experience
- Startup background`

      const result = extractRequirements(description)

      expect(result.mustHave.length).toBe(4)
      expect(result.niceToHave.length).toBe(2)
      expect(result.mustHave[0]).toContain('5+ years')
    })

    it('should parse Full Stack Engineer job description', () => {
      const description = `Full Stack Engineer

Required Skills:
- React and Node.js expertise
- PostgreSQL and MongoDB experience
- AWS or GCP knowledge
- Strong problem-solving skills

Nice to Have:
- Kubernetes experience
- GraphQL knowledge`

      const result = extractRequirements(description)

      expect(result.mustHave).toContain('React and Node.js expertise')
      expect(result.niceToHave).toContain('Kubernetes experience')
    })
  })
})
