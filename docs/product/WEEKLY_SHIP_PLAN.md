# Resume Scanner Pro - Weekly Ship Plan

**Version:** 1.0 | **Date:** 2025-11-01 | **Target Launch:** December 13, 2025 (6 weeks)

---

## Overview

This plan breaks down the MVP launch into **6 weekly sprints**, each with a shippable increment. All work is scoped to 1-week cycles for fast learning velocity.

**Key Principles:**
- ✅ Ship to staging every Friday
- ✅ Feature flags for all new features (safe rollback)
- ✅ Manual testing before merge to main
- ✅ Keep PRs under 400 lines
- ✅ Link all commits to issues/tickets

---

## Week 1 (Nov 4-8): Supabase Foundation ✅ PARTIALLY COMPLETE

**Goal:** Complete authentication and database integration

**Status:** 60% complete (local Supabase running, migrations 001-003 done)

### Remaining Tasks

- [ ] **Migration 004: Add user_id + RLS policies** (4 hours)
  - Add `user_id` column to `jobs`, `candidates`, `evaluations`, `candidate_rankings`
  - Create RLS policies: Users can only read/write their own data
  - Test RLS with different user contexts
  - **Acceptance:** RLS blocks cross-user access in local Supabase

- [ ] **Frontend Supabase client setup** (2 hours)
  - Install `@supabase/supabase-js`
  - Create `frontend/src/lib/supabase.ts` client
  - Configure environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - **Acceptance:** Client can query Supabase from browser

- [ ] **Create useAuth hook** (3 hours)
  - `frontend/src/hooks/useAuth.ts`
  - Functions: `signUp`, `login`, `logout`, `getCurrentUser`
  - Zustand store for auth state
  - **Acceptance:** Hook exposes user state and auth methods

- [ ] **Build Login page** (3 hours)
  - `frontend/src/pages/LoginPage.tsx`
  - Email + password form
  - Error handling (invalid credentials, network errors)
  - Redirect to dashboard on success
  - **Acceptance:** User can login and see dashboard

- [ ] **Build Signup page** (3 hours)
  - `frontend/src/pages/SignupPage.tsx`
  - Email + password form (min 8 chars)
  - Terms checkbox
  - Redirect to dashboard on success
  - **Acceptance:** User can sign up and create account

- [ ] **Migrate sessionStorage to Supabase on signup** (2 hours)
  - Detect if sessionStorage has jobs/candidates
  - Copy to Supabase on first login
  - Clear sessionStorage after migration
  - **Acceptance:** Anonymous user data persists after signup

- [ ] **Deploy Supabase to cloud** (2 hours)
  - Create Supabase cloud project
  - Run migrations on cloud DB
  - Update frontend env vars for cloud URL
  - **Acceptance:** Auth works on cloud Supabase

**Total Effort:** 19 hours (~2.5 days)

**Ship Criteria:**
- ✅ Users can sign up with email/password
- ✅ Users can login and see empty dashboard
- ✅ RLS policies prevent cross-user data access
- ✅ Supabase cloud project live

---

## Week 2 (Nov 11-15): Job Management with Supabase

**Goal:** Jobs CRUD with persistent storage

### Tasks

- [ ] **React Query setup** (2 hours)
  - Install `@tanstack/react-query`
  - Configure QueryClient in `App.tsx`
  - Create `frontend/src/hooks/useJobs.ts` with queries/mutations
  - **Acceptance:** React Query dev tools show cached queries

- [ ] **Update JobForm to save to Supabase** (4 hours)
  - `frontend/src/components/JobForm.tsx`
  - POST to Supabase `jobs` table (not sessionStorage)
  - Include `user_id` from auth context
  - Invalidate React Query cache on success
  - **Acceptance:** Job appears in Supabase DB after creation

- [ ] **Update Dashboard to fetch from Supabase** (3 hours)
  - `frontend/src/pages/Dashboard.tsx`
  - Replace `jobService.getAllJobs()` with `useJobs()` hook
  - Show loading state while fetching
  - Handle empty state (no jobs)
  - **Acceptance:** Dashboard shows jobs from Supabase

- [ ] **Job detail page** (4 hours)
  - `frontend/src/pages/JobDetailPage.tsx`
  - Fetch job by ID with React Query
  - Show job requirements
  - Link to upload resumes
  - **Acceptance:** Clicking job from dashboard opens detail page

- [ ] **Edit job functionality** (3 hours)
  - Edit button on job detail page
  - Reuse JobForm component in edit mode
  - PATCH to Supabase
  - Invalidate cache on success
  - **Acceptance:** Editing job updates in DB and UI

- [ ] **Delete job functionality** (2 hours)
  - Delete button on job detail page
  - Confirmation modal ("Are you sure?")
  - DELETE from Supabase (cascade to candidates/evaluations)
  - **Acceptance:** Deleting job removes from DB and UI

- [ ] **Job templates feature** (4 hours)
  - `save_as_template` checkbox on JobForm
  - Filter templates in dashboard
  - "Clone from template" button
  - **Acceptance:** User can save and clone job templates

**Total Effort:** 22 hours (~3 days)

**Ship Criteria:**
- ✅ Jobs persist to Supabase, not sessionStorage
- ✅ Dashboard loads jobs from React Query cache
- ✅ Users can create, edit, delete jobs
- ✅ Job templates work (save + clone)

---

## Week 3 (Nov 18-22): Resume Upload & Storage

**Goal:** Store resumes in Supabase Storage, parse with backend

### Tasks

- [ ] **Supabase Storage bucket setup** (1 hour)
  - Create `resumes` bucket in Supabase
  - Set RLS policies: Users can only upload to own folder
  - Test upload from Supabase UI
  - **Acceptance:** Can upload file via Supabase dashboard

- [ ] **Update frontend upload to Supabase Storage** (4 hours)
  - `frontend/src/components/ResumeUpload.tsx`
  - Upload files to `resumes/{user_id}/{job_id}/{filename}`
  - Store file URL in `candidates` table
  - Show upload progress per file
  - **Acceptance:** Files appear in Supabase Storage

- [ ] **Update parse API to fetch from Supabase** (3 hours)
  - `api/parse_resume.py`
  - Accept `file_url` instead of file upload
  - Download file from Supabase Storage
  - Parse with pdfplumber
  - Return extracted text
  - **Acceptance:** API can parse files from Supabase URLs

- [ ] **Update candidates table to store file URLs** (2 hours)
  - Migration 005: Add `resume_file_url` column to `candidates`
  - Store Supabase Storage URL after upload
  - **Acceptance:** `candidates` table has file URLs

- [ ] **Resume preview functionality** (3 hours)
  - "View Resume" button on candidate cards
  - Modal with full resume text (from `candidates.resume_text`)
  - Download original PDF option (link to Supabase Storage)
  - **Acceptance:** User can view resume in app

- [ ] **Handle upload errors** (2 hours)
  - File too large (>10MB): Show error
  - Invalid file type: Show error
  - Network error: Retry logic
  - **Acceptance:** Errors display user-friendly messages

- [ ] **Batch upload optimization** (3 hours)
  - Upload files in parallel (max 5 concurrent)
  - Show overall progress bar (X/Y files uploaded)
  - Cancel upload option
  - **Acceptance:** 20 files upload in <30 seconds

**Total Effort:** 18 hours (~2.5 days)

**Ship Criteria:**
- ✅ Resumes stored in Supabase Storage (not local)
- ✅ Parse API fetches from Supabase
- ✅ Candidate records include file URLs
- ✅ Users can upload up to 50 files per job

---

## Week 4 (Nov 25-29): AI Evaluation Persistence

**Goal:** Save evaluation results to Supabase, display from DB

### Tasks

- [ ] **Update evaluation API to save to Supabase** (4 hours)
  - `api/evaluate_candidate.py`
  - After AI evaluation, INSERT into `evaluations` table
  - Include `user_id`, `job_id`, `candidate_id`, `score`, `recommendation`, `analysis`, `cost`, `provider`, `model`
  - Return `evaluation_id` in response
  - **Acceptance:** Evaluations appear in Supabase `evaluations` table

- [ ] **Create useEvaluations hook** (3 hours)
  - `frontend/src/hooks/useEvaluations.ts`
  - Fetch evaluations by job_id
  - Mutation: Run AI evaluation
  - Invalidate cache on success
  - **Acceptance:** React Query caches evaluation results

- [ ] **Update ResultsPage to fetch from Supabase** (4 hours)
  - `frontend/src/pages/ResultsPage.tsx`
  - Replace state-based results with `useEvaluations(jobId)`
  - Show loading state during fetch
  - Handle empty state (no evaluations yet)
  - **Acceptance:** Results page shows evaluations from DB

- [ ] **Real-time evaluation progress** (5 hours)
  - Backend: Server-Sent Events (SSE) for evaluation status
  - Frontend: Listen to SSE, update UI in real-time
  - Show progress: "Evaluating 2/5 candidates..."
  - **Acceptance:** UI updates as each evaluation completes

- [ ] **Cost tracking dashboard** (3 hours)
  - `frontend/src/pages/CostTrackingPage.tsx`
  - Show total spent this month
  - Breakdown by job
  - Cost per evaluation
  - **Acceptance:** User can see AI cost by job

- [ ] **Filter/sort evaluations** (3 hours)
  - Filter by recommendation (Interview/Phone/Decline)
  - Sort by score, date, name
  - Persist filter state in URL params
  - **Acceptance:** Filters work without page reload

**Total Effort:** 22 hours (~3 days)

**Ship Criteria:**
- ✅ Evaluations persist to Supabase
- ✅ Results page loads from DB, not state
- ✅ Real-time progress during batch evaluation
- ✅ Cost tracking visible to users

---

## Week 5 (Dec 2-6): Interview Guides & Stage 2

**Goal:** Complete hiring lifecycle (Stage 1 → Stage 2)

### Tasks

- [ ] **Interview guide generation API** (4 hours)
  - `api/generate_interview_guide.py`
  - Input: job requirements + candidate resume
  - Output: 15 questions (behavioral, technical, role-specific)
  - Store in `interview_guides` table (new migration 006)
  - **Acceptance:** API returns structured interview questions

- [ ] **Interview guide UI** (4 hours)
  - `frontend/src/pages/InterviewGuidePage.tsx`
  - Display 3 sections: Behavioral, Technical, Role-specific
  - Collapsible questions
  - Download as PDF button
  - **Acceptance:** User can view and download interview guide

- [ ] **Stage 2 evaluation form** (5 hours)
  - `frontend/src/pages/Stage2EvaluationPage.tsx`
  - Interview ratings: 5 dimensions (1-10 scale)
  - Interview notes textarea
  - 2-3 reference check sections (rating + notes)
  - **Acceptance:** Form captures Stage 2 data

- [ ] **Stage 2 API endpoint** (3 hours)
  - `api/evaluate_candidate.py` (add `stage=2` support)
  - Calculate weighted score: Resume 25% + Interview 50% + Refs 25%
  - Recommendation: STRONG HIRE (≥90), HIRE (75-89), DO NOT HIRE (<75)
  - Store in `evaluations` table with `stage=2`
  - **Acceptance:** API returns final hiring decision

- [ ] **Final decision page** (4 hours)
  - `frontend/src/pages/FinalDecisionPage.tsx`
  - Show final score with breakdown
  - Color-coded recommendation badge
  - Export decision report to PDF
  - Mark as Hired/Rejected buttons
  - **Acceptance:** User can see final decision and export

- [ ] **Migration 006: Stage 2 tables** (2 hours)
  - Create `interview_guides` table
  - Add Stage 2 columns to `evaluations` (interview_score, references, final_score)
  - **Acceptance:** Tables support Stage 2 data

**Total Effort:** 22 hours (~3 days)

**Ship Criteria:**
- ✅ Interview guides generate from AI
- ✅ Stage 2 evaluation form works
- ✅ Final hiring decision calculated correctly
- ✅ PDF export for interview guides and decisions

---

## Week 6 (Dec 9-13): Polish & Launch 🚀

**Goal:** Production-ready MVP, launch on ProductHunt

### Tasks

- [ ] **Error handling audit** (4 hours)
  - Add error boundaries to all pages
  - User-friendly error messages (no stack traces)
  - Retry logic for API failures
  - **Acceptance:** App doesn't crash on errors

- [ ] **Loading states audit** (3 hours)
  - Skeleton loaders for all async data
  - Spinner for long operations (AI eval, file upload)
  - Disabled buttons during loading
  - **Acceptance:** No "blank screen" states

- [ ] **Analytics implementation** (5 hours)
  - Install PostHog
  - Add all P0 events (see [ANALYTICS.md](ANALYTICS.md))
  - Test events in PostHog dashboard
  - **Acceptance:** All critical events tracked

- [ ] **Payment integration (Stripe)** (6 hours)
  - Install Stripe SDK
  - Create checkout session API
  - Add payment method flow
  - Webhook for payment events
  - **Acceptance:** User can add payment method and get charged

- [ ] **Landing page optimization** (4 hours)
  - Clear value prop above fold
  - Customer testimonials (from beta users)
  - CTA: "Try Free Ranking"
  - Link to pricing page
  - **Acceptance:** Landing page converts at >5%

- [ ] **SEO basics** (2 hours)
  - Meta tags (title, description, OG image)
  - Sitemap.xml
  - Robots.txt
  - **Acceptance:** Google can index site

- [ ] **Documentation** (3 hours)
  - Help docs for core flows (create job, upload resumes, run eval)
  - FAQ page
  - Privacy policy + Terms of Service
  - **Acceptance:** Users can self-serve help

- [ ] **ProductHunt launch prep** (4 hours)
  - Write PH post copy
  - Create launch video (Loom screencast)
  - Design header image (Canva)
  - Schedule launch for Friday 8am PT
  - **Acceptance:** PH post scheduled and approved

- [ ] **Load testing** (3 hours)
  - Simulate 100 concurrent users (Locust or k6)
  - Test AI evaluation throughput
  - Monitor API response times
  - **Acceptance:** No errors at 100 users

- [ ] **Security review** (2 hours)
  - Verify RLS policies work
  - Check for exposed secrets (git-secrets)
  - HTTPS enforced
  - **Acceptance:** No critical security issues

**Total Effort:** 36 hours (~4.5 days)

**Ship Criteria:**
- ✅ Zero P0 bugs
- ✅ All P0 features work end-to-end
- ✅ Analytics tracking all events
- ✅ Payment flow functional
- ✅ ProductHunt launch live
- ✅ Landing page converts at >5%

---

## Post-Launch (Week 7+): Iterate Based on Feedback

**Goal:** Learn from real users, iterate quickly

### Week 7 (Dec 16-20): Feedback & Fixes

- [ ] Monitor ProductHunt comments, respond within 1 hour
- [ ] Fix critical bugs reported by users (P0 severity)
- [ ] Track activation rate (target: 60%)
- [ ] Run first A/B test (landing page CTA)
- [ ] Ship hot fixes as needed (no feature work)

### Week 8 (Dec 23-27): First Iteration

- [ ] Analyze user behavior (PostHog funnels)
- [ ] Identify top drop-off point in funnel
- [ ] Ship 1 improvement to address drop-off
- [ ] Add most-requested P1 feature (from user feedback)

### Weeks 9-12: iOS App (Optional)

- [ ] SwiftUI app skeleton
- [ ] Supabase Swift SDK integration
- [ ] Resume upload from iOS
- [ ] AI evaluation from iOS
- [ ] App Store submission

---

## Risk Management

### Critical Path Items (Can't Ship Without)

1. **Supabase Auth working** → Blocks: Jobs, Resumes, Evaluations
2. **AI evaluation API functional** → Core value prop
3. **Payment integration** → Revenue blocker
4. **RLS policies correct** → Security risk if broken

### Contingency Plans

| Risk | Mitigation |
|------|------------|
| Supabase cloud downtime | Fallback to local Supabase + sessionStorage |
| Claude API rate limits | Switch to GPT-4o Mini (OpenAI) as backup |
| Stripe integration delays | Launch with "Request Invoice" (manual payment) |
| ProductHunt launch flops | Pivot to Reddit (r/recruiting), LinkedIn posts |

---

## Definition of Done (Checklist per Task)

- [ ] Code written and tested locally
- [ ] PR created with description + screenshots
- [ ] Manual testing completed (happy path + edge cases)
- [ ] Merged to `main` branch
- [ ] Deployed to staging (Vercel preview)
- [ ] Feature flag enabled for team testing
- [ ] No new errors in error monitoring (Sentry)

---

## Success Metrics (Per Week)

| Week | Metric | Target | How to Measure |
|------|--------|--------|----------------|
| 1 | Auth works | 100% | Manual test: Signup, login, logout |
| 2 | Jobs persist | 100% | Check Supabase DB after job creation |
| 3 | Resumes upload | 100% | Upload 20 files, verify in Storage |
| 4 | Evals persist | 100% | Run eval, check `evaluations` table |
| 5 | Stage 2 works | 100% | Complete full flow: Resume → Interview → Hire |
| 6 | Launch live | ProductHunt #1 | PH ranking on launch day |

---

## Team Velocity Assumptions

- **Availability:** 40 hours/week (full-time)
- **Velocity:** 20-25 productive hours/week (accounting for meetings, debugging, context switching)
- **Buffer:** 20% for unexpected issues

**Weekly capacity:** 20 hours of feature work + 5 hours buffer

---

## Tools & Workflow

### Project Management
- **GitHub Issues** - Track all tasks
- **GitHub Projects** - Kanban board (To Do, In Progress, Done)
- **Labels:** `P0` (critical), `P1` (important), `P2` (nice-to-have)

### Communication
- **Daily standup** (async): What I did, what I'm doing, blockers
- **Friday demo:** Screen recording of week's work
- **Weekly retro:** What went well, what to improve

### Code Review
- **Self-review:** Read your own PR before requesting review
- **Checklist:** Tests pass, no console errors, mobile responsive
- **Ship fast:** Approve within 24 hours (it's just you for MVP!)

---

## Appendix: Task Estimation Guide

| Task Type | Effort Range |
|-----------|--------------|
| Simple CRUD page | 2-4 hours |
| Complex form with validation | 4-6 hours |
| API endpoint (no AI) | 2-3 hours |
| AI integration | 4-6 hours |
| Migration + RLS policies | 2-3 hours |
| UI polish (loading, errors) | 3-5 hours |
| Documentation page | 1-2 hours |

---

**Document Owner:** Product & Growth Lead
**Last Updated:** 2025-11-01
**Status:** Ready to execute
**Next Review:** End of Week 1 (retro)
