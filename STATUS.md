# Project Status

Last Updated: 2025-11-29

## Current Focus

**PHASE 1 BACKEND INTEGRATION COMPLETE** ✅ → **PHASE 2: DASHBOARD STATS** 🚧

Completed all core workbench functionality (upload, evaluate, results). Next: Dashboard statistics and job management to complete the tool's core feature set. Marketing & Auth (Phase 3) will follow.

## In Progress 🚧

- [ ] **Phase 2: Dashboard Stats & Job Management** (Priority 1)
  - [ ] **useDashboardStats.js** - Create React Query hooks for dashboard aggregation
    - Get job statistics (total jobs, candidates per job, evaluation progress)
    - Get aggregated evaluation metrics (passed/failed counts, score distribution)
    - Get recent evaluation history
  - [ ] **DashboardPage Updates** - Replace mock statistics with real Supabase queries
    - Real-time candidate counts per job
    - Evaluation progress indicators
    - Top candidate recommendations
  - [ ] **RoleCard Updates** - Live progress bars and candidate counts
  - [ ] **CreateRolePage Integration** - Form → Job creation → Navigate to workbench
  - Status: Ready to start (design planned, no blockers)

- [ ] **Phase 3: Marketing & Auth** (Priority 2 - After Phase 2)
  - [ ] Marketing Landing Page (MarketingPage.jsx)
  - [ ] Signup Flow (SignupPage.jsx)
  - [ ] Supabase Auth integration
  - [ ] Routing guards + auth state management
  - Status: Blocked until Phase 2 complete (intentional - complete product features first)

## Recently Completed ✅

- **Phase 1: Backend Integration** (Nov 29) ✅
  - **useCandidates.js** (7 functions, 17 tests)
    - Bulk candidate creation from resume uploads
    - Single/batch queries with auto camelCase conversion
    - Delete, update, shortlist toggle
    - Full database persistence
  - **useEvaluations.js** (8 functions, 15 tests)
    - Single candidate AI evaluation
    - Batch evaluation with progress callbacks ("Evaluating 3/10...")
    - Regex-based evaluation
    - Evaluation history tracking with version numbering
    - Auto-retry failed evaluations (2 retries then mark as 'failed')
  - **ResumeUploadModal.jsx** (22 tests)
    - Drag-drop + file picker for resume uploads
    - File parsing with name extraction ("John_Doe_12345.pdf" → "John Doe")
    - Progress display during parsing and database save
    - Error handling (unsupported types, extraction failures, empty files, DB errors)
    - Multi-file support (1-50 resumes per batch)
  - **WorkbenchPage.jsx** - Real Supabase integration
    - Replaced MOCK_CANDIDATES with live data via hooks
    - Integrated ResumeUploadModal for uploads
    - Real batch evaluation with progress ("Evaluating 3/10 candidates...")
    - Status mapping (pending→New, evaluated→Analyzed, evaluating→Processing, failed→Error)
    - Recommendation display with color coding
  - **ResultsPage.jsx** - Database migration
    - Fetch evaluated candidates from Supabase
    - Backward compatible with legacy session storage mode
  - **All 82 tests passing** (17 + 15 + 22 + 28 tests across 4 suites)
  - **Committed to GitHub** with comprehensive commit message

- **B2B Signup-First Model Decision** (Nov 4)
  - Pivoted from hybrid storage to signup-required approach
  - Updated CLAUDE.md with new architectural decision
  - Created marketing-page-architecture.md (9 sections planned)
  - Reasoning: Better for B2B market, simpler architecture, qualified leads
  - Inspired by Frill's conversion-focused design

- **Architecture Analysis & MVP Roadmap** (Oct 24)
  - Reviewed PRD against current codebase
  - Decision: Keep Python backend (better for PDF/AI than Node.js)
  - ~~Decision: Use hybrid storage (Supabase + sessionStorage for anonymous)~~ REVERSED Nov 4
  - Created 4-6 week MVP roadmap
  - Documented marketing strategy and go-to-market plan

- **Multi-LLM Provider Support** (Oct 24)
  - Added OpenAI GPT-4o Mini support alongside Claude Haiku
  - Provider selection via API parameter
  - Migration 003 tracks provider/model used
  - Cost optimization: Haiku = $0.003/eval (5x cheaper than Sonnet)

- **ResultsPage UI Redesign** (Oct 23)
  - Modern collapsible sections for better UX
  - Enhanced readability and navigation
  - Improved mobile responsiveness

- **Bug Fixes** (Oct 22-23)
  - Fixed AI evaluation null errors for 6+ resume batches
  - Added camelCase/snake_case compatibility for API responses
  - Increased rate limit for parallel processing in local dev

- **Local Supabase Setup** (Oct 22)
  - Initialized Supabase CLI in project
  - Started local Supabase instance in Docker
  - Applied migrations 001-003 successfully
  - Configured auth settings for localhost:3000

## Known Issues 🐛

- GitHub Issue #1: Supabase migrations need cloud deployment
- GitHub Issue #2: API endpoint testing and validation needed
- GitHub Issue #3: Error handling improvements across app
- GitHub Issue #4: Interview rating form UI (Stage 2 evaluations)
- GitHub Issue #5: Reference check form UI (Stage 2 evaluations)
- Port mismatch: README says 3000, Vite uses 5173 (document standardize)
- Need CORS verification on all API endpoints

## Next Session Goals - Phase 2 (Dashboard Stats)

**Goal**: Complete dashboard with real statistics and job management. This completes the core product feature set before adding auth/marketing.

1. [ ] **Step 2.1: Create useDashboardStats.js hook** (React Query)
   - `useDashboardStats(jobId)` - Get stats for specific job
     - `totalCandidates`: From candidates table
     - `evaluatedCount`: From evaluations table
     - `averageScore`: Aggregate evaluation scores
     - `recommendationCounts`: {INTERVIEW: 5, PHONE_SCREEN: 2, DECLINE: 1}
     - `lastEvaluated`: Timestamp of most recent evaluation
   - `useJobStats()` - Get stats for all user's jobs
     - Array of jobs with candidate/evaluated counts
     - Used by Dashboard and RoleCard
   - Tests: 12+ cases covering queries, aggregations, empty states

2. [ ] **Step 2.2: Update DashboardPage** - Replace mock statistics
   - Import useDashboardStats
   - Display real job statistics
   - Show top candidates across all jobs
   - Display evaluation progress
   - Add loading/error states with retry

3. [ ] **Step 2.3: Update RoleCard** - Live progress indicators
   - Display real candidate count: `3 candidates`
   - Display evaluated count: `2 evaluated`
   - Progress bar: `2/3 (67%)`
   - Remove mock data

4. [ ] **Step 2.4: Update CreateRolePage** - Job creation flow
   - Form submission → useCreateJob() mutation
   - Success → Navigate to /app/role/:jobId/workbench
   - Form validation (title required, etc)
   - Loading state during submission

5. [ ] **Testing**: Run full test suite - all should pass
   - Existing 82 tests should still pass
   - Add 12+ new tests for useDashboardStats
   - Add 8+ new tests for updated components

**Expected outcome**: Dashboard shows real data. Users can create jobs and see them populated with statistics. Workbench uploads candidates and updates stats in real-time.

## Recent Decisions 📝

- **Nov 29**: **PHASE 2 ROADMAP** - Complete dashboard stats and job management BEFORE adding auth/marketing (Phase 3). Rationale: Ship working product features first, then add user acquisition layer. This maintains development velocity and ensures core tool is fully functional.

- **Nov 29**: **PHASE 1 COMPLETION** - Finished backend integration work with 82 passing tests (useCandidates, useEvaluations, ResumeUploadModal, WorkbenchPage integration, ResultsPage migration).

- **Nov 4**: **B2B SIGNUP-FIRST MODEL** - Require account creation before trial (like Frill). Better for B2B market, simpler architecture (no sessionStorage), qualified leads, easier conversion tracking. Reverses Oct 24 "hybrid storage" decision.

- **Nov 4**: **REVISED ORDER**: After Nov 29 backend completion, pivoting to dashboard stats BEFORE marketing (reverses Nov 4 marketing-first priority). Ensures product is feature-complete before auth layer.

- **Oct 24**: **STRATEGIC PIVOT** - Building for sellable product with iOS app. Need persistent storage, user accounts, and scalable architecture.

- **Oct 24**: Follow Claude Code 2.0 guide - CLAUDE.md for stable architecture, STATUS.md for current work. Keep docs minimal and updated.

- **Oct 24**: Keep Python backend over Node.js rewrite - Better PDF parsing, AI libraries, already working well.

- **Oct 24**: Claude Haiku as default LLM - 5x cheaper than Sonnet ($0.003 vs $0.015), sufficient quality for structured evaluations.

- **Oct 24**: ~~Hybrid storage approach~~ REVERSED Nov 4 - Now requiring signup for all users.

- **Oct 24**: Start with local Supabase, deploy to cloud after MVP validation.

## What's Next: Quick Reference

**For developers/product managers**: Phase 2 tasks are fully specified above in "Next Session Goals - Phase 2". Start with Step 2.1 (useDashboardStats.js).

**Why this order**:
1. Phase 1 (Complete) ✅ - Enabled resume upload + evaluation
2. Phase 2 (Next) - Dashboard shows stats from Phase 1 data
3. Phase 3 (After) - Auth/marketing gates access to Phases 1-2

**No blockers** - Phase 2 is ready to start immediately. All dependencies exist from Phase 1.

## Blockers

### Phase 2 Dependencies (None - Ready to Start)
- ✅ Supabase schema exists (migrations 001-003 applied)
- ✅ useCandidates.js provides candidate queries
- ✅ useEvaluations.js provides evaluation queries
- ✅ All React Query patterns established
- ✅ Testing infrastructure ready (82 tests passing)

### Phase 3 Dependencies (After Phase 2)
1. **Marketing Copy & Assets** (before building landing page)
   - Hero headline finalized
   - Demo video recorded (60 seconds) OR hero screenshot
   - Company logos for social proof (optional)
   - FAQ answers written

2. **Supabase Cloud Setup** (after Phase 2)
   - Create new Supabase project
   - Project name: "resume-scanner-pro-prod"
   - Region: US (closest to Vercel deployment)

## Architecture Direction

### What We're Building (Updated Oct 24)

**Resume Scanner Pro**: AI-powered recruiting assistant for web + iOS
- User authentication (Supabase Auth)
- Persistent job and resume storage
- Multi-device access (web + iOS)
- Batch resume evaluation (1-50 resumes)
- Two-stage evaluation framework
- Interview guide generation
- Export to PDF
- Freemium pricing model

### Tech Stack (Confirmed)

**Frontend**: React 18, Vite, Tailwind, React Router, Zustand, React Query
**Backend**: Python 3.13 serverless (Vercel)
**Database**: Supabase (PostgreSQL + Auth + Storage)
**AI**: Claude Haiku (primary), OpenAI GPT-4o Mini (optional)
**PDF Parsing**: pdfplumber (Python)

### Data Flow (Target Architecture)

**All Users (Signup Required)**:
1. Marketing page → Signup (Supabase Auth)
2. Email verification → Redirect to /app
3. CRUD jobs → Supabase DB
4. Upload resumes → Supabase Storage + Python parse API
5. Run evaluation → Python AI API + save to Supabase
6. View results → Query Supabase with React Query
7. Export PDF → Client-side jspdf

## MVP Timeline (Updated Nov 29)

**Current Status**: ✅ Week 1 Complete (Phase 1: Backend Integration), 🚧 Week 2 In Progress (Phase 2: Dashboard)

**Week 1 - Phase 1: Backend Integration** ✅ COMPLETE
- [x] useCandidates.js (7 functions, 17 tests)
- [x] useEvaluations.js (8 functions, 15 tests)
- [x] ResumeUploadModal (22 tests)
- [x] WorkbenchPage real data integration (28 tests)
- [x] ResultsPage database migration
- [x] 82 total tests passing
- [x] Committed to GitHub

**Week 2 - Phase 2: Dashboard Stats** 🚧 STARTING
- [ ] useDashboardStats.js (aggregation queries)
- [ ] DashboardPage real statistics
- [ ] RoleCard live progress
- [ ] CreateRolePage job creation flow
- [ ] 12+ new tests

**Week 3 - Phase 3: Marketing & Auth Foundation**
- [ ] Build marketing landing page (9 sections)
- [ ] Create signup page
- [ ] Supabase Auth integration
- [ ] Routing guards + auth state

**Week 4**: Connect Tool to Auth
- [ ] Auth protection for /app routes
- [ ] Redirect unauthenticated → Marketing page
- [ ] User ID RLS enforcement
- [ ] User profile page

**Week 5**: Interview Guides & Stage 2
- [ ] Interview guide generation API
- [ ] Interview rating form (Stage 2)
- [ ] Reference check form
- [ ] Final hiring decision evaluation

**Week 6**: Polish & Export Features
- [ ] PDF export functionality
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Mobile responsiveness
- [ ] Manual QA

**Week 7**: Launch Prep
- [ ] Deploy Supabase cloud
- [ ] Vercel production deploy
- [ ] Documentation review
- [ ] ProductHunt launch assets

**Week 8-10**: iOS App (After Web MVP)
- [ ] SwiftUI app
- [ ] Same Python API
- [ ] Supabase Swift SDK

## Tech Debt

- Update Supabase CLI: v2.40.7 → v2.53.6 (low priority)
- Add React Query (planned for Supabase integration)
- Implement error boundaries
- Add loading states for all async operations
- Create comprehensive test suite (currently manual only)
- Standardize port documentation (3000 vs 5173)

## Notes

- Following GitHub Flow branching strategy
- Conventional commit format (feat:, fix:, docs:, etc.)
- PRs under 400 lines when possible
- All new features should include tests (Vitest + RTL)
- Focus on MVP - ship fast, iterate faster
