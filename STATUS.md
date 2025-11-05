# Project Status

Last Updated: 2025-11-04

## Current Focus

**B2B SIGNUP-FIRST MODEL**: Pivoting to require account creation before trial (like Frill, Greenhouse, LinkedIn Recruiter). Prioritizing marketing landing page to convert qualified recruiter leads, then implementing Supabase Auth. Simpler architecture, better conversion, focus on niche B2B market.

## In Progress 🚧

- [ ] **Marketing Landing Page** (Priority 1)
  - Architecture planned in docs/marketing-page-architecture.md ✅
  - Hero section with value proposition
  - Features overview (6 key features)
  - How it works (3-step process)
  - Pricing teaser
  - FAQ section
  - Final CTA
  - Status: Ready to build

- [ ] **Signup Flow** (Priority 2)
  - Supabase Auth integration
  - SignupPage.jsx component
  - Email verification flow
  - Redirect to /app after signup
  - Status: Blocked by marketing page

- [ ] **Documentation Update** (In Progress)
  - Updated CLAUDE.md with B2B signup-first decision ✅
  - Created marketing-page-architecture.md ✅
  - Updating STATUS.md ✅
  - Remove sessionStorage/anonymous user references from codebase
  - Status: In progress

## Recently Completed ✅

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

## Next Session Goals

1. Build marketing landing page (MarketingPage.jsx)
   - Hero section with primary CTA
   - Features grid (6 features)
   - How it works (3 steps)
   - Pricing teaser + FAQ
2. Create signup page (SignupPage.jsx)
3. Set up Supabase Auth integration
4. Configure routing: / → Marketing, /signup → Signup, /app → Dashboard (auth required)
5. Test end-to-end signup flow

## Recent Decisions 📝

- **Nov 4**: **B2B SIGNUP-FIRST MODEL** - Require account creation before trial (like Frill). Better for B2B market, simpler architecture (no sessionStorage), qualified leads, easier conversion tracking. Reverses Oct 24 "hybrid storage" decision.

- **Nov 4**: Prioritize marketing landing page over Supabase integration - Need strong conversion funnel to drive signups. Marketing page → Signup → Auth → Tool access.

- **Oct 24**: **STRATEGIC PIVOT** - Building for sellable product with iOS app. Need persistent storage, user accounts, and scalable architecture.

- **Oct 24**: Follow Claude Code 2.0 guide - CLAUDE.md for stable architecture, STATUS.md for current work. Keep docs minimal and updated.

- **Oct 24**: Keep Python backend over Node.js rewrite - Better PDF parsing, AI libraries, already working well.

- **Oct 24**: Claude Haiku as default LLM - 5x cheaper than Sonnet ($0.003 vs $0.015), sufficient quality for structured evaluations.

- **Oct 24**: ~~Hybrid storage approach~~ REVERSED Nov 4 - Now requiring signup for all users.

- **Oct 24**: Start with local Supabase, deploy to cloud after MVP validation.

## Blockers

### Critical Decisions Needed

1. **Marketing Copy & Assets** (before building landing page)
   - Hero headline finalized
   - Demo video recorded (60 seconds) OR hero screenshot
   - Company logos for social proof (optional)
   - FAQ answers written

2. **Supabase Cloud Setup** (after marketing page)
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

## MVP Timeline (4-6 Weeks - Updated Nov 4)

**Week 1**: Marketing & Auth Foundation
- Build marketing landing page (9 sections)
- Create signup page
- Supabase Auth integration
- Routing + auth guards

**Week 2**: Connect Existing Tool Flow
- Job CRUD with Supabase
- Resume storage (Supabase Storage)
- Evaluation persistence
- React Query integration

**Week 3**: User Dashboard & History
- Job list view
- Evaluation history
- Re-run evaluations
- Export to PDF

**Week 4**: Interview Guides & Stage 2
- Interview guide generation API
- Interview rating form
- Reference check form
- Final hiring decision evaluation

**Week 5**: Polish & Testing
- Error handling
- Loading states
- Mobile responsiveness
- Manual QA

**Week 6**: Launch Prep
- Deploy Supabase cloud
- Vercel production deploy
- Documentation
- ProductHunt launch assets

**Week 7-10**: iOS App (After Web MVP)
- SwiftUI app
- Same Python API
- Supabase Swift SDK

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
