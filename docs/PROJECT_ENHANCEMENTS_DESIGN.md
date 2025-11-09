# Project Enhancements Design Document

## Overview
This document outlines the design and implementation plan for enhanced project management features in Resume Scanner Pro.

**IMPORTANT: Product Positioning**
- Resume Scanner Pro is a **recruiter's power tool**, NOT an ATS
- Works alongside Oracle/Workday/Greenhouse (doesn't replace them)
- Recruiters upload resumes from ANY source (ATS exports, email, LinkedIn, career fairs)
- Focus: Fast, high-quality shortlisting using Lou Adler Performance-Based Hiring

## Goals
1. **Performance Profile Creation** - 8-question Lou Adler methodology
2. **Selective Evaluation** - Upload 50, evaluate 10 (cost control)
3. **Three-Status System** - Not Evaluated, Recommended, Not Recommended
4. **Candidate Packages** - Living documents that evolve with context
5. **Re-evaluation** - Add phone/interview notes, AI re-evaluates

---

## 🎨 Design System

### Colors
- **Primary**: `#3B82F6` (blue-500) - CTAs, active states
- **Success**: `#10B981` (green-500) - Approved candidates
- **Warning**: `#F59E0B` (amber-500) - Needs review
- **Danger**: `#EF4444` (red-500) - Rejected, delete actions
- **Gray Scale**: gray-50 to gray-900 for text and backgrounds

### Typography
- **Headings**: Bold, gray-900
- **Body**: Regular, gray-700
- **Secondary**: gray-600
- **Disabled**: gray-400

---

## 📐 Wireframes

### 1. Enhanced Project Detail Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Projects                                    [Edit] [⋮ Menu]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Senior Software Engineer                            [Status: Open]  │
│  Engineering • San Francisco, CA • Full-time                          │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 25       │ │ 15       │ │ 8        │ │ $120k-   │                │
│  │ Candidates│ │ Evaluated │ │ Interview│ │ $180k    │                │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                │
│                                                                       │
│  ┌─── Project Info ──────────────────┐  ┌─── Quick Actions ────┐    │
│  │                                    │  │ [Upload Resumes]     │    │
│  │ 📅 Created: Nov 9, 2025            │  │ [Add Manual Candidate│    │
│  │ 👤 Owner: you                      │  │ [Start Evaluations]  │    │
│  │ 📝 Last Updated: 2 hours ago       │  │ [Export Report]      │    │
│  │ 🏷️  Tags: urgent, remote-ok         │  └───────────────────┘    │
│  │                                    │                              │
│  └────────────────────────────────────┘                             │
│                                                                       │
│  ┌─── Description & Requirements ───────────────────────────────┐   │
│  │ [Description Tab] [Requirements Tab] [Team Tab]              │   │
│  │                                                               │   │
│  │ We're looking for a senior engineer to...                    │   │
│  │                                                               │   │
│  │ Must Have:                     Preferred:                     │   │
│  │ • 5+ years React                • GraphQL experience          │   │
│  │ • TypeScript                    • AWS knowledge               │   │
│  │ • Node.js backend               • Team lead experience        │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─── Candidates (25) ────────────────────────────────────────────┐ │
│  │ [Search...] [Filter: All ▼] [Sort: Score ▼] [Bulk Actions ▼]  │ │
│  │                                                                  │ │
│  │ ┌────────────────────────────────────────────────────────────┐ │ │
│  │ │ 💚 John Doe                                   Score: 92/100 │ │ │
│  │ │    Software Engineer @ Google • 7 years exp                │ │ │
│  │ │    Skills: React, TypeScript, Node.js, AWS                 │ │ │
│  │ │    [View Resume] [View Evaluation] [Schedule Interview]    │ │ │
│  │ └────────────────────────────────────────────────────────────┘ │ │
│  │                                                                  │ │
│  │ ┌────────────────────────────────────────────────────────────┐ │ │
│  │ │ 💛 Jane Smith                                 Score: 85/100 │ │ │
│  │ │    Senior Developer @ Meta • 5 years exp                   │ │ │
│  │ │    Skills: React, Vue, TypeScript, Python                  │ │ │
│  │ │    [View Resume] [View Evaluation] [Schedule Interview]    │ │ │
│  │ └────────────────────────────────────────────────────────────┘ │ │
│  │                                                                  │ │
│  │ [Load More...]                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Edit Project Modal

```
┌────────────────────────────────────────────────────────┐
│ Edit Project                                      [×]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Job Title *                                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Senior Software Engineer                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Department *              Location                   │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │ Engineering         │  │ San Francisco, CA      │ │
│  └─────────────────────┘  └────────────────────────┘ │
│                                                        │
│  Employment Type           Status                     │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │ Full-time ▼         │  │ Open ▼                 │ │
│  └─────────────────────┘  └────────────────────────┘ │
│                                                        │
│  Compensation Range                                   │
│  ┌─────────────┐  to  ┌─────────────┐               │
│  │ 120000      │      │ 180000      │               │
│  └─────────────┘      └─────────────┘               │
│                                                        │
│  Tags (comma separated)                               │
│  ┌──────────────────────────────────────────────────┐ │
│  │ urgent, remote-ok, senior                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Job Description                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │ We're looking for...                             │ │
│  │                                                  │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────┐  ┌──────────────┐                    │
│  │ Cancel     │  │ Save Changes │                    │
│  └────────────┘  └──────────────┘                    │
└────────────────────────────────────────────────────────┘
```

### 3. Project Menu (⋮) - Dropdown Actions

```
┌────────────────────────┐
│ 📝 Edit Project        │
│ 📋 Duplicate Project   │
│ 📁 Archive Project     │
│ 📊 Export Report       │
│ ────────────────────   │
│ 🗑️  Delete Project      │
└────────────────────────┘
```

### 4. Upload Resumes Modal

```
┌────────────────────────────────────────────────────────┐
│ Upload Resumes                                    [×]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Drag and drop resumes here or click to browse        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │            📄  Click or Drag Files               │ │
│  │                                                  │ │
│  │         Supports PDF, DOCX, TXT (max 10MB)      │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Uploaded Files (3):                                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ✓ john_doe_resume.pdf              2.1 MB  [×]  │ │
│  │ ✓ jane_smith_resume.pdf            1.8 MB  [×]  │ │
│  │ ⚠ invalid_file.txt                 5 KB    [×]  │ │
│  │   Error: Unable to parse resume                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ☐ Auto-evaluate after upload                         │
│  ☐ Send email notifications to candidates             │
│                                                        │
│  ┌────────────┐  ┌──────────────┐                    │
│  │ Cancel     │  │ Upload (2)   │                    │
│  └────────────┘  └──────────────┘                    │
└────────────────────────────────────────────────────────┘
```

### 5. Candidate Detail View

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Project                                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  John Doe                                      [Schedule Interview]  │
│  Software Engineer @ Google                            [⋮ Menu]       │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ 92/100   │ │ 7 years  │ │ Google   │ │ Matched  │                │
│  │ Score    │ │ Exp      │ │ Company  │ │ 8/10     │                │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                │
│                                                                       │
│  ┌─── AI Evaluation ─────────────────────────────────────────────┐  │
│  │ Recommendation: STRONG HIRE                                    │  │
│  │                                                                 │  │
│  │ Key Strengths:                                                  │  │
│  │ • 7+ years of React and TypeScript experience                  │  │
│  │ • Led team of 5 engineers at Google                            │  │
│  │ • Strong system design skills                                  │  │
│  │                                                                 │  │
│  │ Concerns:                                                       │  │
│  │ • Limited AWS experience                                        │  │
│  │ • Salary expectation may be high                               │  │
│  │                                                                 │  │
│  │ Requirements Match: 8/10 must-have, 6/8 preferred              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── Contact Info ──────────┐  ┌─── Resume ────────────────────┐  │
│  │ 📧 john@email.com          │  │ [View Full Resume]           │  │
│  │ 📱 (555) 123-4567          │  │ [Download PDF]               │  │
│  │ 🔗 linkedin.com/in/johndoe │  │                              │  │
│  │ 🌐 johndoe.dev             │  │ Extracted Text:              │  │
│  └────────────────────────────┘  │ Senior Software Engineer...  │  │
│                                   │                              │  │
│  ┌─── Notes & Comments ───────┐  │                              │  │
│  │ [Add note...]              │  │                              │  │
│  │                             │  │                              │  │
│  │ You: Great candidate!       │  │                              │  │
│  │ 2 hours ago                 │  │                              │  │
│  └─────────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Feature Specifications

### 1. Enhanced Project Metadata

**New Fields:**
- `tags` (JSONB array) - Categorization tags (e.g., "urgent", "remote", "senior")
- `owner_id` (UUID) - Project owner (default: creator)
- `collaborators` (JSONB array) - Team members with access
- `archived` (boolean) - Soft delete/archive flag
- `archived_at` (timestamp) - When project was archived
- `due_date` (date) - Target hire date
- `hiring_manager` (text) - Hiring manager name
- `team_size` (int) - Expected team size
- `work_location` (enum) - Remote/Hybrid/On-site

**Database Migration:**
```sql
ALTER TABLE jobs ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN due_date DATE;
ALTER TABLE jobs ADD COLUMN hiring_manager VARCHAR(255);
ALTER TABLE jobs ADD COLUMN team_size INTEGER;
ALTER TABLE jobs ADD COLUMN work_location VARCHAR(50) DEFAULT 'On-site';

CREATE INDEX idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX idx_jobs_archived ON jobs(archived);
```

### 2. Project Actions

**Edit Project:**
- Update all project fields
- Preserve audit trail (updated_at automatically updated)
- Validate required fields
- Show success toast notification

**Duplicate Project:**
- Copy all project details except:
  - ID (generate new)
  - Created/updated timestamps (new)
  - Candidates (empty)
  - Evaluations (empty)
- Append "(Copy)" to title
- Navigate to new project detail page

**Archive Project:**
- Soft delete (set archived = true)
- Hide from main dashboard
- Add "Archived" filter to dashboard
- Can be restored

**Delete Project:**
- Hard delete (cannot be undone)
- Show confirmation dialog
- Delete cascades to candidates and evaluations
- Redirect to dashboard

**Export Report:**
- Generate PDF report with:
  - Project details
  - Candidate list with scores
  - Evaluation summaries
  - Recommendations
- Download or email

### 3. Candidate Management

**Upload Flow:**
1. Select files (drag-drop or browse)
2. Parse resumes (extract text)
3. Create candidate records
4. Optional: Auto-trigger AI evaluation
5. Show success/error for each file
6. Navigate to candidates list

**Candidate List Features:**
- **Search:** Name, email, skills
- **Filter:** Score range, status, evaluation status
- **Sort:** Score, name, date added, experience
- **Bulk Actions:**
  - Evaluate selected
  - Delete selected
  - Export selected
  - Change status

**Candidate Detail View:**
- Full resume text
- AI evaluation results
- Contact information
- Interview scheduling
- Notes/comments section
- Action history timeline

### 4. Auto-Evaluation

**Trigger Options:**
1. **Manual:** Click "Start Evaluations" button
2. **Auto on Upload:** Checkbox in upload modal
3. **Scheduled:** Batch evaluate at specific time (future)

**Evaluation Queue:**
- Show progress bar
- List of pending evaluations
- Ability to cancel
- Real-time updates via WebSocket (future)

---

## 🎨 High-Fidelity Design Mockup

### Project Detail Page - Full Design

**Layout:**
- Fixed header with breadcrumb and actions
- Sticky tabs for Description/Requirements/Team
- Left sidebar: Project info card
- Main content: Candidates table with filters
- Right sidebar: Quick actions

**Interaction States:**
- **Hover:** Cards lift, buttons darken
- **Loading:** Skeleton screens for candidates
- **Empty:** Illustrated empty state with CTA
- **Error:** Red banner with retry button

**Responsive Breakpoints:**
- **Desktop (1280px+):** 3-column layout
- **Tablet (768-1279px):** 2-column, sidebar stacks
- **Mobile (<768px):** Single column, tabs collapse

---

## 📋 Implementation Checklist

### Phase 1: Database & Backend
- [ ] Create migration for new project fields
- [ ] Update useJobs hooks for new fields
- [ ] Add useUpdateJob with all fields
- [ ] Add useDuplicateJob mutation
- [ ] Add useArchiveJob mutation
- [ ] Add useDeleteJob mutation

### Phase 2: UI Components
- [ ] EditProjectModal component
- [ ] ProjectMenuDropdown component
- [ ] ConfirmDialog component (reusable)
- [ ] TagsInput component
- [ ] StatusSelect component
- [ ] WorkLocationSelect component

### Phase 3: Project Detail Enhancements
- [ ] Update ProjectDetailPage with new fields
- [ ] Add tabs (Description, Requirements, Team)
- [ ] Add project info sidebar
- [ ] Add quick actions sidebar
- [ ] Add edit functionality
- [ ] Add menu dropdown with actions

### Phase 4: Candidates
- [ ] Upload resumes modal
- [ ] Resume parser integration
- [ ] Candidate list component
- [ ] Candidate detail page
- [ ] Search/filter/sort functionality
- [ ] Bulk actions

### Phase 5: Testing & Polish
- [ ] Unit tests for all new components
- [ ] Integration tests for workflows
- [ ] Responsive design testing
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 🚀 Success Metrics

**User Experience:**
- Project edit time < 30 seconds
- Resume upload success rate > 95%
- Candidate search results < 500ms
- Zero data loss on operations

**Technical:**
- All components < 250 lines
- Test coverage > 90%
- Lighthouse score > 90
- No console errors

**Business:**
- Increased user engagement with projects
- Reduced time to hire
- Higher candidate evaluation completion rate

---

## Next Steps

1. Review and approve this design
2. Create database migration
3. Build EditProjectModal component
4. Implement project actions
5. Add candidate upload flow
6. Test and iterate
