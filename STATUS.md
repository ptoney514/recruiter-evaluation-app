# Project Status

Last Updated: 2025-10-24

## Current Focus

**STRATEGIC PIVOT**: Building foundation for sellable product with web + iOS apps. Adding Supabase for user authentication, persistent storage, and multi-device access. Following Claude Code 2.0 best practices for project organization.

## In Progress 🚧

- [ ] Documentation restructuring (Claude Code 2.0 best practices)
  - Created STATUS.md for current work tracking ✅
  - Refactoring CLAUDE.md to stable architecture only
  - Moving ARCHITECTURE_ANALYSIS.md to docs/ folder
  - Status: In progress

- [ ] Supabase integration preparation
  - Local Supabase running in Docker ✅
  - Migrations 001-003 applied to local DB ✅
  - Need migration 004: Add user_id columns and RLS policies
  - Frontend Supabase client setup
  - useAuth hook creation
  - Login/signup pages
  - Blocker: Decide on Supabase cloud project setup

- [ ] React Query integration
  - Install @tanstack/react-query
  - Replace sessionStorage service with Supabase queries
  - Add server state caching
  - Status: Not started

## Recently Completed ✅

- **Architecture Analysis & MVP Roadmap** (Oct 24)
  - Reviewed PRD against current codebase
  - Decision: Keep Python backend (better for PDF/AI than Node.js)
  - Decision: Use hybrid storage (Supabase + sessionStorage for anonymous)
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

1. Complete documentation restructuring (CLAUDE.md + STATUS.md)
2. Create docs/ folder and organize files
3. Create new branch: `feature/supabase-integration`
4. Create migration 004: Add user_id and RLS policies
5. Set up frontend Supabase client (lib/supabase.js)
6. Create useAuth hook for authentication state
7. Build login/signup pages

## Recent Decisions 📝

- **Oct 24**: **STRATEGIC PIVOT** - Building for sellable product with iOS app. Need persistent storage, user accounts, and scalable architecture. Reverting Oct 23 decision to remove Supabase.

- **Oct 24**: Follow Claude Code 2.0 guide - CLAUDE.md for stable architecture, STATUS.md for current work. Keep docs minimal and updated.

- **Oct 24**: Keep Python backend over Node.js rewrite - Better PDF parsing, AI libraries, already working well.

- **Oct 24**: Claude Haiku as default LLM - 5x cheaper than Sonnet ($0.003 vs $0.015), sufficient quality for structured evaluations.

- **Oct 24**: Hybrid storage approach - Supabase for authenticated users (persistent), sessionStorage for anonymous users (try before signup).

- **Oct 24**: Start with local Supabase, deploy to cloud after MVP validation.

- **Oct 21**: Using Claude 3.5 Haiku for cost optimization over Sonnet.

## Blockers

### Critical Decisions Needed

1. **Supabase Cloud Setup**
   - Create new Supabase project? Or link existing?
   - If new: Project name, region selection
   - If existing: Project ref/URL for linking

2. **Anonymous User Strategy**
   - Should anonymous users be able to use the tool?
   - Recommended: Yes (growth hack - try before signup)
   - Implementation: sessionStorage fallback if not authenticated

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

**Authenticated Users**:
1. Login → Supabase Auth
2. CRUD jobs → Supabase DB
3. Upload resumes → Supabase Storage + Python parse API
4. Run evaluation → Python AI API + save to Supabase
5. View results → Query Supabase with React Query
6. Export PDF → Client-side jspdf

**Anonymous Users**:
1. Use sessionStorage (no signup)
2. Same evaluation flow
3. Prompt to save results (signup conversion)

## MVP Timeline (4-6 Weeks)

**Week 1-2**: Supabase Foundation
- Auth integration
- RLS policies
- Frontend client setup

**Week 3-4**: Connect Existing Flow
- Job CRUD with Supabase
- Resume storage
- Evaluation persistence

**Week 5**: Interview Guides
- Guide generation API
- PDF export

**Week 6**: Polish & Launch
- Error handling
- Documentation
- ProductHunt launch

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
