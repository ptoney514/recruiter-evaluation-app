# Project Status

Last Updated: 2025-11-30

## Current Focus

**PHASE 3A: AUTH INTEGRATION** ✅ → **PHASE 3B: MARKETING LANDING PAGE** 🚧

Phase 3A Auth complete: Supabase Auth working, ProtectedRoute guards enabled, E2E auth fixtures created. All 17 E2E tests passing (12 unauthenticated + 5 authenticated). Ready for marketing landing page.

## In Progress 🚧

- [ ] **Phase 3B: Marketing Landing Page** (Priority 1)
  - [ ] Marketing Landing Page (MarketingPage.jsx) - Hero, features, social proof
  - [ ] Demo video or hero screenshot
  - [ ] FAQ section
  - Status: Ready to start

## Recently Completed ✅

- **Phase 3A: Auth Integration** (Nov 30) ✅
  - **ProtectedRoute.jsx** - Fixed auth checking
    - Removed BYPASS_AUTH flag (was true for dev)
    - Fixed Zustand selector (loading not isLoading)
    - Redirects unauthenticated users to /login
  - **E2E Auth Setup** - Playwright authentication fixtures
    - `auth.setup.js` - Creates test user, saves session to `playwright/.auth/user.json`
    - `create-job-flow.auth.spec.js` - 4 authenticated tests for job creation
    - Playwright config with 3 projects: setup, chromium, chromium-auth
  - **Verified Supabase Auth** - Full signup/login flow works
    - Email/password signup creates user immediately
    - Access token returned on signup
    - RLS policies enforce user_id on jobs table
  - **E2E Test Results**
    - Unauthenticated (chromium): 12 passing, 13 skipped
    - Authenticated (chromium-auth): 5 passing (including setup)
    - **Total: 17 E2E tests passing**

- **Phase 2C: E2E Tests** (Nov 30) ✅
  - **create-job-flow.spec.js** (12 tests for unauthenticated flows)
    - Public pages: Landing, login, signup display
    - Auth redirects: /app routes redirect to /login
    - Login form validation: Empty fields, wrong credentials
    - Signup form validation: Password mismatch, terms required
  - **create-job-flow.auth.spec.js** (4 tests for authenticated flows)
    - Dashboard access after login
    - Job creation with auth token
    - Job appears in dashboard
    - Job count increments
  - **delete-job-flow.spec.js** (6 tests, all skipped - needs auth.spec.js version)
  - **tier-limits.spec.js** (5 tests, all skipped - needs auth.spec.js version)
  - **Test Infrastructure**
    - Playwright configuration with 3 projects
    - Auth session persistence for test reuse
    - npm run test:e2e and test:e2e:ui scripts

- **Phase 2B: Integration Tests + API Security** (Nov 29) ✅
  - **jobCreation.integration.test.jsx** (8 tests)
    - Job creation with real Supabase database
    - JSONB field storage (must_have, preferred requirements)
    - Auto-generated fields (id, created_at, user_id)
  - **jobDeletion.integration.test.jsx** (10 tests)
    - Cascade delete of candidates, evaluations, rankings
    - Cascade delete of interview_ratings, reference_checks
    - Isolation between jobs (delete one, keep others)
  - **tierLimits.integration.test.jsx** (9 tests)
    - Free tier limits (3 jobs, 5 candidates/job)
    - Pro tier limits (unlimited)
    - Candidate count calculations per job
  - **API Security Hardening**
    - CORS origin whitelist (replaces wildcard *)
    - Content-Type validation (must be application/json)
    - Content-Length validation with 50MB max
    - JSON parse error handling
  - **Test Infrastructure**
    - vitest.integration.config.js with fileParallelism: false
    - setup.integration.js with BroadcastChannel mock
    - Extended testDbUtils.js with seed functions
    - npm run test:integration script
  - **Total: 27 integration tests, all passing**
  - **Committed to GitHub** with comprehensive commit message

- **Phase 2A: Unit Tests** (Nov 29) ✅
  - **Testing Infrastructure** (Setup)
    - Playwright installed and configured for E2E testing
    - Test database utilities (testDbUtils.js) created for Supabase seeding
    - Test fixtures (testData.js) with realistic job/candidate data
    - Vitest configured with jsdom environment for React component testing
    - Playwright configuration ready for integration/E2E tests
  - **useTierLimits.test.js** (19 tests)
    - Tier configuration and job limit enforcement
    - Free tier vs paid tier behavior
    - Candidate limits per job
    - Edge cases and state transitions
  - **extractRequirements.test.js** (26 tests)
    - Requirement extraction from job descriptions
    - Must-have vs nice-to-have parsing
    - Bullet point and section detection
    - Edge cases (empty descriptions, malformed text)
  - **RoleCard.test.jsx** (20 tests)
    - Dashboard job card rendering
    - Delete functionality and confirmation
    - User interactions and navigation
    - Loading and error states
  - **DashboardPage.test.jsx** (32 tests)
    - Dashboard rendering with user greeting
    - Create Role button with job count display
    - Tier limit warning display
    - Job listing and grid layout
    - Loading, error, and empty states
    - State combinations and edge cases
  - **CreateRolePage.test.jsx** (24 tests)
    - Role creation form rendering and validation
    - Form submission and data handling
    - Tab navigation (paste description vs upload profile)
    - Auto-detection of keywords from description
    - Error handling and user feedback
    - Back button navigation
  - **Total: 121 tests written, 117 passing** (includes 5 test suites covering hooks, utilities, and components)
  - **Testing infrastructure complete** - Ready for integration and E2E tests

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

- **Nov 30**: **PHASE 3A AUTH COMPLETE** - Supabase Auth fully integrated. ProtectedRoute guards enabled, E2E auth fixtures created. RLS policies enforce user_id. All 17 E2E tests passing. Ready for marketing landing page.

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

**For developers/product managers**: Phase 3B Marketing Landing Page is next. Build the conversion-focused landing page with hero, features, and CTA.

**Why this order**:
1. Phase 1 (Complete) ✅ - Enabled resume upload + evaluation
2. Phase 2 (Complete) ✅ - Unit, integration, E2E tests
3. Phase 3A (Complete) ✅ - Auth integration, route protection
4. Phase 3B (Next) - Marketing landing page

**No blockers** - Phase 3B is ready to start. Auth infrastructure complete.

## Blockers

### Phase 3A Dependencies ✅ COMPLETE
- ✅ Supabase Auth working (signup/login)
- ✅ ProtectedRoute guards enabled
- ✅ RLS policies enforce user_id
- ✅ E2E auth fixtures created
- ✅ All 17 E2E tests passing

### Phase 3B Dependencies (Marketing Landing Page)
1. **Marketing Copy & Assets** (needed for landing page)
   - Hero headline finalized
   - Demo video recorded (60 seconds) OR hero screenshot
   - Company logos for social proof (optional)
   - FAQ answers written

2. **Supabase Cloud Setup** (needed for production)
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

**Current Status**: ✅ Phase 1 Complete (Backend Integration), ✅ Phase 2A Complete (Unit Tests), 🚧 Phase 2B/2C In Progress (Integration & E2E Tests)

**Phase 1 - Backend Integration** ✅ COMPLETE (Nov 29)
- [x] useCandidates.js (7 functions, 17 tests)
- [x] useEvaluations.js (8 functions, 15 tests)
- [x] ResumeUploadModal (22 tests)
- [x] WorkbenchPage real data integration (28 tests)
- [x] ResultsPage database migration
- [x] 82 total tests passing
- [x] Committed to GitHub

**Phase 2A - Unit Tests** ✅ COMPLETE (Nov 29)
- [x] Testing infrastructure (Playwright, Vitest, fixtures)
- [x] useTierLimits.test.js (19 tests)
- [x] extractRequirements.test.js (26 tests)
- [x] RoleCard.test.jsx (20 tests)
- [x] DashboardPage.test.jsx (32 tests)
- [x] CreateRolePage.test.jsx (24 tests)
- [x] 121 tests written, 117 passing
- [x] Committed to GitHub

**Phase 2B - Integration Tests + API Security** ✅ COMPLETE (Nov 29)
- [x] jobCreation.integration.test.jsx (8 tests) - Real Supabase interactions
- [x] jobDeletion.integration.test.jsx (10 tests) - Cascade deletion and cleanup
- [x] tierLimits.integration.test.jsx (9 tests) - Tier enforcement validation
- [x] API Security: CORS whitelist, Content-Type/Length validation, 50MB limit
- [x] 27 integration tests, all passing
- [x] Committed to GitHub

**Phase 2C - E2E Tests** ✅ COMPLETE (Nov 30)
- [x] create-job-flow.spec.js (Playwright) - Public pages, auth redirects, form validation
- [x] create-job-flow.auth.spec.js (Playwright) - Authenticated job creation
- [x] delete-job-flow.spec.js (Playwright) - Job deletion (skipped, needs auth.spec.js)
- [x] tier-limits.spec.js (Playwright) - Tier limits (skipped, needs auth.spec.js)
- [x] 17 E2E tests passing (12 unauthenticated + 5 authenticated)

**Phase 3A - Auth Integration** ✅ COMPLETE (Nov 30)
- [x] Fixed ProtectedRoute.jsx - Removed BYPASS_AUTH, fixed Zustand selectors
- [x] Verified Supabase Auth - Signup/login flow, RLS enforcement
- [x] E2E auth setup - auth.setup.js, playwright/.auth/, project config

**Week 3 - Phase 3B: Marketing Landing Page** 🚧 NEXT
- [ ] Build marketing landing page (hero, features, social proof, FAQ)
- [ ] Demo video or hero screenshot
- [ ] Call-to-action buttons linking to signup

**Week 4**: Connect Tool to Auth ✅ COMPLETE (Phase 3A)
- [x] Auth protection for /app routes (ProtectedRoute.jsx)
- [x] Redirect unauthenticated → /login
- [x] User ID RLS enforcement (Supabase policies)
- [ ] User profile page (deferred)

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
