# GitHub Issues Workflow for Resume Scanner Pro

**Version:** 1.0 | **Date:** 2025-11-01

---

## Overview

This project uses **GitHub Issues** for task management, integrated with the Shipping Coach skill for daily shipping discipline.

**Benefits:**
- ✅ No additional tools to install (you already use `gh` CLI)
- ✅ Issues live with your code
- ✅ Automatic linking with commits and PRs
- ✅ Project boards for visualization

---

## Quick Start

### 1. Verify GitHub CLI is Installed

```bash
gh --version
# Should show: gh version 2.x.x

# If not installed:
brew install gh
gh auth login
```

### 2. Create Week 1 Issues from Ship Plan

From [WEEKLY_SHIP_PLAN.md - Week 1](product/WEEKLY_SHIP_PLAN.md#week-1):

```bash
# Navigate to project
cd /Users/pernelltoney/Documents/Projects/02-development/recruiter-evaluation-app

# Create issues for Week 1 tasks
gh issue create --title "Migration 004: Add user_id + RLS policies" \
  --body "Add user_id column to all tables and create Row-Level Security policies.

**Tasks:**
- Add user_id to jobs, candidates, evaluations, candidate_rankings
- Create RLS policy: Users can only read/write their own data
- Test RLS with different user contexts

**Acceptance:** RLS blocks cross-user access in local Supabase

**Time:** 4 hours (2 points)
**Week:** 1" \
  --label "P0,week-1,backend"

gh issue create --title "Frontend Supabase client setup" \
  --body "Install and configure Supabase client for frontend.

**Tasks:**
- Install @supabase/supabase-js
- Create frontend/src/lib/supabase.ts client
- Configure environment variables

**Acceptance:** Client can query Supabase from browser

**Time:** 2 hours (1 point)
**Week:** 1" \
  --label "P0,week-1,frontend"

gh issue create --title "Create useAuth hook" \
  --body "Create React hook for authentication state management.

**Tasks:**
- Create frontend/src/hooks/useAuth.ts
- Functions: signUp, login, logout, getCurrentUser
- Zustand store for auth state

**Acceptance:** Hook exposes user state and auth methods

**Time:** 3 hours (1.5 points)
**Week:** 1" \
  --label "P0,week-1,frontend"

gh issue create --title "Build Login page" \
  --body "Create login page with email/password authentication.

**Tasks:**
- Create frontend/src/pages/LoginPage.tsx
- Email + password form
- Error handling (invalid credentials, network errors)
- Redirect to dashboard on success

**Acceptance:** User can login and see dashboard

**Time:** 3 hours (1.5 points)
**Week:** 1" \
  --label "P0,week-1,frontend"

gh issue create --title "Build Signup page" \
  --body "Create signup page with email/password registration.

**Tasks:**
- Create frontend/src/pages/SignupPage.tsx
- Email + password form (min 8 chars)
- Terms checkbox
- Redirect to dashboard on success

**Acceptance:** User can sign up and create account

**Time:** 3 hours (1.5 points)
**Week:** 1" \
  --label "P0,week-1,frontend"

gh issue create --title "Migrate sessionStorage to Supabase on signup" \
  --body "Copy anonymous user data to Supabase when they sign up.

**Tasks:**
- Detect if sessionStorage has jobs/candidates
- Copy to Supabase on first login
- Clear sessionStorage after migration

**Acceptance:** Anonymous user data persists after signup

**Time:** 2 hours (1 point)
**Week:** 1" \
  --label "P0,week-1,frontend"

gh issue create --title "Deploy Supabase to cloud" \
  --body "Set up production Supabase project and run migrations.

**Tasks:**
- Create Supabase cloud project
- Run migrations on cloud DB
- Update frontend env vars for cloud URL

**Acceptance:** Auth works on cloud Supabase

**Time:** 2 hours (1 point)
**Week:** 1" \
  --label "P0,week-1,infra"
```

### 3. View Your Issues

```bash
# List all open issues
gh issue list

# List issues for current week
gh issue list --label "week-1"

# View specific issue
gh issue view 1
```

---

## Shipping Coach Commands (GitHub Issues Version)

### Start Session

**Command:** `start session [minutes]`

**What it does:**
1. Fetches your open issues: `gh issue list --assignee @me --state open`
2. Recommends best task for time available
3. Updates issue to In Progress (via comment)
4. States clear success criteria

**Example:**
```bash
You: start session 90

Shipping Coach:
Found 7 open issues. For 90 min, I recommend:

🎯 #5 "Create useAuth hook" (1.5pt - 90min)
   - Clear scope, high impact
   - Success: Hook exposes user state and auth methods

Want to tackle this? I'll mark it In Progress.

[Runs: gh issue comment 5 --body "🚧 In Progress - Starting work"]
[Runs: gh issue edit 5 --add-label "in-progress"]
```

### Ship Check

**Command:** `ship check`

**What it does:**
1. Confirms what you accomplished
2. Closes the issue: `gh issue close [number] --comment "✅ Shipped: [summary]"`
3. Celebrates the win 🎉
4. Suggests next task

**Example:**
```bash
You: ship check

Shipping Coach:
✅ useAuth hook completed successfully!
- signUp, login, logout functions working
- Zustand store integrated
- getCurrentUser tested

Closing issue #5. Great work! 🎉

[Runs: gh issue close 5 --comment "✅ Shipped: useAuth hook with full auth state management"]

You have 25 min left. Want to start #6 (Login page)?
```

### Size This Task

**Command:** `size this task: [description]` or `size this: #[issue-number]`

**What it does:**
1. If issue number provided, fetches with `gh issue view [number]`
2. Estimates size using sizing reference
3. If >2pt, suggests breakdown into smaller subtasks
4. Asks if you want to create subtask issues

**Example:**
```bash
You: size this: #1

Shipping Coach:
⚠️ LARGE (2pt - 120min total) - Let's break it down:

Subtasks:
1. MEDIUM: Add user_id columns to tables (1pt - 60min)
2. SMALL: Create RLS policies for jobs table (0.5pt - 30min)
3. SMALL: Create RLS policies for other tables (0.5pt - 30min)

Want me to create these as separate issues? They can reference parent #1.

[If yes, creates 3 new issues linked to parent]
```

### Quick Add

**Command:** `quick add: [idea]`

**What it does:**
1. Creates new issue: `gh issue create --title "[title]" --body "[description]"`
2. Confirms creation with issue number
3. Returns to current work (no context switching!)

**Example:**
```bash
You: quick add: Add password strength indicator to signup form

Shipping Coach:
Created issue #15: "Add password strength indicator to signup form"

Returning to current task (#5). Stay focused!
```

### I'm Stuck

**Command:** `I'm stuck`

**What it does:**
1. Diagnoses the blocker
2. Provides 3 options:
   - Reduce scope: What's the MVP version?
   - Get help: Who/what could unblock you?
   - Switch tasks: Is this the wrong task for now?
3. Adds blocker comment to issue
4. Helps choose path forward

**Example:**
```bash
You: I'm stuck

Shipping Coach:
What's blocking you on #5 (useAuth hook)?

Options:
1. REDUCE SCOPE: Ship basic login/logout first, add features later
2. GET HELP: Check Supabase auth docs, ask in Discord
3. SWITCH TASKS: Work on #6 (Login page) while researching

[Adds comment to #5: "🚧 Blocker: [your response]"]

What would you like to do?
```

---

## GitHub CLI Commands Reference

### Issues

```bash
# List issues
gh issue list
gh issue list --label "week-1"
gh issue list --assignee @me --state open
gh issue list --state closed

# View issue
gh issue view 5

# Create issue
gh issue create --title "Title" --body "Description" --label "P0,week-1"

# Edit issue
gh issue edit 5 --add-label "in-progress"
gh issue edit 5 --remove-label "in-progress"
gh issue edit 5 --add-assignee @me

# Comment on issue
gh issue comment 5 --body "Progress update"

# Close issue
gh issue close 5
gh issue close 5 --comment "✅ Shipped"

# Reopen issue
gh issue reopen 5
```

### Projects (Optional)

```bash
# Create project board
gh project create --title "Resume Scanner Pro MVP"

# Add issue to project
gh project item-add [PROJECT_NUMBER] --owner @me --url https://github.com/OWNER/REPO/issues/5
```

---

## Labels for Organization

### Priority Labels
- `P0` - Must have for launch (critical path)
- `P1` - Should have soon (post-MVP week 1-2)
- `P2` - Nice to have (future)

### Week Labels
- `week-1` - Week 1 tasks (Nov 4-8)
- `week-2` - Week 2 tasks (Nov 11-15)
- `week-3` - Week 3 tasks (Nov 18-22)
- `week-4` - Week 4 tasks (Nov 25-29)
- `week-5` - Week 5 tasks (Dec 2-6)
- `week-6` - Week 6 tasks (Dec 9-13)

### Area Labels
- `frontend` - React/UI work
- `backend` - Python API work
- `database` - Supabase/SQL
- `infra` - Deployment/config
- `docs` - Documentation

### Status Labels
- `in-progress` - Currently working on this
- `blocked` - Waiting on something
- `ready` - Ready to start

### Size Labels (Points)
- `size: micro` - 0.25pt (15-20min)
- `size: small` - 0.5pt (30-40min)
- `size: medium` - 1pt (50-70min)
- `size: large` - 2pt (90-120min)

---

## Create Labels Script

```bash
# Run this once to create all labels
cd /Users/pernelltoney/Documents/Projects/02-development/recruiter-evaluation-app

# Priority
gh label create "P0" --description "Must have for launch" --color "d73a4a"
gh label create "P1" --description "Should have soon" --color "fbca04"
gh label create "P2" --description "Nice to have" --color "0e8a16"

# Weeks
gh label create "week-1" --description "Week 1 tasks" --color "1d76db"
gh label create "week-2" --description "Week 2 tasks" --color "1d76db"
gh label create "week-3" --description "Week 3 tasks" --color "1d76db"
gh label create "week-4" --description "Week 4 tasks" --color "1d76db"
gh label create "week-5" --description "Week 5 tasks" --color "1d76db"
gh label create "week-6" --description "Week 6 tasks" --color "1d76db"

# Areas
gh label create "frontend" --description "React/UI work" --color "0052cc"
gh label create "backend" --description "Python API work" --color "5319e7"
gh label create "database" --description "Supabase/SQL" --color "006b75"
gh label create "infra" --description "Deployment/config" --color "bfd4f2"
gh label create "docs" --description "Documentation" --color "d4c5f9"

# Status
gh label create "in-progress" --description "Currently working" --color "fbca04"
gh label create "blocked" --description "Waiting on something" --color "d73a4a"
gh label create "ready" --description "Ready to start" --color "0e8a16"

# Size
gh label create "size: micro" --description "0.25pt (15-20min)" --color "c5def5"
gh label create "size: small" --description "0.5pt (30-40min)" --color "c5def5"
gh label create "size: medium" --description "1pt (50-70min)" --color "c5def5"
gh label create "size: large" --description "2pt (90-120min)" --color "c5def5"
```

---

## Daily Workflow

### Morning Routine

**1. Check today's tasks:**
```bash
gh issue list --label "week-1" --state open
```

**2. Start session:**
```bash
start session 90
```

**3. Shipping Coach picks task and marks In Progress:**
```bash
gh issue comment [NUMBER] --body "🚧 In Progress"
gh issue edit [NUMBER] --add-label "in-progress"
```

### During Work

**Capture ideas without losing focus:**
```bash
quick add: [idea]
```

**If stuck:**
```bash
I'm stuck
# Shipping Coach diagnoses and adds blocker comment
```

### End of Session

**Ship your work:**
```bash
ship check
```

**Shipping Coach closes issue:**
```bash
gh issue close [NUMBER] --comment "✅ Shipped: [summary]"
```

---

## Weekly Review (Every Friday)

### 1. Review Week's Progress

```bash
# See closed issues this week
gh issue list --label "week-1" --state closed

# See remaining open issues
gh issue list --label "week-1" --state open
```

### 2. Check Ship Criteria

From [WEEKLY_SHIP_PLAN.md](product/WEEKLY_SHIP_PLAN.md):
- Week 1: "Auth works 100%" - ✅ or ❌?
- Week 2: "Jobs persist to Supabase" - ✅ or ❌?

### 3. Celebrate & Plan Next Week

```bash
# Close out this week
gh issue list --label "week-1" --state closed | wc -l
# Example: "🎉 7 tasks shipped this week!"

# Create issues for next week
gh issue create --title "[Next week task]" --label "week-2"
```

---

## Integration with Git Commits

### Link Commits to Issues

```bash
# Use issue number in commit messages
git commit -m "feat: Add useAuth hook

Closes #5"

# When pushed, GitHub automatically closes issue #5
```

### Commit Message Patterns

```bash
# Close an issue
"Closes #5"
"Fixes #5"
"Resolves #5"

# Reference without closing
"Related to #5"
"Part of #5"
"See #5"
```

---

## Example Session with GitHub Issues

### Morning: Start Session

```bash
$ start session 90

Shipping Coach:
Fetching open issues...
[Runs: gh issue list --assignee @me --state open --label "week-1"]

Found 5 open issues for Week 1. For 90 min, I recommend:

🎯 #3 "Create useAuth hook" (1.5pt - 90min)
   - Priority: P0
   - Area: frontend
   - Success: Hook exposes user state and auth methods

Want to tackle this? I'll mark it In Progress.

You: yes

Shipping Coach:
[Runs: gh issue edit 3 --add-label "in-progress"]
[Runs: gh issue comment 3 --body "🚧 Starting work - Session: 90min"]

✅ Issue #3 is now In Progress. Get coding!

Success criteria:
- signUp, login, logout, getCurrentUser functions work
- Zustand store manages auth state
- Hook exports all auth methods
```

### During Work: Capture Idea

```bash
$ quick add: Add "Remember me" checkbox to login form

Shipping Coach:
[Runs: gh issue create --title "Add 'Remember me' checkbox to login form"
       --body "Allow users to stay logged in across sessions"
       --label "P1,frontend"]

Created issue #16. Returning to #3 (useAuth hook). Stay focused!
```

### End of Session: Ship It

```bash
$ ship check

Shipping Coach:
What did you accomplish on #3 (useAuth hook)?

You: Implemented all auth functions, integrated Zustand, tested in browser

Shipping Coach:
✅ useAuth hook completed!
- signUp, login, logout, getCurrentUser functions working
- Zustand store integrated
- Tested in browser

[Runs: gh issue close 3 --comment "✅ Shipped: useAuth hook with full auth state management. All acceptance criteria met."]

Great work! 🎉 Issue #3 closed.

You spent 85 min. Session complete!
```

---

## Tips for Success

### 1. Keep Issues Small
- Create subtasks for anything >2pt
- Better to have 3 small issues than 1 large one

### 2. Use Clear Titles
- ✅ Good: "Create useAuth hook"
- ❌ Bad: "Auth stuff"

### 3. Define Acceptance Criteria
Every issue should have:
- **Tasks:** What to do
- **Acceptance:** How you know it's done
- **Time:** Estimated effort

### 4. Link Related Issues
```markdown
Part of #1 (Migration 004)
Depends on #3 (useAuth hook)
Blocked by #5 (Supabase client setup)
```

### 5. Close Issues via Commits
```bash
git commit -m "feat: Add useAuth hook

Closes #3"
```

---

## Comparison: Linear vs GitHub Issues

| Feature | Linear (Original) | GitHub Issues (This Project) |
|---------|-------------------|------------------------------|
| CLI tool | `lc` (linearctl) | `gh` (GitHub CLI) |
| List issues | `lc issue mine` | `gh issue list --assignee @me` |
| Create issue | `lc issue create` | `gh issue create` |
| Update status | `lc issue update --state` | `gh issue edit --add-label` |
| Add comment | `lc comment add` | `gh issue comment` |
| Close issue | `lc issue update --state Done` | `gh issue close` |
| **Advantage** | Built for PM workflows | Lives with your code |

**Conclusion:** GitHub Issues is simpler for solo dev MVP. All the Shipping Coach principles still apply!

---

## Next Steps

1. **Create labels** (run script above)
2. **Create Week 1 issues** (run issue creation commands above)
3. **Start your first session:**
   ```bash
   start session 90
   ```
4. **Ship your first task:**
   ```bash
   ship check
   ```

---

**You now have a complete task management system using GitHub Issues + Shipping Coach. Let's ship code!** 🚢

---

**Last Updated:** 2025-11-01
**Tool:** GitHub Issues + GitHub CLI (`gh`)
