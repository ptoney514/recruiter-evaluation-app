# Candidate Management Design
## Three-Status System & Selective Evaluation

**Last Updated:** November 9, 2025

---

## Overview

This document details the candidate management system with:
- **Three-Status System** (Not Evaluated, Recommended, Not Recommended)
- **Selective Evaluation** (upload 50, evaluate 10)
- **Candidate Packages** (living documents with context)
- **Re-evaluation Triggers** (add notes, update Performance Profile)

---

## Three-Status System

### Status 1: ⭐ Not Evaluated (Pending)

**What it means:**
- Resume uploaded and parsed successfully
- No AI evaluation performed yet
- No cost incurred
- Recruiter can evaluate anytime

**Visual Design:**
- Badge: `⭐ Not Evaluated`
- Background: `bg-amber-100`
- Text: `text-amber-700`
- Border: `border-amber-300`

**Actions Available:**
- [View Resume]
- [Evaluate] (individual)
- Checkbox for bulk evaluation

---

### Status 2: ✅ Recommended (Move Forward)

**What it means:**
- AI evaluated with Performance Profile
- Recommendation: **INTERVIEW** (Score 85-100) OR **PHONE SCREEN** (Score 70-84)
- Matches must-have requirements
- Shows positive trajectory/achievements
- Recruiter should pursue this candidate

**Visual Design:**
- Badge: `✅ Recommended 92/100`
- Background: `bg-green-100`
- Text: `text-green-700`
- Border: `border-green-300`
- Sub-badge: `INTERVIEW` or `PHONE SCREEN`

**Actions Available:**
- [View Resume]
- [View Evaluation] (detailed AI reasoning)
- [Add Context] (phone screen, interview notes)
- [Schedule Interview]
- [Re-evaluate]

---

### Status 3: ❌ Not Recommended (Don't Pursue)

**What it means:**
- AI evaluated with Performance Profile
- Recommendation: **DECLINE** (Score 0-69)
- Missing critical must-have requirements
- Red flags present (dealbreakers)
- Weak trajectory or irrelevant experience
- Recruiter should skip this candidate

**Visual Design:**
- Badge: `❌ Not Recommended 58/100`
- Background: `bg-gray-100`
- Text: `text-gray-600`
- Border: `border-gray-300`
- Sub-text: Reason (e.g., "Missing CPA requirement")

**Actions Available:**
- [View Resume]
- [View Evaluation] (see why AI declined)
- [Re-evaluate] (if criteria changed)
- Checkbox for bulk delete

---

## Wireframes

### Candidate List with Three Statuses

```
┌─────────────────────────────────────────────────────────────────┐
│ Senior Software Engineer - Q4 2025                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 50       │ │ 15       │ │ 9        │ │ 6        │          │
│  │Candidates │ │ Evaluated ││Recommended││Not Rec.  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌─── Candidates (50) ──────────────────────────────────────┐  │
│  │ [Search...] [Filter: All (50) ▼] [Sort: Score ▼]        │  │
│  │                                                           │  │
│  │ 10 selected  [Evaluate Selected (10)] [Deselect All]     │  │
│  │              Est. cost: $0.04                             │  │
│  │                                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │☑ John Doe                   ⭐ Not Evaluated         │  │  │
│  │ │  Software Engineer @ Google • 7 years               │  │  │
│  │ │  Skills: React, TypeScript, Node.js, AWS            │  │  │
│  │ │  [View Resume] [Evaluate]                           │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │☑ Jane Smith              ✅ Recommended 92/100       │  │  │
│  │ │  Senior Developer @ Meta • 5 years                  │  │  │
│  │ │  Skills: React, Vue, Python                         │  │  │
│  │ │  Recommendation: INTERVIEW                          │  │  │
│  │ │  [View Resume] [View Evaluation] [Schedule]         │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │☐ Bob Johnson            ❌ Not Recommended 58/100    │  │  │
│  │ │  Junior Dev @ Startup • 2 years                     │  │  │
│  │ │  Skills: JavaScript, HTML, CSS                      │  │  │
│  │ │  Recommendation: DECLINE                            │  │  │
│  │ │  Reason: Insufficient experience for senior role    │  │  │
│  │ │  [View Resume] [View Evaluation]                    │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │ ... (47 more candidates)                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Filter Dropdown

```
┌────────────────────────────┐
│ Filter: All (50) ▼         │
├────────────────────────────┤
│ ✓ All (50)                 │
│ ○ Not Evaluated (35)       │
│ ○ Recommended (9)          │
│ ○ Not Recommended (6)      │
│ ────────────────────       │
│ ○ Shortlisted (3)          │
└────────────────────────────┘
```

### Bulk Selection Bar

```
┌────────────────────────────────────────────────────────┐
│ 10 selected                                            │
│ [Evaluate Selected (10)] [Deselect All]                │
│ Est. cost: $0.04 (10 × $0.004)  •  Time: ~30 seconds  │
└────────────────────────────────────────────────────────┘
```

### Confirmation Modal

```
┌────────────────────────────────────────────────────┐
│ Evaluate 10 Candidates?                       [×] │
├────────────────────────────────────────────────────┤
│                                                    │
│ You're about to evaluate:                          │
│ • John Doe                                         │
│ • Alice Chen                                       │
│ • Mike Brown                                       │
│ • Sarah Lee                                        │
│ • David Kim                                        │
│ ... and 5 more                                     │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ Estimated Cost:    $0.04                     │  │
│ │ Estimated Time:    ~30 seconds               │  │
│ │ Provider:          Claude 3.5 Haiku          │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ☐ Auto-filter to "Recommended" after evaluation   │
│                                                    │
│ ┌──────────┐  ┌──────────────┐                    │
│ │ Cancel   │  │ Evaluate Now │                    │
│ └──────────┘  └──────────────┘                    │
└────────────────────────────────────────────────────┘
```

---

## Candidate Detail Page

### With Evaluation v1 (Resume Only)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Project                   [Re-evaluate] [⋮ Menu] │
├─────────────────────────────────────────────────────────────┤
│ Jane Smith                              ✅ Recommended      │
│ Senior Developer @ Meta                                     │
│                                                             │
│ ┌─ Current Evaluation (v1 - Nov 9) ──────────────────────┐ │
│ │ Score: 92/100                                           │ │
│ │ Recommendation: INTERVIEW                               │ │
│ │ Based on: Resume only                                   │ │
│ │                                                         │ │
│ │ Key Strengths:                                          │ │
│ │ • 5+ years React and TypeScript experience              │ │
│ │ • Led team of 3 engineers at Meta                       │ │
│ │ • Built user dashboard from scratch (100k+ users)       │ │
│ │                                                         │ │
│ │ Concerns:                                               │ │
│ │ • Limited Node.js backend experience                    │ │
│ │ • No AWS cloud infrastructure work                      │ │
│ │                                                         │ │
│ │ Requirements Match:                                     │ │
│ │ Must-Haves: 4/4 ✓  Nice-to-Haves: 2/3                  │ │
│ │                                                         │ │
│ │ [View Full Evaluation] [View Evaluation History]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Candidate Package ─────────────────────────────────────┐ │
│ │ [Resume] [Evaluations] [Context] [Notes] [All]          │ │
│ │                                                         │ │
│ │ 📄 Resume (Nov 9, 2025)                                 │ │
│ │ [View PDF] [Download]                                  │ │
│ │                                                         │ │
│ │ 🤖 AI Evaluation v1 (Nov 9 - Resume only)               │ │
│ │ Score: 92/100 → INTERVIEW                              │ │
│ │ [View Details]                                         │ │
│ │                                                         │ │
│ │ [+ Add Phone Screen] [+ Add Interview] [+ Add Note]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Actions ───────────────────────────────────────────────┐ │
│ │ [Schedule Interview] [Add to Shortlist] [Re-evaluate]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### With Evaluation v2 (After Phone Screen)

```
┌─────────────────────────────────────────────────────────────┐
│ Jane Smith                              ✅ Recommended      │
│ Senior Developer @ Meta                                     │
│                                                             │
│ ┌─ Current Evaluation (v2 - Nov 12) ──────────────────────┐ │
│ │ Score: 95/100 (↑ from 92)                                │ │
│ │ Recommendation: INTERVIEW (STRONG)                      │ │
│ │ Based on: Resume + Phone Screen                         │ │
│ │                                                         │ │
│ │ What changed since v1:                                  │ │
│ │ "Phone screen revealed she led the exact migration     │ │
│ │  project we need. Also has AWS cert, not on resume."   │ │
│ │                                                         │ │
│ │ [View Full Evaluation] [View Evaluation History (2)]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Candidate Package ─────────────────────────────────────┐ │
│ │ [Resume] [Evaluations] [Context] [Notes] [All]          │ │
│ │                                                         │ │
│ │ 📄 Resume (Nov 9)                                       │ │
│ │                                                         │ │
│ │ 🤖 AI Evaluation v1 (Nov 9 - Resume only)               │ │
│ │ Score: 92/100 → INTERVIEW                              │ │
│ │                                                         │ │
│ │ 📞 Phone Screen Notes (Nov 12)                          │ │
│ │ Added by: Sarah Johnson                                │ │
│ │ "Great culture fit. Led AWS migration at Meta that     │ │
│ │  scaled to 1M+ users - exactly what we need. Has AWS   │ │
│ │  Solutions Architect cert (not on resume). Salary:     │ │
│ │  $175k current, $190k target."                         │ │
│ │ [Edit]                                                 │ │
│ │                                                         │ │
│ │ 🤖 AI Evaluation v2 (Nov 12 - With phone screen)        │ │
│ │ Score: 95/100 (↑ from 92) → INTERVIEW (STRONG)         │ │
│ │ Upgrade reason: AWS migration experience + cert        │ │
│ │ [View Details]                                         │ │
│ │                                                         │ │
│ │ [+ Add Interview] [+ Add Note]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Add Context Modal

```
┌────────────────────────────────────────────────────┐
│ Add Context to Jane Smith                     [×] │
├────────────────────────────────────────────────────┤
│                                                    │
│ Context Type:                                      │
│ ● Phone Screen  ○ Interview  ○ Reference Check    │
│ ○ Portfolio Review  ○ Note                         │
│                                                    │
│ Date:                                              │
│ ┌──────────────┐                                   │
│ │ Nov 12, 2025 │                                   │
│ └──────────────┘                                   │
│                                                    │
│ Notes/Feedback:                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Great culture fit. Led AWS migration at Meta   │ │
│ │ that scaled to 1M+ users - exactly what we     │ │
│ │ need. Has AWS Solutions Architect cert (not    │ │
│ │ on resume). Salary: $175k current, $190k       │ │
│ │ target.                                        │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ ☑ Re-evaluate candidate with this new context     │
│   (Additional AI analysis: +$0.004)                │
│                                                    │
│ ┌──────────┐  ┌──────────────┐                    │
│ │ Cancel   │  │ Add & Evaluate│                    │
│ └──────────┘  └──────────────┘                    │
└────────────────────────────────────────────────────┘
```

---

## Evaluation History Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ Evaluation History for Jane Smith                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ●─── v3 (Nov 15, 2025) - CURRENT                           │
│  │    Score: 95/100 → INTERVIEW (STRONG)                   │
│  │    Based on: Resume + Phone Screen + Interview          │
│  │    What changed: Confirmed leadership ability in        │
│  │    interview, addresses earlier concern                 │
│  │    [View Details]                                       │
│  │                                                         │
│  ●─── v2 (Nov 12, 2025)                                     │
│  │    Score: 95/100 (↑ from 92) → INTERVIEW (STRONG)       │
│  │    Based on: Resume + Phone Screen                      │
│  │    What changed: AWS migration experience discovered    │
│  │    [View Details]                                       │
│  │                                                         │
│  ●─── v1 (Nov 9, 2025)                                      │
│       Score: 92/100 → INTERVIEW                            │
│       Based on: Resume only                                │
│       Initial evaluation from resume upload                │
│       [View Details]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Profile Changed Alert

```
┌────────────────────────────────────────────────────────────┐
│ Performance Profile Updated                            [×] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ You've changed the evaluation criteria for this project.  │
│                                                            │
│ What Changed:                                              │
│ • Year 1 Outcome: "Build new marketing team"              │
│   → "Rebuild struggling marketing team"                   │
│ • Must-Have Added: "Change management experience"         │
│ • Context Updated: "Need urgent turnaround expertise"     │
│                                                            │
│ This affects: 15 evaluated candidates                      │
│                                                            │
│ Would you like to re-rank all candidates with the new     │
│ criteria? This will create new evaluations (v2) for all.  │
│                                                            │
│ ⚠️  Cost: ~$0.06 (15 candidates × $0.004)                  │
│                                                            │
│ ┌──────────────┐  ┌──────────────┐                        │
│ │ Skip for Now │  │ Re-rank All  │                        │
│ └──────────────┘  └──────────────┘                        │
└────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Candidates Table

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Resume Data
  resume_text TEXT,
  resume_file_url VARCHAR(500),
  resume_file_name VARCHAR(255),
  cover_letter TEXT,

  -- Current Position
  current_title VARCHAR(255),
  current_company VARCHAR(255),
  years_experience DECIMAL(4,1),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),

  -- Parsed Data
  skills JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,

  -- THREE-STATUS SYSTEM
  evaluation_status VARCHAR(50) DEFAULT 'pending',
  -- Values: 'pending', 'evaluating', 'evaluated', 'failed'

  recommendation VARCHAR(50),
  -- Values: NULL (not evaluated), 'INTERVIEW', 'PHONE_SCREEN', 'DECLINE'

  score DECIMAL(5,2),
  -- 0-100 score from AI

  evaluated_at TIMESTAMP,
  evaluation_count INTEGER DEFAULT 0,
  -- Number of times re-evaluated (versions)

  -- Manual Overrides
  shortlisted BOOLEAN DEFAULT false,
  recruiter_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_evaluation_status ON candidates(evaluation_status);
CREATE INDEX idx_candidates_recommendation ON candidates(recommendation);
CREATE INDEX idx_candidates_score ON candidates(score DESC);
```

### Evaluations Table (Versioned)

```sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version Tracking
  version INTEGER NOT NULL,
  -- 1, 2, 3... (increments with each re-evaluation)

  -- Results
  recommendation VARCHAR(50) NOT NULL,
  -- 'INTERVIEW', 'PHONE_SCREEN', 'DECLINE'

  score DECIMAL(5,2) NOT NULL,
  -- 0-100

  -- Detailed Analysis
  strengths JSONB DEFAULT '[]'::jsonb,
  -- Array of strength descriptions

  concerns JSONB DEFAULT '[]'::jsonb,
  -- Array of concern descriptions

  requirements_match JSONB DEFAULT '{}'::jsonb,
  -- { must_haves: 4, must_haves_total: 4, nice_to_haves: 2, nice_to_haves_total: 3 }

  reasoning TEXT,
  -- Detailed explanation of recommendation

  -- Context Included
  context_included JSONB DEFAULT '[]'::jsonb,
  -- ['resume', 'phone_screen', 'interview', 'reference']
  -- Tracks what information was considered

  -- LLM Metadata
  llm_provider VARCHAR(50),
  -- 'anthropic' or 'openai'

  llm_model VARCHAR(100),
  -- 'claude-3-5-haiku-20241022' or 'gpt-4o-mini'

  tokens_input INTEGER,
  tokens_output INTEGER,
  cost DECIMAL(10,4),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_job_id ON evaluations(job_id);
CREATE INDEX idx_evaluations_version ON evaluations(version);
```

### Candidate Context Table

```sql
CREATE TABLE candidate_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Context Type
  context_type VARCHAR(50) NOT NULL,
  -- 'phone_screen', 'interview', 'reference', 'portfolio', 'note'

  content TEXT NOT NULL,
  -- The actual notes/feedback

  added_by VARCHAR(255),
  -- Recruiter name

  context_date DATE,
  -- Date of phone screen/interview (may differ from created_at)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_candidate_context_candidate_id ON candidate_context(candidate_id);
CREATE INDEX idx_candidate_context_type ON candidate_context(context_type);
```

---

## Component Hierarchy

```
ProjectDetailPage
├── ProjectHeader
│   ├── BackButton
│   ├── ProjectTitle
│   └── ActionMenu
│
├── StatsCards
│   ├── TotalCandidatesCard
│   ├── EvaluatedCard
│   ├── RecommendedCard
│   └── NotRecommendedCard
│
├── CandidateList
│   ├── SearchBar
│   ├── FilterDropdown
│   ├── SortDropdown
│   ├── BulkSelectionBar (conditional)
│   └── CandidateCard[] (repeated)
│       ├── Checkbox
│       ├── StatusBadge
│       ├── CandidateInfo
│       └── ActionButtons
│
└── Modals (conditional)
    ├── EvaluateConfirmationModal
    ├── AddContextModal
    └── PerformanceProfileChangedModal

CandidateDetailPage
├── BackButton
├── CandidateHeader
│   ├── CandidateName
│   ├── CurrentPosition
│   └── StatusBadge
│
├── CurrentEvaluationCard
│   ├── Score
│   ├── Recommendation
│   ├── KeyStrengths
│   ├── Concerns
│   └── RequirementsMatch
│
├── CandidatePackage
│   ├── TabNavigation
│   └── PackageContent
│       ├── ResumeSection
│       ├── EvaluationsTimeline
│       ├── ContextList
│       └── NotesSection
│
└── ActionBar
    ├── ScheduleButton
    ├── ShortlistButton
    ├── AddContextButton
    └── ReEvaluateButton
```

---

## Implementation Priority

### Phase 1: Three-Status Foundation (Week 1)
- [ ] Add evaluation_status, recommendation, score columns to candidates table
- [ ] Create evaluations table (versioned)
- [ ] Create candidate_context table
- [ ] Update React Query hooks (useJobs, useCandidates)
- [ ] Create CandidateCard component with three status badges

### Phase 2: Selective Evaluation (Week 1-2)
- [ ] Checkbox selection on candidate cards
- [ ] BulkSelectionBar component
- [ ] EvaluateConfirmationModal component
- [ ] Bulk evaluation API endpoint
- [ ] Cost estimation logic
- [ ] Filter by status (All, Not Evaluated, Recommended, Not Recommended)

### Phase 3: Candidate Detail & Context (Week 2)
- [ ] CandidateDetailPage component
- [ ] Evaluation display (current version)
- [ ] AddContextModal component
- [ ] Save context to candidate_context table
- [ ] Re-evaluation trigger

### Phase 4: Versioned Evaluations (Week 2-3)
- [ ] Evaluation history timeline
- [ ] Show what changed between versions
- [ ] Version comparison view
- [ ] Performance Profile change detection
- [ ] Bulk re-ranking flow

---

**End of Document**
