# Complete PRD - Resume Scanner Pro: Collaborative Resume Assistant

**Version:** 3.0 FINAL | **Date:** 2025-11-02 | **Owner:** Product & Growth Lead

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Target Users](#target-users)
3. [Core Workflows](#core-workflows)
4. [P0 Features](#p0-features-must-have)
5. [P1 Features](#p1-features-post-launch)
6. [P2 Features](#p2-features-future)
7. [Pricing Model](#pricing-model)
8. [Cost Optimization Strategies](#cost-optimization-strategies)
9. [Launch Criteria](#launch-criteria)
10. [Open Questions](#open-questions)

---

## Product Vision

### The Problem

Recruiters are drowning in resumes. For each role, they receive 50-200 applications and spend 3-5 hours manually screening them. Existing solutions fail:

**Traditional ATS:**
- Keyword filters miss context ("Python" ≠ "Python expertise")
- No reasoning, just binary matches
- High false negative rate (good candidates filtered out)

**Black-Box AI Tools:**
- Recruiters don't trust opaque AI decisions
- One AI mistake destroys all credibility
- No way to correct or improve AI
- "AI trying to replace me" sentiment

**Manual DIY (ChatGPT prompts):**
- Copy-paste each resume individually
- No workflow, no audit trail
- Inconsistent results across evaluations
- Time-consuming (still 2-3 hours)

### The Insight

A senior recruiter tested our prototype. Her reaction revealed the fundamental flaw in ALL AI screening tools:

> "I was skeptical of AI rankings until I could provide feedback and see re-ranking. One AI mismatch destroyed trust. Being able to add context like 'worked with her before' and see updated ranking transformed me from skeptical to engaged."

**Conclusion:** The feedback loop isn't optional - it's the trust mechanism that makes AI acceptable.

### The Solution

**Resume Scanner Pro** is the first AI recruiting tool where collaboration is the core product.

**How it works:**
1. **Organize by job** - Create job, upload candidates, track through hiring
2. **Choose your track** - FREE regex forever, or AI-powered (3 jobs FREE)
3. **Review AI rankings** - Scan 50 candidates in 2 minutes
4. **Add your context** - Quick inline notes on 2-3 standouts
5. **Rerun ranking** - AI re-evaluates with your expertise in 15 seconds
6. **Smart optimization** - Only processes shortlisted + annotated (saves 78% cost)
7. **Export & share** - PDF with rankings, notes, and reasoning

**Tagline:** "Teach the AI what great looks like for YOUR team"

---

## Target Users

### Primary: Senior Recruiter (Skeptical of AI)

**Demographics:**
- 5+ years recruiting experience
- Reviews 20-50 resumes per role
- Works in-house at 50-500 person company
- Budget authority for tools ($50-500/mo)

**Psychographics:**
- Skeptical of AI replacing human judgment
- Burned by ATS keyword filters missing great candidates
- Values speed but not at cost of quality
- Has "gut feel" for good candidates (wants to preserve this)
- Wants tools that make them BETTER, not replaceable

**Pain Points:**
- Resume screening takes 3-4 hours per role
- Hard to explain WHY she likes/dislikes candidates (documentation burden)
- Inconsistent evaluations across time ("why did I pass on this candidate last month?")
- AI tools make decisions she disagrees with, no way to correct
- No audit trail for hiring decisions (manager asks "why didn't we interview X?")

**Jobs to Be Done:**
1. Screen 40 resumes in <1 hour (10x faster)
2. Document WHY I like certain candidates (justification for manager)
3. Teach AI to match MY judgment over time (learning)
4. Override AI when I know better (control)
5. Show hiring managers I'm data-driven (credibility)

**Success Metrics:**
- Time to shortlist: 4 hours → 30 minutes (8x improvement)
- Documentation: 0% → 80% (notes on all shortlisted)
- Consistency: "Gut feel" → "Gut feel + AI reasoning"
- Manager satisfaction: "Why didn't we interview X?" → Full audit trail

---

### Secondary: Small HR Team (5-20 hires/year)

**Demographics:**
- 2-3 person HR team
- 10-20 open roles per year
- Tight budget (<$100/mo for tools)
- Non-technical roles (admin, ops, sales)

**Pain Points:**
- Can't afford expensive ATS ($500+/mo)
- Manual screening doesn't scale
- Inconsistent evaluation across team members
- No shared criteria for "good candidate"

**Jobs to Be Done:**
1. Evaluate 20 candidates for admin role (non-technical)
2. Share shortlist with hiring manager (export PDF)
3. Document why we picked candidate A over B (hiring decision rationale)
4. Try AI without commitment (free tier, no credit card)

**Success Metrics:**
- Cost: $0 (free tier) or $49/mo (affordable)
- Time to shortlist: 2 hours → 20 minutes
- Hiring manager satisfaction: Professional PDF exports

---

### Tertiary: Recruiting Agency (Power User)

**Demographics:**
- 10-50 person recruiting firm
- 100-500 candidates per month
- Multiple clients, diverse roles
- Budget: $200-1000/mo for tools

**Pain Points:**
- High volume, need speed
- Client expects data-driven recommendations
- Junior recruiters inconsistent
- Manual screening doesn't scale

**Jobs to Be Done:**
1. Screen 200 candidates per week (batch processing)
2. Train junior recruiters (AI as template for good evaluation)
3. Provide clients with professional reports (white-label exports)
4. Maintain consistent quality across team

**Success Metrics:**
- Volume: 500 candidates/month
- Consistency: Junior recruiter quality matches senior
- Client satisfaction: Professional AI-generated reports

**Note:** Pro tier ($49/mo) targets Primary. Enterprise tier (future) targets Tertiary.

---

## Core Workflows

### Workflow 1: Job-Centric Organization (Foundation)

**Problem Solved:** Recruiters think in "requisitions", not "piles of resumes"

**Flow:**
1. **Create Job**
   - Title: "Senior Software Engineer"
   - Department: Engineering
   - Requirements: ["Python 5yr", "React", "Postgres"]
   - Choose track: Regex-only (FREE) or AI-powered (3 FREE)

2. **Upload Candidates**
   - Drag-drop 20 PDF resumes
   - System parses text, extracts names
   - Shows progress: "15/20 parsed"

3. **Track Status**
   - Pending (20) → Review
   - Shortlisted (5) → Schedule interviews
   - Finalist (2) → Reference checks
   - Hired (1) / Rejected (19)

4. **Return Anytime**
   - Open job from dashboard
   - See current state (5 shortlisted, 2 in interview)
   - Add new candidates as they apply
   - Full history preserved

**Acceptance Criteria:**
- ✅ Create job → Upload 10 resumes → Mark 3 as shortlisted → Log out → Return next day → See state preserved
- ✅ Job dashboard shows all jobs with status counts
- ✅ Job detail view shows candidate list sortable by score/status/name
- ✅ Can add candidates incrementally (upload 10 today, 5 tomorrow)

---

### Workflow 2: Two-Track Evaluation (Free vs Paid)

**Problem Solved:** Users want to try before committing to paid AI

**Track 1: Regex-Only (FREE FOREVER)**

**When to use:**
- Administrative roles (keyword skills matter)
- High volume, low stakes (200+ candidates)
- Budget-conscious (small teams)
- Testing tool before AI commitment

**Flow:**
1. Select "Regex-only" at job creation
2. Upload 50 resumes
3. System extracts keywords: ["Excel", "QuickBooks", "Customer service"]
4. Scores based on keyword matches: 8/10 = 80 score
5. Ranks candidates by score
6. Export shortlist (top 10)

**Features:**
- ✅ Fast (<5s for 50 resumes)
- ✅ Keyword highlighting (shows where matches appear)
- ✅ Full UI (notes, status management, export)
- ✅ Unlimited jobs

**Limitations:**
- ❌ No reasoning/context
- ❌ No re-ranking with notes
- ❌ Simple keyword matching only (no synonyms)

**Upgrade Path:**
- "Convert to AI Job" button
- Shows side-by-side comparison (regex vs AI)
- Consumes 1 of 3 free AI jobs

---

**Track 2: AI-Powered (3 FREE, then $49/mo)**

**When to use:**
- Senior roles (context matters)
- Low volume, high stakes (10-30 candidates)
- Need reasoning/justification
- Willing to provide feedback

**Flow:**
1. Select "AI-powered" at job creation (shows "1/3 free jobs")
2. Upload 20 resumes
3. AI evaluates each (Claude Haiku, ~3s per candidate)
4. Shows scores + reasoning:
   - Score: 87/100
   - Recommendation: INTERVIEW
   - Key Strengths: "10 years Python, led teams of 5, strong culture fit"
   - Key Concerns: "Limited React experience (2yr vs 5yr required)"
5. Scan list (2 minutes)
6. Add notes to 2-3 candidates (inline text field)
7. Click "Rerun Ranking" (processes 10 shortlisted + 2 noted = 12 candidates)
8. Updated ranking appears (<15s)
9. Export shortlist with notes

**Features:**
- ✅ Contextual reasoning (not just keywords)
- ✅ Re-ranking with recruiter feedback
- ✅ Smart rerun (only shortlisted + annotated)
- ✅ Cost preview ("This will process 12 candidates, ~$0.036")
- ✅ Interview guide generation (P1)
- ✅ Premium exports (P1)

**Cost:**
- Initial: 20 candidates × $0.003 = $0.06
- Rerun: 12 candidates × $0.003 = $0.036
- **Total: $0.096 per job**

**Tier Limits:**
- 3 AI jobs (total, not active)
- 50 runs per job (150 total)
- Upgrade to Pro for unlimited

---

### Workflow 3: Collaborative Feedback Loop (Core Value)

**Problem Solved:** Recruiters don't trust black-box AI, need to teach AI what matters

**Selective Annotation (Not Systematic Review)**

**Key Insight:** Recruiters don't review ALL candidates - they spot 1-2 standouts with insider context AI couldn't know.

**Flow:**

**Step 1: AI Ranks (10 seconds)**
```
Upload 20 resumes → AI evaluates → Ranked list appears
```

**Step 2: Recruiter Scans (2 minutes)**
```
Scroll through ranked list → Spot patterns → Identify outliers
```

**Common patterns:**
- "Top 3 look good, agree with AI"
- "Wait, this person (#7) worked here before - red flag"
- "This candidate (#12) has niche skill AI didn't catch"
- "Score is too high (#2), job title inflated"

**Step 3: Quick Annotations (30 seconds per candidate)**

**Inline notes (always visible, not modal):**
```
┌─────────────────────────────────────────┐
│ Jane Smith - Score 87                   │
│ ✅ Recommendation: INTERVIEW            │
│                                         │
│ 💬 Your notes:                         │
│ ┌─────────────────────────────────────┐ │
│ │ [Click to add context...]           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

(After adding note)

┌─────────────────────────────────────────┐
│ Jane Smith - Score 87                   │
│ ✅ Recommendation: INTERVIEW            │
│                                         │
│ 💬 Your notes:                         │
│ ┌─────────────────────────────────────┐ │
│ │ Strong culture fit - worked at      │ │
│ │ similar-stage startup before.       │ │
│ │ AI undervalued this experience.     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ✏️ Edit | 🗑️ Remove                     │
└─────────────────────────────────────────┘
```

**Common note types:**
1. **Insider context:** "This person worked here before - had performance issues"
2. **Skill correction:** "Job title says 'Lead' but was actually IC level"
3. **Culture fit:** "Red flag: 5 jobs in 3 years, we need stability"
4. **Hidden gem:** "Startup experience more valuable than AI scored"

**Step 4: Rerun Ranking (15 seconds)**

**"Rerun Ranking" button states:**
- **Before notes:** Grayed out, tooltip "Add notes to enable"
- **After 1+ notes:** Active, shows "Rerun with Your Context (2 notes)"
- **Click:** Modal appears

**Rerun confirmation modal:**
```
┌───────────────────────────────────────────────┐
│ Rerun Ranking with Your Context              │
├───────────────────────────────────────────────┤
│                                               │
│ You added notes to 2 candidates:              │
│ • Jane Smith: Culture fit insight            │
│ • Mike Johnson: Experience correction        │
│                                               │
│ This will re-evaluate:                        │
│ • 5 shortlisted candidates                   │
│ • 2 candidates with new notes                │
│ • Total: 7 candidates                        │
│                                               │
│ Estimated cost: $0.021 (7 × $0.003)          │
│ Processing time: ~10-15 seconds              │
│                                               │
│ [Cancel]              [Rerun Ranking →]      │
└───────────────────────────────────────────────┘
```

**Step 5: Updated Ranking (immediate)**

**After rerun completes:**
```
┌───────────────────────────────────────────────┐
│ ✅ Ranking Updated!                           │
├───────────────────────────────────────────────┤
│                                               │
│ Changes based on your feedback:               │
│                                               │
│ Jane Smith:    87 → 92 (+5) ✅ Still INTERVIEW│
│ Mike Johnson:  76 → 68 (-8) ⚠️ PHONE SCREEN   │
│                                               │
│ 2 candidates moved                            │
│ 5 candidates unchanged                        │
│                                               │
│ Your notes improved ranking accuracy!         │
│                                               │
│ [View Updated Rankings] [Export PDF]          │
└───────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Notes field always visible (not hidden in modal)
- ✅ Rerun button grayed out until notes added
- ✅ Cost preview accurate (<$0.05 for typical rerun)
- ✅ Rerun completes <15 seconds (P95)
- ✅ Updated scores differ by 5-15 points where feedback provided
- ✅ Notes appear in PDF export

---

### Workflow 4: Smart Rerun Logic (Cost Optimization)

**Problem Solved:** Naive rerun would re-evaluate ALL candidates ($0.15 for 50), but recruiter only cares about 10-15

**Conservative Rules (Production-Ready):**

**Only rerun:**
1. **All shortlisted candidates** (recruiter flagged these as interesting)
2. **Any candidate with new notes since last run** (recruiter added context)

**Don't rerun:**
- Low-ranked candidates (<70 score) without notes (waste of tokens)
- Already-rejected candidates without new context
- Candidates with no changes since last run

**Example Scenarios:**

**Scenario 1: Typical rerun**
```
Job has 50 candidates
AI ranked, recruiter reviews

Recruiter actions:
- Marks 10 as "shortlisted" (top performers)
- Adds notes to 2 candidates:
  - Jane Smith (already shortlisted): "Great culture fit"
  - Bob Lee (rank #15, not shortlisted): "Hidden gem, startup exp"

Smart rerun processes:
- 10 shortlisted (including Jane)
- 1 additional with notes (Bob)
- Total: 11 candidates

Cost: 11 × $0.003 = $0.033

Savings vs full rerun:
- Full: 50 × $0.003 = $0.15
- Smart: 11 × $0.003 = $0.033
- Savings: 78%
```

**Scenario 2: Zero notes, just shortlist**
```
Recruiter accepts AI ranking
Marks top 8 as shortlisted
Clicks "Rerun Ranking" (to refine scores)

Smart rerun processes:
- 8 shortlisted
- 0 notes
- Total: 8 candidates

Cost: 8 × $0.003 = $0.024
```

**Scenario 3: Notes on non-shortlisted**
```
Recruiter disagrees with AI on 3 candidates
All 3 are ranked low (scores 50-65)
Adds notes: "AI missed X skill"

Smart rerun processes:
- 0 shortlisted yet (recruiter wants fresh evaluation)
- 3 with notes
- Total: 3 candidates

Cost: 3 × $0.003 = $0.009

After rerun:
- 1 candidate score jumps to 78 → recruiter adds to shortlist
- Next rerun will include that candidate
```

**Implementation (Python pseudocode):**
```python
def get_candidates_for_rerun(job_id, last_run_timestamp):
    """Return list of candidate IDs to re-evaluate"""

    # Rule 1: All shortlisted candidates
    shortlisted = db.query(
        "SELECT candidate_id FROM candidates WHERE job_id = ? AND status = 'shortlisted'",
        job_id
    )

    # Rule 2: Any candidate with notes added since last run
    with_new_notes = db.query(
        "SELECT candidate_id FROM candidate_rankings WHERE job_id = ? AND feedback_timestamp > ?",
        job_id,
        last_run_timestamp
    )

    # Union (no duplicates)
    candidates_to_rerun = set(shortlisted + with_new_notes)

    return list(candidates_to_rerun)
```

**Acceptance Criteria:**
- ✅ Smart rerun processes 10-15 candidates on average (not 50)
- ✅ Never misses candidate with new notes
- ✅ Always includes shortlisted candidates
- ✅ Cost preview matches actual cost (±$0.01)
- ✅ Rerun completes <15 seconds for 15 candidates

---

### Workflow 5: Shortlist Tier Suggestions (Intelligent Defaults)

**Problem Solved:** Recruiter overwhelmed by 50 candidates, needs starting point

**After Initial AI Evaluation:**

**System suggests tiers based on scores:**
```
┌─────────────────────────────────────────────────┐
│ AI Evaluation Complete (50 candidates)          │
├─────────────────────────────────────────────────┤
│                                                 │
│ Suggested Shortlist Tiers:                     │
│                                                 │
│ ✅ STRONG (10 candidates)                       │
│    Scores 85-95 | Recommend interview          │
│    • Jane Smith (92)                           │
│    • John Doe (88)                             │
│    • Sarah Lee (86)                            │
│    ... 7 more                                  │
│                                                 │
│    [Move Strong to Shortlist →]                │
│                                                 │
│ 🟡 MAYBE (12 candidates)                        │
│    Scores 70-84 | Consider phone screen        │
│    • Mike Johnson (78)                         │
│    • Lisa Chen (74)                            │
│    ... 10 more                                 │
│                                                 │
│    [Review Maybe Tier]                         │
│                                                 │
│ ❌ PASS (28 candidates)                         │
│    Scores <70 | Missing key requirements       │
│                                                 │
│    [Hide Pass Tier]                            │
│                                                 │
│ [Review All Candidates] [Skip to Export]       │
└─────────────────────────────────────────────────┘
```

**One-Click Actions:**
1. **"Move Strong to Shortlist"**
   - Marks top 10 as "shortlisted"
   - Future reruns only process these 10
   - Saves tokens naturally
   - Forces intentional decision

2. **"Review Maybe Tier"**
   - Collapses Strong and Pass
   - Shows only 12 "maybe" candidates
   - Recruiter can promote to shortlist

3. **"Hide Pass Tier"**
   - Hides 28 low-scored candidates
   - Reduces visual clutter
   - Can unhide anytime

**Smart Defaults (Configurable):**
- Strong: 85-100 (top 20% or max 15 candidates)
- Maybe: 70-84 (middle 30% or max 20 candidates)
- Pass: <70 (bottom 50%)

**Benefits:**
1. **Reduces overwhelm:** 50 candidates → review 10-12
2. **Saves tokens:** Future reruns only process shortlist
3. **Forces decision:** Do I agree with AI's "strong" tier?
4. **Natural workflow:** Strong → Interview, Maybe → Phone, Pass → Reject

**Acceptance Criteria:**
- ✅ Tier suggestions appear after initial evaluation
- ✅ "Move Strong to Shortlist" marks 10-15 candidates
- ✅ Future reruns respect shortlist (only process those)
- ✅ Can manually adjust tier thresholds (P1)

---

### Workflow 6: Two-Stage Hiring Pipeline (Post-MVP)

**Problem Solved:** Recruiters need to track full pipeline: 100 resumes → 10 interviews → 1 hire

**Stage 1: Initial Shortlisting (100 → 10)**

**Week 1:**
1. Create job: "Product Manager"
2. Upload 100 resumes
3. AI evaluates all 100 (cost: $0.30)
4. System suggests: 12 Strong, 18 Maybe, 70 Pass
5. Recruiter reviews Strong tier
6. Adds notes to 3 candidates
7. Reruns ranking (processes 12 Strong + 3 noted = 15 candidates)
8. Creates shortlist of 10
9. Exports PDF, shares with hiring manager
10. **Schedules phone screens with top 10**

**OUTSIDE SYSTEM:** Phone screens happen (hiring manager interviews)

---

**Stage 2: Final Selection (10 → 1)**

**Week 3:**
11. Returns to tool, opens same job
12. Sees 10 shortlisted candidates (from Week 1)
13. Adds interview context as notes:
    - Jane: "Excellent culture fit, strong product sense"
    - Mike: "Technical skills strong, hesitant on remote work"
    - Sarah: "Overqualified, flight risk"
14. Clicks "Rerun with Interview Context"
15. AI re-evaluates 10 candidates with interview data
16. Updated ranking helps decide offer
17. Marks Jane as "finalist"
18. Generates hiring manager report (P1)
19. Makes offer

**Key Features:**
- ✅ Same job, two distinct evaluation phases
- ✅ Interview context treated as notes (same workflow)
- ✅ Cost-efficient: Only 10 candidates in Stage 2
- ✅ Full history: Resume → Phone → Interview → Offer

**Note:** Stage 2 is P1 (post-launch). MVP focuses on Stage 1 only.

---

## P0 Features (Must-Have)

### Feature 1: Job CRUD (Foundation)

**Purpose:** Organize recruiting by job, not by pile of resumes

**Functionality:**

**1.1 Create Job**
- Form fields:
  - Title (required): "Senior Software Engineer"
  - Department (optional): "Engineering"
  - Location (optional): "San Francisco, CA"
  - Employment type: Full-time | Part-time | Contract
  - Must-have requirements (array): ["Python 5yr", "React", "Postgres"]
  - Preferred requirements (array): ["Supabase", "Serverless"]
  - Years experience: Min 5, Max 10
  - Description (optional): Free-text
  - Compensation range (optional): $120k - $180k
- Track selection:
  - [ ] Regex-only (FREE unlimited)
  - [ ] AI-powered (1/3 free jobs remaining)
- Submit → Creates job record → Redirects to job detail

**1.2 List Jobs (Dashboard)**
```
┌─────────────────────────────────────────────────┐
│ Your Jobs (8)                  [+ Create Job]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ Senior Software Engineer                        │
│ Engineering • Created 2 days ago                │
│ 🤖 AI-powered • 2/50 runs used                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4%             │
│ 15 candidates • 3 shortlisted • 0 hired         │
│ [Open Job →]                                    │
│                                                 │
│ Product Manager                                 │
│ Product • Created 1 week ago                    │
│ 📝 Regex-only                                   │
│ 42 candidates • 8 shortlisted • 1 hired         │
│ [Open Job →]                                    │
│                                                 │
│ ... 6 more jobs                                │
└─────────────────────────────────────────────────┘
```

**1.3 Job Detail View**
```
┌─────────────────────────────────────────────────┐
│ Senior Software Engineer        [⚙️ Edit Job]   │
│ Engineering • San Francisco, CA                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🤖 AI-powered (2/50 runs used) ━━━━━━━ 4%      │
│                                                 │
│ Requirements:                                   │
│ Must-have: Python 5yr, React, Postgres         │
│ Preferred: Supabase, Serverless               │
│                                                 │
│ [Upload Candidates] [Run Evaluation]           │
│                                                 │
│ Candidates (15)  [All | Pending | Shortlisted | │
│                   Finalist | Hired | Rejected]   │
│                                                 │
│ ☑️ Jane Smith             Score 92  ✅ INTERVIEW │
│    Added 2 days ago • Shortlisted              │
│    💬 "Strong culture fit, startup exp"        │
│                                                 │
│ ☐ John Doe                Score 88  ✅ INTERVIEW │
│    Added 2 days ago • Pending                  │
│                                                 │
│ ... 13 more candidates                         │
│                                                 │
│ [Export Shortlist (3)] [Rerun Ranking]         │
└─────────────────────────────────────────────────┘
```

**1.4 Edit Job**
- All fields editable except track (can't change regex → AI after creation)
- Changing requirements doesn't trigger re-evaluation (manual)

**1.5 Delete Job**
- Confirmation modal: "This will delete 15 candidates and all evaluations"
- Soft delete (archive) vs hard delete (future)

**Acceptance Criteria:**
- ✅ Can create job with min required fields (title, track)
- ✅ Dashboard shows all jobs with run usage
- ✅ Job detail shows candidates sortable by score/status
- ✅ Can edit job without breaking existing data
- ✅ Delete job removes candidates and evaluations

**Effort:** 3 days

---

### Feature 2: Candidate Upload & Parsing

**Purpose:** Batch upload resumes, extract text

**Functionality:**

**2.1 Drag-Drop Upload**
```
┌─────────────────────────────────────────────────┐
│ Upload Candidates                               │
├─────────────────────────────────────────────────┤
│                                                 │
│   Drag & drop PDF or DOCX files here           │
│   or click to browse                            │
│                                                 │
│   Maximum 50 files per upload                  │
│   Supported: PDF, DOCX                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**2.2 Parsing Progress**
```
┌─────────────────────────────────────────────────┐
│ Parsing Resumes...                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✅ Jane_Smith_Resume.pdf                        │
│ ✅ John_Doe_Resume.pdf                          │
│ ⏳ Mike_Johnson_Resume.pdf (parsing...)         │
│ ❌ Corrupt_File.pdf (failed)                    │
│                                                 │
│ Progress: 15/20 complete                        │
│                                                 │
│ [Cancel] [Continue with 15]                    │
└─────────────────────────────────────────────────┘
```

**2.3 Candidate Record Creation**
- Extracts:
  - Resume text (full)
  - Resume file URL (Supabase Storage)
  - Filename
  - Created timestamp
- Auto-detects name from filename or first line
- Status: "pending"
- Associated with job_id

**2.4 Error Handling**
- Corrupt PDF: Show error, skip
- Password-protected: Show error, skip
- Image-based PDF: Attempt OCR (P1), skip if fails
- File too large (>10MB): Show error
- Duplicate detection (P1): Warn if same filename uploaded twice

**Acceptance Criteria:**
- ✅ Can upload 20 PDFs in <30 seconds
- ✅ Parsing completes <5 seconds per resume
- ✅ Extracted text preserves formatting (line breaks)
- ✅ Failed parses don't block batch
- ✅ Supabase Storage stores files

**Effort:** 2 days (reuse existing `parse_resume.py`)

---

### Feature 3: Two-Track Evaluation

**Purpose:** Free regex forever, AI when it matters

**3.1 Regex-Only Evaluation**

**Algorithm:**
```python
def evaluate_regex(resume_text, requirements):
    """Simple keyword matching"""
    score = 0
    matches = []

    for req in requirements:
        # Case-insensitive search
        if req.lower() in resume_text.lower():
            score += 10
            matches.append(req)

    # Normalize to 0-100
    max_score = len(requirements) * 10
    normalized = min(100, (score / max_score) * 100) if max_score > 0 else 50

    # Determine recommendation
    if normalized >= 85:
        rec = "INTERVIEW"
    elif normalized >= 70:
        rec = "PHONE SCREEN"
    else:
        rec = "DECLINE"

    return {
        'score': normalized,
        'recommendation': rec,
        'matched_requirements': matches,
        'missing_requirements': [r for r in requirements if r not in matches]
    }
```

**UI:**
```
┌─────────────────────────────────────────────────┐
│ Jane Smith                         Score 80/100 │
│ 📝 Regex Match                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Matched Requirements (8/10):                    │
│ ✅ Python 5yr                                   │
│ ✅ React                                        │
│ ✅ Postgres                                     │
│ ✅ Team lead experience                         │
│ ... 4 more                                     │
│                                                 │
│ Missing Requirements (2/10):                    │
│ ❌ Supabase (preferred)                         │
│ ❌ Serverless (preferred)                       │
│                                                 │
│ Recommendation: PHONE SCREEN                    │
│                                                 │
│ 💬 Your notes: [Click to add...]               │
│                                                 │
│ [View Resume] [Mark Shortlisted] [Reject]      │
└─────────────────────────────────────────────────┘
```

**3.2 AI-Powered Evaluation**

**Algorithm:**
```python
# Reuse existing api/evaluate_candidate.py
# Stage 1 evaluation with Claude Haiku

response = anthropic_client.evaluate(
    prompt=build_stage1_prompt(skill_instructions, job, candidate),
    model="claude-3-5-haiku-20241022"
)

# Parse response (existing parser)
evaluation = parse_stage1_response(response.text)

# Returns:
{
    'score': 87,
    'qualifications_score': 36,
    'experience_score': 38,
    'risk_flags_score': 13,
    'recommendation': 'ADVANCE TO INTERVIEW',
    'key_strengths': [
        '10 years Python with modern frameworks',
        'Led teams of 5-7 engineers',
        'Strong startup experience'
    ],
    'key_concerns': [
        'Limited React experience (2yr vs 5yr required)',
        'No Postgres at scale (mid-size DBs only)'
    ],
    'reasoning': 'Candidate shows strong technical depth...'
}
```

**UI:**
```
┌─────────────────────────────────────────────────┐
│ Jane Smith                         Score 87/100 │
│ 🤖 AI Evaluation                                │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✅ Recommendation: INTERVIEW                    │
│                                                 │
│ Score Breakdown:                                │
│ Qualifications: 36/40  ████████████████░░      │
│ Experience:     38/40  ███████████████████░    │
│ Risk Flags:     13/20  ██████████████████░░    │
│                                                 │
│ Key Strengths:                                  │
│ • 10 years Python with modern frameworks       │
│ • Led teams of 5-7 engineers                   │
│ • Strong startup experience                    │
│                                                 │
│ Key Concerns:                                   │
│ • Limited React experience (2yr vs 5yr req)    │
│ • No Postgres at scale (mid-size DBs only)     │
│                                                 │
│ AI Reasoning:                                   │
│ Candidate shows strong technical depth in      │
│ Python ecosystem. Leadership experience at     │
│ startup aligns well with company stage...      │
│ [Read More]                                    │
│                                                 │
│ 💬 Your notes: [Click to add...]               │
│                                                 │
│ [View Resume] [Mark Shortlisted] [Reject]      │
└─────────────────────────────────────────────────┘
```

**3.3 Side-by-Side Comparison (Upgrade CTA)**

**On regex job:**
```
┌─────────────────────────────────────────────────┐
│ Want to see AI analysis?                        │
├─────────────────────────────────────────────────┤
│                                                 │
│ Regex matched 8/10 requirements, but can't     │
│ evaluate:                                       │
│ • Quality of experience (10yr != 2yr)          │
│ • Culture fit signals                          │
│ • Red flags (job hopping, gaps)                │
│ • Leadership experience                        │
│                                                 │
│ Try AI evaluation (uses 1 of 3 free jobs)      │
│                                                 │
│ [Convert to AI Job] [Stay Regex]               │
└─────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Regex completes <5s for 50 resumes
- ✅ AI completes <60s for 20 resumes (parallel processing)
- ✅ Regex shows keyword matches
- ✅ AI shows reasoning + breakdown
- ✅ Can convert regex → AI (uses 1 AI job)
- ✅ Tier limit enforced (3 AI jobs max on free)

**Effort:** 3 days (2 days regex, 1 day UI)

---

### Feature 4: Inline Notes (Always Visible)

**Purpose:** Frictionless feedback, no modal interrupting workflow

**UI:**

**Before adding note:**
```
┌─────────────────────────────────────────────────┐
│ Jane Smith                         Score 87/100 │
│ ✅ Recommendation: INTERVIEW                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ 💬 Your notes: [Click to add your context...]  │
│                                                 │
│ ▼ AI Analysis (click to expand)                │
└─────────────────────────────────────────────────┘
```

**After clicking:**
```
┌─────────────────────────────────────────────────┐
│ Jane Smith                         Score 87/100 │
│ ✅ Recommendation: INTERVIEW                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ 💬 Your notes:                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Strong culture fit - worked at similar-    │ │
│ │ stage startup (20 person team). AI         │ │
│ │ undervalued this experience.               │ │
│ │                                            │ │
│ │                                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Save Note] [Cancel]                            │
│                                                 │
│ ▼ AI Analysis (click to expand)                │
└─────────────────────────────────────────────────┘
```

**After saving:**
```
┌─────────────────────────────────────────────────┐
│ Jane Smith                         Score 87/100 │
│ ✅ Recommendation: INTERVIEW                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ 💬 Your notes:                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Strong culture fit - worked at similar-    │ │
│ │ stage startup (20 person team). AI         │ │
│ │ undervalued this experience.               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 📝 Saved 2 minutes ago  [Edit] [Remove]        │
│                                                 │
│ ▼ AI Analysis (click to expand)                │
└─────────────────────────────────────────────────┘
```

**Persistence:**
- Saved to `candidate_rankings` table
- `feedback_notes` column (TEXT)
- `feedback_timestamp` column (TIMESTAMP)
- Visible in all views (list, detail, export)

**Acceptance Criteria:**
- ✅ Notes field always visible (not hidden)
- ✅ Click → expand → type → save (3 clicks max)
- ✅ Notes persist to database
- ✅ Notes survive page refresh
- ✅ Notes appear in PDF export
- ✅ Can edit/remove notes anytime

**Effort:** 1 day

---

### Feature 5: Smart Rerun Button

**Purpose:** Re-rank with recruiter context, cost-optimized

**Button States:**

**State 1: No notes, no shortlist**
```
┌─────────────────────────────────────────────────┐
│ [🔄 Rerun Ranking]  (grayed out)                │
│                                                 │
│ Tooltip: "Add notes or mark candidates as      │
│ shortlisted to enable rerun"                    │
└─────────────────────────────────────────────────┘
```

**State 2: Notes added OR shortlist exists**
```
┌─────────────────────────────────────────────────┐
│ [🔄 Rerun with Your Context (2 notes)]          │
│                                                 │
│ Tooltip: "Re-evaluate shortlisted + noted      │
│ candidates with your feedback"                  │
└─────────────────────────────────────────────────┘
```

**State 3: During rerun**
```
┌─────────────────────────────────────────────────┐
│ [⏳ Rerunning... 8/12 complete]                 │
│                                                 │
│ Estimated time: 5 seconds remaining            │
└─────────────────────────────────────────────────┘
```

**Confirmation Modal:**
```
┌───────────────────────────────────────────────┐
│ Rerun Ranking with Your Context              │
├───────────────────────────────────────────────┤
│                                               │
│ This will re-evaluate:                        │
│ • 5 shortlisted candidates                   │
│ • 2 candidates with new notes                │
│ • Total: 7 candidates (smart rerun)          │
│                                               │
│ Cost breakdown:                               │
│ 7 candidates × $0.003 = $0.021               │
│                                               │
│ Full rerun would cost: $0.15 (50 candidates)  │
│ Smart rerun saves: $0.129 (86% savings!)     │
│                                               │
│ Processing time: ~10-15 seconds              │
│                                               │
│ Your feedback will help AI understand:        │
│ • Jane Smith: Culture fit insight            │
│ • Bob Lee: Experience correction             │
│                                               │
│ [Cancel]              [Confirm Rerun →]       │
└───────────────────────────────────────────────┘
```

**After Rerun:**
```
┌───────────────────────────────────────────────┐
│ ✅ Ranking Updated!                           │
├───────────────────────────────────────────────┤
│                                               │
│ Changes based on your feedback:               │
│                                               │
│ Jane Smith:    87 → 92 (+5) ✅ INTERVIEW      │
│   Your note: "Culture fit insight"           │
│   AI response: "Adjusted experience score    │
│   based on startup context you provided"     │
│                                               │
│ Bob Lee:       65 → 73 (+8) 🟡 PHONE SCREEN   │
│   Your note: "Hidden gem, startup exp"       │
│   AI response: "Re-evaluated with emphasis   │
│   on adaptability and scrappy execution"     │
│                                               │
│ Mike Johnson:  88 → 88 (no change)           │
│ Sarah Chen:    82 → 82 (no change)           │
│ ... 3 more unchanged                         │
│                                               │
│ Summary:                                      │
│ • 2 candidates moved up                      │
│ • 0 candidates moved down                    │
│ • 5 candidates unchanged                     │
│                                               │
│ Your notes improved ranking accuracy! 🎉      │
│                                               │
│ [View Updated Rankings] [Export PDF]          │
└───────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Button grayed out until notes or shortlist
- ✅ Confirmation modal shows cost + candidates
- ✅ Rerun completes <15 seconds (P95)
- ✅ Updated scores differ by 5-15 points where feedback provided
- ✅ After modal shows movement indicators
- ✅ Run count incremented (2/50 → 3/50)

**Effort:** 2 days

---

### Feature 6: Tier Limit Tracking

**Purpose:** Enforce free tier limits, drive upgrades

**UI Components:**

**6.1 Job Dashboard - Limit Indicators**
```
┌─────────────────────────────────────────────────┐
│ Your Jobs (3)                  [+ Create Job]   │
│                                                 │
│ 🤖 AI Jobs: 2/3 used                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 67%              │
│ 1 AI job remaining (then upgrade to Pro)       │
└─────────────────────────────────────────────────┘
```

**6.2 Job Detail - Run Usage**
```
┌─────────────────────────────────────────────────┐
│ Senior Software Engineer                        │
│                                                 │
│ 🤖 AI Runs: 42/50 used                          │
│ ████████████████████████████░░ 84%             │
│ ⚠️ Approaching limit (8 runs remaining)        │
│                                                 │
│ [Upgrade to Pro for Unlimited →]                │
└─────────────────────────────────────────────────┘
```

**6.3 Limit Hit - AI Jobs**
```
┌───────────────────────────────────────────────┐
│ You've Used All 3 Free AI Jobs                │
├───────────────────────────────────────────────┤
│                                               │
│ You've created the maximum 3 AI-powered jobs │
│ on the free tier.                            │
│                                               │
│ Your options:                                 │
│                                               │
│ 1️⃣ Use unlimited Regex-only jobs (still free)│
│    • Fast keyword matching                   │
│    • Good for high-volume screening          │
│                                               │
│ 2️⃣ Upgrade to Pro ($49/month)                │
│    • Unlimited AI jobs                       │
│    • Unlimited runs per job                  │
│    • Smart rerun optimization                │
│    • Premium exports                         │
│                                               │
│ [Create Regex Job] [Upgrade to Pro →]        │
│                                               │
│ Or delete an old AI job to free up a slot    │
│ [Manage My Jobs]                             │
└───────────────────────────────────────────────┘
```

**6.4 Limit Hit - Run Usage**
```
┌───────────────────────────────────────────────┐
│ You've Used All 50 Runs for This Job         │
├───────────────────────────────────────────────┤
│                                               │
│ This job has reached its 50-run limit on     │
│ the free tier.                               │
│                                               │
│ Current state preserved:                      │
│ • 15 candidates evaluated                    │
│ • 3 shortlisted                              │
│ • Notes saved                                │
│                                               │
│ Your options:                                 │
│                                               │
│ 1️⃣ Export current results (no additional runs)│
│    [Export PDF]                              │
│                                               │
│ 2️⃣ Upgrade to Pro for unlimited runs         │
│    Continue working on this job             │
│    [Upgrade to Pro →]                        │
│                                               │
│ 3️⃣ Create a new AI job (if slots remaining)  │
│    Start fresh with 50 new runs             │
│    [Create New Job]                          │
└───────────────────────────────────────────────┘
```

**Database Tracking:**
```sql
-- users table
ALTER TABLE users
ADD COLUMN ai_jobs_created INTEGER DEFAULT 0,
ADD COLUMN ai_jobs_limit INTEGER DEFAULT 3,
ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';

-- jobs table
ALTER TABLE jobs
ADD COLUMN ai_runs_used INTEGER DEFAULT 0,
ADD COLUMN ai_runs_limit INTEGER DEFAULT 50;

-- Increment on evaluation
UPDATE jobs SET ai_runs_used = ai_runs_used + 1 WHERE id = ?;
UPDATE users SET ai_jobs_created = ai_jobs_created + 1 WHERE id = ? AND job_track = 'ai';
```

**Acceptance Criteria:**
- ✅ Tier limits enforced (hard stop at 3/3, 50/50)
- ✅ Visual progress bars update in real-time
- ✅ Warning at 40/50 runs ("Approaching limit")
- ✅ Limit hit modal shows options (regex, upgrade, delete)
- ✅ Pro tier has unlimited (limits = NULL)

**Effort:** 2 days

---

### Feature 7: PDF Export with Notes

**Purpose:** Share shortlist with hiring manager

**Export Options:**

**Basic Export (All Tiers):**
```
┌───────────────────────────────────────────────┐
│ Export Results                                │
├───────────────────────────────────────────────┤
│                                               │
│ Select candidates:                            │
│ [●] Shortlisted only (3 candidates)          │
│ [ ] All candidates (15)                      │
│ [ ] Custom selection                         │
│                                               │
│ Include:                                      │
│ [✓] Scores & recommendations                 │
│ [✓] Your notes                               │
│ [✓] AI reasoning                             │
│ [ ] Full resume text (long)                  │
│                                               │
│ Format:                                       │
│ [●] PDF  [ ] CSV  [ ] Excel (Pro only)       │
│                                               │
│ [Cancel]              [Export PDF →]         │
└───────────────────────────────────────────────┘
```

**PDF Layout:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTLIST REPORT
Senior Software Engineer | Engineering Dept
Generated: November 2, 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE 1: Jane Smith
Score: 92/100 | Recommendation: INTERVIEW
Status: Shortlisted

Your Notes:
"Strong culture fit - worked at similar-stage startup
(20 person team). AI undervalued this experience."

AI Analysis:
Key Strengths:
• 10 years Python with modern frameworks
• Led teams of 5-7 engineers at startups
• Adaptable to fast-paced environments

Key Concerns:
• Limited React experience (2yr vs 5yr required)

Recommendation Reasoning:
Candidate shows exceptional technical leadership...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CANDIDATE 2: John Doe
Score: 88/100 | Recommendation: INTERVIEW
Status: Shortlisted

... repeat for all shortlisted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
3 candidates shortlisted for interview
2 candidates suggested for phone screen
10 candidates declined (missing key requirements)

Next Steps:
1. Schedule interviews with top 3
2. Consider phone screens for "maybe" tier
3. Return to tool to add interview feedback

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by Resume Scanner Pro
Your notes + AI insights = Better hires
```

**Acceptance Criteria:**
- ✅ Export includes notes (visible in PDF)
- ✅ Export includes scores + recommendations
- ✅ Export includes AI reasoning (collapsible)
- ✅ PDF formatted professionally (hiring manager ready)
- ✅ Export completes <5 seconds for 10 candidates
- ✅ Can export multiple times (doesn't consume runs)

**Effort:** 1 day (reuse existing `exportService.js`)

---

## P1 Features (Post-Launch)

### Feature 8: Shortlist Tier Suggestions (Week 5)

**Purpose:** Intelligent defaults reduce overwhelm

(Full spec in Workflow 5 above)

**Effort:** 2 days

---

### Feature 9: Interview Guide Generation (Week 6)

**Purpose:** Probe areas where AI scored low or recruiter flagged concerns

**Algorithm:**
```python
def generate_interview_guide(candidate_evaluation, recruiter_notes):
    """Generate custom interview questions"""

    prompt = f"""
Generate 8-10 interview questions for this candidate:

Candidate: {candidate.name}
Score: {evaluation.score}/100

Key Strengths:
{evaluation.key_strengths}

Key Concerns:
{evaluation.key_concerns}

Recruiter Notes:
{recruiter_notes}

Generate questions that:
1. Validate strengths (3-4 questions)
2. Probe concerns (3-4 questions)
3. Address recruiter's specific flags (2-3 questions)

Format as structured interview guide.
"""

    response = llm.generate(prompt)
    return parse_interview_guide(response)
```

**UI:**
```
┌───────────────────────────────────────────────┐
│ Interview Guide for Jane Smith               │
├───────────────────────────────────────────────┤
│                                               │
│ VALIDATE STRENGTHS                            │
│                                               │
│ 1. Tell me about a time you led a 5-7 person │
│    engineering team through a major release. │
│    (Validates: Leadership at startup)        │
│                                               │
│ 2. Describe your experience with Python      │
│    frameworks in production environments.    │
│    (Validates: 10yr Python expertise)        │
│                                               │
│ PROBE CONCERNS                                │
│                                               │
│ 3. How comfortable are you with React? Walk  │
│    me through your most complex React app.   │
│    (Concern: Limited React experience)       │
│                                               │
│ 4. Tell me about your experience with large- │
│    scale databases. How large was your       │
│    largest Postgres deployment?              │
│    (Concern: No Postgres at scale)           │
│                                               │
│ RECRUITER FOCUS AREAS                         │
│                                               │
│ 5. You mentioned working at a 20-person      │
│    startup. How did you adapt to our larger  │
│    team structure? (Your note: Culture fit)  │
│                                               │
│ [Export Guide] [Customize Questions]          │
└───────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Generates 8-10 questions per candidate
- ✅ Questions reference AI concerns + recruiter notes
- ✅ Professional formatting (copy-paste ready)
- ✅ Can regenerate with different focus

**Effort:** 2 days

---

### Feature 10: Hiring Manager Reports (Week 6)

**Purpose:** Premium export for hiring managers (Pro feature)

**Includes:**
- Executive summary (top 3 candidates, why)
- Comparison matrix (side-by-side strengths)
- Interview questions (suggested for each)
- Recruiter recommendations
- Full AI reasoning

**Effort:** 3 days

---

### Feature 11: Feedback Analytics Dashboard (Week 7)

**Purpose:** Show user how their feedback improves AI over time

**Metrics:**
- Feedback given: 12 notes across 3 jobs
- Rerun triggered: 8 times (60% of evaluations)
- Avg notes per rerun: 2.5 candidates
- Top themes: "Culture fit" (5), "Experience context" (3)
- Score changes: Avg +7 points where feedback provided
- AI vs You agreement: 75% → 85% (improving!)

**Effort:** 3 days

---

## P2 Features (Future)

### Feature 12: Team Collaboration (Multi-User)

**Purpose:** Multiple recruiters collaborate on same job

**Functionality:**
- Shared jobs (invite team members)
- Each recruiter adds notes independently
- AI aggregates team feedback ("2 recruiters flagged culture fit")
- Consensus view ("Team rating: 8.5/10")

**Effort:** 5 days

---

### Feature 13: Automatic Learning Across Jobs

**Purpose:** AI learns user preferences over time

**Functionality:**
- Track recruiter patterns ("Always values startup experience")
- Suggest notes ("You usually mention culture fit for this role type")
- Auto-adjust weights ("Your feedback suggests you value experience 2x more than AI")

**Caution:** Privacy concerns, ML complexity

**Effort:** 10+ days

---

### Feature 14: ATS Integration (Greenhouse, Lever)

**Purpose:** Sync candidates from ATS, push shortlist back

**Functionality:**
- OAuth integration
- Two-way sync (import candidates, export shortlist)
- Webhook notifications (new candidate applied)

**Effort:** 15+ days per integration

---

## Pricing Model

### Free Tier (Generous but Capped)

**Purpose:** Small teams might never upgrade - that's OK! Low CAC, viral growth.

**Limits:**
- ✅ **3 AI-powered jobs EVER** (not active, total lifetime)
- ✅ **50 AI runs per job** (150 total runs)
- ✅ **Unlimited regex-only jobs** (no AI cost)
- ✅ **All collaborative features** (notes, rerun, export)
- ✅ **50 candidates per run** max

**What's Included:**
- Job creation + management
- Candidate upload + parsing
- Regex-only evaluation (unlimited)
- AI evaluation (3 jobs, 50 runs each)
- Inline notes
- Smart rerun (optimized for cost)
- PDF export (basic)
- Status tracking
- 30-day data retention

**Economics:**
- Typical usage: 2 AI jobs, 25 candidates each, 2 runs per job
- Cost: 2 × 25 × 2 × $0.003 = $0.30 CAC
- If 15% convert to Pro: $49 × 0.15 = $7.35 revenue per signup
- **LTV:CAC = 147:1** ✅

**Upgrade Prompts:**
- At 2/3 AI jobs: "1 job remaining"
- At 3/3 AI jobs: Hard stop, show upgrade modal
- At 40/50 runs: "Approaching limit (10 runs left)"
- At 50/50 runs: Hard stop, show options (export, upgrade, new job)

---

### Pro Tier ($49/month)

**Purpose:** High margin, targets agencies + high-volume recruiters

**Includes:**
- ✅ **Unlimited AI jobs**
- ✅ **Unlimited runs per job**
- ✅ **200 candidates per run** max (vs 50 free)
- ✅ **Smart rerun optimization** (auto-skip low-ranked)
- ✅ **Premium exports** (hiring manager reports, Excel)
- ✅ **Interview guide generation**
- ✅ **90-day data retention** (vs 30-day free)
- ✅ **Priority support** (email within 24hr)
- ✅ **Team collaboration** (P1, 3 users)

**Economics:**
- Typical usage: 8 AI jobs/month, 30 candidates each, 2.5 runs per job
- Cost: 8 × 30 × 2.5 × $0.003 = $1.80/month AI cost
- Supabase: $0.50/month
- Vercel: $0.30/month
- **Total COGS: $2.60/month**
- **Revenue: $49/month**
- **Gross margin: 94.7%** ✅

**Break-even:** 15,467 evaluations/month (impossible to hit with typical usage)

**Why Premium Pricing Works:**
- Feedback loop = differentiator (not commodity AI)
- Senior recruiters have budget authority
- $49/mo = hiring ONE better candidate worth $50k+ (0.1% improvement = 10x ROI)
- Clear positioning: "Collaborative AI is premium"

---

### Pay-As-You-Go (Alternative)

**Purpose:** Users who want AI without monthly commitment

**Pricing:**
- $0.15 per initial evaluation (50x markup on cost)
- $0.10 per rerun evaluation
- No monthly fee
- Credit card required upfront
- Credits expire in 12 months

**Use Case:**
- Occasional hiring (1-2 roles per year)
- One-off projects
- Testing before Pro commitment

**Economics:**
- 20 candidates × $0.15 = $3.00
- 1 rerun (10 candidates) × $0.10 = $1.00
- Total: $4.00 per job
- Cost: $0.06 + $0.03 = $0.09
- **Gross margin: 97.8%** ✅

**Note:** Most users will prefer Pro ($49/mo unlimited) over PAYG if they hire 2+ times per month.

---

### Enterprise Tier (Future)

**Purpose:** Large recruiting firms, 50+ users

**Includes:**
- Everything in Pro
- Unlimited users
- White-label exports
- Custom branding
- SSO / SAML
- Dedicated support
- Custom integrations
- SLA guarantees

**Pricing:** $499+/month (based on users)

**Target:** 100+ hires/month, 10+ recruiters

---

## Cost Optimization Strategies

### Strategy 1: Smart Rerun Logic

**Problem:** Naive rerun = re-evaluate ALL candidates = expensive

**Solution:** Only rerun shortlisted + annotated (78% savings)

(Full spec in Workflow 4 above)

**Impact:**
- Typical rerun: $0.15 → $0.033 (78% savings)
- Annual cost at scale (1000 Pro users): $21,600 vs $180,000 saved

---

### Strategy 2: Shortlist Tier Suggestions

**Problem:** Users shortlist too many candidates (waste tokens)

**Solution:** Suggest top 10-15 "Strong" tier, nudge decision

**Impact:**
- Without: Users shortlist 20+ candidates
- With: Users shortlist 10-15 candidates
- Savings: 33% fewer candidates in future reruns

---

### Strategy 3: Regex-Only Track

**Problem:** Not all roles need AI (admin, high-volume)

**Solution:** Free regex forever, keep users engaged after AI limit hit

**Impact:**
- Users stay on platform even after 3 AI jobs used
- Natural upgrade path when important role comes up
- Zero marginal cost (regex is free)

---

### Strategy 4: Batch Processing

**Problem:** Serial API calls slow (60s for 20 candidates)

**Solution:** Parallel processing (3 concurrent API calls)

**Impact:**
- Speed: 60s → 20s (3x faster)
- User perception: "Fast enough" threshold met

---

### Strategy 5: Tier Limits Drive Self-Selection

**Problem:** Power users abuse free tier

**Solution:** 3 jobs, 50 runs = generous but capped

**Impact:**
- Small teams (5-10 hires/year): Never upgrade (OK!)
- Power users (20+ hires/year): Hit limits quickly, upgrade
- Self-selecting: Heavy users pay, light users churn

---

## Launch Criteria

### Functional Completeness
- ✅ Job CRUD (create, read, update, delete)
- ✅ Candidate upload (PDF/DOCX parsing)
- ✅ Two-track evaluation (regex + AI)
- ✅ Inline notes (always visible)
- ✅ Smart rerun (shortlisted + annotated)
- ✅ Tier limits (3 jobs, 50 runs)
- ✅ PDF export (rankings + notes)
- ✅ Status management (pending → hired)

### Quality Gates
- ✅ Zero P0 bugs (feedback loop must work perfectly)
- ✅ Rerun completes <15s (P95)
- ✅ Smart rerun accuracy: 95%+ (processes correct candidates)
- ✅ Tier limit enforcement (hard stops at 3/3, 50/50)
- ✅ Mobile responsive (notes UI works on tablet)
- ✅ PDF export formatting professional

### User Validation
- ✅ 3 beta testers (senior recruiters) complete full workflow
- ✅ Feedback engagement rate: >70% in beta (target 80% at scale)
- ✅ Smart rerun adoption: >60% of reruns use suggested shortlist
- ✅ NPS score: >40 from beta users
- ✅ Quote: "This makes AI useful for me" (positioning validation)

### Go-to-Market Readiness
- ✅ Landing page updated: "Teach AI what great looks like"
- ✅ Demo video: Job creation → Upload → Notes → Rerun → Shortlist (60s)
- ✅ Pricing page: Free tier limits clear, Pro benefits obvious
- ✅ Help docs: "How to use notes to improve rankings"
- ✅ Beta tester quotes (3 testimonials)
- ✅ ProductHunt launch assets prepared

---

## Open Questions

### Product Questions

**Q1: Should regex job conversion to AI consume an AI job slot?**
- Option A: Yes (uses 1 of 3 AI jobs)
- Option B: No (special upgrade path, doesn't count)
- **Recommendation:** Option A (simpler, clearer limits)

**Q2: Can users delete AI jobs to free up slots?**
- Option A: Yes (soft delete, can undelete within 7 days)
- Option B: No (3 jobs is lifetime limit)
- **Recommendation:** Option A (more flexible, less frustration)

**Q3: Should shortlist tier thresholds be configurable?**
- Option A: Fixed (85+ = Strong, 70-84 = Maybe, <70 = Pass)
- Option B: Configurable per user/job
- **Recommendation:** Option A for MVP, Option B for P1

**Q4: How to handle duplicate candidates (same resume uploaded twice)?**
- Option A: Allow duplicates (separate evaluations)
- Option B: Detect + warn ("Similar resume already uploaded")
- **Recommendation:** Option A for MVP (simpler), Option B for P1

**Q5: Should free tier have run limit PER USER or PER JOB?**
- Current: 50 runs per job (150 total if 3 jobs)
- Alternative: 150 runs total across all jobs (more flexible)
- **Recommendation:** Per job (clearer limits, prevents gaming)

---

### Technical Questions

**Q6: Supabase cloud deployment timeline?**
- Option A: Deploy Week 1 (immediate production env)
- Option B: Local dev Week 1-2, cloud Week 3 (less risk)
- **Recommendation:** Option B (validate locally first)

**Q7: Regex scoring algorithm?**
- Option A: Simple keyword count (fast, easy)
- Option B: TF-IDF scoring (better quality, more complex)
- **Recommendation:** Option A for MVP, Option B for P1

**Q8: Smart rerun - what if user unmarks shortlist after rerun?**
- Scenario: User shortlists 10 → reruns → unmarks 5
- Next rerun: Should it include those 5?
- **Recommendation:** No (only current shortlist + new notes)

**Q9: PDF export - include full resume text?**
- Option A: Optional checkbox (default OFF)
- Option B: Never include (export is summary only)
- **Recommendation:** Option A (some managers want full text)

**Q10: Tier limit warnings - when to show?**
- Option A: 40/50 runs (10 left)
- Option B: 45/50 runs (5 left)
- **Recommendation:** Option A (earlier warning, less panic)

---

### Business Questions

**Q11: Beta tester compensation?**
- Option A: Free Pro tier for 6 months
- Option B: Free lifetime (early adopter perk)
- Option C: No compensation (value of tool is enough)
- **Recommendation:** Option A (generous but time-limited)

**Q12: Launch pricing - start at $49 or lower ($29)?**
- Current plan: $49/mo
- Alternative: Launch at $29, increase to $49 after 6 months
- **Recommendation:** $49 from day 1 (don't anchor low, justify with value)

**Q13: ProductHunt launch timing?**
- Option A: Week 4 (right after MVP ships)
- Option B: Week 6 (after polish + beta feedback)
- **Recommendation:** Option B (don't launch with bugs)

**Q14: Free tier data retention - 30 or 90 days?**
- Current plan: 30 days
- Pro tier: 90 days
- **Recommendation:** 30 days (encourages upgrade for long-term projects)

**Q15: Anonymous users (no signup)?**
- Option A: Allow anonymous mode (sessionStorage only)
- Option B: Require signup for all features
- **Recommendation:** Option B (cleaner, easier to enforce limits)

---

## Next Actions

### Week 1: Foundation
1. ☐ Apply database migrations (004: job-centric, 005: tier limits)
2. ☐ Build job CRUD UI (dashboard + detail)
3. ☐ Test candidate upload + parsing
4. ☐ Implement status tracking (pending → hired)
5. ☐ Deploy to Supabase cloud (or stay local)

### Week 2: Two-Track Model
1. ☐ Implement regex evaluation algorithm
2. ☐ Build mode selection UI (job creation)
3. ☐ Implement tier limit tracking
4. ☐ Test AI evaluation (reuse existing endpoint)
5. ☐ Build upgrade prompts (approaching/hit limits)

### Week 3: Collaborative Feedback
1. ☐ Build inline notes UI (always visible)
2. ☐ Implement smart rerun logic (backend)
3. ☐ Build rerun button + confirmation modal
4. ☐ Test rerun completes <15s
5. ☐ Add notes to PDF export

### Week 4: Launch Prep
1. ☐ Beta test with 3 recruiters
2. ☐ Fix bugs identified in beta
3. ☐ Polish UI (loading states, error handling)
4. ☐ Update landing page + demo video
5. ☐ Prepare ProductHunt launch (defer to Week 6)

---

**Next Document:** [User Flows](USER_FLOWS.md) (Mermaid diagrams for all workflows)

**Author:** Product & Growth Lead
**Status:** Production-Ready
**Last Updated:** 2025-11-02
