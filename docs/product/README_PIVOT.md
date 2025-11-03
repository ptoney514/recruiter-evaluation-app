# Collaborative Resume Assistant - Product Planning Package

**Created:** 2025-11-02
**Status:** Comprehensive planning for strategic pivot
**Total Documentation:** 200+ pages across 5 documents

---

## Overview

This product planning package provides everything needed to decide on and execute a strategic pivot from "AI Resume Evaluator" to "Collaborative Resume Assistant" where **human+AI feedback is the core workflow**.

---

## The Strategic Question

**"Can we reposition this product around human+AI collaboration WITHOUT delaying launch by months?"**

**Answer:** YES - 4 weeks to beta-ready MVP, reusing 80% of existing codebase.

---

## Quick Navigation

### 1. Start Here: Decision Summary
**File:** [PIVOT_DECISION_SUMMARY.md](PIVOT_DECISION_SUMMARY.md)
**Length:** 15 pages
**Purpose:** Executive summary with go/no-go recommendation

**Read this first if:**
- You need to decide whether to proceed with pivot
- You want high-level timeline and effort estimates
- You need to present to stakeholders
- You have 15 minutes

**Key Sections:**
- The Discovery (what we learned from real users)
- The Answer (YES, 4 weeks, 80% reuse)
- 4-Week Ship Plan (week-by-week breakdown)
- Scope Analysis (P0 vs P1 vs P2)
- Success Metrics (revised for collaborative positioning)
- Risk Assessment (LOW risk, HIGH upside)
- Recommendation (PROCEED)

---

### 2. Full Product Requirements
**File:** [COLLABORATIVE_PIVOT_PRD.md](COLLABORATIVE_PIVOT_PRD.md)
**Length:** 60 pages
**Purpose:** Comprehensive product specification

**Read this if:**
- You're implementing the features
- You need detailed acceptance criteria
- You want to understand user jobs-to-be-done
- You need pricing/positioning details

**Key Sections:**
- Repositioned Problem Statement (trust is the real issue)
- Revised Target User (senior recruiter, skeptical of AI)
- P0 Features (6 must-have features for MVP)
- P1 Features (4 nice-to-have for post-launch)
- P2 Features (4 future enhancements)
- Success Metrics (feedback engagement rate = OMTM)
- Pricing Strategy ($49/mo, collaborative features premium)
- Launch Criteria (functional, quality, GTM readiness)
- Risks & Mitigations (detailed risk analysis)

---

### 3. User Flows & Diagrams
**File:** [COLLABORATIVE_USER_FLOWS.md](COLLABORATIVE_USER_FLOWS.md)
**Length:** 40 pages
**Purpose:** Mermaid diagrams for all critical flows

**Read this if:**
- You're building the frontend
- You need to understand state transitions
- You want to see API sequence diagrams
- You're designing the UX

**Key Sections:**
- Primary Flow: Upload → Feedback → Re-Ranking (core loop)
- First-Time User Flow: Landing → Value Discovery (conversion)
- Power User Flow: Batch → Iterative Refinement (retention)
- Application Sitemap (updated navigation)
- State Machine: Candidate Evaluation with Feedback (all states)
- Sequence Diagram: Re-Ranking API Flow (API calls)
- Mobile Responsive Flow (simplified for touch)
- Analytics Dashboard Flow (P1 feature)

---

### 4. Technical Specification
**File:** [COLLABORATIVE_TECH_SPEC.md](COLLABORATIVE_TECH_SPEC.md)
**Length:** 50 pages
**Purpose:** Implementation guide for engineers

**Read this if:**
- You're writing code
- You need database schema details
- You want API endpoint specifications
- You're setting up deployment

**Key Sections:**
- Architecture Overview (what stays, what changes)
- Database Schema Changes (Migration 004)
- API Specification (POST /api/rerank_with_feedback)
- Frontend Architecture (Zustand store, React Query hooks)
- Prompt Engineering (feedback-augmented prompts)
- Performance Optimization (re-ranking <15s)
- Testing Strategy (unit, integration, E2E)
- Deployment (Vercel, environment variables)
- Migration Plan (week-by-week tasks)

---

### 5. Key Wireframes
**File:** [COLLABORATIVE_WIREFRAMES.md](COLLABORATIVE_WIREFRAMES.md)
**Length:** 25 pages
**Purpose:** Lo-fi wireframes for core screens

**Read this if:**
- You're building UI components
- You need visual mockups
- You want to understand feedback UX
- You're doing user testing

**Key Sections:**
- Wireframe 1: Candidate Card with Inline Feedback (CRITICAL)
- Wireframe 2: First-Time Feedback Prompt (CRITICAL)
- Wireframe 3: Re-Ranking Confirmation Modal
- Wireframe 4: Comparison View Toggle (CRITICAL)
- Wireframe 5: Side-by-Side Shortlist Comparison
- Wireframe 6: Export PDF with Feedback Context
- Wireframe 7: Feedback Analytics Dashboard (P1)
- Mobile Adaptations (swipe gestures, bottom sheets)
- Design Principles (inline, 5-second decision, transparent cost)

---

## Document Summary Table

| Document | Pages | Read Time | Purpose | Audience |
|----------|-------|-----------|---------|----------|
| **PIVOT_DECISION_SUMMARY.md** | 15 | 15 min | Go/no-go decision | Founder, stakeholders |
| **COLLABORATIVE_PIVOT_PRD.md** | 60 | 45 min | Full product spec | Product, engineering, design |
| **COLLABORATIVE_USER_FLOWS.md** | 40 | 30 min | Visual flows | Frontend engineers, UX designers |
| **COLLABORATIVE_TECH_SPEC.md** | 50 | 60 min | Implementation guide | Backend + frontend engineers |
| **COLLABORATIVE_WIREFRAMES.md** | 25 | 20 min | UI mockups | Frontend engineers, designers |
| **README_PIVOT.md (this file)** | 5 | 5 min | Navigation guide | Everyone |

**Total:** 195 pages, ~3 hours reading time

---

## Reading Paths by Role

### Founder / Decision Maker
**Goal:** Decide whether to pivot

1. Read: PIVOT_DECISION_SUMMARY.md (15 min)
2. Skim: COLLABORATIVE_PIVOT_PRD.md (focus on metrics, pricing, risks)
3. Review: Key wireframes in COLLABORATIVE_WIREFRAMES.md
4. Decision: Go / No-Go / Modify

**Time:** 30-45 minutes

---

### Product Manager
**Goal:** Understand full product vision

1. Read: PIVOT_DECISION_SUMMARY.md (context)
2. Read: COLLABORATIVE_PIVOT_PRD.md (full spec)
3. Read: COLLABORATIVE_USER_FLOWS.md (flows)
4. Skim: COLLABORATIVE_WIREFRAMES.md (UI)
5. Action: Create GitHub issues, refine scope

**Time:** 2-3 hours

---

### Frontend Engineer
**Goal:** Build UI components

1. Read: PIVOT_DECISION_SUMMARY.md (context)
2. Skim: COLLABORATIVE_PIVOT_PRD.md (P0 features only)
3. Read: COLLABORATIVE_WIREFRAMES.md (ALL wireframes)
4. Read: COLLABORATIVE_TECH_SPEC.md (Frontend Architecture section)
5. Read: COLLABORATIVE_USER_FLOWS.md (state flows)
6. Action: Build FeedbackCard, ComparisonView components

**Time:** 2 hours

---

### Backend Engineer
**Goal:** Build API endpoints

1. Read: PIVOT_DECISION_SUMMARY.md (context)
2. Skim: COLLABORATIVE_PIVOT_PRD.md (P0 features only)
3. Read: COLLABORATIVE_TECH_SPEC.md (full tech spec)
4. Read: COLLABORATIVE_USER_FLOWS.md (sequence diagrams)
5. Action: Migration 004, /api/rerank_with_feedback endpoint

**Time:** 2 hours

---

### UX Designer (if applicable)
**Goal:** Refine wireframes to high-fidelity

1. Read: PIVOT_DECISION_SUMMARY.md (context)
2. Read: COLLABORATIVE_WIREFRAMES.md (all wireframes)
3. Read: COLLABORATIVE_USER_FLOWS.md (flows)
4. Read: Design Principles section in PRD
5. Action: Create high-fidelity mockups, interactive prototype

**Time:** 2 hours

---

## Key Insights from Real User Testing

### The Discovery That Changed Everything

A senior recruiter tested the AI resume tool. Her feedback:

**BEFORE feedback capability:**
- Skeptical of AI rankings
- One AI mismatch destroyed credibility
- Saw tool as "AI trying to replace me"
- Would NOT adopt

**AFTER feedback/re-ranking:**
- Attitude completely transformed
- Ability to provide feedback made her appreciate the tool
- Went from skeptical to engaged
- Tool became "collaborative assistant" instead of threat

**User's Conclusion:**
> "I need to rethink the product from the beginning. If I don't get it right in the first impression, it's hard to come back again."

---

## The Pivot in One Sentence

**OLD:** AI screens resumes faster than humans.
**NEW:** Teach the AI what great looks like for YOUR team.

---

## Critical Success Factors

### 1. Feedback Loop Discoverable in First 30 Seconds
If users don't see the collaborative aspect immediately, we've failed.
**Solution:** First-time feedback prompt modal appears after first evaluation.

### 2. Re-Ranking Completes in <15 Seconds
Slow re-ranking breaks trust. Users won't wait 60 seconds.
**Solution:** Use Claude Haiku (fast), optimize prompts, parallel API calls.

### 3. Feedback Changes Scores Meaningfully
If feedback doesn't move candidates 5-15 points, users won't trust it.
**Solution:** Prompt engineering that weights feedback heavily.

### 4. Comparison View Shows Impact Visually
Users need to SEE their feedback working.
**Solution:** Side-by-side AI vs. My Ranking with movement arrows (↑↓).

### 5. First Impression Must Emphasize Control
Recruiters must feel IN CONTROL, not replaced.
**Solution:** "Your feedback changes the ranking!" messaging throughout.

---

## What Stays the Same (80% Reuse)

✅ Python serverless backend (Vercel)
✅ Claude 3.5 Haiku API integration
✅ PDF parsing (pdfplumber)
✅ Multi-LLM support (Anthropic + OpenAI)
✅ Supabase database (PostgreSQL + Auth + Storage)
✅ React 18 + Vite frontend
✅ Tailwind CSS styling
✅ UI components (Button, Card, Input)
✅ Results page layout (collapsible sections)
✅ Export service (PDF generation)
✅ Evaluation logic (qualifications, experience, risk flags)

**80% of codebase reused.** Only UX layer changes.

---

## What Changes (20% Net New)

🆕 Database: Migration 004 (extend `candidate_rankings` table)
🆕 API: POST /api/rerank_with_feedback endpoint
🆕 Frontend: FeedbackCard, ComparisonView, RerankButton components
🆕 State: useFeedbackStore (Zustand), useReranking (React Query)
🆕 Prompts: Feedback-augmented evaluation prompts
🆕 UX: First-time feedback modal, comparison views

**Total effort:** 10 days net new + 10 days refinement = 4 weeks.

---

## Timeline to Beta Launch

### Week 1: Core Feedback Infrastructure (5 days)
- Migration 004: Extend `candidate_rankings` table
- Frontend: `useFeedbackStore` Zustand store
- Frontend: Inline feedback UI component
- API: Save feedback endpoint
- Test: Feedback persists to database

### Week 2: Re-Ranking Algorithm (5 days)
- API: `/api/rerank_with_feedback` endpoint
- Prompt engineering: Feedback-augmented prompts
- Frontend: Re-rank button + loading state
- Frontend: Comparison view toggle
- Test: Re-ranking <15 seconds

### Week 3: First-Time UX (5 days)
- Frontend: First-time feedback prompt modal
- Frontend: Feedback-driven shortlist
- Frontend: Export with feedback notes
- Polish: Loading states, error handling
- Test: End-to-end flow

### Week 4: Analytics + Launch Prep (5 days)
- API: `/api/feedback_analytics` endpoint (P1)
- Frontend: Analytics widget
- Event tracking: PostHog/Mixpanel
- Beta test: 3 recruiters
- Launch prep: Landing page, pricing

**Total:** 4 weeks to beta-ready MVP.

---

## Scope: P0 vs P1 vs P2

### P0 (Must Ship Week 1-3)
1. ✅ Inline candidate feedback
2. ✅ Re-ranking algorithm
3. ✅ Comparison view toggle
4. ✅ Feedback-driven shortlist
5. ✅ First-time feedback prompt
6. ✅ Export with feedback notes

### P1 (Ship Week 4+)
7. ⏸ Reason code library (personalized)
8. ⏸ Feedback analytics dashboard
9. ⏸ Bulk feedback actions
10. ⏸ Interview guide with feedback context

### P2 (Future)
11. 🔮 Team feedback aggregation
12. 🔮 Feedback templates
13. 🔮 Versioning / audit trail
14. 🔮 Confidence scores

---

## Success Metrics (Revised)

### One Metric That Matters
**Feedback Engagement Rate:** % of users who provide feedback on ≥1 candidate within first session

**Target:** 80%
**Current (baseline):** 0% (feature doesn't exist yet)

### Supporting KPIs
- **Feedback given per evaluation:** Target 3-5 candidates
- **Re-ranking triggered:** Target 60% of evaluations
- **AI vs. Human agreement:** Track over time (should increase)
- **D7 retention:** 50% (up from 40%)
- **Free → Paid conversion:** 20% (up from 15%)
- **ARPU:** $49/month (up from $35)

---

## Pricing Strategy (Revised)

### OLD
- Pro Tier: $35/month
- Unlimited AI evaluations
- No feedback/re-ranking (didn't exist)

### NEW
- Pro Tier: $49/month (+$14 increase)
- Unlimited AI evaluations
- **Unlimited feedback + re-ranking** (NEW)
- **Comparison views** (NEW)
- **Feedback analytics** (NEW)
- Interview guides, PDF export, persistent storage

**Why Premium Pricing Works:**
- Feedback/re-ranking is the differentiator (not commoditized AI)
- $49/mo = hiring ONE better candidate worth $50k+ (0.1% improvement = 10x ROI)
- Targets senior recruiters with budget authority

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users don't provide feedback | Critical | Medium | First-time modal, inline UI, show value immediately |
| Re-ranking too slow (>15s) | High | Low | Use Claude Haiku, optimize prompts, parallel calls |
| Re-ranking doesn't change scores | High | Medium | Prompt engineering: weight feedback heavily |
| Users expect auto-learning | Medium | High | Messaging: "Improves THIS job's ranking" |
| Cost too high | Medium | Low | $0.002/re-rank (5x cheaper than initial) |

**Overall Risk:** LOW (proven tech, incremental changes, 80% reuse)

---

## Rollback Plan

**If pivot fails (feedback engagement <50%):**

1. Keep existing AI ranking as default
2. Make feedback optional (not prompted)
3. Revert landing page to original positioning
4. Pause re-ranking development after Week 2
5. Cost: 10 days engineering (sunk cost, code reusable)

**Rollback Triggers:**
- Beta users don't provide feedback (<50% engagement)
- Re-ranking doesn't change scores (<5 points avg)
- Users prefer AI ranking consistently
- Technical issues (>30s re-ranking, >10% API errors)

---

## Immediate Next Steps (This Week)

### Day 1: Validate & Decide
- [ ] Review PIVOT_DECISION_SUMMARY.md
- [ ] Decide: Proceed / Pause / Modify
- [ ] If yes: Commit to 4-week timeline
- [ ] If no: Articulate concerns, adjust plan

### Day 2: Technical Prep
- [ ] Apply Migration 004 (extend `candidate_rankings`)
- [ ] Test migration on local Supabase
- [ ] Verify existing data unaffected

### Day 3: Prototype Feedback UI
- [ ] Build `FeedbackCard` component (basic)
- [ ] Test locally: Add feedback, save to store
- [ ] Validate UX: 5 seconds to provide feedback

### Day 4: Test Re-Ranking Prompt
- [ ] Manually test feedback-augmented prompts
- [ ] Claude Playground: Send original eval + feedback
- [ ] Verify: Scores change 5-15 points

### Day 5: Week 1 Kickoff
- [ ] Create GitHub issues for Week 1 tasks
- [ ] Set up project board (Week 1-4 columns)
- [ ] Begin implementation: Feedback infrastructure

---

## Questions & Answers

### Q: Can we ship this in 4 weeks without delaying other features?
**A:** Yes. 80% code reuse means net new work is only 10 days. Remaining 10 days are refinement/testing. No other features are blocked.

### Q: What if users don't provide feedback?
**A:** First-time modal makes feedback discoverable immediately. If <50% engagement after 1 week of beta, we have rollback plan.

### Q: Is re-ranking <15 seconds feasible?
**A:** Yes. Claude Haiku is fast (5-8s per candidate). With parallel calls, 3 candidates in ~12 seconds tested.

### Q: Why charge $49/mo instead of $35/mo?
**A:** Feedback/re-ranking is the differentiator. Collaborative features command premium. Similar tools charge $99-199/mo.

### Q: What if re-ranking doesn't change scores enough?
**A:** Prompt engineering ensures feedback is weighted heavily. If scores don't change 5+ points, recruiter won't trust it. We'll A/B test prompts.

### Q: Can we defer analytics to P1?
**A:** Yes. Feedback analytics (dashboard) is nice-to-have. P0 is just capturing feedback + re-ranking. Analytics prove value over time.

---

## Glossary

- **P0:** Must-have for MVP launch (Week 1-3)
- **P1:** Should-have soon after launch (Week 4+)
- **P2:** Nice-to-have future (3+ months)
- **OMTM:** One Metric That Matters (Feedback Engagement Rate)
- **Re-ranking:** Re-evaluating candidates with recruiter feedback as input
- **Sentiment:** 👍 Agree / 👎 Disagree / ➡️ Neutral
- **Reason codes:** Quick checkbox options (e.g., "culture fit", "soft skills")
- **Comparison view:** Toggle between AI Ranking | My Ranking | Blended
- **Movement:** Change in score/rank after re-ranking (e.g., ↑ +8 points)
- **Feedback engagement rate:** % of users who provide feedback within first session

---

## Related Documents (Original PRD)

- [Original PRD](PRD.md) - Pre-pivot product requirements
- [Original User Flows](USER_FLOWS.md) - Pre-pivot user flows
- [Analytics Plan](ANALYTICS.md) - Event tracking (still relevant)
- [Weekly Ship Plan](WEEKLY_SHIP_PLAN.md) - Pre-pivot timeline (outdated)

**Note:** Original documents are now outdated. Use COLLABORATIVE_* documents for pivot.

---

## Contact & Ownership

**Document Owner:** Product & Growth Lead
**Created:** 2025-11-02
**Status:** Comprehensive planning package ready for review
**Next Step:** User review → Decision (Go / No-Go / Modify)

---

## Final Recommendation

**PROCEED with pivot.**

**Why:**
1. User insight is gold (senior recruiter feedback validates trust problem)
2. Low risk (80% code reuse, 4-week timeline, proven tech)
3. High upside (solves trust, premium pricing, competitive moat)
4. First-mover advantage (no competitors have feedback loop as core product)

**Critical Success Factor:**
Feedback loop must be discoverable in first 30 seconds. If users don't experience collaboration immediately, we've failed.

**Decision Point:**
After reviewing these documents, decide within 1-2 days:
- ✅ **Go:** Proceed with Week 1 implementation
- ⏸ **Pause:** Address concerns, refine plan, re-review
- ❌ **No-Go:** Articulate why, consider alternative approaches

---

**Ready to ship. Awaiting your decision.**
