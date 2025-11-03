# Collaborative Resume Assistant - Technical Specification

**Version:** 2.0 | **Date:** 2025-11-02 | **Type:** Implementation Guide

---

## Overview

This document specifies the technical implementation for the pivot to "Collaborative Resume Assistant" where human+AI feedback is the core workflow.

**Key Principle:** Reuse 80% of existing codebase, change only UX layer + re-ranking logic.

---

## Architecture Overview

### What STAYS the Same (80% Reuse)

✅ **Backend:**
- Python serverless functions (Vercel)
- Claude 3.5 Haiku API integration
- PDF parsing (pdfplumber)
- OpenAI GPT-4o Mini support (multi-LLM)
- `api/ai_evaluator.py` evaluation logic
- `api/llm_providers.py` abstraction layer
- `api/parse_resume.py` PDF extraction

✅ **Database:**
- Supabase PostgreSQL
- Existing schema: `jobs`, `candidates`, `evaluations`
- **`candidate_rankings` table** (already exists! Just extend it)
- Migrations 001-003 (already applied)

✅ **Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- UI components (`Button`, `Card`, `Input`)
- Results page layout (collapsible sections)

✅ **Services:**
- `storageManager.js` (hybrid Supabase + sessionStorage)
- `evaluationService.js` (API client)
- `exportService.js` (PDF generation)

---

### What CHANGES (20% Net New)

🆕 **Database Schema:**
- Migration 004: Extend `candidate_rankings` with feedback columns

🆕 **API Endpoints:**
- `POST /api/rerank_with_feedback` - Re-evaluate with recruiter feedback

🆕 **Frontend Components:**
- `FeedbackCard.jsx` - Inline feedback UI on candidate cards
- `ComparisonView.jsx` - Toggle AI vs. My Ranking vs. Blended
- `RerankButton.jsx` - Trigger re-ranking with confirmation modal
- `FeedbackPrompt.jsx` - First-time user modal

🆕 **State Management:**
- `useFeedbackStore.js` - Zustand store for feedback state
- `useReranking.js` - React Query hook for re-ranking API

🆕 **Prompt Engineering:**
- Feedback-augmented evaluation prompts

---

## Database Schema Changes

### Migration 004: Extend `candidate_rankings` Table

**File:** `supabase/migrations/004_add_feedback_columns.sql`

```sql
-- Migration 004: Add Feedback Columns to candidate_rankings
-- Description: Support recruiter feedback on AI evaluations

BEGIN;

-- Add feedback columns to existing candidate_rankings table
ALTER TABLE candidate_rankings
ADD COLUMN sentiment VARCHAR(20) CHECK (sentiment IN ('agree', 'disagree', 'neutral')),
ADD COLUMN reason_codes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN feedback_notes TEXT,
ADD COLUMN original_ai_score INTEGER,
ADD COLUMN adjusted_score INTEGER,
ADD COLUMN feedback_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for feedback queries
CREATE INDEX idx_candidate_rankings_sentiment ON candidate_rankings(sentiment);
CREATE INDEX idx_candidate_rankings_job_feedback ON candidate_rankings(job_id)
  WHERE sentiment IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN candidate_rankings.sentiment IS 'Recruiter sentiment on AI ranking: agree, disagree, neutral';
COMMENT ON COLUMN candidate_rankings.reason_codes IS 'Array of quick reason codes: ["better_culture_fit", "soft_skills_gap"]';
COMMENT ON COLUMN candidate_rankings.feedback_notes IS 'Free-text recruiter notes explaining feedback';
COMMENT ON COLUMN candidate_rankings.original_ai_score IS 'AI score (0-100) before recruiter feedback';
COMMENT ON COLUMN candidate_rankings.adjusted_score IS 'Score after re-ranking with recruiter feedback';
COMMENT ON COLUMN candidate_rankings.feedback_timestamp IS 'When feedback was last provided';

COMMIT;
```

**Existing Schema (candidate_rankings):**
```sql
CREATE TABLE candidate_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,

  -- Existing columns
  rank INTEGER NOT NULL,
  manual_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(job_id, candidate_id)
);
```

**After Migration 004:**
- `sentiment`: 'agree' | 'disagree' | 'neutral'
- `reason_codes`: `["better_culture_fit", "experience_underrated", "soft_skills_gap"]`
- `feedback_notes`: "Led similar projects at smaller company - AI undervalued this."
- `original_ai_score`: 76 (AI's initial score)
- `adjusted_score`: 72 (after re-ranking with feedback)

---

### Future Table (P1): Feedback Reason Library

**File:** `supabase/migrations/005_feedback_reason_library.sql`

```sql
-- Migration 005: Feedback Reason Library (P1 Feature)
-- Description: Track user-specific reason codes that appear frequently

CREATE TABLE feedback_reason_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  reason_code VARCHAR(100) NOT NULL,
  display_text VARCHAR(255) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, reason_code)
);

CREATE INDEX idx_feedback_library_user ON feedback_reason_library(user_id);
CREATE INDEX idx_feedback_library_usage ON feedback_reason_library(usage_count DESC);

COMMENT ON TABLE feedback_reason_library IS 'User-personalized feedback reason codes that appear frequently (e.g., "startup_culture_fit" used 6x)';
```

---

## API Specification

### New Endpoint: POST /api/rerank_with_feedback

**File:** `api/rerank_candidate.py`

**Purpose:** Re-evaluate candidates using recruiter feedback as input to AI

**Request:**
```json
{
  "job": {
    "id": "uuid",
    "title": "Senior Software Engineer",
    "must_have_requirements": ["Python 5yr", "React", "Postgres"],
    "preferred_requirements": ["Supabase", "Serverless"]
  },
  "candidates": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "resume_text": "...",
      "original_evaluation": {
        "score": 76,
        "qualifications_score": 32,
        "experience_score": 30,
        "risk_flags_score": 14,
        "recommendation": "PHONE SCREEN FIRST"
      },
      "feedback": {
        "sentiment": "disagree",
        "reason_codes": ["too_high", "culture_fit_concern"],
        "notes": "Missing collaborative skills we need on small team"
      }
    },
    {
      "id": "uuid",
      "full_name": "Mike Wilson",
      "resume_text": "...",
      "original_evaluation": {
        "score": 64,
        "recommendation": "DECLINE"
      },
      "feedback": {
        "sentiment": "disagree",
        "reason_codes": ["underrated", "better_experience"],
        "notes": "Startup experience more valuable than AI scored - led similar team at smaller company"
      }
    }
  ],
  "provider": "anthropic",
  "model": "claude-3-5-haiku-20241022"
}
```

**Response:**
```json
{
  "success": true,
  "reranked_candidates": [
    {
      "candidate_id": "uuid",
      "original_score": 64,
      "adjusted_score": 72,
      "movement": 8,
      "new_rank": 2,
      "original_recommendation": "DECLINE",
      "new_recommendation": "PHONE SCREEN FIRST",
      "reasoning": "Recruiter feedback highlighted startup leadership experience that initial evaluation underweighted. Candidate led similar-sized team (5 engineers) at early-stage company, demonstrating adaptability and scrappiness valuable for our context. Adjusted experience score from 28/40 to 36/40 to reflect relevance of startup background. Culture fit appears strong based on recruiter's local knowledge of team needs.",
      "score_breakdown": {
        "qualifications_score": 25,
        "experience_score": 36,
        "risk_flags_score": 11
      }
    },
    {
      "candidate_id": "uuid",
      "original_score": 76,
      "adjusted_score": 68,
      "movement": -8,
      "new_rank": 3,
      "original_recommendation": "PHONE SCREEN FIRST",
      "new_recommendation": "PHONE SCREEN FIRST",
      "reasoning": "Recruiter identified culture fit concern around collaboration skills, which are critical for small team environment. While candidate has strong technical qualifications, feedback suggests potential gap in soft skills needed for close-knit team. Reduced cultural fit subscore within risk flags category based on recruiter's expertise. Recommend phone screen to probe collaborative experience more deeply.",
      "score_breakdown": {
        "qualifications_score": 32,
        "experience_score": 30,
        "risk_flags_score": 6
      }
    }
  ],
  "usage": {
    "total_input_tokens": 4500,
    "total_output_tokens": 800,
    "total_cost": 0.0021,
    "candidates_reranked": 2,
    "avg_cost_per_candidate": 0.00105
  },
  "model": "claude-3-5-haiku-20241022",
  "provider": "anthropic"
}
```

**Implementation:**

```python
# api/rerank_candidate.py
from http.server import BaseHTTPRequestHandler
import json
from ai_evaluator import load_skill_instructions
from llm_providers import get_provider
from http_utils import ResponseHelper


def build_feedback_augmented_prompt(skill_instructions, job_data, candidate_data, original_eval, feedback):
    """Build re-evaluation prompt with recruiter feedback context"""

    base_prompt = f"""{skill_instructions}

---

TASK: Re-evaluate this candidate considering recruiter feedback.

**JOB DETAILS:**
Title: {job_data.get('title')}
Must-Have Requirements:
{chr(10).join([f"- {req}" for req in job_data.get('must_have_requirements', [])])}

**CANDIDATE:**
Name: {candidate_data.get('full_name')}
Resume: {candidate_data.get('resume_text')}

**ORIGINAL AI EVALUATION:**
- Score: {original_eval['score']}/100
- Recommendation: {original_eval['recommendation']}
- Qualifications: {original_eval.get('qualifications_score', 'N/A')}/40
- Experience: {original_eval.get('experience_score', 'N/A')}/40
- Risk Flags: {original_eval.get('risk_flags_score', 'N/A')}/20

**RECRUITER FEEDBACK:**
- Sentiment: {feedback['sentiment']} (recruiter {'agrees with' if feedback['sentiment'] == 'agree' else 'disagrees with'} AI scoring)
- Reason Codes: {', '.join(feedback['reason_codes'])}
- Notes: "{feedback['notes']}"

**RE-EVALUATION INSTRUCTIONS:**
1. The recruiter has direct knowledge of team culture, unspoken requirements, and candidate nuances
2. Consider: Did initial evaluation miss context the recruiter understands?
3. Re-assess the specific areas mentioned in feedback (experience, culture fit, etc.)
4. Adjust scoring to account for factors the recruiter values
5. Explain how feedback influenced your new evaluation
6. If recruiter disagrees (sentiment=disagree), expect score to change by 5-15 points in direction indicated
7. If recruiter agrees (sentiment=agree), maintain similar score with refined reasoning

The recruiter's local expertise should carry significant weight. Give thoughtful consideration to their feedback.

Provide updated evaluation in this format:

SCORE: [0-100]
QUALIFICATIONS_SCORE: [0-100]
EXPERIENCE_SCORE: [0-100]
RISK_FLAGS_SCORE: [0-100]
RECOMMENDATION: [ADVANCE TO INTERVIEW / PHONE SCREEN FIRST / DECLINE]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]

KEY_CONCERNS:
- [Concern 1]
- [Concern 2]

REASONING:
[Explain how recruiter feedback influenced your re-evaluation. Reference specific points from their notes. Justify score changes.]
"""
    return base_prompt


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract data
            job = data.get('job', {})
            candidates = data.get('candidates', [])
            provider = data.get('provider', 'anthropic')
            model = data.get('model', None)

            # Validate
            if not job or not candidates:
                self._send_error(400, 'Missing job or candidates data')
                return

            # Load skill instructions
            skill_instructions = load_skill_instructions()

            # Get LLM provider
            llm_provider = get_provider(provider, model=model)

            # Re-evaluate each candidate with feedback
            reranked_results = []
            total_input_tokens = 0
            total_output_tokens = 0
            total_cost = 0.0

            for candidate in candidates:
                original_eval = candidate.get('original_evaluation', {})
                feedback = candidate.get('feedback', {})

                # Build feedback-augmented prompt
                prompt = build_feedback_augmented_prompt(
                    skill_instructions,
                    job,
                    candidate,
                    original_eval,
                    feedback
                )

                # Call LLM
                response_text, usage_metadata = llm_provider.evaluate(prompt)

                # Parse response (reuse existing parser)
                from ai_evaluator import parse_stage1_response
                evaluation_data = parse_stage1_response(response_text)

                # Calculate movement
                original_score = original_eval.get('score', 0)
                adjusted_score = evaluation_data['score']
                movement = adjusted_score - original_score

                # Append result
                reranked_results.append({
                    'candidate_id': candidate['id'],
                    'original_score': original_score,
                    'adjusted_score': adjusted_score,
                    'movement': movement,
                    'original_recommendation': original_eval.get('recommendation'),
                    'new_recommendation': evaluation_data['recommendation'],
                    'reasoning': evaluation_data['reasoning'],
                    'score_breakdown': {
                        'qualifications_score': evaluation_data['qualifications_score'],
                        'experience_score': evaluation_data['experience_score'],
                        'risk_flags_score': evaluation_data['risk_flags_score']
                    },
                    'key_strengths': evaluation_data['key_strengths'],
                    'key_concerns': evaluation_data['key_concerns']
                })

                # Accumulate usage
                total_input_tokens += usage_metadata['input_tokens']
                total_output_tokens += usage_metadata['output_tokens']
                total_cost += usage_metadata['cost']

            # Send response
            self._send_response(200, {
                'success': True,
                'reranked_candidates': reranked_results,
                'usage': {
                    'total_input_tokens': total_input_tokens,
                    'total_output_tokens': total_output_tokens,
                    'total_cost': round(total_cost, 4),
                    'candidates_reranked': len(candidates),
                    'avg_cost_per_candidate': round(total_cost / len(candidates), 5) if candidates else 0
                },
                'model': usage_metadata.get('model'),
                'provider': llm_provider.get_provider_name()
            })

        except Exception as e:
            self._send_error(500, str(e))

    def _send_response(self, status_code, data):
        ResponseHelper.send_json(self, status_code, data)

    def _send_error(self, status_code, message):
        ResponseHelper.send_error(self, status_code, message)

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
```

**Effort:** 3-4 days (prompt engineering, testing, iteration)

---

### Modified Function: load_skill_instructions()

**File:** `api/ai_evaluator.py`

```python
# No changes needed - existing function already loads recruiting skill
# Skill path: ~/.claude/skills/recruiting-evaluation/SKILL.md
# Or fallback to inline prompt if file not found

def load_skill_instructions():
    """Load recruiting-evaluation skill instructions"""
    try:
        with open(SKILL_PATH, 'r') as f:
            return f.read()
    except FileNotFoundError:
        # Fallback: use basic instructions
        return """
You are evaluating a candidate using a two-stage framework.

Stage 1: Resume Screening (0-100 score)
- Score based on: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline
"""
```

---

## Frontend Architecture

### State Management: Zustand Store

**File:** `frontend/src/stores/feedbackStore.js`

```javascript
import create from 'zustand'

export const useFeedbackStore = create((set, get) => ({
  // State
  feedbackByCandidateId: {}, // { candidate_id: { sentiment, reason_codes, notes } }
  rerankingInProgress: false,
  comparisonView: 'ai', // 'ai' | 'my' | 'blended'
  rerankResults: null, // Cached re-ranking results

  // Actions
  setFeedback: (candidateId, feedback) => {
    set(state => ({
      feedbackByCandidateId: {
        ...state.feedbackByCandidateId,
        [candidateId]: {
          ...state.feedbackByCandidateId[candidateId],
          ...feedback,
          timestamp: new Date().toISOString()
        }
      }
    }))
  },

  removeFeedback: (candidateId) => {
    set(state => {
      const newFeedback = { ...state.feedbackByCandidateId }
      delete newFeedback[candidateId]
      return { feedbackByCandidateId: newFeedback }
    })
  },

  clearAllFeedback: () => set({ feedbackByCandidateId: {}, rerankResults: null }),

  setComparisonView: (view) => set({ comparisonView: view }),

  setRerankingInProgress: (status) => set({ rerankingInProgress: status }),

  setRerankResults: (results) => set({ rerankResults: results }),

  // Computed getters
  hasFeedback: () => Object.keys(get().feedbackByCandidateId).length > 0,

  getFeedbackCount: () => Object.keys(get().feedbackByCandidateId).length,

  getCandidateFeedback: (candidateId) => get().feedbackByCandidateId[candidateId] || null
}))
```

---

### React Query Hook: useReranking

**File:** `frontend/src/hooks/useReranking.js`

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/api'
import { useFeedbackStore } from '../stores/feedbackStore'

export function useReranking(jobId) {
  const queryClient = useQueryClient()
  const { setRerankingInProgress, setRerankResults } = useFeedbackStore()

  return useMutation({
    mutationFn: async ({ job, candidates, feedback }) => {
      setRerankingInProgress(true)

      // Build request payload
      const payload = {
        job,
        candidates: candidates.map(candidate => ({
          id: candidate.id,
          full_name: candidate.name,
          resume_text: candidate.resumeText,
          original_evaluation: {
            score: candidate.score,
            qualifications_score: candidate.qualificationsScore,
            experience_score: candidate.experienceScore,
            risk_flags_score: candidate.riskFlagsScore,
            recommendation: candidate.recommendation
          },
          feedback: feedback[candidate.id]
        })),
        provider: 'anthropic',
        model: 'claude-3-5-haiku-20241022'
      }

      const response = await apiClient.rerankWithFeedback(payload)
      return response
    },

    onSuccess: (data) => {
      // Store results in Zustand
      setRerankResults(data.reranked_candidates)

      // Invalidate candidates query to refetch
      queryClient.invalidateQueries(['candidates', jobId])
      queryClient.invalidateQueries(['rankings', jobId])

      // Auto-switch to "My Ranking" view
      useFeedbackStore.getState().setComparisonView('my')

      setRerankingInProgress(false)
    },

    onError: (error) => {
      console.error('Re-ranking failed:', error)
      setRerankingInProgress(false)
      // Error handling in component (toast notification)
    }
  })
}
```

---

### API Client Extension

**File:** `frontend/src/services/api.js`

```javascript
// Existing apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = {
  // Existing methods...
  async evaluateCandidate(job, candidate, stage = 1, provider = 'anthropic') {
    const response = await fetch(`${API_BASE_URL}/api/evaluate_candidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, candidate, stage, provider })
    })
    if (!response.ok) throw new Error('Evaluation failed')
    return response.json()
  },

  // NEW METHOD
  async rerankWithFeedback(payload) {
    const response = await fetch(`${API_BASE_URL}/api/rerank_with_feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Re-ranking failed')
    }

    return response.json()
  },

  // NEW METHOD (P1)
  async saveFeedbackToDatabase(candidateId, jobId, feedback) {
    // Save to candidate_rankings table via Supabase
    const { data, error } = await supabase
      .from('candidate_rankings')
      .upsert({
        candidate_id: candidateId,
        job_id: jobId,
        sentiment: feedback.sentiment,
        reason_codes: feedback.reason_codes,
        feedback_notes: feedback.notes,
        feedback_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

---

### New Component: FeedbackCard

**File:** `frontend/src/components/feedback/FeedbackCard.jsx`

```javascript
import { useState } from 'react'
import { useFeedbackStore } from '../../stores/feedbackStore'
import { Button } from '../ui/Button'

const REASON_CODES = [
  { code: 'better_culture_fit', label: 'Better culture fit than AI thinks' },
  { code: 'soft_skills_gap', label: 'Missing critical soft skill' },
  { code: 'experience_underrated', label: 'Experience more relevant than score shows' },
  { code: 'red_flag', label: 'Red flag AI didn\'t catch' },
  { code: 'experience_overrated', label: 'Experience less relevant than AI scored' },
  { code: 'too_high', label: 'Score too high overall' }
]

export function FeedbackCard({ candidate }) {
  const { getCandidateFeedback, setFeedback } = useFeedbackStore()
  const existingFeedback = getCandidateFeedback(candidate.id)

  const [sentiment, setSentiment] = useState(existingFeedback?.sentiment || null)
  const [selectedReasons, setSelectedReasons] = useState(existingFeedback?.reason_codes || [])
  const [notes, setNotes] = useState(existingFeedback?.notes || '')
  const [showFeedbackForm, setShowFeedbackForm] = useState(!!existingFeedback)

  const handleSentimentClick = (newSentiment) => {
    setSentiment(newSentiment)
    setShowFeedbackForm(true)
  }

  const toggleReasonCode = (code) => {
    setSelectedReasons(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  const handleSave = () => {
    setFeedback(candidate.id, {
      sentiment,
      reason_codes: selectedReasons,
      notes: notes.trim()
    })
    // Show success toast
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
        <div className="text-2xl font-bold text-gray-700">
          {candidate.score}/100
        </div>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
          candidate.recommendation === 'ADVANCE TO INTERVIEW' ? 'bg-emerald-50 text-emerald-700' :
          candidate.recommendation === 'PHONE SCREEN FIRST' ? 'bg-amber-50 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {candidate.recommendation}
        </span>
      </div>

      {/* Sentiment Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Feedback:
        </label>
        <div className="flex gap-2">
          <Button
            variant={sentiment === 'agree' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSentimentClick('agree')}
          >
            👍 Agree
          </Button>
          <Button
            variant={sentiment === 'disagree' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSentimentClick('disagree')}
          >
            👎 Disagree
          </Button>
          <Button
            variant={sentiment === 'neutral' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSentimentClick('neutral')}
          >
            ➡️ Neutral
          </Button>
        </div>
      </div>

      {/* Reason Codes (show when sentiment selected) */}
      {showFeedbackForm && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why? (select all that apply)
            </label>
            <div className="space-y-2">
              {REASON_CODES.map(({ code, label }) => (
                <label key={code} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(code)}
                    onChange={() => toggleReasonCode(code)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add note (optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Led similar projects at smaller company - AI undervalued this experience"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          {/* Save Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!sentiment}
          >
            Save Feedback
          </Button>
        </>
      )}

      {/* Feedback Badge (if saved) */}
      {existingFeedback && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Your feedback:</strong> {existingFeedback.sentiment === 'agree' ? '👍' : '👎'}{' '}
          {existingFeedback.notes || existingFeedback.reason_codes.join(', ')}
        </div>
      )}
    </div>
  )
}
```

**Effort:** 1-2 days

---

### New Component: ComparisonView

**File:** `frontend/src/components/feedback/ComparisonView.jsx`

```javascript
import { useFeedbackStore } from '../../stores/feedbackStore'

export function ComparisonView({ candidates }) {
  const { comparisonView, setComparisonView, rerankResults } = useFeedbackStore()

  // Merge AI scores with re-ranked scores
  const candidatesWithMovement = candidates.map(candidate => {
    const rerankData = rerankResults?.find(r => r.candidate_id === candidate.id)

    return {
      ...candidate,
      aiScore: candidate.score, // Original AI score
      myScore: rerankData?.adjusted_score || candidate.score, // After feedback
      movement: rerankData?.movement || 0,
      newRecommendation: rerankData?.new_recommendation || candidate.recommendation
    }
  })

  // Sort based on view
  const sortedCandidates =
    comparisonView === 'ai'
      ? [...candidatesWithMovement].sort((a, b) => b.aiScore - a.aiScore)
      : comparisonView === 'my'
      ? [...candidatesWithMovement].sort((a, b) => b.myScore - a.myScore)
      : [...candidatesWithMovement].sort((a, b) => ((b.aiScore + b.myScore) / 2) - ((a.aiScore + a.myScore) / 2))

  return (
    <div>
      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setComparisonView('ai')}
          className={`px-4 py-2 rounded-md ${
            comparisonView === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          AI Ranking
        </button>
        <button
          onClick={() => setComparisonView('my')}
          className={`px-4 py-2 rounded-md ${
            comparisonView === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          My Ranking
        </button>
        <button
          onClick={() => setComparisonView('blended')}
          className={`px-4 py-2 rounded-md ${
            comparisonView === 'blended' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Blended (50/50)
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Candidate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                {comparisonView === 'ai' ? 'AI Score' : comparisonView === 'my' ? 'My Score' : 'Blended Score'}
              </th>
              {comparisonView !== 'ai' && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Movement</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCandidates.map((candidate, index) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">#{index + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{candidate.name}</div>
                  <div className="text-sm text-gray-500">
                    {comparisonView === 'my' ? candidate.newRecommendation : candidate.recommendation}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-lg font-semibold text-gray-900">
                    {comparisonView === 'ai'
                      ? candidate.aiScore
                      : comparisonView === 'my'
                      ? candidate.myScore
                      : Math.round((candidate.aiScore + candidate.myScore) / 2)}
                  </div>
                </td>
                {comparisonView !== 'ai' && (
                  <td className="px-4 py-3">
                    {candidate.movement !== 0 ? (
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        candidate.movement > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {candidate.movement > 0 ? '↑' : '↓'} {Math.abs(candidate.movement)} points
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Same</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Effort:** 2 days

---

## Performance Optimization

### Re-Ranking Speed (<15 seconds target)

**Techniques:**
1. **Use Claude Haiku** - Faster than Sonnet (5-8s vs 12-15s per candidate)
2. **Parallel API calls** - Evaluate multiple candidates concurrently (max 3 at a time to avoid rate limits)
3. **Cache job context** - Don't re-send full job description for each candidate
4. **Streaming responses** (P1) - Show results as they arrive, not all at once

**Implementation:**

```python
# api/rerank_candidate.py (optimized)
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def rerank_candidates_parallel(candidates, job, llm_provider, max_concurrent=3):
    """Re-rank candidates in parallel with concurrency limit"""
    semaphore = asyncio.Semaphore(max_concurrent)

    async def rerank_one(candidate):
        async with semaphore:
            # Build prompt
            prompt = build_feedback_augmented_prompt(...)
            # Call LLM (blocking, so run in executor)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, llm_provider.evaluate, prompt)
            return response

    # Run all in parallel (with semaphore limiting concurrency)
    results = await asyncio.gather(*[rerank_one(c) for c in candidates])
    return results
```

**Effort:** 1 day (optional optimization if <15s not met initially)

---

## Testing Strategy

### Unit Tests

**File:** `api/test_rerank_candidate.py`

```python
import pytest
from rerank_candidate import build_feedback_augmented_prompt

def test_prompt_includes_feedback():
    job = {'title': 'Engineer', 'must_have_requirements': ['Python']}
    candidate = {'full_name': 'John Doe', 'resume_text': '...'}
    original_eval = {'score': 76, 'recommendation': 'PHONE SCREEN'}
    feedback = {
        'sentiment': 'disagree',
        'reason_codes': ['underrated'],
        'notes': 'Startup experience undervalued'
    }

    prompt = build_feedback_augmented_prompt(None, job, candidate, original_eval, feedback)

    assert 'Startup experience undervalued' in prompt
    assert 'sentiment: disagree' in prompt.lower()
    assert '76' in prompt  # Original score
```

---

### Integration Tests

**File:** `frontend/src/__tests__/FeedbackFlow.test.jsx`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FeedbackCard } from '../components/feedback/FeedbackCard'
import { useFeedbackStore } from '../stores/feedbackStore'

test('user can provide feedback and save', async () => {
  const candidate = { id: '123', name: 'John Doe', score: 76, recommendation: 'PHONE SCREEN FIRST' }

  render(<FeedbackCard candidate={candidate} />)

  // Click "Disagree"
  fireEvent.click(screen.getByText('👎 Disagree'))

  // Select reason code
  fireEvent.click(screen.getByLabelText(/experience more relevant/i))

  // Add note
  fireEvent.change(screen.getByPlaceholderText(/Led similar projects/i), {
    target: { value: 'Startup experience counts more' }
  })

  // Save
  fireEvent.click(screen.getByText('Save Feedback'))

  // Check store
  await waitFor(() => {
    const feedback = useFeedbackStore.getState().getCandidateFeedback('123')
    expect(feedback.sentiment).toBe('disagree')
    expect(feedback.notes).toBe('Startup experience counts more')
  })
})
```

---

## Deployment

### Environment Variables

**Frontend** (`.env.local`):
```bash
VITE_API_BASE_URL=http://localhost:8000  # Local dev
# VITE_API_BASE_URL=https://your-app.vercel.app  # Production

VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend** (`api/.env`):
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Optional
RECRUITING_SKILL_PATH=/path/to/skill.md  # Optional
```

---

### Vercel Deployment

**File:** `vercel.json` (no changes needed)

```json
{
  "functions": {
    "api/**/*.py": {
      "runtime": "python3.13"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

**Deploy:**
```bash
cd /Users/pernelltoney/Documents/Projects/02-development/recruiter-evaluation-app
vercel --prod
```

---

## Migration Plan

### Week 1: Database + Feedback Capture

1. ✅ Apply Migration 004 (feedback columns)
2. ✅ Create `useFeedbackStore` Zustand store
3. ✅ Build `FeedbackCard` component
4. ✅ Test feedback saves to database
5. ✅ Test feedback persists on refresh (Supabase)

### Week 2: Re-Ranking Core

1. ✅ Create `/api/rerank_with_feedback` endpoint
2. ✅ Prompt engineering: Feedback-augmented prompts
3. ✅ Build `useReranking` React Query hook
4. ✅ Test re-ranking completes <15 seconds
5. ✅ Build `ComparisonView` component

### Week 3: UX Polish

1. ✅ First-time feedback prompt modal
2. ✅ Toast notifications (feedback saved, re-ranking complete)
3. ✅ Loading states (re-ranking progress)
4. ✅ Error handling (retry, refund)
5. ✅ Export PDF with feedback notes

### Week 4: Analytics + Launch

1. ✅ Event tracking (feedback_given, rerank_triggered)
2. ✅ Feedback analytics dashboard (P1)
3. ✅ Beta testing with 3 recruiters
4. ✅ Fix bugs, polish UI
5. ✅ Deploy to production

---

## Rollback Plan

**If pivot fails or feedback engagement <50%:**

1. **Keep existing AI ranking** as default
2. **Make feedback optional** (not prompted)
3. **Revert landing page** to original positioning
4. **Pause re-ranking development** after Week 2
5. **Cost:** 10 days engineering (sunk cost, but most code reusable)

**Rollback triggers:**
- Beta users don't provide feedback (engagement <50%)
- Re-ranking doesn't change scores meaningfully (<5 points avg)
- Users prefer AI ranking over My Ranking consistently
- Technical issues (re-ranking >30 seconds, API errors >10%)

---

## Next Steps

1. **Review with user** - Validate technical approach
2. **Apply Migration 004** - Extend `candidate_rankings` table
3. **Prototype `FeedbackCard`** - Build UI in 1 day, test locally
4. **Test re-ranking prompt** - Manually test with sample feedback
5. **Week 1 kickoff** - Start implementation (5 days to feedback capture)

---

**Document Owner:** Product & Growth Lead + Engineering Lead
**Status:** Draft for review
**Approval Required:** Founder
**Related:** [Collaborative Pivot PRD](COLLABORATIVE_PIVOT_PRD.md), [User Flows](COLLABORATIVE_USER_FLOWS.md)
