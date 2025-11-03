# Resume Scanner Pro - Product Requirements Document

**Version:** 1.0 | **Date:** 2025-11-01 | **Status:** MVP Development | **Owner:** Product & Growth Lead

---

## Elevator Pitch

**Resume Scanner Pro** is an AI-powered batch resume evaluation tool that helps recruiters screen 10-50 candidates in minutes, not hours. Upload resumes, get instant keyword matching (free) or AI-powered analysis (paid), and make data-driven hiring decisions with a two-stage evaluation framework.

**Tagline:** "From 50 resumes to 5 interviews in 10 minutes."

---

## Problem Statement

### Current Pain Points

**Recruiters and hiring managers face:**
1. **Time sink:** Manually screening 30-50 resumes takes 3-4 hours per job posting
2. **Inconsistency:** Different reviewers use different criteria, leading to missed great candidates
3. **Bias risk:** Unconscious bias in manual resume review
4. **No documentation:** Hard to justify why candidates were rejected
5. **Poor candidate experience:** Slow response times (1-2 weeks to hear back)

**Quantified Impact:**
- Average recruiter screens 40 resumes/week
- Manual review: 5 min/resume = 200 min/week (3.3 hours)
- Inconsistent evaluation leads to 15-20% false negatives (good candidates rejected)
- Lack of audit trail creates compliance risk

---

## Target Users

### Primary User: In-House Recruiter
- **Company size:** 50-500 employees (SMB to mid-market)
- **Hiring volume:** 2-5 open roles at any time, 30-50 applicants per role
- **Pain level:** 8/10 - drowning in resumes, need to move faster
- **Budget authority:** $50-200/month for productivity tools
- **Tech savviness:** Comfortable with web apps, uses ATS (Greenhouse, Lever)

### Secondary User: Hiring Manager
- **Role:** Engineering manager, Sales leader, Operations director
- **Hiring volume:** 1-3 roles/year, 20-40 applicants per role
- **Pain level:** 9/10 - resume screening is not their core job
- **Budget:** Willing to pay if it saves 2+ hours per hire
- **Tech savviness:** Moderate - needs simple, intuitive UI

### Tertiary User: Agency Recruiter
- **Volume:** High (100+ resumes/week across multiple clients)
- **Pain level:** 7/10 - has processes, but wants speed/quality edge
- **Budget:** Performance-based, will pay for competitive advantage
- **Needs:** Multi-client support, white-label potential (future)

---

## Solution Overview

### Core Value Proposition

**For recruiters** who need to screen large batches of resumes quickly,
**Resume Scanner Pro** is an AI evaluation tool
**that** provides instant, objective candidate rankings with detailed justifications,
**unlike** manual review or basic ATS keyword filters,
**our solution** combines free regex-based ranking with selective AI deep-dives on top candidates to optimize both speed and cost.

### Key Features (MVP)

#### P0 - Must Have for Launch

1. **Batch Resume Upload** (1-50 files)
   - Drag-and-drop interface
   - PDF + DOCX support
   - Progress indicator during upload
   - Acceptance: Upload 10 PDFs in <5 seconds

2. **Job Requirements Definition**
   - Must-have vs. preferred requirements
   - Skills, experience, education criteria
   - Save job templates for repeated roles
   - Acceptance: Create job profile in <2 minutes

3. **Free Regex-Based Ranking**
   - Instant keyword matching (no AI cost)
   - 0-100 score based on requirements match
   - Sort candidates by match percentage
   - Acceptance: Rank 50 resumes in <3 seconds

4. **Selective AI Evaluation (Paid)**
   - User chooses which candidates to evaluate with AI
   - Two-stage framework (resume screening vs. final hiring)
   - Detailed justification (qualifications, experience, risk flags)
   - Recommendation: Interview / Phone Screen / Decline
   - Acceptance: AI evaluation completes in <10 seconds per candidate

5. **Results Dashboard**
   - Sortable candidate table
   - Collapsible detail sections per candidate
   - Export to PDF report
   - Acceptance: View and export results for 30 candidates in <1 minute

6. **User Authentication** (Supabase Auth)
   - Email/password signup
   - Persistent storage across devices
   - Anonymous users can try tool (sessionStorage fallback)
   - Acceptance: Signup flow in <30 seconds

7. **Multi-Device Access**
   - Web app (desktop + mobile responsive)
   - Same data across devices
   - Acceptance: Start on laptop, view on phone seamlessly

#### P1 - Should Have Soon (Week 5-6)

8. **Interview Guide Generation**
   - AI-generated interview questions based on resume
   - Behavioral + technical + role-specific questions
   - Export to PDF
   - Acceptance: Generate interview guide in <15 seconds

9. **Stage 2 Evaluation** (Post-Interview)
   - Interview ratings input form
   - Reference check data capture
   - Final hiring decision (HIRE / DO NOT HIRE)
   - Weighted scoring: Resume (25%) + Interview (50%) + References (25%)
   - Acceptance: Complete Stage 2 evaluation in <3 minutes

10. **Job Templates Library**
    - Save common job profiles
    - Clone and modify templates
    - Share templates across team (future)
    - Acceptance: Create job from template in <1 minute

#### P2 - Nice to Have (Post-MVP)

11. **Candidate Ranking Override**
    - Manual reordering of candidates
    - Add private notes
    - Flag candidates for follow-up
    - Acceptance: Reorder 10 candidates in <30 seconds

12. **Multi-LLM Provider Choice**
    - Choose between Claude Haiku (faster, cheaper) or GPT-4o (higher quality)
    - Per-candidate provider selection
    - Cost tracking per provider
    - Acceptance: Toggle provider in <2 clicks

13. **iOS Native App**
    - SwiftUI application
    - Same backend API
    - Supabase Swift SDK integration
    - Acceptance: Feature parity with web app

14. **Team Collaboration**
    - Share job postings with team
    - Collaborative candidate review
    - Role-based permissions
    - Acceptance: Invite teammate in <1 minute

---

## User Flows (Core MVP Scenarios)

### Flow 1: First-Time User - Try Free Feature
1. Land on homepage → "Try free ranking" CTA
2. Define job requirements (2 min)
3. Upload 10 resumes (drag-and-drop)
4. See instant regex-based ranking (3 sec)
5. Prompt: "Upgrade to AI evaluation for top 5 candidates" → Signup

### Flow 2: Authenticated User - Full Evaluation
1. Login → Dashboard (saved jobs)
2. Create new job or select template
3. Upload 30 resumes
4. Review regex rankings
5. Select top 10 for AI evaluation (1 click)
6. Wait 10 sec per candidate (100 sec total)
7. Review AI recommendations
8. Export top 5 to PDF report
9. Share with hiring manager

### Flow 3: Hiring Manager - Stage 2 Decision
1. Login → View evaluated candidates
2. Select candidate for Stage 2
3. Add interview ratings (1-10 scale across 5 dimensions)
4. Add reference check notes
5. System calculates final score (weighted)
6. Recommendation: HIRE / DO NOT HIRE
7. Export decision report to PDF

---

## Success Metrics

### One Metric That Matters (MVP Launch)
**Activation Rate:** % of signups who complete their first AI evaluation within 7 days
- **Target:** 60%
- **Why:** Proves value delivery and converts free users to paid

### Supporting KPIs

#### Acquisition
- Website visitors → Trial signups: 5% (industry benchmark: 2-3%)
- Landing page session time: >45 seconds
- Bounce rate: <50%

#### Activation
- Signups → First AI evaluation: 60% (within 7 days)
- Time to first value: <10 minutes
- Free ranking → Paid AI upgrade: 30%

#### Retention
- D7 retention: 40%
- D30 retention: 25%
- Monthly active users (MAU): 100 by end of Month 2

#### Revenue
- Free → Paid conversion: 15% (within 30 days)
- ARPU (Average Revenue Per User): $25/month
- MRR (Monthly Recurring Revenue): $2,500 by Month 3

#### Product Quality
- AI evaluation accuracy (user satisfaction): 4.2/5.0
- P95 API response time: <500ms (excluding AI processing)
- Single AI evaluation: <10 seconds
- System uptime: >99.5%

---

## Explicit Out of Scope (Not MVP)

1. **ATS Integration** - No Greenhouse/Lever/Workday API integration (manual upload only)
2. **Video Interview Analysis** - Text-based resumes only
3. **Candidate Communication** - No email/SMS to candidates from the tool
4. **Calendar Integration** - No scheduling interviews within app
5. **White-Label / Agency Features** - Single-tenant only for MVP
6. **Advanced Analytics Dashboard** - Basic KPIs only, no BI tools
7. **GDPR Data Deletion** - Manual process for MVP (automate post-launch)
8. **Team Collaboration** - Single-user accounts only for MVP
9. **Background Checks** - No integration with background check providers
10. **Job Board Posting** - No Indeed/LinkedIn job posting from app

---

## Technical Constraints

### Performance Budgets
- Page load time: <2 seconds
- Resume upload + parse: <5 seconds per file
- Single AI evaluation: <10 seconds
- Batch evaluation (5 resumes): <30 seconds
- PDF export: <3 seconds

### Cost Constraints
- Claude Haiku: $0.003 per evaluation (target)
- Target gross margin: >70% (AI cost = <30% of revenue)
- Max AI cost per user/month: $7.50 (if $25 ARPU)

### Security Requirements
- HTTPS only
- Supabase Row-Level Security (RLS) policies
- API keys in environment variables (never committed)
- PII encrypted at rest (Supabase default)
- Resume files deleted after 30 days (GDPR compliance)

### Scalability Targets
- Support 1,000 concurrent users
- 10,000 evaluations/month
- 99.5% uptime SLA

---

## Open Questions (Research Needed)

1. **Pricing Model:**
   - Per-evaluation ($0.10/eval)? Monthly subscription ($25/month unlimited)? Hybrid?
   - Recommendation: Start with per-eval, migrate to subscription at 50 users

2. **Free Tier Limits:**
   - How many free regex rankings before requiring signup?
   - Recommendation: 3 jobs (up to 150 resumes total) before paywall

3. **Resume Retention:**
   - How long to store resumes? (Privacy vs. user convenience)
   - Recommendation: 30 days (legal requirement + user data minimization)

4. **Compliance Certifications:**
   - Do we need SOC 2 Type II for enterprise sales?
   - Recommendation: Not for MVP, required for deals >$5k ARR

5. **Internationalization:**
   - Support resumes in languages other than English?
   - Recommendation: English-only MVP, add Spanish/French in Month 6

6. **Mobile Strategy:**
   - Web-responsive first or native iOS immediately?
   - Recommendation: Web-responsive MVP, native iOS Month 3

---

## Launch Criteria (Definition of "MVP Ready")

### Functional Completeness
- ✅ All P0 features implemented and tested
- ✅ Authentication works (email/password + anonymous fallback)
- ✅ Payment integration (Stripe) functional
- ✅ PDF export generates readable reports
- ✅ AI evaluations complete within 10-second SLA

### Quality Gates
- ✅ Zero critical bugs (P0 severity)
- ✅ <5 high-priority bugs (P1 severity)
- ✅ 80% test coverage on core evaluation logic
- ✅ Load tested: 100 concurrent users, no errors
- ✅ Security review completed (RLS policies, secrets management)

### Go-to-Market Readiness
- ✅ Landing page live with clear value prop
- ✅ 3 customer testimonials (beta users)
- ✅ ProductHunt launch assets prepared
- ✅ Pricing page published
- ✅ Help documentation for core flows

### Metrics Infrastructure
- ✅ Analytics tracking implemented (acquisition → activation → retention → revenue)
- ✅ Error monitoring (Sentry or similar)
- ✅ KPI dashboard for team visibility
- ✅ Feedback collection mechanism (in-app survey)

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI cost exceeds revenue | High | Medium | Use Claude Haiku (5x cheaper), implement cost tracking, offer freemium tier |
| Competitors copy feature | Medium | High | Move fast, build brand, add unique IP (interview guides, two-stage framework) |
| GDPR compliance issues | High | Low | 30-day resume deletion, encryption at rest, privacy policy review |
| Users don't trust AI | Medium | Medium | Show AI reasoning, allow overrides, offer free regex tier |
| Supabase downtime | Medium | Low | Monitor uptime, implement retry logic, have failover plan |
| PDF parsing errors | High | Medium | Support PDF + DOCX, manual text input fallback, parse error handling |

---

## Dependencies

### External Services
- **Supabase:** Database, Auth, Storage (critical path)
- **Anthropic API:** Claude Haiku for AI evaluation (critical path)
- **Vercel:** Frontend + serverless functions hosting (critical path)
- **Stripe:** Payment processing (P1 - can defer for beta)

### Internal Teams
- **Development:** 1 full-stack engineer (Python + React)
- **Design:** Lo-fi wireframes (this doc), hire designer for polish (Month 2)
- **Marketing:** Landing page copy, ProductHunt launch (outsource or DIY)

### Legal/Compliance
- **Privacy Policy:** Required before launch (template + lawyer review)
- **Terms of Service:** Required before launch
- **GDPR Compliance:** EU users = extra requirements (defer if US-only beta)

---

## Timeline (MVP to Launch)

### Week 1-2: Supabase Foundation ✅ (Partially Complete)
- [x] Local Supabase setup
- [x] Migrations 001-003 applied
- [ ] Migration 004: Add user_id + RLS policies
- [ ] Frontend Supabase client (lib/supabase.js)
- [ ] useAuth hook
- [ ] Login/signup pages

### Week 3-4: Connect Existing Flow
- [ ] Job CRUD with Supabase
- [ ] Resume upload to Supabase Storage
- [ ] Evaluation results persistence
- [ ] React Query integration (replace sessionStorage)

### Week 5: Interview Guides + Stage 2
- [ ] Interview guide generation API
- [ ] Stage 2 evaluation form (interview ratings + references)
- [ ] PDF export for interview guides

### Week 6: Polish & Launch Prep
- [ ] Error handling across app
- [ ] Loading states for async operations
- [ ] Analytics implementation (PostHog/Mixpanel)
- [ ] Landing page optimization
- [ ] ProductHunt launch assets

**Target Launch Date:** Week 6 (December 13, 2025)

---

## Pricing Strategy (Proposed)

### Freemium Model

**Free Tier:**
- Unlimited regex-based keyword ranking
- Up to 3 saved jobs
- Limited to 10 resumes per batch
- Results deleted after 7 days
- No interview guides

**Pro Tier: $49/month** (or $0.15/evaluation pay-as-you-go)
- Unlimited AI evaluations
- Unlimited saved jobs
- Up to 50 resumes per batch
- Persistent storage (90 days)
- Interview guide generation
- Stage 2 evaluation (post-interview)
- PDF export
- Priority support

**Enterprise Tier: $199/month** (future)
- Everything in Pro
- Team collaboration (5 seats)
- White-label option
- API access
- SSO / SAML
- Dedicated account manager

---

## Competitive Landscape

### Direct Competitors
1. **Fetcher.ai** - AI recruiting, $99/month, focus on outbound sourcing (not screening)
2. **HireVue** - Video interview AI, enterprise-only, $$$
3. **Ideal.com** - AI resume screening, enterprise ATS integration, >$500/month

### Indirect Competitors
1. **Greenhouse/Lever ATS** - Basic keyword filters, no AI evaluation
2. **LinkedIn Recruiter** - Search/source candidates, not evaluation
3. **Manual resume review** - Free but slow/inconsistent

### Our Differentiators
- ✅ **Freemium pricing** - Try before you buy (competitors require enterprise sales)
- ✅ **Two-stage framework** - Resume screening + post-interview evaluation (unique IP)
- ✅ **Interview guide generation** - Not just screening, but full hiring workflow
- ✅ **Cost-optimized AI** - Claude Haiku = 5x cheaper than competitors using GPT-4
- ✅ **Simple UX** - No complex ATS setup, just upload and go
- ✅ **Multi-device** - Web + iOS (competitors are desktop-only)

---

## Appendix

### Related Documents
- [User Flows & Wireframes](USER_FLOWS.md)
- [Analytics & Event Tracking Plan](ANALYTICS.md)
- [Weekly Ship Plan](WEEKLY_SHIP_PLAN.md)
- [Technical Architecture](../CLAUDE.md)
- [Current Status](../STATUS.md)

### Glossary
- **ATS:** Applicant Tracking System (Greenhouse, Lever, Workday)
- **ICE Score:** Impact × Confidence × Ease (prioritization framework)
- **P0/P1/P2:** Priority levels (Must Have / Should Have / Nice to Have)
- **RLS:** Row-Level Security (Supabase database security feature)
- **SLO:** Service Level Objective (performance target)
- **TTI:** Time to Interview (metric for recruiter efficiency)

---

**Document Status:** Draft for review
**Next Review:** After user feedback on wireframes
**Approval Required From:** Product Lead, Engineering Lead
