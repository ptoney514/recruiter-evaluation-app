# CLAUDE.md - Project Instructions

**Resume Scanner Pro** - AI-powered batch resume evaluation tool for personal use.

## Project Vision

Screen 50+ resumes instantly with AI-powered analysis, reducing evaluation time from hours to minutes while maintaining quality hiring decisions.

**Core Features:**
- ✅ Batch upload 1-50 resumes (free keyword ranking)
- ✅ Two-stage evaluation (resume screening → interview assessment)
- ✅ AI-powered analysis (Claude 3.5 Haiku + OpenAI GPT-4o + Ollama)
- ✅ Quick Score with local Ollama models
- ✅ Interview guide generation
- ✅ PDF export reports

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, React Router, Zustand
- **State**: React Query (server state), Zustand (client state)
- **Backend**: Python Flask API server
- **Database**: SQLite (via Python API)
- **AI**: Claude 3.5 Haiku (primary), OpenAI GPT-4o Mini (optional), Ollama (local)
- **PDF Parsing**: pdfplumber (Python), PDF.js (client-side)
- **Testing**: Vitest + React Testing Library, Playwright (E2E)

## Quick Start

**Prerequisites:** Node.js 18+, Python 3.13+, Anthropic API key

**Setup:**
```bash
# 1. Install dependencies
cd frontend && npm install && cd ..
pip3 install --break-system-packages anthropic pdfplumber python-docx Pillow flask flask-cors

# 2. Configure API environment
cd api && cp .env.example .env
# Add ANTHROPIC_API_KEY to api/.env

# 3. Start servers (2 terminals)
cd api && python3 flask_server.py    # Terminal 1: API
cd frontend && npm run dev            # Terminal 2: Frontend

# 4. Access
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

## Development Commands

### Start Services
```bash
# Terminal 1: API Server
cd api && python3 flask_server.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- API: http://localhost:8000

### Testing
```bash
cd frontend && npm run test:run     # Run all tests
cd frontend && npm run test:e2e     # Run E2E tests (Playwright)
```

### Other Commands
```bash
npm run build                       # Production build
npm run lint                        # ESLint
```

## Architecture

### Project Structure
```
recruiter-evaluation-app/
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── pages/          # Route-level components
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API service layer
│   │   └── hooks/          # React Query hooks
│   └── .env.local          # Frontend environment variables
├── api/                     # Python Flask API
│   ├── flask_server.py      # Main API server
│   ├── database.py          # SQLite database layer
│   ├── evaluate_candidate.py  # AI evaluation endpoint
│   ├── ai_evaluator.py        # Multi-LLM evaluation logic
│   ├── llm_providers.py       # Provider abstraction layer
│   ├── ollama_provider.py     # Ollama integration
│   └── .env                   # API keys
├── data/                    # SQLite database and uploads
│   └── recruiter.db         # Main database
├── docs/                    # Additional documentation
├── CLAUDE.md               # This file (stable architecture)
└── PROJECT_STATUS.md       # Current work and progress
```

### Data Flow
```
Frontend (React) → databaseService.js → Python API → SQLite
                                      → AI endpoints → Claude/Ollama
```

### Three-Tier Scoring System (A-T-Q)

**Quick Score** (Local Ollama - Free)
- Fast screening with local LLM models (phi3, mistral, llama3)
- Runs automatically on resume upload
- 0-100 score based on requirements matching

**Stage 1: Resume Screening** (Claude - Paid)
- Deep analysis: Accomplishments (50%) + Trajectory (30%) + Qualifications (20%)
- Output: 0-100 score, recommendation (Interview/Phone Screen/Decline)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline

**Stage 2: Final Hiring Decision** (Claude - Paid)
- Score: Resume (25%) + Interview (50%) + References (25%)
- Output: Final score, recommendation (STRONG HIRE/HIRE/DO NOT HIRE)

### API Endpoints

```python
# Jobs
GET    /api/jobs              # List all jobs
POST   /api/jobs              # Create job
GET    /api/jobs/:id          # Get job
PUT    /api/jobs/:id          # Update job
DELETE /api/jobs/:id          # Delete job

# Candidates
GET    /api/jobs/:id/candidates    # List candidates for job
POST   /api/jobs/:id/candidates    # Create candidate
GET    /api/candidates/:id         # Get candidate
PUT    /api/candidates/:id         # Update candidate
DELETE /api/candidates/:id         # Delete candidate

# Evaluations
POST   /api/evaluate_candidate     # Run Claude evaluation
POST   /api/evaluate_quick         # Run Ollama quick score
POST   /api/evaluate_quick/batch   # Batch quick scoring
```

### Database Schema (SQLite)

**Tables:**
- `jobs` - Job postings with requirements (JSON fields)
- `candidates` - Candidate profiles with three-tier scores
- `evaluations` - Detailed AI evaluation results

**Key Columns (candidates):**
- `quick_score` - Ollama-generated score (0-100)
- `stage1_score`, `stage1_a_score`, `stage1_t_score`, `stage1_q_score` - Claude Stage 1
- `stage2_score` - Claude Stage 2 final score
- `resume_text` - Extracted text from uploaded files

## Key Design Decisions

### Python Backend over Node.js
**Decision:** Keep Python Flask API instead of rewriting in Node.js

**Why:** Python has better PDF parsing (pdfplumber), first-class AI SDKs (anthropic, openai), and works well with SQLite. The backend is stable and performant.

### SQLite for Personal Use
**Decision:** Use SQLite instead of PostgreSQL/Supabase

**Why:** Simple file-based database, no server needed, easy to backup/delete. Perfect for personal use without multi-user requirements.

### Local-First Architecture
**Decision:** All data stored locally, no cloud dependencies

**Why:** Privacy, speed, no recurring costs for storage. Resume data stays on your machine.

### Claude Haiku for Evaluations
**Decision:** Use Claude 3.5 Haiku as default LLM

**Why:** 5x cheaper than Sonnet (~$0.003 per evaluation). Quality is sufficient for structured resume analysis. Can upgrade to GPT-4o for specific candidates.

### Ollama for Quick Scoring
**Decision:** Use local Ollama for initial screening

**Why:** Free, fast, and private. No API costs for initial filtering. Models like phi3 and mistral run locally.

## Critical Constraints

### What TO Do

- **Use functional React components only** - Hooks compatibility, consistency
- **Use React Query for ALL server state** - Never useState for server data
- **Use async/await over .then()** - More readable async code
- **Comment complex evaluation logic** - Scoring calculations, parsing, prompts
- **Keep components under 200 lines** - Split if exceeding
- **Validate all API inputs** - Frontend + backend validation
- **Handle AI errors gracefully** - API calls can fail, show user-friendly messages

### What NOT To Do

- ❌ **Don't bypass React Query for server state** - Cache inconsistencies
- ❌ **Don't commit .env files or API keys** - Security risk
- ❌ **Don't modify prompts without updating parsers** - Evaluations will fail
- ❌ **Don't use sync file operations in API** - Use async only
- ❌ **Don't mutate React state directly** - Use setters
- ❌ **Don't use class components** - Functional components only

## Environment Variables

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:8000
```

**API** (`api/.env`):
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # Optional
```

## Testing Philosophy

**Current:**
- Unit tests: Utility functions, parsing logic (Vitest)
- Component tests: Forms, UI interactions (React Testing Library)
- E2E tests: Critical user flows (Playwright)

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

**Ollama (local):** Free

## Current Focus

**🎯 Phase 4: Simplified Personal Use**

- ✅ Removed Supabase dependencies
- ✅ Removed authentication (single-user mode)
- ✅ SQLite database via Python API
- ✅ Local file storage for resumes

**For detailed progress, see [PROJECT_STATUS.md](PROJECT_STATUS.md)**

---

**File Organization:**
- `CLAUDE.md` - This file (stable architecture)
- `PROJECT_STATUS.md` - Living status (update frequently)
