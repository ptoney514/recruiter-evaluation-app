# CLAUDE.md - Project Instructions

**Resume Scanner Pro** - AI-powered batch resume evaluation tool for recruiters.

## Project Vision

Enable B2B recruiters to screen 50+ resumes instantly with AI-powered analysis, reducing evaluation time from hours to minutes while maintaining quality hiring decisions.

**Core Features:**
- ✅ Batch upload 1-50 resumes (free keyword ranking)
- ✅ Two-stage evaluation (resume screening → interview assessment)
- ✅ AI-powered analysis (Claude 3.5 Haiku + OpenAI GPT-4o)
- ✅ Interview guide generation
- ✅ PDF export reports
- 🚧 Live testing and user validation
- 📋 Mobile apps (iOS/Android - Phase 4)

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Zustand
- **State**: React Query (server state), Zustand (client state)
- **Backend**: Python 3.13 serverless functions (Vercel)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Claude 3.5 Haiku (primary), OpenAI GPT-4o Mini (optional)
- **PDF Parsing**: pdfplumber (Python), PDF.js (client-side)
- **Testing**: Vitest + React Testing Library (planned)
- **Deployment**: Vercel (frontend + API functions)

## Quick Start

**Prerequisites:** Node.js 18+, Python 3.13+, Anthropic API key, Supabase (local Docker or cloud)

**Setup:**
```bash
# 1. Install dependencies
cd frontend && npm install && cd ..
pip3 install --break-system-packages anthropic pdfplumber python-docx Pillow

# 2. Configure environment
cd api && cp .env.example .env
# Add ANTHROPIC_API_KEY to api/.env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.local

# 3. Start Supabase (local)
supabase start

# 4. Start servers
cd api && python3 dev_server.py 8000  # Terminal 1
cd frontend && npm run dev             # Terminal 2

# 5. Access
# Frontend: http://localhost:3000 (or :5173 if Vite default)
# API: http://localhost:8000
# Supabase Studio: http://localhost:54323
```

## Development Commands

### Start All Services (must have Docker running)
```bash
# Terminal 1: Supabase
supabase start

# Terminal 2: API Server
cd api && python3 flask_server.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Supabase Studio: http://localhost:54323

### Testing
```bash
cd frontend && npm run test:run     # Run all tests
cd frontend && npm run test:e2e     # Run E2E tests (Playwright)
```

### Other Commands
```bash
npm run build                       # Production build
npm run lint                        # ESLint
supabase db reset                   # Reset local DB
```

## Architecture

### Project Structure
```
recruiter-evaluation-app/
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── pages/          # Route-level components
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API/Supabase/storage layers
│   │   ├── hooks/          # React Query hooks (planned)
│   │   └── lib/            # Supabase client (planned)
│   └── .env.local          # Frontend environment variables
├── api/                     # Python serverless functions
│   ├── evaluate_candidate.py  # AI evaluation endpoint
│   ├── parse_resume.py        # PDF text extraction
│   ├── ai_evaluator.py        # Multi-LLM evaluation logic
│   ├── llm_providers.py       # Provider abstraction layer
│   └── .env                   # API keys
├── supabase/
│   └── migrations/          # Database schema versions
├── docs/                    # Additional documentation
├── CLAUDE.md               # This file (stable architecture)
└── STATUS.md               # Current work and progress
```

### Two-Stage Evaluation Framework

**Core Business Logic:**

**Stage 1: Resume Screening** (who to interview)
- Score: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Output: 0-100 score, recommendation (Interview/Phone Screen/Decline)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline

**Stage 2: Final Hiring Decision** (who gets the offer)
- Score: Resume (25%) + Interview (50%) + References (25%)
- Interview performance weighted most heavily
- Output: Final score, recommendation (STRONG HIRE/HIRE/DO NOT HIRE)

**API Pattern:**
```python
# Stage 1
POST /api/evaluate_candidate
{
  "stage": 1,
  "job": {...},
  "candidate": {...},
  "provider": "anthropic",  # or "openai"
  "model": "claude-3-5-haiku-20241022"  # optional
}

# Stage 2
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

### Database Schema (Supabase)

**Tables:**
- `jobs` - Job postings (JSONB: must_have_requirements, preferred_requirements)
- `candidates` - Candidate profiles (JSONB: skills, education)
- `evaluations` - AI evaluation results with scores
- `candidate_rankings` - Manual ranking overrides
- `interview_ratings` - Stage 2 interview data
- `reference_checks` - Stage 2 reference data

**Migrations:**
- `001_initial_schema.sql` - Core tables
- `002_interview_and_references.sql` - Stage 2 tables
- `003_add_llm_provider_tracking.sql` - Multi-LLM support

**Planned:**
- `004_add_auth_and_rls.sql` - user_id columns + RLS policies

## Key Design Decisions

### Python Backend over Node.js
**Decision:** Keep Python serverless functions instead of rewriting in Node.js/TypeScript

**Why:** Python has better PDF parsing (pdfplumber), first-class AI SDKs (anthropic, openai), and the backend is already working well. Rewriting would delay MVP by weeks with minimal benefit.

### Claude Haiku over Sonnet/GPT-4
**Decision:** Use Claude 3.5 Haiku as default LLM

**Why:** 5x cheaper than Sonnet ($0.003 vs $0.015 per evaluation). For batch resume screening, cost matters. Haiku quality is sufficient for structured evaluations. Users can optionally upgrade to GPT-4o for specific candidates.

### Supabase over Self-Hosted
**Decision:** Use Supabase for database, auth, and storage

**Why:** Faster iteration, built-in auth/storage, real-time subscriptions, RLS for security. Reduces infrastructure overhead for solo developer MVP.

### B2B Signup-First Model (Authentication Required)
**Decision:** Require account creation before trial usage (like Frill, Greenhouse, LinkedIn Recruiter)

**Why:**
- **Qualified leads:** Filters tire-kickers, captures email for nurture campaigns
- **B2B expectations:** Corporate recruiters expect signup for SaaS trials - signals legitimacy
- **Simpler architecture:** Single storage system (Supabase only), no sessionStorage migration flows
- **Better conversion:** Email captured upfront, easier to track trial → paid conversion
- **Prevents abuse:** Account requirement reduces spam, throwaway usage
- **Focus on niche:** Target serious corporate/agency recruiters, not mass consumer market

**Implementation:** Marketing landing page → Signup → Tool access (all data persisted to Supabase)

### Serverless over Traditional Backend
**Decision:** Python serverless functions (Vercel) instead of Express/FastAPI server

**Why:** Stateless evaluation API benefits from serverless. Auto-scaling, pay-per-use, simpler deployment. No server management overhead.

### JSONB for Flexible Schema
**Decision:** Use PostgreSQL JSONB for requirements, skills, education, arrays

**Why:** Job requirements vary widely across roles. JSONB allows schema evolution without migrations while maintaining queryability.

## Accepted Trade-offs

### JSONB Flexibility vs Type Safety
**Trade-off:** Less type safety at database level for flexible data structures

**Why Accept:** Faster MVP iteration. Requirements stabilize post-launch. Flexibility > strict typing for now.

### Monorepo without Workspace Tools
**Trade-off:** No Nx/Turborepo for monorepo management

**Why Accept:** Only 2 directories (frontend, api), minimal shared code. Tooling adds complexity without value.

### Manual Testing over E2E
**Trade-off:** Manual API/UI testing instead of comprehensive automated tests

**Why Accept:** Prioritize feature velocity. Add tests as system stabilizes and edge cases emerge.

### Regex Parsing over Structured Output
**Trade-off:** Parse Claude text responses with regex vs strict JSON schema

**Why Accept:** Natural language output is easier to read/modify. Parsing logic is straightforward. Better for prompt engineering iteration.

## Critical Constraints

### What TO Do

- **Use functional React components only** - Hooks compatibility, consistency
- **Use React Query for ALL server state** - Never useState for server data
- **Use async/await over .then()** - More readable async code
- **Comment complex evaluation logic** - Scoring calculations, parsing, prompts
- **Keep components under 200 lines** - Split if exceeding
- **Validate all API inputs** - Frontend + backend validation
- **Handle AI errors gracefully** - Claude API can fail, show user-friendly messages
- **Use JSONB for flexible data** - Arrays, objects, variable structures
- **Test migrations locally first** - Supabase local before production

### What NOT To Do

- ❌ **Don't bypass React Query for server state** - Cache inconsistencies
- ❌ **Don't commit .env files or API keys** - Security risk
- ❌ **Don't modify prompts without updating parsers** - Evaluations will fail
- ❌ **Don't store PII unencrypted** - Use Supabase encryption
- ❌ **Don't skip CORS headers** - API endpoints need CORS
- ❌ **Don't use sync file operations in serverless** - Use async only
- ❌ **Don't mutate React state directly** - Use setters
- ❌ **Don't rewrite backend in Node.js** - Python is better for this use case
- ❌ **Don't use class components** - Functional components only

### Commit Protocol

Before every commit, use the **product-manager agent** (`.claude/agents/product-manager.md`) to update `PROJECT_STATUS.md` with:
- Move completed items to "Completed Features" section
- Update "In Progress" with current work
- Note any new blockers, decisions, or infrastructure changes
- Update "Last Updated" date

This ensures project status stays in sync with code changes and nothing gets lost between sessions.

## Testing Philosophy

**Current:** Manual testing of API endpoints and UI flows

**Target:**
- Unit tests: Utility functions, parsing logic (Vitest)
- Component tests: Forms, UI interactions (React Testing Library)
- Integration tests: API evaluation endpoints
- E2E tests: Critical user flows (Playwright - future)

**Priorities:**
1. Evaluation response parsing (high impact if broken)
2. Scoring calculations (Stage 1 and Stage 2)
3. Form validation logic
4. Supabase data mutations

**Guidelines:**
- Test business logic, not implementation details
- Mock AI API calls (avoid real costs)
- Test error states and edge cases
- Keep tests fast and isolated

## Performance Budgets

- API response: < 500ms (excluding AI processing)
- Resume upload + parsing: < 5 seconds
- Single AI evaluation: < 10 seconds
- Batch evaluation (5 resumes): < 30 seconds
- Page load time: < 2 seconds

## Cost Tracking

**Claude 3.5 Haiku:**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- Average: ~$0.003 per evaluation

**OpenAI GPT-4o Mini (optional):**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Average: ~$0.005 per evaluation

Cost calculated automatically in `evaluate_candidate.py` and stored in database.

## Environment Variables

**Frontend** (`frontend/.env.local`):
```
VITE_SUPABASE_URL=http://127.0.0.1:54321  # Local or cloud URL
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**API** (`api/.env`):
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Optional
```

## Important Implementation Notes

- **React Query** manages all server state. Never use useState for server data.
- **JSONB fields** enable schema evolution. Use for arrays/objects.
- **Evaluation prompts** format must match parsing logic in `ai_evaluator.py`
- **CORS enabled** on all API endpoints for local development
- **File uploads** go to Supabase Storage, text extracted via `parse_resume.py`
- **Recruiting skill** at `~/.claude/skills/recruiting-evaluation/SKILL.md` (falls back to inline)
- **Multi-LLM support** via `llm_providers.py` abstraction layer

## Current Focus

**🎯 Phase 3: Live Testing Preparation**

### Session Goals:
1. ✅ Clean up project structure for momentum tracking
2. ⚠️ Test resume upload service (newly merged)
3. ⚠️ Verify auth flow end-to-end
4. ⚠️ Fix remaining code review issues (accessibility, ARIA labels)
5. 📋 Prepare for Phase 4: Live user testing

**For detailed progress and blockers, see [PROJECT_STATUS.md](PROJECT_STATUS.md)**

---

**File Organization:**
- `CLAUDE.md` - This file (stable architecture, read once per session)
- `PROJECT_STATUS.md` - Living status (update daily, reference often)
- `WORKFLOW_GUIDE.md` - How to do common tasks
- `TESTING_GUIDE.md` - Our testing standards
