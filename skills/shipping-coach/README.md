# Shipping Coach

Your personal accountability partner for shipping code every session. Helps size tasks, maintain focus, and prevent scope creep.

## What It Does

Shipping Coach is designed to help you:
- **Ship something every session** - No more endless WIP
- **Right-size tasks** - Break down work into 30/60/90 minute chunks
- **Stay focused** - Prevent context switching and scope creep
- **Maintain momentum** - Celebrate wins and keep moving
- **Manage Linear tasks** - Integrated task management

## Core Philosophy

🎯 **Progress over perfection** - Ship something every session
⚡ **Momentum over magnitude** - Small wins compound
🎪 **One task, start to finish** - No context switching
✅ **Clear success criteria** - Know when you're done
⏱️ **30/60/90 minute buckets** - Right-sized work

## When to Use

Use this skill when you:
- Start a coding session and need to pick a task
- Have a large task that feels overwhelming
- Feel stuck or blocked on current work
- Want to capture an idea without losing focus
- Need to ship and mark work as complete

## Quick Start

### Starting a Session

```
start session 60
```

**What happens:**
1. Fetches your Linear tasks (Todo, In Progress)
2. Recommends best task for your time available
3. Marks it In Progress
4. States clear success criteria

### Shipping Work

```
ship check
```

**What happens:**
1. Confirms what you accomplished
2. Marks task as Done in Linear
3. Adds completion comment
4. Celebrates your win 🎉
5. Suggests next task

### Sizing a Task

```
size this task: Build user authentication flow
```

**What happens:**
1. Estimates task size (micro/small/medium/large)
2. If too big (>2pt), breaks it into smaller pieces
3. Provides specific breakdown with clear deliverables
4. Optionally creates subtasks in Linear

### When You're Stuck

```
I'm stuck
```

**What happens:**
1. Diagnoses the blocker
2. Provides 3 options: reduce scope, get help, or switch tasks
3. Updates Linear with current status
4. Helps you choose path forward

### Quick Adding Ideas

```
quick add: refactor database connection pool
```

**What happens:**
1. Creates new Linear issue
2. Confirms creation
3. Returns you to current work (no context switching!)

## Task Sizing Guide

| Size | Points | Time | Description | Example |
|------|--------|------|-------------|---------|
| **MICRO** | 0.25pt | 15-20min | Single file, no complexity | "Fix button color" |
| **SMALL** | 0.5pt | 30-40min | Basic component/feature | "Create loading spinner" |
| **MEDIUM** | 1pt | 50-70min | Feature with logic & state | "Add profile edit form" |
| **LARGE** | 2pt | 90-120min | Complex feature (max size) | "Build registration flow" |
| **TOO BIG** | 3+pt | - | **MUST BREAK DOWN** | ⚠️ Epic, not a task |

**Rule**: If estimated >2pt, decompose into shippable pieces.

## Linear CLI Integration

This skill integrates with Linear CLI (`lc` / `linearctl`) for task management:

```bash
# View your tasks
lc issue mine --state "Todo,In Progress"

# Get task details
lc issue get TEAM-123

# Update task status
lc issue update TEAM-123 --state "In Progress"
lc issue update TEAM-123 --state "Done"

# Create new task
lc issue create --title "Task Title" --team TEAM

# Add comment
lc comment add TEAM-123 --body "Progress update"
```

**Setup Required:**
- Install Linear CLI: [linearctl](https://github.com/LinearHQ/linear-cli)
- Authenticate: `lc auth login`
- Configure your team code

## Anti-Patterns Prevented

The Shipping Coach watches for and prevents:

| Anti-Pattern | Intervention |
|--------------|--------------|
| Starting tasks too large | "Break it down or pick smaller task" |
| Context switching | "Finish what you started first" |
| Scope creep mid-task | "Quick-add that idea, ship current task first" |
| Perfectionism blocking ship | "Good enough to ship? Then ship it." |
| "Just one more feature" | "Ship what you have. That can be next task." |
| Unclear success criteria | "How will you know you're done?" |

## Example Session

**Start (60 min available):**
```
You: start session 60

Coach:
Found 5 tasks in your backlog. For 60 min, I recommend:

🎯 TEAM-42 "Add loading states to registration form" (0.5pt - 30min)
   - Quick win, clear scope, high impact
   - Success: Loading spinner shows during form submit

Want to tackle this? I'll mark it In Progress.
```

**Working:**
```
You: I want to add error animations too

Coach:
Good idea! Let's quick-add that for later:
- Created TEAM-48: "Add error animations to forms"

Stay focused on TEAM-42 (loading states). Ship it, then tackle animations.
```

**Shipping:**
```
You: ship check

Coach:
✅ Loading states added successfully!
- Spinner shows on submit
- Button disabled during processing
- Error states handled

Marking TEAM-42 as Done. Great work! 🎉

You have 25 min left. Want to start TEAM-45 (quick CSS fix)?
```

## Voice & Style

The Shipping Coach communicates with:

- **Direct and action-oriented** - No fluff, just next steps
- **Brief** - Responses under 10 lines when possible
- **Encouraging but realistic** - Celebrates wins, acknowledges challenges
- **Focused on shipping** - Everything points toward deliverables
- **Minimal emojis** - ✅ completion, 🎉 wins, 🚢 shipping

## What It Doesn't Do

Shipping Coach is NOT:
- ❌ A velocity tracker or sprint planner
- ❌ A burndown chart generator
- ❌ A project manager replacement
- ❌ An estimation ceremony facilitator

It's laser-focused on one thing: **helping you ship code to customers**.

## Success Metrics

You're succeeding when:
- ✅ You ship something every session
- ✅ Tasks are right-sized for time available
- ✅ Scope creep is caught and prevented
- ✅ Backlog stays organized and actionable
- ✅ You feel momentum and progress

## Tips for Best Results

1. **Be honest about time available** - Don't start 2pt task with 30min left
2. **Trust the sizing** - If coach says it's too big, break it down
3. **Celebrate wins** - Each ship is progress, no matter how small
4. **Use quick-add liberally** - Capture ideas without derailing focus
5. **Ship first, perfect later** - Done > Perfect

## Common Scenarios

### "I Have 30 Minutes Before a Meeting"
```
You: start session 30
Coach: Recommends 0.25-0.5pt tasks (micro/small)
```

### "This Task Is Taking Too Long"
```
You: I'm stuck
Coach: Diagnoses and offers: reduce scope, get help, or switch
```

### "I Want to Add Just One More Thing"
```
You: Let me add [feature]
Coach: "Quick-add it. Ship what you have first."
```

### "I Don't Know What to Work On"
```
You: start session 90
Coach: Analyzes backlog, recommends best task for 90min
```

## Integration with Other Skills

Works well with:
- **Code reviewers** - Ship, then request review
- **Test generators** - Ship with tests
- **Documentation writers** - Ship with docs

## Requirements

- **Linear CLI** (`lc` / `linearctl`) - For task management
- **Linear account** - With configured team
- Tools: Bash, Read, Grep, Glob (provided by default)

## Version History

- **1.0.0** (2025-10-31) - Initial skill creation with Linear integration, task sizing, and shipping discipline

## Related Skills

- [skill-creator](../skill-creator/) - For creating new skills
- [sop-writer](../sop-writer/) - For documenting workflows

## Notes

- Designed for individual developers, not teams
- Focuses on personal shipping discipline
- Integrates with Linear but principles apply to any task tracker
- Works best when used at start and end of every coding session
