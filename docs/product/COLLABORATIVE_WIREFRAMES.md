# Collaborative Resume Assistant - Key Wireframes

**Version:** 2.0 | **Date:** 2025-11-02 | **Focus:** Feedback-First UX

---

## Overview

These wireframes show the core collaborative features that differentiate the repositioned product. **Focus:** Make recruiter feel in control from first screen.

---

## Wireframe 1: Candidate Card with Inline Feedback (CRITICAL)

**Purpose:** Feedback is inline, not hidden in settings. 5-second decision.

```
┌─────────────────────────────────────────────────────────────┐
│ Jane Smith                                  AI Score: 87/100 │
│ 🟢 Recommendation: ADVANCE TO INTERVIEW                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Your Feedback: (This changes the ranking!)                   │
│                                                               │
│ [ 👍 Agree ]  [ 👎 Disagree ]  [ ➡️ Neutral ]               │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Why? (Select all that apply)                          │   │
│ │                                                        │   │
│ │ ☐ Better culture fit than AI thinks                   │   │
│ │ ☐ Missing critical soft skill                         │   │
│ │ ☐ Experience more relevant than score shows           │   │
│ │ ☐ Red flag AI didn't catch                            │   │
│ │ ☐ Experience less relevant than AI scored             │   │
│ │ ☐ Score too high overall                              │   │
│ │                                                        │   │
│ │ Add note (optional):                                   │   │
│ │ ┌──────────────────────────────────────────────────┐  │   │
│ │ │ Led similar projects at smaller company - AI     │  │   │
│ │ │ undervalued this startup experience.             │  │   │
│ │ └──────────────────────────────────────────────────┘  │   │
│ │                                                        │   │
│ │ [ Save Feedback ]                                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ▼ AI Analysis (click to expand)                              │
│   Qualifications: 38/40  Experience: 35/40  Risk: 14/20      │
│   • Strong Python background (7 years)                       │
│   • React expertise in 3 production apps                     │
│   ⚠ No Supabase experience (can learn)                       │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Choices:**
- Sentiment buttons FIRST (👍👎➡️) - binary, easy decision
- Reason codes as checkboxes (faster than typing)
- Optional notes for nuance
- "This changes the ranking!" - sets expectation
- Inline (not modal, not separate page)

---

## Wireframe 2: First-Time Feedback Prompt (CRITICAL)

**Purpose:** Discover collaborative feature in first 30 seconds. Not buried.

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Ranking Complete ✓                    [×] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                                                               │
│         Quick question before you export:                    │
│                                                               │
│         Do these rankings match your gut feel?               │
│                                                               │
│                                                               │
│         [ 👍 Looks Good ]    [ 👎 Not Quite ]               │
│                                                               │
│                                                               │
│   ────────────────────────────────────────────────────       │
│                                                               │
│   Why we ask: Your feedback makes the AI smarter for         │
│   YOUR team's needs. It takes 30 seconds and you'll          │
│   see instant re-ranking.                                    │
│                                                               │
│                                                               │
│                 [ ⚙️ Let Me Review First ]                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**User Flow:**
- **👍 Looks Good** → Skip to export, no friction
- **👎 Not Quite** → Show inline feedback UI on candidate cards
- **⚙️ Let Me Review** → Dismiss modal, user browses results

**After clicking "Not Quite":**

```
┌─────────────────────────────────────────────────────────────┐
│ Thanks! Tell us where the AI got it wrong:                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ (Candidate cards now show inline feedback UI...)            │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Jane Smith - 87 (AI)         👍 👎 ➡️               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ John Doe - 76 (AI)           👍 👎 ➡️  ← Click here  │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ After you mark 2-3 candidates, we'll re-rank in 10 seconds. │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Critical:** This modal appears IMMEDIATELY after first evaluation. Can't miss it.

---

## Wireframe 3: Re-Ranking Confirmation Modal

**Purpose:** Transparent cost, clear value, builds trust.

```
┌───────────────────────────────────────────┐
│  Confirm Re-Ranking                    [×]│
├───────────────────────────────────────────┤
│                                           │
│  You've provided feedback on 3 candidates:│
│                                           │
│  ┌───────────────────────────────────┐   │
│  │ • John Doe (76) - 👎 Too high     │   │
│  │ • Mike Wilson (64) - 👍 Underrated│   │
│  │ • Sarah Lee (59) - 👎 Red flag    │   │
│  └───────────────────────────────────┘   │
│                                           │
│  Re-ranking will:                         │
│  1. Send your feedback to AI              │
│  2. AI re-evaluates with your context     │
│  3. New scores in ~12 seconds             │
│                                           │
│  Cost: $0.006 (3 × $0.002)                │
│  Time: ~12 seconds                        │
│                                           │
│  [Cancel]          [Confirm & Re-rank →]  │
│                                           │
└───────────────────────────────────────────┘
```

**After clicking "Confirm":**

```
┌─────────────────────────────────────────────────────────────┐
│                 Re-ranking in progress...                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ⏳ Evaluating with your feedback                           │
│                                                               │
│   ████████████████░░░░░░░░░░░░░░░░  60% (2 of 3 complete)   │
│                                                               │
│   ✓ John Doe - Re-evaluated                                  │
│   ✓ Mike Wilson - Re-evaluated                               │
│   ⏳ Sarah Lee - Processing...                                │
│                                                               │
│   Estimated time remaining: 4 seconds                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key:** Real-time progress, transparent timing, can't take >15 seconds.

---

## Wireframe 4: Comparison View Toggle (CRITICAL)

**Purpose:** Show impact of feedback visually. Aha moment.

```
┌─────────────────────────────────────────────────────────────┐
│ Re-ranking Complete! 🎉                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ View: [● AI Ranking] [ My Ranking ] [ Blended (50/50) ]     │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rank│ Candidate    │ AI Score│ My Score│ Movement      │ │
│ ├─────┼──────────────┼─────────┼─────────┼───────────────┤ │
│ │  1  │ Jane Smith   │   87    │   87    │ Same ✓        │ │
│ │  2  │ John Doe     │   76    │   68    │ ↓ -8 points   │ │
│ │  3  │ Mike Wilson  │   64    │   72    │ ↑ +8 points   │ │
│ │  4  │ Sarah Lee    │   59    │   59    │ Same          │ │
│ └─────┴──────────────┴─────────┴─────────┴───────────────┘ │
│                                                               │
│ Agreement: 50% (2 of 4 same) | Avg difference: 8 points     │
│                                                               │
│ Changes Summary:                                              │
│ • Mike Wilson moved to shortlist (was 3rd, now 2nd)         │
│ • John Doe moved to phone screen tier                        │
│                                                               │
│ [ Export My Ranking ] [ Create Shortlist ] [ Adjust Again ]  │
└─────────────────────────────────────────────────────────────┘
```

**After toggling to "My Ranking" view:**

```
┌─────────────────────────────────────────────────────────────┐
│ View: [ AI Ranking ] [● My Ranking ] [ Blended (50/50) ]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ MY RANKING (based on your feedback):                         │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rank│ Candidate    │ Score │ Your Feedback              │ │
│ ├─────┼──────────────┼───────┼────────────────────────────┤ │
│ │  1  │ Jane Smith   │  87   │ 👍 Agree                  │ │
│ │  2  │ Mike Wilson  │  72   │ 👍 Underrated - Startup   │ │
│ │  3  │ John Doe     │  68   │ 👎 Too high - Culture fit │ │
│ │  4  │ Sarah Lee    │  59   │ 👎 Red flag - Job hopping │ │
│ └─────┴──────────────┴───────┴────────────────────────────┘ │
│                                                               │
│ [ Create Shortlist from Top 2 ] [ Generate Interview Guides ]│
└─────────────────────────────────────────────────────────────┘
```

**Key Design Choices:**
- Toggle switches view instantly (<500ms, no page reload)
- Movement arrows (↑↓) show rank changes
- Feedback notes visible in "My Ranking" view
- Agreement % gamifies improvement

---

## Wireframe 5: Side-by-Side Shortlist Comparison

**Purpose:** Prove value when human+AI beats either alone.

```
┌─────────────────────────────────────────────────────────────┐
│ Create Shortlist                                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Your feedback changed the shortlist:                         │
│                                                               │
│ ┌──────────────────────────────┬──────────────────────────┐ │
│ │ AI Would Interview:          │ You Selected:            │ │
│ ├──────────────────────────────┼──────────────────────────┤ │
│ │ 1. Jane Smith (87) ✓         │ 1. Jane Smith (87) ✓     │ │
│ │ 2. John Doe (76)             │ 2. Mike Wilson (72) NEW  │ │
│ │ 3. Mike Wilson (64)          │ 3. John Doe (68)         │ │
│ └──────────────────────────────┴──────────────────────────┘ │
│                                                               │
│ 💡 Your feedback moved Mike Wilson into shortlist!          │
│    AI would have missed him.                                 │
│                                                               │
│ [ Confirm Shortlist ] [ Adjust Again ]                       │
└─────────────────────────────────────────────────────────────┘
```

**Aha Moment:** Recruiter sees AI would have missed someone they want to interview.

---

## Wireframe 6: Export PDF with Feedback Context

**Purpose:** Audit trail. Shows hiring manager "human+AI collaboration."

```
┌─────────────────────────────────────────────────────────────┐
│ Export Results                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Choose export format:                                        │
│                                                               │
│ ● PDF Report with Feedback Notes (Recommended)              │
│ ○ Excel Spreadsheet                                          │
│ ○ CSV (Data Only)                                            │
│                                                               │
│ Include in PDF:                                               │
│ ☑ AI scores + My scores (side-by-side)                      │
│ ☑ Feedback notes for each candidate                          │
│ ☑ Movement indicators (who moved up/down)                    │
│ ☑ Interview guides for shortlist                             │
│ ☐ Full resume text                                           │
│                                                               │
│ [ Cancel ]                           [ Export PDF →]         │
└─────────────────────────────────────────────────────────────┘
```

**PDF Preview (First Page):**

```
────────────────────────────────────────────────────────────────
Senior Software Engineer - Candidate Evaluation Report

Evaluated by: Sarah Johnson (Senior Recruiter)
Date: November 2, 2025
Method: AI + Human Feedback (Collaborative)

────────────────────────────────────────────────────────────────

SHORTLIST (TOP 3):

1. Jane Smith - Final Score: 87/100
   AI Score: 87 | Recruiter: 👍 Agree
   Recommendation: ADVANCE TO INTERVIEW
   Feedback: "Strong technical fit, culture alignment verified"

2. Mike Wilson - Final Score: 72/100 ↑
   AI Score: 64 | Recruiter: 👍 Underrated (+8 points)
   Recommendation: ADVANCE TO INTERVIEW (moved from DECLINE)
   Feedback: "Startup experience more valuable than AI scored.
   Led similar team at smaller company with higher impact."

3. John Doe - Final Score: 68/100 ↓
   AI Score: 76 | Recruiter: 👎 Too high (-8 points)
   Recommendation: PHONE SCREEN FIRST
   Feedback: "Culture fit concern - missing collaborative skills
   we need on small team. Technical skills strong, but soft
   skills gap identified."

────────────────────────────────────────────────────────────────

METHODOLOGY:
This ranking combines AI evaluation (qualifications, experience,
risk flags) with recruiter expertise. Recruiter feedback on 3
candidates led to re-ranking, resulting in 1 candidate moving
into shortlist that AI would have declined.

────────────────────────────────────────────────────────────────
```

**Key:** PDF clearly shows:
1. AI vs. Human scores
2. Feedback notes
3. Movement indicators (↑↓)
4. Methodology section (builds credibility with hiring manager)

---

## Wireframe 7: Feedback Analytics Dashboard (P1)

**Purpose:** Prove value over time. Gamification.

```
┌─────────────────────────────────────────────────────────────┐
│ Feedback Analytics                           Last 30 Days    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ Feedback Given  │ │ Re-rankings     │ │ Agreement %     ││
│ │                 │ │                 │ │                 ││
│ │      12         │ │       3         │ │   75% → 85%     ││
│ │   candidates    │ │     jobs        │ │   ↑ Improving!  ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                               │
│ Top Reason Codes:                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Culture fit (6x)              ████████████░░░░░░░░ │ │
│ │ 2. Soft skills gap (4x)          ████████░░░░░░░░░░░ │ │
│ │ 3. Experience underrated (2x)    ████░░░░░░░░░░░░░░░ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Candidates Moved:                                            │
│ • 4 moved UP (AI underrated)                                 │
│ • 2 moved DOWN (AI overrated)                                │
│ • 6 stayed same (AI accurate)                                │
│                                                               │
│ 💡 Pattern Detected:                                         │
│ You consistently value startup experience more than AI.      │
│ Add "Startup Culture Fit" to your reason library?            │
│                                                               │
│ [ Yes, Add to Library ]  [ No Thanks ]                       │
└─────────────────────────────────────────────────────────────┘
```

**Key Insights:**
- Agreement % trending up = AI learning user preferences
- Top reason codes = patterns in recruiter judgment
- Pattern detection = personalized quick codes

---

## Mobile Adaptations (Simplified)

### Mobile: Feedback Card (Swipe Gesture)

```
┌─────────────────────────────────┐
│ Jane Smith                   87 │
│ 🟢 INTERVIEW                    │
├─────────────────────────────────┤
│                                 │
│   ← Swipe Left    Swipe Right → │
│      👎 Disagree    👍 Agree     │
│                                 │
│   ──────── or ────────          │
│                                 │
│   [ 👍 ] [ 👎 ] [ ➡️ ]          │
│                                 │
│   (After swipe: Quick reason    │
│    popup, save to DB)           │
│                                 │
└─────────────────────────────────┘
```

**Mobile Optimizations:**
- Swipe gestures for quick feedback
- Bottom sheets for modals (native feel)
- Card view instead of table
- Fewer reason codes (3-4 vs 6)

---

## Design Principles

### 1. Feedback is Inline, Not Hidden
❌ Bad: Settings → Preferences → Feedback
✅ Good: Directly on candidate card in results view

### 2. 5-Second Decision
❌ Bad: Long form with 10 fields
✅ Good: Sentiment button + checkbox reason codes

### 3. Transparent Cost & Value
❌ Bad: Hidden re-ranking charge
✅ Good: "3 candidates × $0.002 = $0.006, ~12 seconds"

### 4. Show Movement Visually
❌ Bad: "Score changed from 64 to 72"
✅ Good: "Mike Wilson ↑ +8 points (moved to shortlist!)"

### 5. Comparison, Not Replacement
❌ Bad: "My Ranking" only (hides AI work)
✅ Good: Toggle between AI | My | Blended (shows both)

---

## Color & Typography

### Status Colors (Existing)
- 🟢 Green: ADVANCE TO INTERVIEW (score ≥85)
- 🟡 Amber: PHONE SCREEN FIRST (score 70-84)
- 🔴 Gray: DECLINE (score <70)

### Feedback Colors (New)
- 🔵 Blue: Feedback provided (badge, border)
- 🟢 Green: Moved up (↑ arrow)
- 🔴 Red: Moved down (↓ arrow)

### Typography
- Sentiment buttons: 24px emoji (👍👎➡️)
- Scores: 32px bold (87/100)
- Movement: 14px medium (↑ +8 points)
- Reason codes: 14px regular

---

## Accessibility

### Keyboard Navigation
- Tab through sentiment buttons
- Enter/Space to activate
- Arrow keys to navigate reason codes
- Esc to dismiss modals

### Screen Readers
- "Agree with AI ranking for Jane Smith"
- "Disagree button selected, showing feedback form"
- "Mike Wilson moved up 8 points to rank 2"

### Color Contrast
- WCAG AA compliance (4.5:1 text)
- Don't rely on color alone (use icons + text)
- Example: 🟢 INTERVIEW (icon + text, not just green)

---

## Implementation Priority

### Week 1: Must-Have
1. ✅ Wireframe 1: Feedback Card (inline UI)
2. ✅ Wireframe 2: First-time prompt

### Week 2: Core Loop
3. ✅ Wireframe 3: Re-ranking confirmation
4. ✅ Wireframe 4: Comparison view

### Week 3: Value Proof
5. ✅ Wireframe 5: Shortlist comparison
6. ✅ Wireframe 6: Export with feedback

### Week 4 (P1): Analytics
7. ⏸ Wireframe 7: Analytics dashboard

---

## User Testing Questions

**Test with 2-3 senior recruiters:**

1. **First impression:** Does the feedback prompt appear too early/late/just right?
2. **Friction:** How long does it take to provide feedback on 1 candidate? (Target: <30 seconds)
3. **Value clarity:** Is it clear that feedback changes the ranking?
4. **Comparison view:** Which view do you prefer? (AI | My | Blended)
5. **Aha moment:** When did you realize the tool learns from you?

---

## Next Steps

1. **Review wireframes** - Gather feedback on layout, copy, flow
2. **Prototype Week 1 UI** - Build FeedbackCard in React (basic version)
3. **User test prototype** - 1-2 recruiters walk through flow
4. **Iterate based on feedback** - Adjust before full implementation
5. **Begin Week 1 implementation** - Migrate 004 → FeedbackCard → Save to DB

---

**Document Owner:** Product & Growth Lead
**Last Updated:** 2025-11-02
**Status:** Draft for review
**Related:** [Pivot PRD](COLLABORATIVE_PIVOT_PRD.md), [User Flows](COLLABORATIVE_USER_FLOWS.md)
