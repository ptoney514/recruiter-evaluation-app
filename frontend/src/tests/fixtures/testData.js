/**
 * Test Fixtures
 * Predefined test data for unit, integration, and E2E tests
 */

export const SAMPLE_JOBS = {
  seniorMarketing: {
    title: 'Senior Marketing Manager',
    department: 'Marketing',
    description: `About the Role:
We are looking for a Senior Marketing Manager to lead our digital growth strategy.

Must Have:
- 5+ years in digital marketing
- Experience with Marketo and Salesforce
- Proven track record of managing $500k+ budgets
- Leadership experience managing small teams

Preferred:
- SaaS B2B experience
- Startup background`,
    must_have_requirements: [
      '5+ years in digital marketing',
      'Experience with Marketo and Salesforce',
      'Proven track record of managing $500k+ budgets',
      'Leadership experience managing small teams',
    ],
    preferred_requirements: [
      'SaaS B2B experience',
      'Startup background',
    ],
    employment_type: 'Full-time',
  },

  fullStackEngineer: {
    title: 'Full Stack Engineer',
    department: 'Engineering',
    description: `About the Role:
Join our engineering team to build scalable web applications.

Required Skills:
- React and Node.js expertise
- PostgreSQL and MongoDB experience
- AWS or GCP knowledge
- Strong problem-solving skills

Nice to Have:
- Kubernetes experience
- GraphQL knowledge`,
    must_have_requirements: [
      'React and Node.js expertise',
      'PostgreSQL and MongoDB experience',
      'AWS or GCP knowledge',
      'Strong problem-solving skills',
    ],
    preferred_requirements: [
      'Kubernetes experience',
      'GraphQL knowledge',
    ],
    employment_type: 'Full-time',
  },

  productManager: {
    title: 'Product Manager',
    department: 'Product',
    description: `About the Role:
Lead product strategy and roadmap for our platform.

Must Have:
- 3+ years product management experience
- Experience with B2B SaaS products
- Data-driven decision making
- Cross-functional team leadership

Preferred:
- AI/ML product experience
- Previous startup PM role`,
    must_have_requirements: [
      '3+ years product management experience',
      'Experience with B2B SaaS products',
      'Data-driven decision making',
      'Cross-functional team leadership',
    ],
    preferred_requirements: [
      'AI/ML product experience',
      'Previous startup PM role',
    ],
    employment_type: 'Full-time',
  },
}

export const SAMPLE_CANDIDATES = {
  strongCandidate: {
    full_name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0001',
    location: 'San Francisco, CA',
    current_title: 'Marketing Manager',
    current_company: 'TechCorp Inc',
    years_experience: 6,
    resume_text: `Alice Johnson
San Francisco, CA
alice@example.com | 555-0001 | linkedin.com/in/alice

EXPERIENCE
Senior Marketing Manager at TechCorp Inc (3 years)
- Led digital marketing strategy for $1M+ budget
- Managed team of 5 marketers
- Increased leads by 40% using Marketo

Marketing Manager at StartupCo (3 years)
- Implemented Salesforce for lead tracking
- Managed $300k marketing budget
- Built marketing from ground up

SKILLS
- Digital Marketing, Marketo, Salesforce, Budget Management
- Team Leadership, Strategic Planning, SaaS

EDUCATION
MBA Marketing, Stanford University
BS Business, UC Berkeley`,
    skills: ['Digital Marketing', 'Marketo', 'Salesforce', 'Team Leadership', 'SaaS'],
    education: [
      { degree: 'MBA', field: 'Marketing', school: 'Stanford University' },
      { degree: 'BS', field: 'Business', school: 'UC Berkeley' },
    ],
  },

  mediumCandidate: {
    full_name: 'Bob Chen',
    email: 'bob@example.com',
    phone: '555-0002',
    location: 'New York, NY',
    current_title: 'Marketing Analyst',
    current_company: 'MediaCorp',
    years_experience: 3,
    resume_text: `Bob Chen
New York, NY
bob@example.com | 555-0002

EXPERIENCE
Marketing Analyst at MediaCorp (3 years)
- Worked on campaigns using Marketo
- Budget reporting and analysis
- Some team coordination

SKILLS
- Marketing Analytics, Marketo, Salesforce (basic), Excel
- Report Writing

EDUCATION
BS Marketing, NYU`,
    skills: ['Marketing Analytics', 'Marketo', 'Salesforce', 'Excel'],
    education: [
      { degree: 'BS', field: 'Marketing', school: 'NYU' },
    ],
  },

  weakCandidate: {
    full_name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '555-0003',
    location: 'Austin, TX',
    current_title: 'Marketing Associate',
    current_company: 'LocalBiz',
    years_experience: 1,
    resume_text: `Carol Davis
Austin, TX
carol@example.com | 555-0003

EXPERIENCE
Marketing Associate at LocalBiz (1 year)
- Social media posting
- Basic email marketing
- Content writing

SKILLS
- Social Media, Content Writing, Email Marketing (basic)

EDUCATION
BS Communications, University of Texas`,
    skills: ['Social Media', 'Content Writing', 'Email Marketing'],
    education: [
      { degree: 'BS', field: 'Communications', school: 'University of Texas' },
    ],
  },
}

export const SAMPLE_EVALUATIONS = {
  advance: {
    recommendation: 'ADVANCE',
    confidence: 'High',
    overall_score: 8.5,
    key_strengths: [
      'Exceeds all required skills',
      'Strong leadership background',
      'Relevant SaaS experience',
    ],
    concerns: [],
    requirements_match: {
      '5+ years in digital marketing': true,
      'Marketo and Salesforce': true,
      'Budget management': true,
      'Team leadership': true,
    },
    reasoning: 'Strong candidate with all required skills and SaaS experience.',
    claude_model: 'claude-3-5-haiku-20241022',
    evaluation_prompt_tokens: 1200,
    evaluation_completion_tokens: 450,
    evaluation_cost: 0.003,
  },

  requestInterview: {
    recommendation: 'REQUEST_INTERVIEW',
    confidence: 'Medium',
    overall_score: 7.0,
    key_strengths: [
      'Marketo experience',
      'Some budget responsibility',
      'Growing skill set',
    ],
    concerns: [
      'Limited budget management experience (under $500k)',
      'No team leadership experience',
    ],
    requirements_match: {
      '5+ years in digital marketing': false,
      'Marketo and Salesforce': true,
      'Budget management': true,
      'Team leadership': false,
    },
    reasoning: 'Candidate has some relevant experience but lacks team leadership. Interview recommended.',
    claude_model: 'claude-3-5-haiku-20241022',
    evaluation_prompt_tokens: 1100,
    evaluation_completion_tokens: 480,
    evaluation_cost: 0.003,
  },

  disposition: {
    recommendation: 'DISPOSITION',
    confidence: 'High',
    overall_score: 3.5,
    key_strengths: [
      'Enthusiastic',
      'Willing to learn',
    ],
    concerns: [
      'Significantly under-qualified (1 year vs 5+ required)',
      'No Marketo/Salesforce experience',
      'No budget management experience',
      'No team leadership experience',
    ],
    requirements_match: {
      '5+ years in digital marketing': false,
      'Marketo and Salesforce': false,
      'Budget management': false,
      'Team leadership': false,
    },
    reasoning: 'Candidate does not meet minimum requirements. Not a good fit for this role.',
    claude_model: 'claude-3-5-haiku-20241022',
    evaluation_prompt_tokens: 950,
    evaluation_completion_tokens: 420,
    evaluation_cost: 0.002,
  },
}

export const TEST_USER_CREDENTIALS = {
  email: 'test@example.com',
  password: 'TestPassword123!',
}

/**
 * Helper to create a complete job with candidates and evaluations
 */
export function createFullJobScenario() {
  return {
    job: SAMPLE_JOBS.seniorMarketing,
    candidates: [
      {
        ...SAMPLE_CANDIDATES.strongCandidate,
        evaluation: SAMPLE_EVALUATIONS.advance,
      },
      {
        ...SAMPLE_CANDIDATES.mediumCandidate,
        evaluation: SAMPLE_EVALUATIONS.requestInterview,
      },
      {
        ...SAMPLE_CANDIDATES.weakCandidate,
        evaluation: SAMPLE_EVALUATIONS.disposition,
      },
    ],
  }
}

/**
 * Helper to create test candidate with defaults
 */
export function createTestCandidate(overrides = {}) {
  return {
    ...SAMPLE_CANDIDATES.strongCandidate,
    ...overrides,
  }
}

/**
 * Helper to create test job with defaults
 */
export function createTestJob(overrides = {}) {
  return {
    ...SAMPLE_JOBS.seniorMarketing,
    ...overrides,
  }
}
