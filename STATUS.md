# Project Status

Last Updated: 2025-10-22

## Current Focus

Implementing two-stage evaluation framework (Stage 2: Final Hiring Decision with weighted scoring) and updating project structure to Claude Code v2.0 standards.

## In Progress 🚧

- [ ] Run Supabase migration 002_interview_and_references.sql ([Issue #1](https://github.com/ptoney514/recruiter-evaluation-app/issues/1))
  - Migration file ready in `supabase/migrations/`
  - Need to execute in Supabase SQL Editor
  - Blocker: Requires access to Supabase dashboard

- [ ] Test Stage 1 API (Resume Screening) ([Issue #2](https://github.com/ptoney514/recruiter-evaluation-app/issues/2))
  - Need to create test payload
  - Validate response format
  - Document cost metrics

- [ ] Test Stage 2 API (Final Hiring Decision) ([Issue #3](https://github.com/ptoney514/recruiter-evaluation-app/issues/3))
  - Need to create test payload with interview/reference data
  - Verify weighted scoring calculation (25/50/25)
  - Validate that interview performance is weighted most heavily

## Recently Completed ✅

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

## Recent Decisions 📝

- **Oct 22**: Adopted Claude Code v2.0 project structure with CLAUDE.md + STATUS.md for better collaboration and context preservation

- **Oct 22**: Created GitHub issues for tracking development work instead of inline TODO comments

- **Oct 21**: Implemented two-stage evaluation framework (25% resume + 50% interview + 25% references) per recruiting best practices

- **Oct 21**: Using Claude 3.5 Haiku for cost optimization (~$0.003 per evaluation vs ~$0.015 for Sonnet)

- **Oct 21**: Integrated recruiting-evaluation skill for consistent evaluation criteria across sessions

## Blockers

- **Supabase Access**: Need credentials/access to run database migrations
- **API Testing Environment**: Need to determine if testing against production API or local mock

## Notes

- Following GitHub Flow branching strategy (feature branches from main)
- Using conventional commit format (feat:, fix:, docs:, etc.)
- Keeping PRs under 400 lines when possible
- All new features should include tests (target: Vitest + React Testing Library)
