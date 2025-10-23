# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AI-powered candidate evaluation system that helps recruiters make data-driven hiring decisions using Claude API. Uses a two-stage evaluation framework to screen resumes and make final hiring decisions.

## Quick Start (New Developer)

**Prerequisites:**
- Node.js 18+
- Docker Desktop (for local Supabase)
- Supabase CLI: `brew install supabase/tap/supabase`

**Setup Steps:**

1. **Clone and Install Dependencies**
   ```bash
   git clone <repo-url>
   cd recruiter-evaluation-app
   cd frontend && npm install && cd ..
   ```

2. **Start Local Supabase**
   ```bash
   supabase start
   # Wait for containers to start (first time takes ~2 minutes)
   ```

3. **Configure Frontend Environment**
   ```bash
   # Copy local Supabase credentials
   cd frontend
   cp .env.example .env
   # Update .env with local Supabase URL and anon key from `supabase status`
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Frontend runs at http://localhost:5173 (or :3000 if configured)
   ```

5. **Access Local Services**
   - **Frontend**: http://localhost:5173
   - **Supabase Studio**: http://127.0.0.1:54323 (Database UI)
   - **API**: http://127.0.0.1:54321
   - **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

6. **Verify Setup**
   ```bash
   # Check Supabase status
   supabase status

   # View tables in database
   docker exec supabase_db_recruiter-evaluation-app psql -U postgres -d postgres -c "\dt"
   # Should show: jobs, candidates, evaluations, candidate_rankings, interview_ratings, reference_checks
   ```

**Common Commands:**
```bash
# Stop Supabase
supabase stop

# Reset database to migrations
supabase db reset

# View Supabase logs
supabase logs

# Open Studio UI
open http://127.0.0.1:54323
```

## Tech Stack

- **Frontend**: Vite + React, Tailwind CSS, React Router, React Query (TanStack Query), Zustand
- **Backend**: Python serverless functions (Vercel), Supabase (PostgreSQL + Storage)
- **AI**: Claude 3.5 Haiku API via Anthropic SDK
- **Deployment**: Vercel (frontend + API), Supabase (database)

## Development Commands

**Frontend development:**
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

**API testing locally:**
```bash
cd api
python -m http.server 8000
```

## Architecture

### Monorepo Structure
- `frontend/` - React application
- `api/` - Python serverless functions (Vercel)
- `supabase/migrations/` - Database schema migrations

### Frontend Architecture

**Data Flow:**
1. React Query hooks (`hooks/`) manage server state and caching
2. Services layer (`services/`) abstracts Supabase and API calls
3. Components consume hooks and display data

**Component Organization:**
- `components/ui/` - Reusable UI primitives (Button, Card, Input, Badge)
- `components/layout/` - App layout components (Header, Layout)
- `components/jobs/` - Job management components
- `components/candidates/` - Candidate management (Phase 2)
- `components/evaluations/` - AI evaluation display (Phase 3)
- `pages/` - Route-level page components

**Key Services:**
- `services/supabase.js` - Supabase client initialization
- `services/jobsService.js` - Job CRUD operations via Supabase

### Backend Architecture

**Serverless Functions:**
- `api/parse_resume.py` - Extracts text from PDF/DOCX resumes
- `api/evaluate_candidate.py` - Runs AI evaluations via Claude API

**Two-Stage Evaluation Framework:**

**Stage 1: Resume Screening** (determines who to interview)
- Score calculation: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline
- Output: Score (0-100), recommendation, strengths, concerns, suggested interview questions

**Stage 2: Final Hiring Decision** (determines who gets the offer)
- Score calculation: Resume (25%) + Interview (50%) + References (25%)
- Interview performance is weighted most heavily (50%)
- Output: Final score, recommendation (STRONG HIRE/HIRE/DO NOT HIRE), confidence level

**Evaluation API Pattern:**
```python
# Stage 1 (Resume Screening)
POST /api/evaluate_candidate
{
  "stage": 1,
  "job": {...},
  "candidate": {...}
}

# Stage 2 (Post-Interview)
POST /api/evaluate_candidate
{
  "stage": 2,
  "job": {...},
  "candidate": {...},
  "resume_score": 85,
  "interview": {...},
  "references": [...]
}
```

**Skill Integration:**
- Loads instructions from `~/.claude/skills/recruiting-evaluation/SKILL.md`
- Falls back to inline instructions if skill file not found
- Skill defines evaluation criteria and scoring rubrics

### Database Schema

**Core Tables:**
- `jobs` - Job postings with requirements (JSONB: must_have_requirements, preferred_requirements)
- `candidates` - Candidate profiles with resume text and metadata (JSONB: skills, education)
- `evaluations` - AI evaluation results with scores and analysis
- `candidate_rankings` - Manual ranking overrides per job
- `interview_ratings` - Interview performance data for Stage 2
- `reference_checks` - Reference check data for Stage 2

**Key Schema Patterns:**
- JSONB fields for flexible data (requirements, skills, education, red_flags)
- Evaluation stage tracking (`evaluation_stage`: 1 or 2)
- Cost tracking fields (`evaluation_prompt_tokens`, `evaluation_completion_tokens`, `evaluation_cost`)
- Auto-updating `updated_at` timestamps via triggers

**Migrations:**
- `001_initial_schema.sql` - Core tables (jobs, candidates, evaluations, rankings)
- `002_interview_and_references.sql` - Stage 2 tables (interview_ratings, reference_checks)

## Key Design Decisions

### Two-Stage Evaluation Framework
**Decision:** Separate resume screening (Stage 1) from final hiring decision (Stage 2) with weighted scoring.

**Why:** This mirrors real-world hiring workflows where resume screening determines who to interview, and the final decision heavily weights interview performance (50%) over resume (25%) and references (25%). It prevents over-relying on resume credentials alone.

### Claude Haiku over Sonnet
**Decision:** Use Claude 3.5 Haiku for all evaluations instead of Claude Sonnet.

**Why:** Cost optimization - Haiku costs ~$0.003 per evaluation vs Sonnet's ~$0.015. For high-volume candidate screening, this is a 5x cost savings with minimal quality trade-off for structured evaluations.

### Zustand over Redux
**Decision:** Use Zustand for lightweight state management needs.

**Why:** Simpler API, less boilerplate, and sufficient for this application's state complexity. Redux would add unnecessary overhead for a tool primarily driven by server state (managed by React Query).

### Supabase over Self-Hosted PostgreSQL
**Decision:** Use Supabase for database, storage, and authentication.

**Why:** Faster iteration, built-in authentication, file storage, and real-time subscriptions out of the box. Reduces infrastructure management overhead for an MVP.

### Vercel Serverless over Traditional Backend
**Decision:** Python serverless functions on Vercel instead of a traditional Express/FastAPI server.

**Why:** Simpler deployment model, automatic scaling, and pay-per-use pricing. The evaluation API is stateless and benefits from serverless architecture.

### JSONB Fields for Flexible Schema
**Decision:** Use PostgreSQL JSONB columns for requirements, skills, education, and other array/object data.

**Why:** Allows schema evolution without migrations. Job requirements and candidate skills vary widely - JSONB provides flexibility while maintaining queryability.

## Accepted Trade-offs

### JSONB Flexibility vs Strict Typing
**Trade-off:** Using JSONB for flexible data means less type safety at the database level.

**Why Accept:** Faster iteration during MVP phase. We can migrate to stricter schemas once requirements stabilize. The flexibility outweighs the type safety concerns for now.

### Monorepo without Workspace Tooling
**Trade-off:** Monorepo structure (frontend + api) without Nx/Turborepo workspace management.

**Why Accept:** Project simplicity. With only 2 main directories and minimal shared code, workspace tooling would add more complexity than value.

### Manual API Testing over Automated E2E
**Trade-off:** Currently relying on manual testing of API endpoints rather than comprehensive E2E test suite.

**Why Accept:** Prioritizing feature development speed. Will add automated testing as the system stabilizes and edge cases are better understood.

### Client-Side Evaluation Parsing over Structured Output
**Trade-off:** Parsing Claude's text responses with regex rather than using strict JSON schema output.

**Why Accept:** More natural language evaluation output that's easier to read/modify. The parsing logic is straightforward and the text format is more maintainable for prompt engineering.

## Critical Constraints

### What TO Do

- **Use functional React components only** - No class components for consistency and hooks compatibility
- **Use React Query for ALL server state** - Never store server data in local state (useState/useReducer)
- **Use async/await over .then()** - More readable asynchronous code
- **Comment complex evaluation logic** - Especially scoring calculations and API parsing
- **Keep components under 200 lines** - Split into smaller components if exceeding
- **Always validate API inputs** - Both frontend and backend validation with clear error messages
- **Handle evaluation errors gracefully** - Claude API can fail; always show user-friendly messages
- **Use JSONB for flexible array/object data** - Don't create rigid schemas for variable data structures

### What NOT To Do

- ❌ **Don't bypass React Query for server state** - Leads to cache inconsistencies and stale data
- ❌ **Don't commit .env files or API keys** - Keep credentials out of version control
- ❌ **Don't modify evaluation prompts without updating parsers** - The prompt format in `evaluate_candidate.py` must match the parsing logic or evaluations will fail
- ❌ **Don't store sensitive candidate data unencrypted** - Use Supabase's built-in encryption for PII
- ❌ **Don't skip CORS configuration** - All API endpoints need CORS headers for local development
- ❌ **Don't use synchronous file operations in serverless functions** - Async only for PDF/DOCX parsing
- ❌ **Don't mutate React state directly** - Always use setter functions
- ❌ **Don't create database migrations without testing** - Test locally before running in production Supabase

## Testing Philosophy

**Current Approach:** Manual testing of API endpoints and UI flows

**Target Approach:**
- Unit tests for utility functions and parsing logic (Vitest)
- Component tests for forms and UI interactions (React Testing Library)
- API integration tests for evaluation endpoints
- E2E tests for critical user flows (Playwright - future)

**Coverage Priorities:**
1. Evaluation response parsing (high impact if broken)
2. Form validation logic
3. Scoring calculations (Stage 1 and Stage 2)
4. Supabase data mutations

**Testing Guidelines:**
- Test business logic, not implementation details
- Mock Claude API calls in tests (avoid real API costs)
- Test error states and edge cases
- Keep tests fast and isolated

## Current Phase

**Phase:** MVP Development - Two-Stage Evaluation Framework

**Status:** Building Stage 2 UI and testing infrastructure

**Completed:**
- ✅ Stage 1: Resume screening API and database schema
- ✅ Stage 2: Final hiring decision API with weighted scoring
- ✅ Database migrations for interview ratings and reference checks
- ✅ Job management UI (CRUD operations)

**In Progress:**
- 🚧 Supabase migration deployment (Issue #1)
- 🚧 API testing and validation (Issues #2, #3)
- 🚧 Interview rating form UI (Issue #4)
- 🚧 Reference check form UI (Issue #5)

**Next Up:**
- Stage 2 evaluation display UI
- Side-by-side candidate comparison
- Batch evaluation workflows
- Excel export functionality

## Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**API** (`api/.env`):
```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Cost Tracking

**Claude 3.5 Haiku Pricing:**
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens
- Average cost per evaluation: ~$0.003

Cost calculation is performed automatically in `evaluate_candidate.py` and stored in the database.

## Important Implementation Notes

- **React Query** is used for all server state management. Do not use local state for server data.
- **JSONB fields** in PostgreSQL allow flexible schema evolution. Use these for array/object data.
- **Evaluation responses** from Claude are parsed using regex patterns. The prompt format in `evaluate_candidate.py` must match the parsing logic.
- **CORS is enabled** on all API endpoints for local development.
- **File uploads** go to Supabase Storage, with resume text extracted via `parse_resume.py`.
- The **recruiting-evaluation skill** hardcoded at `~/.claude/skills/recruiting-evaluation/SKILL.md` defines the AI evaluation criteria. Update this skill to modify evaluation logic.
