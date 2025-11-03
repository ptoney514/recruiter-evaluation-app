# Resume Scanner Pro - Product Documentation

**Created:** 2025-11-01 | **Owner:** Product & Growth Lead

---

## Overview

This directory contains the complete product foundation for **Resume Scanner Pro** MVP. These documents were created using the [Product & Growth Lead (0→1) agent](../../agents/product-growth-lead-0to1/README.md) to establish a solid product strategy before shipping.

---

## Documents in This Directory

### 1. [PRD.md](PRD.md) - Product Requirements Document
**Purpose:** Define what we're building and why

**Key Sections:**
- Problem statement and target users
- Core features (P0, P1, P2 prioritization)
- Success metrics (OMTM: 60% activation rate)
- Out of scope items
- Launch criteria

**Use this when:**
- Planning new features
- Making prioritization decisions
- Onboarding team members
- Justifying product decisions

---

### 2. [USER_FLOWS.md](USER_FLOWS.md) - User Flows & Wireframes
**Purpose:** Visualize how the product works

**Key Sections:**
- Application sitemap (Mermaid diagram)
- 4 core user flows with diagrams
- 15 wireframes (text-based, ready for design)
- State diagrams (auth, evaluation)
- Mobile considerations

**Use this when:**
- Building frontend components
- Discussing UX improvements
- Creating design mockups
- User testing preparation

---

### 3. [ANALYTICS.md](ANALYTICS.md) - Analytics & Event Tracking Plan
**Purpose:** Measure success and optimize growth

**Key Sections:**
- KPI framework (AARRR metrics)
- Complete event tracking plan (40+ events)
- Conversion funnels
- Dashboard specifications
- Growth experiments (ICE framework)
- Implementation guide (PostHog)

**Use this when:**
- Implementing analytics tracking
- Running A/B tests
- Reviewing weekly KPIs
- Debugging conversion drop-offs

---

### 4. [WEEKLY_SHIP_PLAN.md](WEEKLY_SHIP_PLAN.md) - 6-Week MVP Plan
**Purpose:** Execute on the product vision

**Key Sections:**
- 6 weekly sprints (Nov 4 → Dec 13)
- Task breakdown with time estimates
- Ship criteria per week
- Risk management and contingencies
- Post-launch iteration plan

**Use this when:**
- Planning weekly work
- Estimating timelines
- Identifying blockers
- Tracking progress toward launch

---

## Quick Start Guide

### For Product Work

1. **Starting a new feature?**
   - Check [PRD.md](PRD.md) → Is it P0/P1/P2?
   - Review [USER_FLOWS.md](USER_FLOWS.md) → How does it fit in user journey?
   - Add tasks to [WEEKLY_SHIP_PLAN.md](WEEKLY_SHIP_PLAN.md)

2. **Running an experiment?**
   - Check [ANALYTICS.md](ANALYTICS.md) → ICE score framework
   - Define metric, hypothesis, success rule
   - Add events to tracking plan

3. **Reviewing progress?**
   - Check [WEEKLY_SHIP_PLAN.md](WEEKLY_SHIP_PLAN.md) → Are we on track?
   - Review metrics in [ANALYTICS.md](ANALYTICS.md) → Dashboard
   - Update [PRD.md](PRD.md) if scope changes

### For Development Work

1. **Building a page?**
   - Reference wireframes in [USER_FLOWS.md](USER_FLOWS.md)
   - Follow component patterns from existing pages
   - Add analytics events from [ANALYTICS.md](ANALYTICS.md)

2. **Stuck on priorities?**
   - Check [PRD.md](PRD.md) → P0 features first
   - Check [WEEKLY_SHIP_PLAN.md](WEEKLY_SHIP_PLAN.md) → Current week tasks

3. **Deploying to production?**
   - Verify ship criteria in [WEEKLY_SHIP_PLAN.md](WEEKLY_SHIP_PLAN.md)
   - Confirm analytics events fire in [ANALYTICS.md](ANALYTICS.md)

---

## Document Maintenance

### When to Update

| Document | Update Frequency | Trigger |
|----------|------------------|---------|
| PRD.md | Monthly or when scope changes | Major feature adds/cuts |
| USER_FLOWS.md | When UX changes | New pages, flow redesigns |
| ANALYTICS.md | Weekly (new events) | New features, experiments |
| WEEKLY_SHIP_PLAN.md | Weekly (retro) | End of sprint |

### Version Control

- All docs are **version-controlled in Git**
- Use PRs for major changes (scope updates, flow redesigns)
- Add changelog at top of doc when updating
- Tag versions: `v1.0.0` (launch), `v1.1.0` (post-launch iteration)

---

## Key Decisions Made

### Product Strategy

1. **Freemium model** - Free regex ranking, paid AI evaluation
2. **Two-stage evaluation** - Resume screening (Stage 1) + Post-interview (Stage 2)
3. **Web-first, iOS later** - Web MVP by Week 6, iOS by Month 3
4. **Cost-optimized AI** - Claude Haiku ($0.003/eval) as default

### Metrics Focus

1. **OMTM (One Metric That Matters):** 60% activation rate (signup → first AI eval)
2. **North Star:** Weekly Active Evaluators (users who evaluate ≥1 candidate/week)
3. **Revenue:** $2,500 MRR by Month 3

### Launch Criteria

1. **Ship by:** December 13, 2025 (6 weeks from Nov 4)
2. **Platform:** ProductHunt launch
3. **Quality bar:** Zero P0 bugs, <5 P1 bugs, 80% test coverage on eval logic

---

## Success Metrics (How We'll Know It's Working)

### Week 1 Milestone
- ✅ Authentication works (signup, login, logout)
- ✅ Supabase cloud deployed with RLS policies

### Week 6 Milestone (Launch)
- ✅ ProductHunt launch live
- ✅ 100 signups in first week
- ✅ 60% activation rate (OMTM)
- ✅ 5% landing → signup conversion

### Month 3 Goals (Post-Launch)
- ✅ 300 MAU (Monthly Active Users)
- ✅ $2,500 MRR (Monthly Recurring Revenue)
- ✅ 40% D7 retention
- ✅ 15% free → paid conversion

---

## Related Resources

### Technical Documentation
- [CLAUDE.md](../../CLAUDE.md) - Architecture and tech decisions
- [STATUS.md](../../STATUS.md) - Current work and blockers
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment instructions

### Agent Documentation
- [Product & Growth Lead Agent](../../agents/product-growth-lead-0to1/AGENT.md) - Full agent instructions
- [Agent README](../../agents/product-growth-lead-0to1/README.md) - Quick reference

### External Links
- [Supabase Docs](https://supabase.com/docs) - Database, auth, storage
- [PostHog Docs](https://posthog.com/docs) - Analytics implementation
- [Stripe Docs](https://stripe.com/docs) - Payment integration

---

## Feedback & Iteration

### How to Give Feedback on These Docs

1. **Quick fixes** (typos, broken links): Edit directly and commit
2. **Content suggestions**: Open GitHub issue with label `documentation`
3. **Major scope changes**: Schedule product review meeting

### Review Schedule

- **Weekly:** Review ship plan progress (Friday retro)
- **Bi-weekly:** Review analytics metrics vs targets
- **Monthly:** Review PRD for scope creep or new insights

---

## Questions?

- **Product questions:** Review [PRD.md](PRD.md) first, then ask
- **Technical questions:** Check [CLAUDE.md](../../CLAUDE.md)
- **Current status:** See [STATUS.md](../../STATUS.md)
- **Implementation help:** Use [Product & Growth Lead agent](../../agents/product-growth-lead-0to1/AGENT.md)

---

**This product foundation was created in 1 session using the Product & Growth Lead (0→1) agent. It's a living document set—update as you learn!**

---

**Last Updated:** 2025-11-01
**Next Review:** End of Week 1 (Nov 8, 2025)
