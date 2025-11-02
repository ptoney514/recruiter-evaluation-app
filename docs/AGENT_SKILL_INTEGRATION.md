# Agent & Skill Integration Guide

**Version:** 1.0 | **Date:** 2025-11-01

---

## Overview

This project uses **two complementary tools** to help you ship Resume Scanner Pro MVP:

1. **Product & Growth Lead (0→1) Agent** - Strategic planning and product direction
2. **Shipping Coach Skill** - Tactical execution and daily shipping discipline

Together, they form a complete system: **Strategy → Execution → Shipping**

---

## How They Work Together

### Product & Growth Lead Agent (Strategy)

**Purpose:** Create the product foundation and roadmap

**Creates:**
- PRD (what to build and why)
- User flows & wireframes (how it should work)
- Analytics plan (what to measure)
- Weekly ship plan (6-week MVP roadmap)

**Use when:**
- Planning new features
- Making prioritization decisions
- Creating visual specifications
- Defining success metrics
- Breaking projects into weekly milestones

**Location:** [agents/product-growth-lead-0to1/](../agents/product-growth-lead-0to1/)

**Key Output:** [Weekly Ship Plan](product/WEEKLY_SHIP_PLAN.md) with weekly tasks

---

### Shipping Coach Skill (Execution)

**Purpose:** Ship code every session by staying focused and right-sizing tasks

**Provides:**
- Task sizing (micro/small/medium/large)
- Session planning (30/60/90 min buckets)
- Scope creep prevention
- Linear task management integration
- Shipping accountability

**Use when:**
- Starting a coding session
- Breaking down weekly tasks into daily/hourly work
- Feeling stuck or blocked
- Capturing ideas without losing focus
- Marking work as complete

**Location:** [skills/shipping-coach/](../skills/shipping-coach/)

**Key Commands:**
- `start session [minutes]` - Pick and start a task
- `ship check` - Mark task complete and celebrate
- `size this task` - Estimate and break down work
- `quick add [idea]` - Capture without context switching
- `I'm stuck` - Get unblocked

---

## Workflow Example: Week 1 of Ship Plan

### Step 1: Strategic Planning (Product & Growth Lead)

**You have:** [Weekly Ship Plan - Week 1](product/WEEKLY_SHIP_PLAN.md#week-1)

**Week 1 tasks from ship plan:**
- [ ] Migration 004: Add user_id + RLS policies (4 hours)
- [ ] Frontend Supabase client setup (2 hours)
- [ ] Create useAuth hook (3 hours)
- [ ] Build Login page (3 hours)
- [ ] Build Signup page (3 hours)
- [ ] Migrate sessionStorage to Supabase on signup (2 hours)
- [ ] Deploy Supabase to cloud (2 hours)

**Total:** 19 hours (~2.5 days of work)

---

### Step 2: Break Down Into Shippable Tasks (Shipping Coach)

Now use Shipping Coach to break weekly tasks into **daily shippable pieces**:

```bash
# Monday morning - 90 minute session
You: start session 90

Shipping Coach:
Found 7 tasks in your backlog. For 90 min, I recommend:

🎯 "Migration 004: Add user_id to jobs table" (1pt - 60min)
   - Add column, update queries, test locally
   - Success: Jobs table has user_id, queries updated

Want to tackle this? I'll mark it In Progress.
```

**Result:** Weekly task broken into **micro/small/medium tasks** that fit your available time.

---

### Step 3: Size Each Task (Shipping Coach)

Use Shipping Coach to estimate all Week 1 tasks:

```bash
You: size this task: Migration 004 - Add user_id + RLS policies

Shipping Coach:
⚠️ LARGE (2pt - 120min total) - Let's break it down:

1. MEDIUM: Add user_id columns to tables (1pt - 60min)
   - Update jobs, candidates, evaluations, candidate_rankings tables
   - Test locally in Supabase Studio
   - Success: All tables have user_id column

2. SMALL: Create RLS policies for jobs table (0.5pt - 30min)
   - Users can only read/write their own jobs
   - Test with different user contexts
   - Success: RLS blocks cross-user access

3. SMALL: Create RLS policies for candidates + evaluations (0.5pt - 30min)
   - Same pattern as jobs table
   - Test end-to-end flow
   - Success: Full RLS protection

Want me to create these as subtasks in Linear?
```

**Result:** 4-hour task broken into **3 shippable pieces** (60min + 30min + 30min)

---

### Step 4: Execute Daily (Shipping Coach)

**Monday (90 min available):**

```bash
# Start session
start session 90

# Work on task 1: Add user_id columns (60 min)
# ... code, test, commit ...

# Ship it!
ship check

Shipping Coach:
✅ user_id columns added successfully!
- All 4 tables updated
- Queries tested in Supabase Studio
- No errors

Marking "Add user_id columns" as Done. Great work! 🎉

You have 25 min left. Want to start RLS policies for jobs table?
```

**Tuesday (60 min available):**

```bash
# Start session
start session 60

# Work on task 2: RLS policies for jobs (30 min)
# ... write policies, test, commit ...

# Ship it!
ship check

# Work on task 3: RLS policies for candidates (remaining 30 min)
# ... write policies, test, commit ...

ship check
```

**Result:** By Tuesday afternoon, Migration 004 is **DONE** (3 separate ships across 2 days)

---

## Daily Workflow Pattern

### Morning (Start of Day)

**1. Check Weekly Ship Plan** (Product & Growth Lead output)
- What's the goal for this week?
- Which weekly task should I work on next?
- Am I on track to hit ship criteria?

**2. Start Session** (Shipping Coach)
```bash
start session 90  # or 60, or 30 based on availability
```

**3. Pick Task** (Shipping Coach recommends based on time)
- Coach shows tasks that fit your available time
- Marks task as "In Progress" in Linear
- States clear success criteria

---

### During Work (Execution)

**If you have an idea:**
```bash
quick add: Add password strength indicator to signup form
```
- Captures idea in Linear
- **Doesn't break your flow** - returns to current task

**If you're stuck:**
```bash
I'm stuck
```
- Coach diagnoses the blocker
- Offers 3 options: reduce scope, get help, switch tasks
- Helps you choose path forward

---

### End of Session (Shipping)

**Ship Check:**
```bash
ship check
```

**Shipping Coach:**
1. Confirms what you accomplished
2. Marks task as "Done" in Linear
3. Adds completion comment
4. **Celebrates the win** 🎉
5. Suggests next task if time remains

---

## Integration with GitHub Issues

### Setup GitHub CLI

```bash
# Verify GitHub CLI is installed
gh --version

# If not installed:
brew install gh  # macOS

# Authenticate (if not already)
gh auth login
```

### GitHub Issues Workflow

**Weekly tasks from Ship Plan → GitHub issues:**

1. Create GitHub issues from Weekly Ship Plan tasks (one-time setup)
2. Use Shipping Coach to break large tasks into subtasks
3. Shipping Coach manages task state transitions:
   - Start session → Add "in-progress" label
   - Ship check → Close issue
   - I'm stuck → Add blocker comment

**Example GitHub Issues board:**
```
┌─────────────┬──────────────┬──────────┐
│   OPEN      │ IN PROGRESS  │  CLOSED  │
├─────────────┼──────────────┼──────────┤
│ #7          │ #5           │ #1 ✅    │
│ useAuth     │ user_id cols │ Docs     │
│ hook        │ (1pt - 60m)  │          │
│ (1pt)       │              │ #2 ✅    │
│             │              │ RLS jobs │
│ #8          │              │          │
│ Login page  │              │ #3 ✅    │
│ (1pt)       │              │ RLS rest │
│             │              │          │
│ #9          │              │ #4 ✅    │
│ Signup page │              │ Client   │
│ (1pt)       │              │ setup    │
└─────────────┴──────────────┴──────────┘
```

**See detailed workflow:** [GitHub Issues Workflow Guide](GITHUB_ISSUES_WORKFLOW.md)

---

## Task Sizing Reference

**Use this to break down Weekly Ship Plan tasks:**

| Ship Plan Estimate | Shipping Coach Size | Breakdown Strategy |
|--------------------|---------------------|-------------------|
| 2 hours | 2 × MEDIUM (1pt each) | Split into 2 sessions |
| 3 hours | 1 LARGE (2pt) OR 3 MEDIUM (1pt each) | Depends on natural boundaries |
| 4 hours | 2 LARGE (2pt each) OR 4 MEDIUM | Break at logical checkpoints |
| 6 hours | 3 LARGE (2pt each) | Ship 1-2 per day over 2-3 days |

**Golden Rule:** Never start a task >2pt (>90min). Break it down first.

---

## Weekly Review Pattern

**Every Friday afternoon:**

### 1. Review Ship Criteria (Product & Growth Lead)

**Check:** [Weekly Ship Plan](product/WEEKLY_SHIP_PLAN.md#week-1)

**Questions:**
- Did we hit this week's ship criteria? (e.g., "Auth works 100%")
- What % of weekly tasks are complete?
- Any blockers for next week?

### 2. Celebrate Wins (Shipping Coach)

```bash
# Count shipped tasks this week
lc issue mine --state Done --created-this-week

Shipping Coach:
🎉 This week you shipped 12 tasks!
- 4 MEDIUM tasks (4pt total)
- 6 SMALL tasks (3pt total)
- 2 MICRO tasks (0.5pt total)

Total: 7.5pt shipped. Excellent momentum!
```

### 3. Plan Next Week (Both)

**Product & Growth Lead:** What's Week 2 focus?
- Review [Week 2 tasks](product/WEEKLY_SHIP_PLAN.md#week-2)
- Create Linear issues for Week 2
- Set weekly goal

**Shipping Coach:** Break down first 2-3 tasks for Monday
- Size Monday's tasks
- Mark as "Todo" in Linear
- Ready to hit the ground running

---

## Common Scenarios

### Scenario 1: Large Task from Ship Plan

**Ship Plan says:** "React Query setup (2 hours)"

**Use Shipping Coach to break down:**
```bash
size this task: React Query setup

Shipping Coach:
LARGE (2pt - 120min) - Break it down:

1. SMALL: Install @tanstack/react-query (0.25pt - 15min)
   - npm install, update package.json
   - Success: Dependency installed

2. SMALL: Configure QueryClient in App.tsx (0.5pt - 30min)
   - Create QueryClient, add QueryClientProvider
   - Success: Dev tools visible in browser

3. MEDIUM: Create useJobs hook with queries (1pt - 60min)
   - useQuery for fetch, useMutation for CRUD
   - Success: Hook works in JobsPage

Start with #1 (quick win), then tackle #2 and #3.
```

---

### Scenario 2: Scope Creep During Task

**You're building Login page, then think:**
"I should add a 'Forgot Password' link..."

**Shipping Coach intervenes:**
```bash
You: I want to add forgot password flow

Shipping Coach:
Good idea! Let's quick-add that for later:
- Created RSP-15: "Add forgot password flow"

Stay focused on RSP-8 (Login page basic flow). Ship it, then tackle password reset.
```

**Result:** Idea captured, focus maintained, task ships on time.

---

### Scenario 3: Running Out of Time

**You have 30 minutes before a meeting, 60-min task in progress:**

```bash
You: I'm stuck - won't finish this in 30 min

Shipping Coach:
30 min left, task 50% done. Options:

1. REDUCE SCOPE: Ship what's working now
   - Login form works, just needs error handling
   - Ship form, add error handling as next task

2. SWITCH TASKS: Save work, pick smaller task
   - Commit progress, mark "In Progress"
   - Start 0.25pt task (RSP-10: Fix button styling)

3. EXTEND TIME: Finish after meeting
   - Not ideal (context switch), but doable

Recommendation: Option 1 (reduce scope). Ship the form.
```

**Result:** Ship working login form now, error handling later. Momentum maintained.

---

## Anti-Patterns & Interventions

| You Do This | Shipping Coach Says | Result |
|-------------|---------------------|--------|
| Start 4-hour task with 60 min left | "⚠️ Task too big for time available. Pick smaller task or break this down." | Avoid frustration |
| Add feature mid-task | "Quick-add it. Ship what you have first." | Stay focused |
| Perfectionism blocks ship | "Good enough to ship? Then ship it." | Overcome analysis paralysis |
| Work on 3 tasks at once | "Finish RSP-5 first. No context switching." | Maintain flow |
| Unclear when task is done | "How will you know you're done? State success criteria." | Clear goals |

---

## Metrics That Matter

### Product & Growth Lead Metrics (Weekly)
- Week 1 ship criteria met? (Yes/No)
- % of weekly tasks completed (Target: 80%+)
- On track for Dec 13 launch? (Yes/No/At Risk)

### Shipping Coach Metrics (Daily)
- Tasks shipped per session (Target: 1+)
- Average task size (Target: 0.5-1pt)
- Scope creep incidents prevented (Track quick-adds)
- Stuck → Unblocked rate (Track "I'm stuck" usage)

**Combined success:** Ship 1-2 tasks/day, complete 80%+ of weekly plan, launch on time.

---

## Quick Reference

### When to Use Each Tool

| Question | Use This |
|----------|----------|
| What should we build? | Product & Growth Lead → PRD |
| How should it look? | Product & Growth Lead → Wireframes |
| What's this week's goal? | Product & Growth Lead → Ship Plan |
| What should I work on now? | Shipping Coach → `start session` |
| Is this task too big? | Shipping Coach → `size this task` |
| I'm stuck, help! | Shipping Coach → `I'm stuck` |
| Task complete! | Shipping Coach → `ship check` |
| New idea, don't want to forget | Shipping Coach → `quick add [idea]` |

### File Locations

- **Product docs:** [docs/product/](product/)
  - PRD, wireframes, analytics, ship plan
- **Product & Growth Lead agent:** [agents/product-growth-lead-0to1/](../agents/product-growth-lead-0to1/)
- **Shipping Coach skill:** [skills/shipping-coach/](../skills/shipping-coach/)

---

## Installation & Setup

### 1. Product & Growth Lead Agent

**Already installed!** Agent is in [agents/product-growth-lead-0to1/](../agents/product-growth-lead-0to1/)

**Usage:**
```bash
# In Claude Code, reference the agent when planning:
"Use the Product & Growth Lead agent to create a PRD for [feature]"
```

### 2. Shipping Coach Skill

**Already installed!** Skill is in [skills/shipping-coach/](../skills/shipping-coach/)

**Usage:**
```bash
# In Claude Code, invoke skill commands:
"start session 60"
"ship check"
"size this task: [description]"
```

### 3. GitHub CLI (Required for Shipping Coach)

```bash
# Install (if not already)
brew install gh  # macOS

# Authenticate
gh auth login

# Test
gh issue list
```

**See full workflow:** [GitHub Issues Workflow Guide](GITHUB_ISSUES_WORKFLOW.md)

---

## FAQ

### Q: Do I need to use both tools?

**A:** No, but they're designed to work together:
- **Product & Growth Lead alone:** Great for planning, but you'll manually execute
- **Shipping Coach alone:** Great for execution, but lacks strategic direction
- **Both together:** Plan strategically, execute tactically, ship consistently

### Q: Can I use Shipping Coach without GitHub Issues?

**A:** Partially. You can use task sizing and anti-pattern prevention, but task management commands (`start session`, `ship check`) work best with GitHub Issues integration via `gh` CLI.

### Q: How often should I use Product & Growth Lead?

**A:** Weekly or when making product decisions:
- Weekly: Review ship plan progress
- As needed: Plan new features, update PRD, create wireframes
- Post-launch: Run growth experiments, analyze metrics

### Q: How often should I use Shipping Coach?

**A:** Every coding session:
- Start: `start session [time]`
- During: `quick add [ideas]`, `I'm stuck` when blocked
- End: `ship check`

### Q: What if a weekly task is blocked?

**A:** Use Shipping Coach's "I'm stuck" command:
1. Diagnoses blocker (scope, technical, unclear requirements)
2. Provides 3 options (reduce scope, get help, switch tasks)
3. Updates Linear with blocker note
4. Helps you pick another task to maintain momentum

### Q: Can I change the Weekly Ship Plan?

**A:** Yes! The ship plan is a living document:
- Update estimates as you learn
- Move tasks between weeks if priorities shift
- Add new tasks if scope increases
- Remove tasks if cutting scope
- Track changes in git commits

**Golden Rule:** Keep 6-week timeline fixed (Dec 13 launch). Adjust scope, not deadline.

---

## Success Story Example

**Monday, Nov 4 (Week 1 Day 1):**

```bash
# Morning - 90 min session
start session 90

Coach: 🎯 RSP-5 "Add user_id columns to tables" (1pt - 60min)
# Work, test, commit
ship check
Coach: ✅ Shipped! You have 25 min left.

Coach: 🎯 RSP-6 "RLS policies for jobs table" (0.5pt - 30min)
# Work, test, commit
ship check
Coach: ✅ Shipped! 2 tasks done. Great start! 🎉
```

**Tuesday, Nov 5 (Week 1 Day 2):**

```bash
# Morning - 60 min session
start session 60

Coach: 🎯 RSP-7 "Frontend Supabase client setup" (1pt - 60min)
# Work, test, commit
ship check
Coach: ✅ Shipped! 3 tasks done this week.
```

**By Friday, Nov 8 (Week 1 End):**

- ✅ 7 tasks shipped
- ✅ Week 1 ship criteria met: "Auth works 100%"
- ✅ On track for Week 2
- 🎉 Celebrated wins, maintained momentum

**Result:** Shipped something every day, hit weekly goal, stayed on track for Dec 13 launch.

---

## Next Steps

1. **Set up GitHub CLI** (if not already done)
   ```bash
   gh --version  # Check if installed
   gh auth login  # Authenticate
   ```

2. **Create GitHub issues from Week 1 Ship Plan**
   - Follow the [GitHub Issues Workflow Guide](GITHUB_ISSUES_WORKFLOW.md)
   - Create labels first: `gh label create ...`
   - Create Week 1 issues: `gh issue create ...`
   - Assign to yourself: `gh issue edit [NUMBER] --add-assignee @me`

3. **Start your first session**
   ```bash
   start session 90
   ```

4. **Ship something today!**
   ```bash
   ship check
   ```

---

**You now have a complete system: Strategic planning (Product & Growth Lead) → Tactical execution (Shipping Coach) → Consistent shipping. Let's build Resume Scanner Pro!** 🚢

---

**Last Updated:** 2025-11-01
**Maintained by:** Product & Growth Lead + Shipping Coach
