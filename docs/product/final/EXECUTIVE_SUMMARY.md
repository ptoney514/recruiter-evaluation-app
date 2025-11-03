# Executive Summary - Resume Scanner Pro: Collaborative Resume Assistant

**Version:** 3.0 FINAL | **Date:** 2025-11-02 | **Status:** Production-Ready Specification

---

## The Critical Discovery

A senior recruiter tested our AI tool. Her reaction revealed the fatal flaw in every AI screening product:

**Before feedback capability:**
- Skeptical of AI rankings, even when accurate
- One AI mismatch = complete loss of trust
- Saw tool as "trying to replace me"

**After adding feedback/re-ranking:**
- Attitude transformed completely
- Went from skeptical to engaged
- Tool became "collaborative assistant"

**Her conclusion:**
> "I need to be able to teach the AI what matters for MY team. The feedback loop isn't optional - it's what makes AI trustworthy."

---

## Final Product Positioning

**OLD (Failed):** "AI screens resumes faster than humans"
**NEW (Validated):** "Teach the AI what great looks like for YOUR team"

**Resume Scanner Pro** is the only AI recruiting tool where the recruiter stays in control. Upload resumes, review AI rankings, provide quick feedback on 2-3 candidates, and watch the AI re-rank based on YOUR expertise in 15 seconds. The tool gets smarter every time you use it.

### Tagline
"Human + AI > Either Alone"

---

## Go-to-Market Strategy

### Phase 1: Job-Centric Foundation (Week 1-2)
**Position:** "Organize recruiting by job, not by pile of resumes"

**Value Props:**
- Create job → Upload candidates → Track through hiring
- Status management: Pending → Shortlisted → Finalist → Hired
- Full audit trail per hiring decision
- Return anytime, pick up where you left off

**Target:** Solo recruiters, small HR teams (5-20 hires/year)

### Phase 2: Two-Track Evaluation (Week 2-3)
**Position:** "Free regex screening forever, AI when it matters"

**Value Props:**
- Regex-only: Keyword matching, FREE unlimited
- AI-powered: Context + reasoning, 3 jobs FREE then $49/mo
- Side-by-side comparison (see the difference)
- Upgrade path when important role comes up

**Target:** Cost-conscious recruiters testing AI tools

### Phase 3: Collaborative Feedback (Week 3-4)
**Position:** "The only AI that learns from YOUR judgment"

**Value Props:**
- Inline notes: "This person worked here before - red flag"
- Rerun ranking: AI re-evaluates with your context
- Smart rerun: Only processes shortlisted + annotated candidates
- Cost-optimized: $0.003/candidate, ~$0.03/rerun

**Target:** Senior recruiters burned by black-box AI tools

### Phase 4: Two-Stage Workflow (Week 5-6)
**Position:** "From 100 resumes → 10 interviews → 1 hire, all in one tool"

**Value Props:**
- Stage 1: Initial shortlisting (100 → 10)
- Return with interview notes
- Stage 2: Final selection (10 → 1)
- Hiring manager reports

**Target:** Recruiters managing full hiring pipeline

---

## Success Metrics

### One Metric That Matters
**Feedback Engagement Rate = 80%**

**Definition:** % of AI evaluation runs where recruiter provides feedback on at least 1 candidate

**Why:** Proves users trust the collaborative model vs. black-box AI

### Supporting KPIs

#### Week 1-2: Job Adoption
- Jobs created per user: Target 2.5
- Candidates uploaded per job: Target 25
- Status updates per candidate: Target 1.5
- Return rate (opens job 2+ times): Target 70%

#### Week 3-4: Two-Track Model
- Regex vs AI job ratio: Target 60/40 (most try AI)
- AI evaluation runs per job: Target 2.3
- Free tier → Pro conversion: Target 15-20%
- AI job limit hit rate: Target 30% (upgrade pressure)

#### Week 5-6: Collaborative Feedback
- Feedback engagement rate: Target 80%
- Rerun triggered rate: Target 60% of evaluations
- Avg notes per rerun: Target 2.5 candidates
- Cost per rerun: Target $0.03 (10 candidates)

#### Week 7-8: Business Metrics
- D7 retention: Target 50%
- Free → Paid conversion: Target 18%
- ARPU: Target $42/month
- NPS: Target 50+

---

## 4-Week Launch Timeline

### Week 1: Job-Centric Architecture (Foundation)
**Goal:** Recruiters can organize recruiting by job

**Ships:**
- Job creation + management (CRUD)
- Candidate upload + parsing (PDF/DOCX)
- Status tracking (pending/shortlisted/finalist/hired)
- Job detail view with candidate list
- Database migrations (jobs, candidates, evaluations)

**Acceptance:**
- Create job → Upload 10 resumes → Mark 3 as shortlisted → Return next day, see state preserved

**Effort:** 5 days

---

### Week 2: Two-Track Evaluation Model
**Goal:** Free regex forever, AI when it matters

**Ships:**
- Regex-only mode (keyword matching, FREE)
- AI-powered mode (Claude Haiku, 3 jobs FREE)
- Mode selection UI (toggle at job creation)
- Tier limit tracking (3/3 AI jobs, 40/50 runs)
- Upgrade prompts (approaching limits)
- Basic ranking UI (score, recommendation, reasoning)

**Acceptance:**
- Create regex job → Upload 20 resumes → See keyword matches → Export shortlist
- Create AI job → Upload 10 resumes → See AI scores + reasoning → Compare to regex results
- Hit 3 AI jobs → See upgrade prompt

**Effort:** 5 days

---

### Week 3: Collaborative Feedback Loop
**Goal:** Recruiter teaches AI what matters

**Ships:**
- Inline notes (always-visible text field per candidate)
- "Rerun Ranking" button (grayed out until notes added)
- Smart rerun logic (only shortlisted + annotated)
- Cost preview ("This will process 8 candidates, ~$0.024")
- Re-ranked results with movement indicators
- Feedback persistence (saved to database)

**Acceptance:**
- Upload 20 candidates → AI ranks → Add notes to 2 candidates → Click "Rerun Ranking" → See updated scores in <15s → Notes appear in export

**Effort:** 5 days

---

### Week 4: Polish + Launch Prep
**Goal:** Production-ready for limited beta

**Ships:**
- PDF export with notes + rankings
- Tier limit warnings (visual indicators)
- Error handling (retry, graceful failures)
- Analytics events (feedback given, rerun triggered)
- Help docs (feedback workflow)
- Beta tester onboarding (3 senior recruiters)

**Acceptance:**
- All P0 features work end-to-end
- Zero P0 bugs (feedback loop must be flawless)
- 3 beta testers complete full workflow
- Feedback engagement rate >70% in beta

**Effort:** 5 days

---

### Week 5-6: Two-Stage Workflow (Post-MVP)
**Goal:** Support full hiring pipeline

**Ships:**
- Shortlist tier suggestions ("Strong" 10, "Maybe" 8, "Pass" 32)
- "Move Strong to Shortlist" button
- Return workflow (open job, see shortlist)
- Stage 2 prep: Interview context collection
- Hiring manager export templates

**Effort:** 10 days (deferred to post-launch)

---

## Pricing Model (Final)

### Free Tier (Token-Based, Generous but Capped)
**Purpose:** Small teams might never upgrade - that's OK! Low CAC (~$0.45 total AI cost)

**Limits:**
- **150,000 tokens per month** (~50-150 candidate evaluations)
- **3 AI jobs per month** (resets monthly)
- **Unlimited regex-only jobs** (no tokens used)
- All collaborative features (notes, smart rerun, "Rerun All")
- 50 candidates per batch max
- IP-based rate limiting (max 5 accounts per IP)

**Why Token-Based is Better:**
- ✨ **Transparency:** Users see exactly what AI costs
- ✨ **Flexibility:** Run many small batches or few large ones
- ✨ **Incentive:** Encourages efficient use (shortlist early, use smart rerun)
- ✨ **Education:** Shows AI isn't "magic" (has real compute cost)
- ✨ **Industry standard:** Matches OpenAI/Anthropic model

**Economics:**
- Typical usage: 100 evaluations = 100,000 tokens
- CAC: 100,000 tokens × $0.003/1000 = $0.30
- If 18% convert to Pro: $49 × 0.18 = $8.82 revenue
- **LTV:CAC = 168:1** ✅

### Pro Tier ($49/month)
**Purpose:** High margin, targets agencies + high-volume recruiters

**Includes:**
- **Unlimited AI jobs**
- **Unlimited tokens** (no monthly cap)
- 200 candidates per batch max (vs 50 free)
- Smart rerun optimization (auto-skip low-ranked)
- "Rerun All" with token transparency
- Manual drag-to-reorder with reasoning (P1)
- Premium exports (hiring manager reports, Excel)
- Interview guide generation
- Priority support

**Economics:**
- Revenue: $49/month
- Typical usage: 600 evaluations = 600,000 tokens
- AI cost: 600,000 × $0.003/1000 = $1.80/month
- **Gross margin: 96.3%** ✅
- Break-even: 16.3M tokens/month (impossible to hit)

**Why Premium Pricing Works:**
- Feedback loop = differentiator (not commodity AI)
- Senior recruiters have budget authority
- $49/mo = hiring ONE better candidate worth $50k+ (0.1% improvement = 10x ROI)
- Clear positioning: "Collaborative AI is premium"

---

## Product Architecture

### Job-Centric Mental Model

**Problem Solved:** Recruiters think in "requisitions", not "batches"

**Structure:**
```
Job (Container)
├── Metadata (title, requirements, status)
├── Candidates (10-200 per job)
│   ├── Resume text + file
│   ├── AI evaluation (if AI mode)
│   ├── Status (pending/shortlisted/finalist/hired/rejected)
│   └── Notes (recruiter context)
├── Evaluation Runs (version history)
│   ├── Run 1: Initial upload (50 candidates)
│   ├── Run 2: Rerun with notes (10 candidates)
│   └── Run 3: New candidates added (5 candidates)
└── Usage Tracking (runs used, cost, tier limits)
```

**Benefits:**
- Natural return workflow (open job, continue where left off)
- Full audit trail (every evaluation saved)
- Usage-based pricing alignment (jobs + runs)
- Matches recruiter mental model perfectly

---

### Two-Track Evaluation Architecture

**Track 1: Regex-Only (FREE)**
```
Upload resumes → Extract text → Keyword matching → Score (0-100) → Rank → Export
```

**Features:**
- Fast (<5s for 50 resumes)
- Keyword highlighting
- Full UI (notes, status, export)
- Zero AI cost

**Limitations:**
- No reasoning/context
- No re-ranking with notes
- Simple keyword matching only

**Track 2: AI-Powered (3 FREE, then PAID)**
```
Upload resumes → Extract text → Claude Haiku evaluation → Score + reasoning → Rank → Notes → Rerun → Export
```

**Features:**
- Contextual reasoning
- Re-ranking with recruiter feedback
- Smart rerun logic
- Interview guide generation
- Premium exports

**Cost:**
- Initial: $0.003/candidate
- Rerun: $0.003/candidate (only shortlisted + annotated)

**Upgrade Path:**
- Regex job can be converted to AI job later
- "See AI analysis" button on regex results
- Side-by-side comparison

---

### Collaborative Feedback Architecture

**Selective Annotation (Not Systematic Review)**

**Key insight:** Recruiters don't review ALL candidates - they spot 1-2 standouts with insider context.

**Flow:**
1. AI ranks 50 candidates
2. Recruiter scans list (2 minutes)
3. Spots 2-3 candidates with context:
   - "This person worked here - red flag"
   - "Job title inflated - was IC level"
   - "Cultural fit concern from previous interaction"
4. Adds quick inline notes (always visible text field)
5. Clicks "Rerun Ranking" (grayed out until notes added)
6. AI re-evaluates with recruiter context (only shortlisted + annotated)
7. Updated ranking appears (<15s)

**Sometimes zero feedback:** Accept AI ranking, move to shortlist, export PDF.

---

## Smart Rerun Logic (Cost Optimization)

### Conservative Approach (Production-Ready)

**Only rerun:**
1. All shortlisted candidates (recruiter flagged these as interesting)
2. Any candidate with new notes since last run (recruiter added context)

**Don't rerun:**
- Low-ranked candidates (<70 score) without notes (waste of tokens)
- Already-rejected candidates without new context
- Candidates with no changes since last run

**Example:**
- Job has 50 candidates
- 10 shortlisted
- Recruiter adds notes to 2 (one shortlisted, one not)
- Rerun evaluates: 10 shortlisted + 1 new note = **11 candidates**
- Cost: 11 × $0.003 = **$0.033**

**Savings vs. full rerun:**
- Full: 50 × $0.003 = $0.15
- Smart: 11 × $0.003 = $0.033
- **Savings: 78%**

---

### AI-Suggested Shortlist Tiers

**After initial run, system suggests:**
- ✅ **Strong Candidates (10)** - Scores 85-95, recommend interview
- 🟡 **Maybe Candidates (8)** - Scores 70-84, consider phone screen
- ❌ **Not Recommended (32)** - Scores <70, missing key requirements

**Smart default:** "Move Strong to Shortlist" button
- Creates shortlist of 10
- Future reruns only process those 10
- Saves tokens naturally
- Forces intentional decision ("Do I agree with AI's strong tier?")

---

## Reuse 80% of Existing Code

### Already Built (No Changes)
- Python serverless functions (Vercel)
- Claude 3.5 Haiku API integration
- PDF parsing (pdfplumber)
- Multi-LLM support (Anthropic + OpenAI)
- Stage 1 evaluation logic
- React 18 + Vite frontend
- Tailwind UI components
- Supabase database (partial)

### Net New (20% Effort)
- Job-centric UI (dashboard, job detail)
- Two-track mode selection
- Tier limit tracking
- Inline notes UI
- Smart rerun logic
- Shortlist tier suggestions

**Total Effort:** 20 days (4 weeks) to production-ready MVP

---

## Cost Analysis & Unit Economics (Token-Based)

### Free Tier Economics

**Assumptions:**
- Avg user creates 2 AI jobs per month
- Avg 25 candidates per job
- Avg 2 runs per job (initial + 1 smart rerun)
- **Total: 100 candidate evaluations**

**Token Usage:**
- 100 evaluations × 1,000 tokens = **100,000 tokens used**
- Remaining: 50,000 tokens (33% buffer)

**Costs:**
- 100,000 tokens × $0.003/1000 = **$0.30 CAC**

**Conversion:**
- If 18% convert to Pro at $49/mo (improved from 15% due to better UX)
- Revenue per signup: $49 × 0.18 = **$8.82**
- LTV (6 months): $49 × 6 × 0.18 = **$52.92**
- **LTV:CAC ratio = 176:1** ✅ (improved!)

### Pro Tier Economics

**Assumptions:**
- Pro user creates 8 AI jobs/month
- Avg 30 candidates per job
- Avg 2.5 runs per job (initial + 1.5 reruns)
- **Total: 600 candidate evaluations**

**Token Usage:**
- 600 evaluations × 1,000 tokens = **600,000 tokens used**
- Unlimited tier, no cap

**Costs:**
- 600,000 tokens × $0.003/1000 = **$1.80/month AI cost**
- Supabase + Vercel: **$0.80/month infrastructure**
- **Total COGS: $2.60/month**

**Margins:**
- Revenue: $49/month
- AI cost: $1.80/month
- Supabase: $0.50/month (est)
- Vercel: $0.30/month (est)
- **Total COGS: $2.60/month**
- **Gross margin: 94.7%** ✅

### Break-Even Analysis

**Pro tier break-even:**
- Revenue: $49/month
- Fixed costs: $2.60/month (Supabase + Vercel)
- Variable cost: $0.003/candidate evaluation
- Break-even: (49 - 2.60) / 0.003 = **15,467 evaluations/month**

**Reality check:**
- Typical Pro usage: 600 evaluations/month
- Typical Pro cost: $1.80 + $2.60 = $4.40/month
- **We'd need 25x typical usage to break even** ✅

**Conclusion:** Economics work even with generous free tier.

---

## Launch Criteria

### Functional Completeness
- ✅ Job CRUD (create, edit, delete, list)
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
- ✅ Smart rerun accuracy: 95%+ (only relevant candidates)
- ✅ Tier limit enforcement (hard stops at 3/3, 50/50)
- ✅ Mobile responsive (feedback UI works on tablet)

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

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Users don't provide feedback** | Critical | Medium | Inline notes (not modal), show value immediately, cost preview |
| **Smart rerun logic incorrect** | High | Low | Conservative rules (shortlisted + annotated), test extensively |
| **Free tier too generous** | Medium | Low | 150 runs = $0.45 CAC, LTV:CAC = 147:1, economics still work |
| **Tier limits confuse users** | Medium | Medium | Visual progress bars, clear warnings at 40/50, upgrade CTAs |
| **Regex vs AI not clear** | Medium | Medium | Side-by-side comparison, "Try AI" button on regex results |
| **Rerun too slow (>15s)** | High | Low | Claude Haiku (fast), parallel processing, only process 10-15 candidates |
| **Job-centric model doesn't fit** | High | Low | Matches recruiter mental model (validated with user research) |
| **Two-stage workflow too complex** | Medium | Low | Ship Stage 1 only for MVP, Stage 2 deferred to Week 5-6 |

**Overall Risk:** LOW
- Proven tech stack (Claude, Supabase, React)
- 80% code reuse (incremental changes)
- User-validated positioning (feedback loop)
- Conservative free tier (economics work even if generous)

---

## Rollback Plan

**If feedback engagement rate <50% after beta:**

### Option 1: Simplify Feedback (Keep Positioning)
- Remove rerun button (too intimidating?)
- Keep inline notes (passive feedback)
- Show notes in export only
- Defer re-ranking to future release

### Option 2: Revert to Basic AI (Abandon Collaborative Positioning)
- Keep AI ranking as-is
- Remove feedback/rerun features
- Position as "Fast AI screening"
- Focus on speed/cost vs. collaboration

### Option 3: Double Down on Selective Annotation
- Simplify to thumbs up/down only
- Remove reason codes (too much friction?)
- Show "Your picks" vs "AI picks" side-by-side
- No re-ranking, just comparison

**Rollback Triggers:**
- Feedback engagement rate <50% after 100 evaluation runs
- Smart rerun logic fails (processes wrong candidates >10% of time)
- Performance issues (rerun >30 seconds consistently)
- Beta testers prefer basic AI over collaborative model

**Cost:** 4 weeks engineering (sunk cost if rollback needed)

---

## Competitive Positioning

### vs. Greenhouse, Lever (ATS with AI)
**Their Weakness:** Black-box AI, no feedback loop, expensive ($500+/mo)
**Our Strength:** Collaborative AI, generous free tier, job-centric

### vs. HireVue, Pymetrics (AI Assessment)
**Their Weakness:** Pre-hire assessments (additional step), expensive
**Our Strength:** Resume-only, integrated workflow, fast

### vs. ChatGPT Prompts (DIY AI)
**Their Weakness:** Manual copy-paste, no workflow, no audit trail
**Our Strength:** Batch processing, feedback loop, full history

### vs. Upwork, Fiverr (Human Screening)
**Their Weakness:** Slow (days), expensive ($50-200/batch), inconsistent
**Our Strength:** Fast (minutes), cheap ($0.15/batch), consistent + improvable

**Moat:**
1. **Feedback loop as core product** (not optional feature)
2. **Job-centric architecture** (matches recruiter mental model)
3. **Smart rerun logic** (cost optimization built-in)
4. **Generous free tier** (low switching costs, viral growth)

---

## Open Questions (Require User Input)

1. **Beta testers:** Confirmed 3 senior recruiters lined up for Week 4?

2. **Supabase setup:** Deploy to Supabase cloud Week 1 or stay local until Week 3?
   - Recommendation: Local Week 1-2, cloud Week 3 (less risk)

3. **Regex implementation:** Use simple keyword matching or TF-IDF scoring?
   - Recommendation: Start simple (keyword count), add TF-IDF Week 5+

4. **Tier limit UX:** Hard stop at 3 AI jobs or allow "1 more job, then upgrade"?
   - Recommendation: Hard stop (clear boundary, forces decision)

5. **Rerun cost display:** Show exact cost ($0.033) or rounded ($0.03)?
   - Recommendation: Rounded (less intimidating)

6. **Shortlist tier names:** "Strong/Maybe/Pass" or "Interview/Phone/Decline"?
   - Recommendation: "Interview/Phone/Decline" (clearer actions)

---

## Immediate Next Steps (This Week)

### Day 1: Validate & Decide
- ☐ Review this executive summary
- ☐ Review complete PRD (COMPLETE_PRD.md)
- ☐ Decide: Proceed with job-centric + two-track model? Yes/No/Modify
- ☐ If yes: Commit to 4-week timeline
- ☐ If no: Articulate concerns, adjust plan

### Day 2: Database Migrations
- ☐ Create migration 004: Add job-centric columns
- ☐ Create migration 005: Add tier limit tracking
- ☐ Apply to local Supabase
- ☐ Test migrations (existing data unaffected)

### Day 3: Job Dashboard Prototype
- ☐ Design job dashboard (list view)
- ☐ Design job detail view (candidate list)
- ☐ Sketch inline notes UI (always visible)
- ☐ Get user feedback (1-2 recruiters)

### Day 4: Regex Implementation
- ☐ Build keyword matching algorithm
- ☐ Test with sample resumes (compare to AI)
- ☐ Measure speed (target <5s for 50 resumes)

### Day 5: Week 1 Kickoff
- ☐ Create GitHub issues (Week 1 tasks)
- ☐ Set up project board (Week 1-4 columns)
- ☐ Begin implementation: Job CRUD + migrations

---

## Success Definition

**MVP Launch Success = All 3:**
1. **Functional:** All P0 features ship (job-centric, two-track, feedback loop)
2. **Quality:** Zero P0 bugs, <15s rerun, 3 beta testers complete workflow
3. **Positioning:** Feedback engagement rate >70%, beta testers quote "makes AI useful"

**6-Month Success = All 4:**
1. **Adoption:** 500 jobs created, 60% are AI-powered (not just regex)
2. **Engagement:** 80% feedback engagement rate, 50% D7 retention
3. **Conversion:** 18% free → paid, $42 ARPU
4. **Economics:** <$5 CAC (free tier), 95%+ gross margin (Pro tier)

---

## Recommendation: PROCEED

**Why:**
1. **User insight validated** - Feedback loop solves trust problem
2. **Economics proven** - 147:1 LTV:CAC, 95% gross margin
3. **Low risk** - 80% code reuse, 4-week timeline, proven tech
4. **High upside** - First mover on collaborative AI, premium pricing justified
5. **Scalable architecture** - Job-centric model supports full hiring pipeline

**Critical Success Factors:**
1. **Feedback loop must be discoverable** - Inline notes (not hidden), rerun button visible
2. **Smart rerun must work perfectly** - Only process relevant candidates, <15s, <$0.05
3. **Tier limits must drive upgrades** - Visual progress, clear value, soft nudges
4. **Positioning must be consistent** - Every touchpoint says "teach AI what matters"

---

**Next Document:** [Complete PRD](COMPLETE_PRD.md) (40 pages, full product requirements)

**Author:** Product & Growth Lead
**Date:** 2025-11-02
**Status:** Production-Ready
**Approval Required:** Founder
