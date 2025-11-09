# Product Requirements Document (PRD)
## Resume Scanner Pro - AI-Powered Recruiter Shortlisting Tool

**Version:** 2.0
**Last Updated:** November 9, 2025
**Status:** Active Development

---

## 1. Product Vision

### What It Is
**Resume Scanner Pro is an AI-powered resume evaluation tool for corporate and agency recruiters.** It helps recruiters quickly shortlist candidates from batches of 10-50 resumes using Lou Adler's Performance-Based Hiring methodology, regardless of where those resumes came from.

### What It Is NOT
❌ **Not an ATS** - Does not replace Oracle Recruiting Cloud, Workday, Greenhouse, etc.
❌ **Not a job board** - Does not post jobs or collect applications
❌ **Not an applicant tracking system** - Does not manage hiring pipelines
❌ **Not integrated with HRIS** - Standalone tool, no Oracle/Workday integration
❌ **Not a candidate database** - Projects are temporary, focused on active searches

### Core Value Proposition
**"From 50 resumes to 5 interviews in 10 minutes, with better quality than manual screening."**

Using AI trained on Lou Adler's Performance-Based Hiring methodology, recruiters get:
- **60% time savings** - 10 min vs 3+ hours for 30 resumes
- **Higher quality shortlists** - Focus on outcomes/trajectory, not just keywords
- **Cost-effective** - $0.003-0.005 per evaluation, selective evaluation to control costs
- **Works with any source** - Oracle downloads, email attachments, LinkedIn PDFs, career fair resumes

---

## 2. User Personas

### Primary Persona: Corporate Recruiter (Sarah)
**Context:**
- Works at mid-size company (500-5000 employees)
- Uses Oracle Recruiting Cloud or Workday
- Fills 5-10 roles simultaneously
- Receives 20-50 resumes per role

**Pain Points:**
- Spends 3-5 hours manually screening resumes per role
- Keyword matching misses transferable experience
- Hiring managers reject shortlists: "These don't match what I need"
- Can't articulate what "good" looks like beyond job description

**How She Uses Resume Scanner Pro:**
1. Creates project: "Senior Software Engineer - Q4 2025"
2. Answers 8 Performance Profile questions (5-8 minutes)
3. Downloads 30 resumes from Oracle
4. Uploads all 30 to Resume Scanner Pro
5. Selects 10 most promising → AI evaluates
6. Reviews AI rankings, adds phone screen notes
7. Presents top 5 to hiring manager with AI justification

**Success Metrics:**
- Shortlist time: 10 minutes vs 3 hours previously
- Hiring manager acceptance: 80% vs 50% previously
- Time to fill: Reduced by 30%

---

### Secondary Persona: Agency Recruiter (Marcus)
**Context:**
- Works at recruiting agency
- Clients send job descriptions via email
- Sources candidates from LinkedIn, referrals, job boards
- Paid on placement, speed matters

**Pain Points:**
- Client job descriptions are vague ("rockstar developer")
- Needs to present 5 qualified candidates fast
- Can't afford to waste time on mismatched candidates
- No ATS, uses email and spreadsheets

**How He Uses Resume Scanner Pro:**
1. Client sends job description
2. Creates project, builds Performance Profile from client call
3. Sources 25 candidates from LinkedIn
4. Uploads all 25 resumes
5. Selects 15 → AI evaluates
6. Filters to "Recommended (8)"
7. Calls top 8, adds phone screen notes
8. Re-evaluates with phone context
9. Presents top 5 to client with AI analysis

**Success Metrics:**
- Client presentation: 1 day vs 3 days previously
- Client acceptance rate: 70% vs 40% previously
- Placements per month: +50%

---

### Tertiary Persona: Hiring Manager (David)
**Context:**
- Engineering Director at university
- Works with HR recruiter
- Frustrated with mismatched candidate slates
- Knows what good looks like but can't articulate it

**How He Uses Resume Scanner Pro:**
1. HR asks him 8 Performance Profile questions
2. Reviews AI evaluations with HR recruiter
3. Understands why candidates were recommended
4. Adds interview feedback after interviews
5. AI re-ranks with interview context

**Success Metrics:**
- Candidate quality: Much better match to actual needs
- Interview efficiency: Fewer wasted interview slots
- Confidence in hiring decisions: Higher

---

## 3. Core Workflow

### End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE PROJECT                                           │
│    → Enter project name (e.g., "Senior Engineer - Q4 2025") │
│    → Answer 8 Performance Profile questions                 │
│    → Define what "success" looks like for this role         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. UPLOAD RESUMES (from any source)                         │
│    → Drag-drop 10-50 resumes (PDF, DOCX, TXT)              │
│    → From Oracle/Workday exports                            │
│    → From email attachments                                 │
│    → From LinkedIn downloads                                │
│    → From career fair collections                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SELECTIVE EVALUATION                                     │
│    → All 50 resumes parsed and shown                        │
│    → Recruiter scans names/titles                           │
│    → Selects 10 promising candidates via checkboxes         │
│    → Clicks "Evaluate Selected (10)"                        │
│    → AI evaluates only those 10 (cost control)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. VIEW RANKINGS & TRIAGE                                   │
│    → 6 candidates: ✅ Recommended (Interview/Phone Screen)  │
│    → 4 candidates: ❌ Not Recommended (Decline)              │
│    → Filter to "Recommended" to focus                       │
│    → Review AI reasoning for each                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SHORTLIST & ADD CONTEXT                                  │
│    → Phone screen top 6 recommended candidates              │
│    → Add phone screen notes to candidate packages           │
│    → AI re-evaluates with phone context                     │
│    → Some scores go up, some down based on new info         │
│    → Select top 3 for hiring manager                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. INTERVIEWS & CONTINUOUS REFINEMENT                       │
│    → Hiring manager interviews top 3                        │
│    → Recruiter adds interview feedback                      │
│    → AI re-evaluates with interview context                 │
│    → If needed: Evaluate more from original 50              │
│    → Or upload new batch of resumes                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. HIRE OR ITERATE                                          │
│    → Strong candidate hired ✓                               │
│    → OR Performance Profile needs adjustment                │
│    → Update PP criteria → Re-rank all candidates            │
│    → Some candidates move up/down with new criteria         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Features

### 4.1 Project Management

**What is a "Project"?**
- One project = One job opening being filled
- Contains: Performance Profile + Candidates + Evaluations
- Lifecycle: Active search → Hire made → Archive project
- Examples: "Senior Engineer - Q4 2025", "CFO Search - Winter 2026"

**Project Creation:**
- Project name/title
- 8-question Performance Profile (Lou Adler methodology)
- Optional: Basic metadata (department, location) for reference only

**Project States:**
- **Open** - Active search, evaluating candidates
- **On Hold** - Search paused (budget freeze, internal candidate, etc.)
- **Closed** - Hire made
- **Archived** - Historical record

---

### 4.2 Performance Profile (Lou Adler Methodology)

**8 Questions That Define Success:**

1. **Year 1 Outcomes** - What needs to be accomplished?
2. **Biggest Challenge** - What's the hardest obstacle?
3. **Comparable Experience** - What experience proves they can do this?
4. **Dealbreakers** - What causes catastrophic failure?
5. **Motivation Fit** - What energizes top performers?
6. **Must-Haves vs Nice-to-Haves** - What's required vs. preferred?
7. **Trajectory Pattern** - What career progression predicts success?
8. **Context** - Any special organizational/role context?

**Why This Matters:**
- Traditional JDs focus on duties; Performance Profiles focus on outcomes
- AI evaluates candidates against success criteria, not just keywords
- Transferable experience recognized (e.g., healthcare audit → higher ed audit)
- Trajectory analysis (upward career progression vs. lateral moves)

**Time Investment:**
- Questions: 5-8 minutes to answer
- AI generates structured screening criteria
- ROI: 60% time savings on screening

---

### 4.3 Resume Upload & Parsing

**Supported Sources:**
- **ATS Exports** - Oracle Recruiting Cloud, Workday, Greenhouse bulk exports
- **Email Attachments** - Resumes from hiring managers, referrals
- **LinkedIn** - Downloaded candidate profiles
- **Career Fairs** - Batch uploads from events
- **Any PDF/DOCX/TXT** - No integration required

**Upload Flow:**
1. Drag-drop or browse to select files
2. Supports 10-50 resumes per batch
3. AI extracts text from PDFs/DOCX
4. Validates file format and quality
5. Shows success/error for each file
6. All resumes visible immediately (status: "Not Evaluated")

**File Support:**
- PDF (most common)
- DOCX (Microsoft Word)
- TXT (plain text)
- Max size: 10MB per file

---

### 4.4 Selective Evaluation (Cost Control)

**Three-Status System:**

1. **⭐ Not Evaluated** (Pending)
   - Resume uploaded and parsed
   - No AI evaluation yet
   - No cost incurred
   - Recruiter can evaluate anytime

2. **✅ Recommended** (Move Forward)
   - AI evaluated
   - Recommendation: INTERVIEW or PHONE SCREEN
   - Score: Typically 75-100
   - Reason: Matches Performance Profile criteria

3. **❌ Not Recommended** (Don't Pursue)
   - AI evaluated
   - Recommendation: DECLINE
   - Score: Typically 0-70
   - Reason: Missing must-haves or red flags present

**Selective Evaluation Flow:**
1. Upload 50 resumes → All show "⭐ Not Evaluated"
2. Recruiter scans names/titles/companies
3. Selects 15 promising candidates (checkboxes)
4. Clicks "Evaluate Selected (15)"
5. Confirmation: "Est. cost: $0.06 (15 × $0.004)"
6. AI evaluates only those 15
7. Results: 9 Recommended, 6 Not Recommended
8. Recruiter filters to "Recommended (9)" to focus

**Cost Optimization:**
- Only pay for evaluations you need
- Evaluate in batches as needed (15 now, 10 more later)
- Average: $0.003-0.005 per candidate
- Example: 50 candidates, evaluate 20 = $0.08 total

---

### 4.5 AI Evaluation Engine

**How AI Evaluates Resumes:**

**Input:**
- Performance Profile (8 questions answered)
- Candidate resume (parsed text)

**AI Analysis (7 Criteria):**
1. **Achievement Match** - Resume shows accomplishments similar to Year 1 outcomes?
2. **Challenge Evidence** - Candidate overcame similar obstacles?
3. **Experience Relevance** - Comparable experience patterns (not just keywords)?
4. **Red Flags** - Any dealbreakers present?
5. **Motivation Alignment** - Career moves suggest right motivations?
6. **Trajectory Analysis** - Upward career progression?
7. **Context Fit** - Background aligns with organizational context?

**Output:**
- **Score:** 0-100 (weighted across 7 criteria)
- **Recommendation:** INTERVIEW (85+), PHONE SCREEN (70-84), DECLINE (<70)
- **Strengths:** 3-5 key strengths with evidence from resume
- **Concerns:** 2-3 concerns or gaps
- **Requirements Match:** X/Y must-haves, X/Y nice-to-haves
- **Reasoning:** Detailed justification for recommendation

**Example Evaluation:**

```
JOHN DOE - Score: 92/100
Recommendation: INTERVIEW

Key Strengths:
• Led comprehensive risk assessment at Johns Hopkins (25 departments)
  → Directly matches Year 1 outcome
• Promoted 3x in 6 years (Auditor → Senior → Manager → Director)
  → Shows upward trajectory pattern
• Presented audit findings to board/C-suite regularly
  → Evidence of overcoming political challenge

Concerns:
• No higher education experience (all healthcare)
  → Transferable but may need cultural onboarding
• Limited data analytics tool experience
  → Nice-to-have, can be developed

Requirements Match: 4/4 must-haves, 1/3 nice-to-haves

Reasoning: Strong match for Chief Internal Auditor role. Healthcare audit
experience is highly transferable to higher ed. Demonstrated all critical
competencies: building audit functions, navigating complex politics,
progressive leadership. Slight learning curve on higher ed culture, but
mission-driven career moves suggest strong cultural fit.
```

---

### 4.6 Candidate Package (Living Document)

**What's in a Candidate Package?**

A candidate package is a **growing file** that includes:
- Original materials (resume, cover letter)
- AI evaluations (versioned - v1, v2, v3)
- Human context (recruiter notes, interview feedback)
- Timeline of changes

**Package Evolution:**

**Day 1: Upload**
```
📄 Resume (uploaded)
Status: ⭐ Not Evaluated
```

**Day 2: Initial Evaluation**
```
📄 Resume
🤖 AI Evaluation v1 (resume only)
   Score: 85/100
   Recommendation: PHONE SCREEN
Status: ✅ Recommended
```

**Day 5: After Phone Screen**
```
📄 Resume
🤖 AI Evaluation v1 (85/100 - PHONE SCREEN)
📞 Phone Screen Notes
   "Revealed he led the exact migration we need. Salary: $180k"
🤖 AI Evaluation v2 (92/100 - INTERVIEW) ← UPGRADED
   What changed: Migration leadership experience discovered
Status: ✅ Recommended
```

**Day 8: After Interview**
```
📄 Resume
🤖 AI Evaluation v1 (85/100)
📞 Phone Screen Notes
🤖 AI Evaluation v2 (92/100)
🎤 Interview Feedback
   "Strong technical. Leadership examples thin - mostly IC work."
🤖 AI Evaluation v3 (88/100 - INTERVIEW 2nd round) ← ADJUSTED
   What changed: Leadership concern noted
Status: ✅ Recommended (with caveat)
```

---

### 4.7 Re-evaluation Triggers

**Why Re-evaluate?**
- New information discovered (phone screen, interview, reference)
- Candidate provides additional materials (portfolio, work samples)
- Performance Profile criteria changed
- Recruiter wants fresh analysis

**Three Types of Re-evaluation:**

**1. Individual Re-evaluation (With New Context)**
- Recruiter adds phone screen notes
- Clicks "Re-evaluate with new context"
- AI analyzes: Resume + Phone screen notes
- Score may go up or down
- Creates Evaluation v2

**2. Bulk Re-ranking (Performance Profile Changed)**
- Recruiter updates Performance Profile
- Year 1 outcome changed: "Build team" → "Rebuild struggling team"
- Alert: "Performance Profile changed. Re-rank all candidates?"
- AI re-evaluates all evaluated candidates with new criteria
- Some candidates move up, others move down

**3. On-Demand Re-evaluation**
- Recruiter clicks "Re-evaluate" on candidate detail
- AI generates fresh evaluation with current Performance Profile
- Useful if PP was refined after initial evaluation

---

### 4.8 Filtering & Search

**Filter Options:**
- **All** - Show all candidates (uploaded + evaluated)
- **Not Evaluated** - Only candidates pending evaluation
- **Recommended** - Only INTERVIEW + PHONE SCREEN recommendations
- **Not Recommended** - Only DECLINE recommendations
- **Shortlisted** - Manually marked by recruiter

**Search:**
- Name
- Current company
- Skills/keywords in resume
- Email

**Sort:**
- Score (high to low)
- Name (alphabetical)
- Date added (newest/oldest)
- Company
- Years of experience

---

## 5. Technical Architecture

### 5.1 Database Schema

**Jobs Table:**
```sql
- id (UUID)
- title (VARCHAR) - "Senior Software Engineer - Q4 2025"
- performance_profile (JSONB) - 8 questions answered
- user_id (UUID) - Owner
- status (VARCHAR) - open, on_hold, closed, archived
- created_at, updated_at
```

**Candidates Table:**
```sql
- id (UUID)
- job_id (UUID) - FK to jobs
- user_id (UUID) - Owner
- full_name (VARCHAR)
- email (VARCHAR)
- resume_text (TEXT) - Extracted from PDF
- resume_file_url (VARCHAR) - Supabase Storage
- current_title (VARCHAR)
- current_company (VARCHAR)
- years_experience (DECIMAL)
- skills (JSONB array)
- evaluation_status (VARCHAR) - pending, evaluating, evaluated, failed
- recommendation (VARCHAR) - NULL, INTERVIEW, PHONE_SCREEN, DECLINE
- score (DECIMAL) - 0-100
- evaluated_at (TIMESTAMP)
- evaluation_count (INTEGER) - Number of times re-evaluated
- created_at, updated_at
```

**Evaluations Table (Versioned):**
```sql
- id (UUID)
- candidate_id (UUID)
- job_id (UUID)
- user_id (UUID)
- version (INTEGER) - 1, 2, 3...
- recommendation (VARCHAR) - INTERVIEW, PHONE_SCREEN, DECLINE
- score (DECIMAL) - 0-100
- strengths (JSONB array)
- concerns (JSONB array)
- requirements_match (JSONB)
- reasoning (TEXT)
- context_included (JSONB) - What was considered (resume, phone, interview)
- llm_provider (VARCHAR) - anthropic, openai
- llm_model (VARCHAR) - claude-3-5-haiku-20241022
- tokens_input, tokens_output, cost
- created_at
```

**Candidate Context Table:**
```sql
- id (UUID)
- candidate_id (UUID)
- user_id (UUID)
- context_type (VARCHAR) - phone_screen, interview, reference, note
- content (TEXT)
- added_by (VARCHAR) - Recruiter name
- created_at, updated_at
```

---

### 5.2 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- React Query (server state)
- Zustand (client state)

**Backend:**
- Python 3.13 serverless functions (Vercel)
- pdfplumber (PDF text extraction)
- anthropic SDK (Claude API)
- openai SDK (GPT-4o optional)

**Database:**
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS) for multi-tenancy

**AI:**
- Claude 3.5 Haiku (primary, $0.003/eval)
- OpenAI GPT-4o Mini (optional, $0.005/eval)

---

### 5.3 API Endpoints

**Evaluate Candidates:**
```python
POST /api/evaluate_candidates
{
  "job_id": "uuid",
  "candidate_ids": ["uuid1", "uuid2", "uuid3"],
  "provider": "anthropic",
  "model": "claude-3-5-haiku-20241022",
  "include_context": true  # Include phone/interview notes
}

Response:
{
  "evaluations": [
    {
      "candidate_id": "uuid1",
      "score": 92,
      "recommendation": "INTERVIEW",
      "version": 2,
      ...
    }
  ],
  "total_cost": 0.012,
  "total_time": 8.4
}
```

**Parse Resume:**
```python
POST /api/parse_resume
{
  "file": <binary>,
  "filename": "john_doe_resume.pdf"
}

Response:
{
  "text": "John Doe\nSoftware Engineer...",
  "metadata": {
    "pages": 2,
    "size": 1024000,
    "format": "pdf"
  }
}
```

---

## 6. Success Metrics

### User Engagement
- **Projects created per user:** Target: 5/month (active recruiter)
- **Resumes uploaded per project:** Target: 20-40
- **Evaluation rate:** Target: 50% of uploaded resumes evaluated
- **Re-evaluation rate:** Target: 20% of candidates re-evaluated

### Time Savings
- **Time to shortlist:** Target: <10 minutes for 30 resumes
- **vs. Manual screening:** 3+ hours → 60% time savings

### Quality
- **Hiring manager acceptance:** Target: 75%+ accept AI shortlist
- **Interview-to-hire ratio:** Target: 1:3 (33% of interviews result in hire)

### Business
- **Monthly Active Users (MAU):** Target: 500 recruiters
- **Evaluations per month:** Target: 50,000
- **Revenue:** $0.01/evaluation → $500/month (cost + margin)

---

## 7. Feature Roadmap

### Phase 1: MVP (Current)
- ✅ Dashboard with projects
- ✅ Project creation
- ✅ Basic job fields
- 🔄 Performance Profile builder (8 questions)
- 🔄 Resume upload and parsing
- 🔄 Selective evaluation (checkboxes)
- 🔄 Three-status system (Not Evaluated, Recommended, Not Recommended)
- 🔄 AI evaluation with Performance Profile
- 🔄 Candidate detail view

### Phase 2: Context & Re-evaluation (Next)
- Add context (phone screen, interview, notes)
- Versioned evaluations (v1, v2, v3)
- Re-evaluation with new context
- Performance Profile updates trigger re-ranking
- Evaluation history timeline

### Phase 3: Interview Guides (Future)
- Generate interview guides from Performance Profile
- Behavioral questions mapped to Year 1 outcomes
- Scorecard templates
- Interview feedback capture

### Phase 4: Team Collaboration (Future)
- Share projects with hiring managers
- Comment threads on candidates
- @mention team members
- Activity feed

### Phase 5: Analytics & Insights (Future)
- Time-to-hire metrics
- Source effectiveness (LinkedIn vs. referrals)
- AI accuracy tracking (accepted vs. rejected recommendations)
- Performance Profile templates library

---

## 8. Out of Scope (Explicitly NOT Building)

❌ **ATS Integration** - No Oracle/Workday/Greenhouse webhooks or APIs
❌ **Job Posting** - No job board publishing
❌ **Applicant Portal** - No candidate-facing application system
❌ **Email Automation** - No automated candidate outreach
❌ **Offer Management** - No offer letters, background checks, onboarding
❌ **Pipeline Tracking** - No multi-stage hiring pipelines
❌ **Candidate Database** - No long-term candidate storage
❌ **Chrome Extension** - No LinkedIn scraping plugin

**Why?**
- Focus on core value: Fast, high-quality shortlisting
- Avoid competing with established ATS players
- Partner with ATS systems, don't replace them
- Recruiter power tool, not full hiring suite

---

## 9. Competitive Advantage

### Why Resume Scanner Pro Wins

**1. Lou Adler Methodology**
- Only tool using proven Performance-Based Hiring
- Focus on outcomes, not duties
- Trajectory analysis (career progression)
- vs. Competitors: Dumb keyword matching

**2. Selective Evaluation (Cost Control)**
- Upload 50, evaluate 10
- Pay only for what you need
- vs. Competitors: Must evaluate all, expensive

**3. Works with Any Source**
- No ATS integration required
- Email, LinkedIn, career fairs, Oracle exports
- vs. Competitors: Locked to specific ATS

**4. Living Candidate Packages**
- Context evolves (phone screens, interviews)
- AI re-evaluates with new information
- Versioned evaluations show progression
- vs. Competitors: One-shot evaluation, static

**5. Transparent AI Reasoning**
- Shows why candidates recommended
- Evidence from resume quoted
- vs. Competitors: Black box scores

---

## 10. Risks & Mitigations

### Risk 1: AI Quality
**Risk:** AI recommends poor candidates, hiring managers lose trust
**Mitigation:**
- Start with Lou Adler methodology (proven framework)
- Show reasoning/evidence (not just scores)
- Track accuracy metrics
- A/B test prompts
- Allow manual override

### Risk 2: User Adoption
**Risk:** Recruiters don't trust AI, continue manual screening
**Mitigation:**
- Free trial: First 50 evaluations free
- Show time savings metrics
- Testimonials from early users
- Hiring manager acceptance data

### Risk 3: Cost Unpredictability
**Risk:** Users evaluate hundreds of candidates, costs explode
**Mitigation:**
- Selective evaluation by design
- Cost preview before evaluation
- Usage limits for free tier
- Pricing caps for paid plans

### Risk 4: Resume Quality
**Risk:** Bad PDF parsing, missing critical information
**Mitigation:**
- pdfplumber is robust
- Show extracted text for validation
- Allow manual text input
- Support multiple formats (PDF, DOCX, TXT)

---

## Appendix A: User Stories

### Epic 1: Project Management

**US-1.1:** As a recruiter, I want to create a new project for each job opening I'm filling, so I can organize candidates by role.

**US-1.2:** As a recruiter, I want to answer 8 Performance Profile questions when creating a project, so AI understands what success looks like.

**US-1.3:** As a recruiter, I want to view all my active projects on a dashboard, so I can see which searches need attention.

**US-1.4:** As a recruiter, I want to archive completed projects, so my dashboard stays clean.

---

### Epic 2: Resume Upload & Evaluation

**US-2.1:** As a recruiter, I want to upload 10-50 resumes at once, so I can batch process candidates.

**US-2.2:** As a recruiter, I want to see all uploaded resumes immediately (not evaluated yet), so I can scan names and companies.

**US-2.3:** As a recruiter, I want to select specific candidates to evaluate via checkboxes, so I only pay for evaluations I need.

**US-2.4:** As a recruiter, I want to see cost estimate before evaluating, so I control my budget.

**US-2.5:** As a recruiter, I want AI to evaluate selected candidates in 30-60 seconds, so I get fast results.

---

### Epic 3: Candidate Triage

**US-3.1:** As a recruiter, I want to filter candidates by "Recommended" vs "Not Recommended", so I focus on strong candidates.

**US-3.2:** As a recruiter, I want to see AI score and recommendation on candidate cards, so I know who to prioritize.

**US-3.3:** As a recruiter, I want to view detailed AI reasoning, so I understand why candidates were recommended.

**US-3.4:** As a recruiter, I want to manually shortlist candidates, so I can mark top picks for hiring manager.

---

### Epic 4: Context & Re-evaluation

**US-4.1:** As a recruiter, I want to add phone screen notes to a candidate, so AI re-evaluates with new information.

**US-4.2:** As a recruiter, I want to see evaluation history (v1, v2, v3), so I can track how candidate scores changed.

**US-4.3:** As a recruiter, I want to update Performance Profile mid-search, so I can re-rank all candidates with new criteria.

**US-4.4:** As a recruiter, I want to add interview feedback, so AI incorporates hiring manager insights.

---

## Appendix B: Design Principles

1. **Speed Matters** - Recruiters are busy. Every click should save time.
2. **Transparency Builds Trust** - Show AI reasoning, don't hide in black boxes.
3. **Cost Control is Critical** - Make selective evaluation obvious and easy.
4. **Flexibility Over Automation** - Let recruiters choose, don't force workflows.
5. **Quality Over Quantity** - Better to evaluate 10 well than 50 poorly.

---

**End of PRD**
