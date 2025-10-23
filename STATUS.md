# Project Status

Last Updated: 2025-10-23

## Current Focus

**MAJOR PIVOT**: Simplifying architecture to build a batch resume ranker that integrates with Oracle Recruiting Cloud (ATS-agnostic). Removing unnecessary complexity (Supabase, job CRUD UI) to focus on core value: uploading resumes + getting AI-ranked evaluations.

## In Progress 🚧

**Current Branch**: `refactor/batch-resume-ranker`

### Architecture Refactor
- [ ] Remove Supabase database and all persistence layer
- [ ] Remove Jobs CRUD UI (not needed - Oracle handles this)
- [ ] Remove Interview Rating Forms (replace with flexible text input)
- [ ] Implement session-based storage (browser sessionStorage)
- [ ] Build regex-based evaluator (free, instant keyword matching)
- [ ] Add selective AI evaluation (run AI only on chosen candidates)
- [ ] Create job description templates (Nurse, Professor, etc.)
- [ ] Build batch upload workflow (1-50 resumes at once)
- [ ] Format AI output to match existing markdown report format

## Recently Completed ✅

- **Architecture Discovery** (Oct 23)
  - Clarified actual use case: Batch resume ranker, NOT full ATS
  - User has Oracle Recruiting Cloud for candidate management
  - Identified workflow: Download resumes from Oracle → Upload to tool → Get AI rankings
  - Current working system: Claude Desktop app with markdown reports
  - Goal: Replicate Claude Desktop workflow as web app

- **Job Upload Feature** (Oct 23)
  - Created regex-based job parser (parse_job_simple.py)
  - Removed expensive AI-based parsing
  - Built dev server for local API testing
  - Interview rating form (will be replaced with flexible text input)

- Local Supabase setup with migration 002 deployed (Oct 22)
  - Initialized Supabase CLI in project
  - Started local Supabase instance in Docker
  - Applied migration 002_interview_and_references.sql successfully
  - Verified `interview_ratings` and `reference_checks` tables created
  - Verified all indexes and constraints in place
  - Created frontend/.env with local Supabase credentials
  - **Issue #1 completed for local development!**

- Updated project to Claude Code v2.0 structure (Oct 22)
  - Created CLAUDE.md with architectural guidance
  - Created STATUS.md for tracking current work
  - Added Key Design Decisions, Trade-offs, Constraints sections
  - Added Testing Philosophy and Current Phase

- Created GitHub issues for next development phase (Oct 22)
  - Issue #1: Supabase migration setup
  - Issue #2: Stage 1 API testing
  - Issue #3: Stage 2 API testing
  - Issue #4: Interview rating form UI
  - Issue #5: Reference check form UI

- Two-stage evaluation API implementation (Oct 22)
  - Stage 1: Resume screening with 0-100 scoring
  - Stage 2: Final decision with weighted scoring (25% resume + 50% interview + 25% references)

- Database schema for Stage 2 data (Oct 22)
  - `interview_ratings` table with competency ratings
  - `reference_checks` table with reference data
  - Updated `evaluations` table with stage tracking

- Skills sync: recruiting-evaluation skill (Oct 21)
  - Integrated evaluation criteria from skill file
  - Fallback to inline instructions if skill not found

## Known Issues 🐛

- Port mismatch in documentation
  - README states `localhost:3000`
  - Vite defaults to `localhost:5173`
  - Need to standardize documentation

- Need to verify CORS configuration
  - Ensure all API endpoints have proper CORS headers
  - Test cross-origin requests from frontend

- Hardcoded skill path in evaluate_candidate.py
  - Currently points to `~/.claude/skills/recruiting-evaluation/SKILL.md`
  - May break if skill file doesn't exist or path changes
  - Fallback logic exists but should be tested

## Next Session Goals

1. **Complete Supabase Setup** (Issue #1)
   - Access Supabase dashboard
   - Run 002_interview_and_references.sql migration
   - Verify tables and indexes created successfully

2. **Validate API Endpoints** (Issues #2, #3)
   - Create test payloads for Stage 1 and Stage 2
   - Execute API calls and document responses
   - Verify scoring calculations match expected formulas
   - Document cost per evaluation

3. **Start Frontend UI Development** (Issues #4, #5)
   - Design interview rating form layout
   - Design reference check form layout
   - Plan component architecture and data flow

## New Architecture (Simplified)

### What We're Building
**A batch resume ranker** that integrates with Oracle Recruiting Cloud exports. User workflow:

1. Export 1-50 resumes from Oracle (individual PDFs)
2. Upload to web app with job description
3. Choose evaluation mode:
   - **Regex (Free)**: Instant keyword matching → Quick filter
   - **AI (Paid)**: Detailed Claude analysis → Full report
4. Get ranked markdown report (matches current Claude Desktop output)
5. For Stage 2: Add interview notes → Re-evaluate with weighted scoring

### What We're Removing
- ❌ Supabase database (no persistent storage needed)
- ❌ Jobs CRUD UI (Oracle handles job management)
- ❌ Complex interview rating forms (replace with flexible text input)
- ❌ Candidate management (Oracle tracks candidates)
- ❌ Authentication (MVP is public access)

### What We're Keeping/Adding
- ✅ React frontend (existing)
- ✅ Python API with Claude integration (existing)
- ✅ PDF parsing (existing)
- ✅ Dev server for local testing (new)
- ✅ Regex evaluator for cost control (new)
- ✅ Selective AI evaluation (new)
- ✅ Job templates (Nurse, Professor, etc.) (new)
- ✅ Session-based storage (browser only) (new)

### Cost Optimization
**Current**: 50 candidates × $0.003 = $0.15 per evaluation

**Optimized**:
- Regex filter (free) → Top 5 candidates
- AI on 5 only = $0.015 per evaluation
- **90% cost savings**

## Recent Decisions 📝

- **Oct 23**: **MAJOR PIVOT** - Discovered actual use case is batch resume ranker, not full ATS. User has Oracle for candidate management, needs tool for AI-powered ranking of exported resumes.

- **Oct 23**: Dual-mode evaluation (Regex vs AI) for cost control. Regex provides instant free filtering, AI gives detailed analysis on selected candidates only.

- **Oct 23**: Remove Supabase entirely - no persistent storage needed. Use browser sessionStorage instead.

- **Oct 23**: ATS-agnostic design - works with Oracle exports, career fair resumes, or any PDF resumes.

- **Oct 22**: Using local Supabase for development and testing before deploying to production. **NOTE**: This decision is now reversed - removing database entirely.

- **Oct 21**: Using Claude 3.5 Haiku for cost optimization (~$0.003 per evaluation vs ~$0.015 for Sonnet)

## Blockers

None currently - local development environment is fully operational!

**Recently Resolved:**
- ✅ **Supabase Access**: Local Supabase running successfully. Production deployment TBD.
- ✅ **Development Environment**: Local setup complete with all migrations applied.

## Production Deployment Checklist

**When ready to deploy migrations to production Supabase:**

1. **Pre-Deployment**
   - [ ] Test all migrations thoroughly on local Supabase
   - [ ] Verify all table structures match schema requirements
   - [ ] Document rollback plan for each migration
   - [ ] Backup production database (Supabase dashboard → Database → Backups)
   - [ ] Notify team of planned deployment window

2. **Deployment**
   - [ ] Link to production Supabase: `supabase link --project-ref <production-ref> --password <db-password>`
   - [ ] Review pending migrations: `supabase db remote commit`
   - [ ] Push migrations: `supabase db push`
   - [ ] Verify migration success in Supabase dashboard

3. **Post-Deployment Verification**
   - [ ] Verify all 6 tables exist in production
   - [ ] Verify indexes created: `idx_interview_ratings_*`, `idx_reference_checks_*`
   - [ ] Verify foreign key constraints working
   - [ ] Test frontend connection to production database
   - [ ] Run smoke tests on critical user flows
   - [ ] Monitor error logs for 24 hours

4. **Rollback Plan (if needed)**
   - [ ] Have rollback SQL ready
   - [ ] Document data migration strategy for rollback
   - [ ] Test rollback procedure on staging first

## Notes

- Following GitHub Flow branching strategy (feature branches from main)
- Using conventional commit format (feat:, fix:, docs:, etc.)
- Keeping PRs under 400 lines when possible
- All new features should include tests (target: Vitest + React Testing Library)
