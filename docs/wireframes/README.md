# Wireframes - Dashboard & Project Detail

## How to View

Open these HTML files in your browser:

1. **[dashboard.html](./dashboard.html)** - Projects list view
2. **[project-detail.html](./project-detail.html)** - Individual project view with tabs

**Interactive Features:**
- Click any project card on the Dashboard to go to Project Detail
- Click "Back to Dashboard" to return
- Switch between tabs (Overview, Candidates, Results, Settings)

---

## What's New (vs. Current Clunky UI)

### Old UX Problems ❌

**Current Flow:**
1. Land on homepage → Upload resumes immediately
2. No way to see past evaluations
3. No project organization
4. Can't manage multiple jobs
5. Results disappear after session ends
6. No clear navigation between jobs

### New UX Solution ✅

**Improved Flow:**
1. **Dashboard** - See all recruiting projects at a glance
2. **Project-based organization** - Each job is a project with its own candidates
3. **Persistent data** - All data saved to Supabase, accessible anytime
4. **Clear navigation** - Breadcrumbs, back buttons, sidebar always visible
5. **Progressive disclosure** - Tabs organize complex information
6. **Batch operations** - Upload resumes to existing projects anytime

---

## Key Design Decisions

### 1. Dashboard (Projects List)

**Goal:** Give recruiters a high-level view of all active recruiting efforts

**Features:**
- **Card-based layout** - Easy to scan, visual hierarchy
- **Progress indicators** - See evaluation completion at a glance (65% circle)
- **Quick stats** - Candidates, evaluated, interview-ready (no need to drill down)
- **Status badges** - Active vs Draft projects clearly marked
- **Quick actions** - "View" and "Upload Resumes" right on the card
- **Search bar** - Find projects quickly when managing many jobs

**Why it works:**
- Reduces cognitive load - all info visible without clicking
- Fast context switching between projects
- Clear call-to-action ("Create New Project")

### 2. Project Detail (Tabbed Interface)

**Goal:** Everything about one recruiting project in one place

**Features:**
- **Sticky sidebar** - Project stats always visible, no scrolling
- **Tab navigation** - Organize related info without overwhelming
  - **Overview** - Job description and requirements
  - **Candidates** - All uploaded resumes with evaluation status
  - **Results** - Ranked evaluation results with filters
  - **Settings** - Edit, archive, or delete project
- **Breadcrumb navigation** - Always know where you are
- **Back button** - Return to Dashboard prominently placed

**Why it works:**
- Single source of truth for each project
- Tabs reduce visual clutter
- Sidebar provides context without taking main focus
- Clear escape routes (back button, breadcrumb)

### 3. Candidates Tab

**Goal:** Manage all resumes for this project

**Features:**
- **Table view** - Easy to scan many candidates
- **Evaluation status** - Color-coded badges (Complete, Not Evaluated, Evaluating...)
- **Bulk actions** - Select multiple, evaluate or export all at once
- **Inline actions** - View resume, evaluate, or delete per row

**Why it works:**
- Power user features (bulk select, filters)
- Clear status visibility
- Fast individual actions

### 4. Results Tab

**Goal:** See evaluated candidates ranked by score

**Features:**
- **Ranked list** - #1, #2, #3 with scores
- **Color-coded scores** - Green (85+), Yellow (70-84), Red (<70)
- **Recommendation badges** - Interview, Phone Screen, Decline
- **Filters** - Show only interview candidates, for example
- **Export button** - Generate PDF report

**Why it works:**
- Immediate visual hierarchy (who's best?)
- Filters help focus on actionable candidates
- Export supports downstream hiring workflows

---

## Navigation Flow

```
Landing Page
    ↓
Signup/Login
    ↓
Dashboard (Projects List)
    ↓
[Create New Project] OR [Select Existing Project]
    ↓
Project Detail (Tabs: Overview | Candidates | Results | Settings)
    ↓ (from Overview tab)
[Upload Resumes] → Parse → [Evaluate Candidates]
    ↓
Results Tab (Ranked list with scores)
    ↓
[Export PDF] OR [View Individual Evaluation] OR [Add More Resumes]
    ↓
Back to Dashboard (manage next project)
```

---

## Interaction Patterns

### Pattern 1: New User Onboarding
1. Signup → Dashboard (empty state)
2. "Create Your First Project" CTA
3. Fill job details → Save
4. "Upload Resumes" CTA
5. Drag & drop PDFs → Parse
6. "Evaluate Candidates" button
7. View results in Results tab

### Pattern 2: Power User (Multiple Projects)
1. Login → Dashboard (sees 10 projects)
2. Search "Software Engineer"
3. Click project card
4. Switch to Candidates tab
5. "Upload Resumes" (add 15 more to existing project)
6. Bulk select all → "Bulk Evaluate"
7. Switch to Results tab
8. Filter "Interview only"
9. Export to PDF
10. Back to Dashboard (next project)

### Pattern 3: Returning User (Check Status)
1. Login → Dashboard
2. Scan progress circles (65%, 100%, 33%)
3. Click project with incomplete evaluations
4. Sidebar shows "8 of 12 evaluated"
5. Switch to Candidates tab
6. See which candidates need evaluation
7. Select all pending → "Bulk Evaluate"
8. Wait for progress (real-time updates)
9. Switch to Results tab
10. Review new rankings

---

## Responsive Behavior

### Desktop (1400px+)
- Sidebar + Main content side-by-side
- Projects grid: 3 columns
- Tables: Full width with all columns

### Tablet (768px - 1399px)
- Sidebar + Main content (narrower sidebar)
- Projects grid: 2 columns
- Tables: Horizontal scroll or condensed columns

### Mobile (<768px)
- Sidebar collapses to hamburger menu
- Projects grid: 1 column (stacked cards)
- Tables: Card-based view (no table)
- Tabs: Horizontal scroll if needed

---

## What's Missing (Intentionally)

These features are NOT in the MVP wireframes but could be added later:

- **Team collaboration** - Share projects with other recruiters
- **Comments/notes** - Add private notes to candidates
- **Email integration** - Send interview invites directly
- **Calendar integration** - Schedule interviews from the app
- **ATS integration** - Sync with Greenhouse, Lever
- **Custom branding** - White-label for agencies
- **AI configuration** - Choose LLM provider per project
- **Candidate portal** - Candidates can update their own info

---

## Technical Implementation Notes

### Components to Build

**Dashboard:**
- `DashboardPage.jsx` - Main container
- `ProjectCard.jsx` - Reusable project card
- `ProgressCircle.jsx` - SVG progress indicator
- `EmptyState.jsx` - First-time user view

**Project Detail:**
- `ProjectDetailPage.jsx` - Main container with sidebar
- `ProjectSidebar.jsx` - Stats and back button
- `TabNavigation.jsx` - Tab switcher
- `OverviewTab.jsx` - Job description and requirements
- `CandidatesTab.jsx` - Table of all resumes
- `ResultsTab.jsx` - Ranked evaluation results
- `SettingsTab.jsx` - Project settings

**Shared:**
- `StatusBadge.jsx` - Reusable badge component
- `ScoreBadge.jsx` - Color-coded score display
- `RecommendationBadge.jsx` - Interview/Phone/Decline badge

### Routing

```
/ → Landing Page (marketing)
/signup → Signup Page
/login → Login Page
/dashboard → Dashboard (protected)
/project/:id → Project Detail (protected)
/project/:id/upload → Resume Upload (protected)
/project/:id/results/:candidateId → Individual evaluation detail (protected)
/settings → User settings (protected)
/billing → Billing & subscription (protected)
```

### State Management

**Zustand stores:**
- `authStore.js` - User authentication state
- `projectsStore.js` - Current projects list (cache)
- `currentProjectStore.js` - Currently viewed project

**React Query:**
- `useProjects()` - Fetch all projects
- `useProject(id)` - Fetch single project with candidates
- `useCandidates(projectId)` - Fetch candidates for project
- `useEvaluations(projectId)` - Fetch evaluation results

---

## Next Steps

1. **Review wireframes with stakeholders** - Get feedback on layout and flow
2. **Create high-fidelity designs in Figma** (optional) - Add real colors, icons, imagery
3. **Start implementation** - Build Dashboard first, then Project Detail
4. **Test with real users** - Watch 3-5 recruiters use the wireframes (clickable prototype)
5. **Iterate based on feedback** - Adjust before building

**Estimated Implementation Time:**
- Dashboard: 2-3 days
- Project Detail (all tabs): 4-5 days
- Navigation & routing: 1 day
- Polish & responsive: 2 days
- **Total: 9-11 days** (assuming full-time work)

---

## Questions for Review

1. **Dashboard layout** - Is the card-based approach intuitive? Or prefer a table/list view?
2. **Sidebar always visible** - Does the persistent sidebar help or distract?
3. **Tab organization** - Are the 4 tabs the right breakdown? Should Results be merged with Candidates?
4. **Empty states** - What should we show when a project has 0 candidates?
5. **Bulk actions** - Do we need bulk evaluate, or is it obvious enough?
6. **Mobile experience** - Should we prioritize mobile or focus on desktop (recruiters use desktops)?

---

**Created:** Nov 9, 2025
**Version:** 1.0
**Status:** Ready for review