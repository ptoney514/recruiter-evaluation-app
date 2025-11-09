# AI Resume Evaluation & Ranking Architecture

## Overview
This document explains how Resume Scanner Pro evaluates individual resumes and ranks them against job descriptions using AI (Claude 3.5 Haiku or GPT-4o Mini).

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER UPLOADS RESUMES                           │
│                          (Batch: 1-50 PDFs/TXT)                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE PDF TEXT EXTRACTION                       │
│                        (frontend/utils/pdfParser)                        │
│  • PDF.js parses PDF files                                              │
│  • Extracts plain text from each resume                                 │
│  • Stores in sessionStorage/Supabase                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     JOB DESCRIPTION + REQUIREMENTS                       │
│  • Job title, summary, department                                       │
│  • Must-have requirements (array of strings)                            │
│  • Preferred requirements (array of strings)                            │
│  • Additional instructions (optional)                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BATCH EVALUATION ORCHESTRATION                        │
│                   (frontend/services/evaluationService.js)               │
│                                                                          │
│  • evaluateWithAI(job, candidates[], options)                           │
│  • Process candidates in parallel (3 concurrent workers)                │
│  • Each worker calls API for individual candidate                       │
│  • Retry logic: 2 retries per candidate if API fails                    │
│  • Progress callback updates UI in real-time                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ Parallel (max 3 at once)│
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐        ┌───────────────┐       ┌───────────────┐
│  Candidate 1  │        │  Candidate 2  │       │  Candidate 3  │
│  (individual) │        │  (individual) │       │  (individual) │
└───────┬───────┘        └───────┬───────┘       └───────┬───────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INDIVIDUAL RESUME EVALUATION                          │
│                       (Python API Serverless)                            │
│                                                                          │
│  POST /api/evaluate_candidate                                           │
│  {                                                                       │
│    job: { title, requirements, summary, ... },                          │
│    candidate: { name, text, email },                                    │
│    stage: 1,                                                             │
│    provider: "anthropic" | "openai",                                    │
│    model: "claude-3-5-haiku-20241022" | "gpt-4o-mini"                   │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI EVALUATOR MODULE                              │
│                        (api/ai_evaluator.py)                             │
│                                                                          │
│  1. Load recruiting skill instructions (SKILL.md or fallback)           │
│  2. Build Stage 1 evaluation prompt:                                    │
│     • System context (recruiting expert, two-stage framework)           │
│     • Job details (title, requirements, summary)                        │
│     • Candidate resume text                                             │
│     • Structured output format (scores, recommendation, etc.)           │
│  3. Call LLM provider (Anthropic/OpenAI)                                │
│  4. Parse response using regex                                          │
│  5. Return structured evaluation data                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │  Anthropic Provider  │      │   OpenAI Provider    │
    │   (llm_providers.py) │      │  (llm_providers.py)  │
    │                      │      │                      │
    │  • Claude 3.5 Haiku  │      │  • GPT-4o Mini       │
    │  • $0.003/eval       │      │  • $0.001/eval       │
    │  • 30s response time │      │  • 10s response time │
    └──────────┬───────────┘      └──────────┬───────────┘
               │                             │
               └──────────────┬──────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │         LLM API CALL            │
            │  (Claude Messages or OpenAI)    │
            │  • Max tokens: 4096             │
            │  • Returns text response        │
            │  • Tracks token usage           │
            └─────────────┬───────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       STRUCTURED LLM RESPONSE                            │
│                                                                          │
│  SCORE: 88                                                               │
│  QUALIFICATIONS_SCORE: 92                                               │
│  EXPERIENCE_SCORE: 85                                                   │
│  RISK_FLAGS_SCORE: 88                                                   │
│  RECOMMENDATION: ADVANCE TO INTERVIEW                                   │
│                                                                          │
│  KEY_STRENGTHS:                                                         │
│  - 8+ years Python experience with Flask, Django                        │
│  - Strong ML background (scikit-learn, TensorFlow)                      │
│  - Led team of 5 engineers at previous company                          │
│                                                                          │
│  KEY_CONCERNS:                                                          │
│  - No React experience (job requires full-stack)                        │
│  - Gap in employment (2022-2023)                                        │
│  - Limited startup experience                                           │
│                                                                          │
│  INTERVIEW_QUESTIONS:                                                   │
│  1. Can you walk us through the employment gap in 2022-2023?            │
│  2. How would you approach learning React for this full-stack role?     │
│  3. Tell us about a time you led a team through a technical challenge   │
│                                                                          │
│  REASONING:                                                             │
│  [2-3 paragraphs explaining the score and recommendation]               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        RESPONSE PARSING                                  │
│                      (parse_stage1_response)                             │
│                                                                          │
│  • Regex extraction of scores (SCORE: 88 → score: 88)                   │
│  • Parse recommendation (RECOMMENDATION: X → recommendation: X)          │
│  • Extract bulleted lists (KEY_STRENGTHS, KEY_CONCERNS)                 │
│  • Extract numbered questions (INTERVIEW_QUESTIONS)                     │
│  • Extract reasoning paragraphs                                         │
│                                                                          │
│  Returns JavaScript object:                                             │
│  {                                                                       │
│    score: 88,                                                            │
│    qualifications_score: 92,                                            │
│    experience_score: 85,                                                │
│    risk_flags_score: 88,                                                │
│    recommendation: "ADVANCE TO INTERVIEW",                              │
│    key_strengths: ["...", "...", "..."],                                │
│    key_concerns: ["...", "...", "..."],                                 │
│    interview_questions: ["...", "...", "..."],                          │
│    reasoning: "..."                                                     │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API RESPONSE WITH METADATA                          │
│                                                                          │
│  {                                                                       │
│    success: true,                                                        │
│    stage: 1,                                                             │
│    evaluation: { /* parsed evaluation above */ },                       │
│    usage: {                                                              │
│      input_tokens: 1250,                                                 │
│      output_tokens: 420,                                                 │
│      cost: 0.0028  // Calculated based on provider pricing              │
│    },                                                                    │
│    model: "claude-3-5-haiku-20241022",                                  │
│    provider: "anthropic"                                                │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BATCH RESULTS AGGREGATION                             │
│                   (evaluationService.js - after all)                     │
│                                                                          │
│  1. Collect all individual evaluation results                           │
│  2. Sort by score (descending): results.sort((a,b) => b.score - a.score)│
│  3. Generate summary statistics:                                        │
│     • Total candidates                                                  │
│     • Count by recommendation (Interview/Phone/Decline)                 │
│     • Top candidate name and score                                      │
│  4. Aggregate usage metrics:                                            │
│     • Total input tokens (sum across all candidates)                    │
│     • Total output tokens (sum across all candidates)                   │
│     • Total cost (sum)                                                  │
│     • Average cost per candidate                                        │
│                                                                          │
│  Returns:                                                               │
│  {                                                                       │
│    success: true,                                                        │
│    results: [ /* sorted by score desc */ ],                             │
│    summary: {                                                           │
│      totalCandidates: 12,                                               │
│      advanceToInterview: 3,                                             │
│      phoneScreen: 5,                                                    │
│      declined: 4,                                                       │
│      topCandidate: "Sarah Chen",                                        │
│      topScore: 92                                                       │
│    },                                                                    │
│    usage: {                                                             │
│      inputTokens: 15000,                                                │
│      outputTokens: 5040,                                                │
│      cost: 0.034,                                                       │
│      avgCostPerCandidate: 0.0028                                        │
│    }                                                                     │
│  }                                                                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESULTS DISPLAY (UI)                             │
│                        (frontend/pages/ResultsPage)                      │
│                                                                          │
│  • Ranked list of candidates (sorted by score)                          │
│  • Color-coded by recommendation:                                       │
│    - Green: ADVANCE TO INTERVIEW (85+)                                  │
│    - Yellow: PHONE SCREEN FIRST (70-84)                                 │
│    - Red: DECLINE (<70)                                                 │
│  • Expandable cards showing:                                            │
│    - Scores breakdown (Qualifications, Experience, Risk Flags)          │
│    - Key strengths and concerns                                         │
│    - Interview questions                                                │
│    - AI reasoning                                                       │
│  • Summary statistics at top                                            │
│  • Total cost and token usage                                           │
│  • Export to PDF option                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Breakdown

### 1. Individual Resume Evaluation Process

#### **Step 1: Prompt Construction** (api/ai_evaluator.py:40-107)

The `build_stage1_prompt()` function creates a structured prompt containing:

**Skill Instructions:**
```
You are evaluating a candidate using a two-stage framework.

Stage 1: Resume Screening (0-100 score)
- Score based on: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline
```

**Job Details:**
- Title, department, location, employment type
- Must-have requirements (bullet list)
- Preferred requirements (bullet list)
- Job summary/description

**Candidate Data:**
- Name and email
- Full resume text (extracted from PDF)

**Output Format Specification:**
```
SCORE: [0-100]
QUALIFICATIONS_SCORE: [0-100]
EXPERIENCE_SCORE: [0-100]
RISK_FLAGS_SCORE: [0-100]
RECOMMENDATION: [ADVANCE TO INTERVIEW / PHONE SCREEN FIRST / DECLINE]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

KEY_CONCERNS:
- [Concern 1]
- [Concern 2]

INTERVIEW_QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]

REASONING:
[Explanation paragraphs]
```

#### **Step 2: LLM API Call** (api/llm_providers.py)

**Anthropic Claude 3.5 Haiku:**
```python
client.messages.create(
    model="claude-3-5-haiku-20241022",
    max_tokens=4096,
    messages=[{"role": "user", "content": prompt}]
)

# Pricing: $0.25/1M input, $1.25/1M output
# Average cost: ~$0.003 per evaluation
# Response time: ~20-30 seconds
```

**OpenAI GPT-4o Mini:**
```python
client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are an expert recruiter..."},
        {"role": "user", "content": prompt}
    ],
    max_tokens=4096
)

# Pricing: $0.15/1M input, $0.60/1M output
# Average cost: ~$0.001 per evaluation (3x cheaper!)
# Response time: ~10-15 seconds (2x faster!)
```

#### **Step 3: Response Parsing** (api/ai_evaluator.py:110-184)

Regex-based extraction:
- `SCORE: 88` → `evaluation['score'] = 88`
- `RECOMMENDATION: ADVANCE TO INTERVIEW` → `evaluation['recommendation'] = "ADVANCE TO INTERVIEW"`
- Lines starting with `- ` under `KEY_STRENGTHS:` → added to array
- Lines starting with `1.` under `INTERVIEW_QUESTIONS:` → added to array

Handles malformed responses gracefully:
- Missing scores default to 0
- Missing recommendation defaults to "DECLINE"
- Empty arrays if sections not found

#### **Step 4: Return Structured Data**

```javascript
{
  success: true,
  stage: 1,
  evaluation: {
    score: 88,
    qualifications_score: 92,
    experience_score: 85,
    risk_flags_score: 88,
    recommendation: "ADVANCE TO INTERVIEW",
    key_strengths: [...],
    key_concerns: [...],
    interview_questions: [...],
    reasoning: "..."
  },
  usage: {
    input_tokens: 1250,
    output_tokens: 420,
    cost: 0.0028
  },
  model: "claude-3-5-haiku-20241022",
  provider: "anthropic"
}
```

---

### 2. Batch Evaluation & Ranking Process

#### **Step 1: Parallel Processing** (frontend/services/evaluationService.js:180-236)

```javascript
// Process 3 candidates at a time (concurrency = 3)
// Respects 10/min rate limit for local dev
await processBatch(
  candidates,
  evaluateFn,
  concurrency = 3,
  onProgress
)
```

**Worker Pool Pattern:**
```
Queue: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]

Worker 1: C1 → C4 → C7 → C10
Worker 2: C2 → C5 → C8
Worker 3: C3 → C6 → C9

Timeline:
0s:   W1=C1, W2=C2, W3=C3  (3 parallel)
30s:  W1=C4, W2=C5, W3=C6  (next 3)
60s:  W1=C7, W2=C8, W3=C9  (next 3)
90s:  W1=C10               (last one)
```

Each worker:
1. Grabs next candidate from queue
2. Calls `evaluateSingleCandidate()`
3. Updates progress callback
4. Repeats until queue empty

#### **Step 2: Retry Logic** (frontend/services/evaluationService.js:88-169)

```javascript
// If API call fails, retry up to 2 times
async function evaluateSingleCandidate(job, candidate, options, retryCount = 0) {
  try {
    // Call API
  } catch (error) {
    if (retryCount < 2) {
      await sleep(2000)  // Wait 2s
      return evaluateSingleCandidate(job, candidate, options, retryCount + 1)
    }

    // Max retries reached, return error result
    return {
      success: false,
      evaluation: {
        name: candidate.name,
        score: 0,
        recommendation: 'ERROR',
        error: error.message
      }
    }
  }
}
```

#### **Step 3: Results Aggregation** (frontend/services/evaluationService.js:290-340)

After all candidates evaluated:

**1. Collect Results:**
```javascript
const results = evaluationResults.map(r => r.evaluation)
```

**2. Sort by Score (Descending):**
```javascript
results.sort((a, b) => b.score - a.score)
// Now: [Sarah: 92, John: 88, Alice: 85, Bob: 72, ...]
```

**3. Generate Summary Statistics:**
```javascript
const summary = {
  totalCandidates: results.length,
  advanceToInterview: results.filter(r => r.recommendation === 'ADVANCE TO INTERVIEW').length,
  phoneScreen: results.filter(r => r.recommendation === 'PHONE SCREEN FIRST').length,
  declined: results.filter(r => r.recommendation === 'DECLINE').length,
  errors: results.filter(r => r.recommendation === 'ERROR').length,
  topCandidate: results[0].name,  // First after sort
  topScore: results[0].score
}
```

**4. Aggregate Token Usage:**
```javascript
const usage = {
  inputTokens: sum(all input tokens),
  outputTokens: sum(all output tokens),
  cost: sum(all costs),
  avgCostPerCandidate: totalCost / candidateCount
}
```

#### **Step 4: Return Final Rankings**

```javascript
{
  success: true,
  results: [
    { name: "Sarah Chen", score: 92, recommendation: "ADVANCE TO INTERVIEW", ... },
    { name: "John Doe", score: 88, recommendation: "ADVANCE TO INTERVIEW", ... },
    { name: "Alice Wang", score: 85, recommendation: "ADVANCE TO INTERVIEW", ... },
    { name: "Bob Smith", score: 72, recommendation: "PHONE SCREEN FIRST", ... },
    { name: "Jane Lee", score: 68, recommendation: "DECLINE", ... }
  ],
  summary: {
    totalCandidates: 12,
    advanceToInterview: 3,
    phoneScreen: 5,
    declined: 4,
    topCandidate: "Sarah Chen",
    topScore: 92
  },
  usage: {
    inputTokens: 15000,
    outputTokens: 5040,
    cost: 0.034,
    avgCostPerCandidate: 0.0028
  }
}
```

---

## Scoring Formula (Stage 1: Resume Screening)

### Component Weights

```
Total Score = (Qualifications × 0.4) + (Experience × 0.4) + (Risk Flags × 0.2)
```

**Example:**
```
Qualifications: 92/100
Experience: 85/100
Risk Flags: 88/100 (higher = fewer flags)

Total = (92 × 0.4) + (85 × 0.4) + (88 × 0.2)
      = 36.8 + 34.0 + 17.6
      = 88.4/100
```

### Recommendation Thresholds

```
Score ≥ 85  → ADVANCE TO INTERVIEW
70 ≤ Score < 85 → PHONE SCREEN FIRST
Score < 70  → DECLINE
```

### Scoring Criteria

**Qualifications (40%):**
- Education match (degree level, field)
- Required skills coverage
- Certifications/licenses
- Technical proficiency

**Experience (40%):**
- Years of experience in relevant roles
- Industry experience match
- Progressive responsibility
- Leadership/management experience
- Project complexity and scale

**Risk Flags (20%):**
- Employment gaps
- Job hopping (many short tenures)
- Overqualification (might leave quickly)
- Underqualification (steep learning curve)
- Geographic mismatch
- Salary expectation mismatch
- Cultural fit concerns

---

## Ranking Logic

### Primary Sort: Score (Descending)

```javascript
results.sort((a, b) => b.score - a.score)
```

Candidates ranked purely by numerical score:
```
1. Sarah Chen       92  ⭐ Interview
2. John Doe         88  ⭐ Interview
3. Alice Wang       85  ⭐ Interview
4. Bob Smith        72  📞 Phone Screen
5. Jane Lee         68  ❌ Decline
```

### No Secondary Sorts

Currently, **ranking is purely score-based**. No tiebreakers.

If two candidates have the same score, order is undefined (based on array order, which depends on API response timing).

**Future Enhancement Idea:**
```javascript
// Tiebreaker: Higher qualifications score
results.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score
  return b.qualifications_score - a.qualifications_score
})
```

---

## Key Design Decisions

### Why Regex Parsing Instead of JSON?

**Current Approach:**
```
SCORE: 88
QUALIFICATIONS_SCORE: 92
...
```

**Alternative (JSON):**
```json
{
  "score": 88,
  "qualifications_score": 92
}
```

**Reasons for text parsing:**
1. **Natural language prompts are easier to iterate on** - Can add/modify sections without breaking JSON schema
2. **LLMs sometimes break JSON syntax** - Extra commas, unescaped quotes, etc.
3. **Reasoning section benefits from prose** - More readable for humans
4. **Simpler debugging** - Can read raw response easily
5. **Fallback-friendly** - If one field fails to parse, others still work

**Trade-off:** More fragile parsing logic, but more flexible prompt engineering.

### Why Parallel Processing with Concurrency Limit?

**Sequential (slow):**
```
C1 → C2 → C3 → C4 → C5
Total time: 5 × 30s = 150 seconds (2.5 minutes)
```

**Fully Parallel (rate limit violations):**
```
All 50 at once → 10/min rate limit exceeded → failures
```

**Concurrency-Limited Parallel (optimal):**
```
3 at a time → 50 ÷ 3 = 17 batches × 30s = 510 seconds (8.5 minutes)
With retries and errors, ~10 minutes for 50 candidates
```

**Configuration:**
- Local dev: 3 concurrent (10/min rate limit)
- Production: Could increase to 5-10 concurrent with higher limits

### Why Stage 1 Only?

**Stage 2 is planned but not implemented:**
```python
# Stage 2: Final Hiring Decision
# Score = (Resume 25%) + (Interview 50%) + (References 25%)

if stage == 2:
    raise NotImplementedError('Stage 2 evaluation not yet implemented')
```

**Current focus:** Stage 1 (Resume Screening) is the MVP.

**Stage 2 requirements:**
- Interview ratings input (UI not built)
- Reference check data (UI not built)
- Different scoring formula (25/50/25 split)

---

## Performance Metrics

### Evaluation Speed

**Single Candidate:**
- Claude Haiku: 20-30 seconds
- GPT-4o Mini: 10-15 seconds

**Batch of 10 Candidates:**
- Claude: ~100 seconds (3 concurrent workers)
- GPT-4o: ~50 seconds

**Batch of 50 Candidates:**
- Claude: ~500 seconds (8.3 minutes)
- GPT-4o: ~250 seconds (4.2 minutes)

### Cost per Evaluation

**Claude 3.5 Haiku:**
- Input: $0.25/1M tokens
- Output: $1.25/1M tokens
- Avg: ~$0.003 per evaluation

**GPT-4o Mini:**
- Input: $0.15/1M tokens
- Output: $0.60/1M tokens
- Avg: ~$0.001 per evaluation (3x cheaper!)

**Batch of 50:**
- Claude: ~$0.15
- GPT-4o: ~$0.05

### Token Usage

**Average per Evaluation:**
- Input tokens: ~1,200 (job description + resume + prompt)
- Output tokens: ~400 (scores, strengths, concerns, questions, reasoning)
- Total: ~1,600 tokens per candidate

**Batch of 50:**
- Total tokens: ~80,000
- Cost (Claude): ~$0.15
- Cost (GPT-4o): ~$0.05

---

## Error Handling

### API Failures

**Network Errors:**
```javascript
// Retry up to 2 times with 2s delay
if (retryCount < 2) {
  await sleep(2000)
  return evaluateSingleCandidate(..., retryCount + 1)
}

// After max retries, return error result
return {
  success: false,
  evaluation: {
    name: candidate.name,
    score: 0,
    recommendation: 'ERROR',
    error: error.message
  }
}
```

**Timeout Protection:**
```javascript
// 90 second timeout for AI evaluation
fetchWithTimeout(url, options, 90000)

// If timeout, retry or mark as error
```

### Malformed LLM Responses

**Missing Scores:**
```python
# Default to 0 if parsing fails
try:
    evaluation['score'] = int(line.split(':', 1)[1].strip())
except:
    pass  # Defaults to 0 from initialization
```

**Missing Sections:**
```python
# Initialize with empty defaults
evaluation = {
    'score': 0,
    'recommendation': 'DECLINE',
    'key_strengths': [],  # Empty if not found
    'key_concerns': [],
    'interview_questions': [],
    'reasoning': ''
}
```

### Storage Limits

**Client-side storage check:**
```javascript
// Check before adding resume
if (!sessionStore.canAddMoreData(textSizeKB)) {
  errors.push(`Storage limit reached. Try evaluating current batch first.`)
  return null
}
```

---

## Extracting as Standalone Agent

### Core Files Needed

```
standalone-resume-evaluator/
├── ai_evaluator.py          # Core evaluation logic
├── llm_providers.py         # Multi-LLM abstraction
├── requirements.txt         # anthropic, openai
└── README.md
```

### Standalone Usage

```python
from ai_evaluator import evaluate_candidate_with_ai

job = {
    'title': 'Senior Python Engineer',
    'must_have_requirements': [
        '5+ years Python experience',
        'Flask or Django framework',
        'PostgreSQL/MySQL'
    ],
    'preferred_requirements': [
        'ML/AI experience',
        'Docker/Kubernetes'
    ],
    'summary': 'Build backend services for AI-powered SaaS product'
}

candidate = {
    'full_name': 'Sarah Chen',
    'email': 'sarah@example.com',
    'resume_text': '[Full resume text from PDF extraction]'
}

# Evaluate with Claude
result = evaluate_candidate_with_ai(
    job_data=job,
    candidate_data=candidate,
    stage=1,
    provider='anthropic',
    model='claude-3-5-haiku-20241022'
)

print(f"Score: {result['evaluation']['score']}/100")
print(f"Recommendation: {result['evaluation']['recommendation']}")
print(f"Cost: ${result['usage']['cost']}")
print(f"Key Strengths: {result['evaluation']['key_strengths']}")
```

### Integration Points

**As Python Function:**
```python
# Import and call directly
from ai_evaluator import evaluate_candidate_with_ai
```

**As REST API:**
```python
# Flask/FastAPI wrapper
@app.post('/evaluate')
def evaluate(job: Job, candidate: Candidate):
    return evaluate_candidate_with_ai(job, candidate, stage=1)
```

**As CLI Tool:**
```bash
python evaluate.py \
  --job job.json \
  --resume resume.txt \
  --provider anthropic \
  --model claude-3-5-haiku-20241022
```

**As Lambda Function:**
```python
# Serverless deployment
def lambda_handler(event, context):
    job = event['job']
    candidate = event['candidate']
    return evaluate_candidate_with_ai(job, candidate, stage=1)
```

---

## Summary

**Individual Evaluation:**
1. Resume text extracted (PDF → plain text)
2. Prompt built (job + candidate + output format)
3. LLM called (Claude or GPT-4o)
4. Response parsed (regex extraction)
5. Structured data returned (score, recommendation, insights)

**Batch Ranking:**
1. Process candidates in parallel (3 workers)
2. Retry logic handles failures
3. Results collected and sorted by score
4. Summary statistics generated
5. Total cost and usage aggregated

**Key Features:**
- Multi-LLM support (Claude Haiku, GPT-4o Mini)
- Structured scoring (Qualifications 40% + Experience 40% + Risk 20%)
- Automatic ranking (sort by score descending)
- Cost optimization (GPT-4o Mini 3x cheaper than Claude)
- Error resilience (retries, timeouts, graceful degradation)
- Progress tracking (real-time UI updates)

**Standalone Extraction:**
- Core logic in `ai_evaluator.py` + `llm_providers.py`
- No frontend dependencies
- Can be used as Python library, API, CLI, or serverless function
- Requires: `anthropic` and/or `openai` SDK, Python 3.13+
