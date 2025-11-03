# Collaborative Resume Assistant - User Flows & Diagrams

**Version:** 2.0 | **Date:** 2025-11-02 | **Type:** Visual Flow Specification

---

## Table of Contents

1. [Primary Flow: Upload → Feedback → Re-Ranking](#primary-flow-upload--feedback--re-ranking)
2. [First-Time User Flow: Landing → Value Discovery](#first-time-user-flow-landing--value-discovery)
3. [Power User Flow: Batch Upload → Iterative Refinement](#power-user-flow-batch-upload--iterative-refinement)
4. [Application Sitemap (Updated)](#application-sitemap-updated)
5. [State Machine: Candidate Evaluation with Feedback](#state-machine-candidate-evaluation-with-feedback)
6. [Sequence Diagram: Re-Ranking API Flow](#sequence-diagram-re-ranking-api-flow)

---

## Primary Flow: Upload → Feedback → Re-Ranking

**Goal:** Core collaborative workflow that differentiates the product

**Metric:** Feedback engagement rate (80% target)

```mermaid
flowchart TD
    A[Login → Dashboard] --> B[Create Job or Select Existing]
    B --> C[Upload 15 Resumes PDF/DOCX]
    C --> D[Files Parse Successfully]
    D --> E[AI Evaluation Runs Automatically]
    E --> F[Results Table: 15 Candidates Ranked]

    F --> G{Modal: Do rankings match your gut?}

    G -->|👍 Looks Good| H[Skip to Export]
    G -->|👎 Not Quite| I[Show Inline Feedback UI]
    G -->|⚙️ Let Me Review| J[Dismiss Modal, Review Results]

    J --> K{Spot any surprises?}
    K -->|No| H
    K -->|Yes| I

    I --> L[Add Feedback to 3-5 Candidates]
    L --> M[Sentiment: 👍 Agree / 👎 Disagree]
    M --> N[Reason Codes: Better fit, Missing skill, etc.]
    N --> O[Optional Notes: Free text context]

    O --> P[Save Feedback to Database]
    P --> Q[Toast: Want to re-rank? 10 seconds]

    Q --> R{Click Re-rank?}
    R -->|No| S[Continue with AI Rankings]
    R -->|Yes| T[Confirmation Modal: 3 candidates, dollar0.006]

    T --> U{Confirm?}
    U -->|Cancel| S
    U -->|Confirm| V[Re-ranking API Call]

    V --> W[Progress: Evaluating with your feedback...]
    W --> X[Re-ranking Complete 12 seconds]

    X --> Y[View Toggle: AI → My Ranking]
    Y --> Z[Movement Indicators: ↑↓ with points]

    Z --> AA{Satisfied with changes?}
    AA -->|No| AB[Adjust Feedback, Re-rank Again]
    AA -->|Yes| AC[Create Shortlist from My Ranking]

    AB --> V

    AC --> AD[Export PDF with Feedback Notes]
    AD --> AE[Share with Hiring Manager]

    S --> H
    H --> AD

    style I fill:#e1f5ff
    style V fill:#fff4e6
    style Z fill:#e7f5e7
    style AC fill:#f0f0f0
```

**Key Decision Points:**
1. **Modal prompt** - Immediate feedback discovery (first 30 seconds)
2. **Re-rank confirmation** - Transparent cost, clear value
3. **Iterative refinement** - Allow multiple re-ranking cycles

---

## First-Time User Flow: Landing → Value Discovery

**Goal:** Convert skeptical visitors to engaged users through feedback loop

**Metric:** Free trial → Signup conversion (30% target)

```mermaid
flowchart TD
    A[Land on Homepage] --> B[See Tagline: Teach AI what great looks like]
    B --> C[Value Prop: Human + AI > Either Alone]

    C --> D{Interested?}
    D -->|No| E[Bounce]
    D -->|Yes| F[Try Free Ranking CTA]

    F --> G[Create Job Modal: Enter 3-5 Requirements]
    G --> H[Upload 5 Sample Resumes]
    H --> I[Progress: Parsing... 80%]
    I --> J[AI Ranking Complete 8 seconds]

    J --> K[See Results Table: 5 Candidates Sorted]
    K --> L{Modal: Do these match your gut?}

    L -->|👍 Looks Good| M[Great! Export PDF]
    L -->|👎 Not Quite| N[Tell us where AI got it wrong]

    N --> O[Click 👎 on 2 Candidates]
    O --> P[Quick Reason: Culture fit, Experience, etc.]
    P --> Q[Toast: Re-rank with feedback? Free for first try]

    Q --> R{Click Yes?}
    R -->|No| M
    R -->|Yes| S[Re-ranking... 10 seconds]

    S --> T[New Rankings Show Changes]
    T --> U[Candidate 3 moved to 1 ↑ +2 spots]
    U --> V[Candidate 2 moved to 4 ↓ -2 spots]

    V --> W[Aha Moment: I made it better!]
    W --> X[Modal: Like this? Sign up to save preferences]

    X --> Y{Sign Up?}
    Y -->|Yes| Z[Signup Form: Email + Password]
    Y -->|No| AA[Continue as Guest sessionStorage]

    Z --> AB[Account Created]
    AB --> AC[Feedback + Rankings Saved to Supabase]
    AC --> AD[Redirect to Dashboard with Saved Job]

    AA --> M
    M --> AE[Data Ephemeral, Lost on Refresh]

    style N fill:#e1f5ff
    style W fill:#d4edda
    style Z fill:#fff3cd
```

**Critical Moments:**
1. **30-second hook** - Feedback modal appears immediately
2. **Aha moment** - Re-ranking changes results based on user input
3. **Signup trigger** - "Save preferences" after experiencing value

---

## Power User Flow: Batch Upload → Iterative Refinement

**Goal:** Efficient workflow for repeat users who understand feedback loop

**Metric:** D7 retention (50% target)

```mermaid
flowchart TD
    A[Login → Dashboard] --> B[See 5 Previous Jobs]
    B --> C{Use Existing or New?}

    C -->|Existing| D[Select Senior Engineer Role]
    C -->|New| E[Create Job from Template]
    E --> D

    D --> F[Job Detail: 12 Previous Candidates]
    F --> G[Click Add More Resumes]
    G --> H[Upload 25 New PDFs]

    H --> I[Parsing All 25... Progress Bar]
    I --> J[Auto-run AI Ranking]
    J --> K[37 Total Candidates Now 12 old + 25 new]

    K --> L[Filter: Show Only New Candidates]
    L --> M[Quick Scan: Do I agree with top 10?]

    M --> N{Pattern Recognition}
    N -->|AI still undervalues startup exp| O[Select 4 Candidates with Startup Background]
    N -->|AI overvalues years of experience| P[Select 3 Candidates AI Ranked Too High]

    O --> Q[Bulk Action: Apply Same Feedback]
    P --> Q

    Q --> R[Reason Code: Startup experience underrated]
    R --> S[Add Note: Our stage needs scrappy builders]

    S --> T[Save Feedback to 7 Candidates]
    T --> U[Click Re-rank All with Feedback]

    U --> V[Confirm: 7 candidates × dollar0.002 = dollar0.014]
    V --> W[Re-ranking... 18 seconds]

    W --> X[View: My Ranking]
    X --> Y[Top 5 Now Includes 2 AI Missed]
    Y --> Z[Agreement: 80% vs. 70% Last Time]

    Z --> AA{Review Analytics}
    AA --> AB[Dashboard: AI Learning Your Preferences]
    AB --> AC[12 Feedbacks Given, 3 Jobs Evaluated]
    AC --> AD[Top Reason: Startup experience 6x]

    AD --> AE{Add to Reason Library?}
    AE -->|Yes| AF[Save Startup Tag for Quick Select]
    AE -->|No| AG[Continue]

    AF --> AH[Create Shortlist from My Ranking]
    AG --> AH

    AH --> AI[Top 5: Jane, Mike, Sarah, Tom, Lisa]
    AI --> AJ[Generate Interview Guides for Top 5]
    AJ --> AK[Export All to PDF with Feedback Context]

    AK --> AL[Email to Hiring Manager]
    AL --> AM[Mark 5 as Interview Scheduled]

    style Q fill:#e1f5ff
    style AB fill:#d4edda
    style AF fill:#fff3cd
```

**Power User Indicators:**
1. **Bulk feedback** - Recognizes patterns across candidates
2. **Reason library** - Personalized quick codes from repeated usage
3. **Analytics awareness** - Checks improvement over time

---

## Application Sitemap (Updated)

```mermaid
flowchart TB
    root[Resume Scanner Pro]

    root --> marketing[Marketing Site]
    root --> app[Web App]

    marketing --> landing[Landing Page]
    marketing --> pricing[Pricing Page]
    marketing --> demo[Live Demo New: Shows Feedback]

    app --> auth[Authentication]
    auth --> login[Login]
    auth --> signup[Signup]

    app --> dashboard[Dashboard]
    dashboard --> jobs[Jobs List]
    dashboard --> analytics[Feedback Analytics New]
    dashboard --> profile[User Profile]

    jobs --> jobdetail[Job Detail]
    jobdetail --> upload[Upload Resumes]
    jobdetail --> airanking[AI Ranking Results]

    airanking --> feedback[Inline Feedback UI New]
    feedback --> rerank[Re-rank with Feedback New]
    rerank --> comparison[Comparison View New]

    comparison --> shortlist[Create Shortlist]
    comparison --> export[Export PDF with Feedback New]
    comparison --> interviewguide[Interview Guide Generator]

    airanking --> stage2[Stage 2 Evaluation]
    stage2 --> interview[Interview Ratings]
    stage2 --> references[Reference Checks]

    dashboard --> templates[Job Templates]
    templates --> newjob[Create from Template]

    analytics --> library[Reason Code Library New]

    style feedback fill:#e1f5ff
    style rerank fill:#fff4e6
    style comparison fill:#e7f5e7
    style analytics fill:#f0f0f0
```

**New Sections:**
- Feedback Analytics dashboard
- Inline feedback UI (integrated into results)
- Re-ranking flow
- Comparison view toggle
- Reason code library

---

## State Machine: Candidate Evaluation with Feedback

```mermaid
stateDiagram-v2
    [*] --> Uploaded: Resume uploaded

    Uploaded --> Parsing: Parse PDF/DOCX
    Parsing --> ParseError: Parse fails
    Parsing --> Ranked: Parse succeeds

    ParseError --> ManualInput: User enters text
    ManualInput --> Ranked

    Ranked --> AIEvaluating: Auto-run AI
    AIEvaluating --> EvalError: API error
    AIEvaluating --> Evaluated: Evaluation completes

    EvalError --> AIEvaluating: Retry up to 3x
    EvalError --> Ranked: Cancel

    Evaluated --> FeedbackPending: Results displayed

    FeedbackPending --> FeedbackGiven: User adds sentiment + notes
    FeedbackPending --> NoFeedback: User skips feedback

    FeedbackGiven --> RerankRequested: User clicks re-rank
    FeedbackGiven --> FeedbackSaved: User saves for later

    RerankRequested --> Reranking: API call with feedback
    Reranking --> RerankError: API timeout
    Reranking --> Reranked: New scores returned

    RerankError --> RerankRequested: Retry
    RerankError --> FeedbackGiven: Cancel

    Reranked --> ComparisonView: Show AI vs My Ranking

    ComparisonView --> IterateAgain: User adjusts feedback
    ComparisonView --> Shortlisted: User creates shortlist

    IterateAgain --> FeedbackGiven

    NoFeedback --> Exported: Export AI ranking
    FeedbackSaved --> Exported
    Shortlisted --> Exported

    Exported --> InterviewScheduled: Move to interviews
    Exported --> Declined: Disposition as declined

    InterviewScheduled --> Stage2: Add interview data
    Stage2 --> FinalDecision: Calculate final score

    FinalDecision --> Hired
    FinalDecision --> Rejected

    Hired --> [*]
    Rejected --> [*]
    Declined --> [*]

    note right of FeedbackGiven
        NEW STATE
        Critical for trust
    end note

    note right of Reranking
        NEW STATE
        15-second SLA
    end note

    note right of ComparisonView
        NEW STATE
        Shows movement
    end note
```

**Key State Additions:**
- `FeedbackPending` - After AI eval, before user action
- `FeedbackGiven` - User provided sentiment/notes
- `Reranking` - API processing with feedback context
- `Reranked` - New scores calculated
- `ComparisonView` - Showing AI vs. My Ranking
- `IterateAgain` - User refines feedback, re-ranks again

---

## Sequence Diagram: Re-Ranking API Flow

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant FE as React App
    participant API as Python API
    participant Claude as Claude 3.5 Haiku
    participant DB as Supabase DB

    U->>FE: Provides feedback on 3 candidates
    FE->>FE: Store feedback in Zustand state

    U->>FE: Clicks "Re-rank with Feedback"
    FE->>U: Show confirmation modal (cost, time estimate)

    U->>FE: Confirms re-ranking
    FE->>API: POST /api/rerank_with_feedback
    Note right of API: Body: job_id, candidates[], feedback[]

    API->>DB: Fetch job details + resume text
    DB-->>API: Job requirements, candidate resumes

    API->>API: Build feedback-augmented prompt
    Note right of API: Includes: original score, feedback, notes

    loop For each candidate with feedback
        API->>Claude: Send re-evaluation prompt
        Note right of Claude: Prompt: "Recruiter says: [feedback]"
        Claude-->>API: New evaluation response
        API->>API: Parse response (score, reasoning)
    end

    API->>API: Calculate movement (new - original)
    API->>DB: UPDATE candidate_rankings (adjusted_score, feedback)
    DB-->>API: Success

    API-->>FE: Response (new scores, movement, reasoning, cost)
    FE->>FE: Update React Query cache
    FE->>FE: Switch view to "My Ranking"
    FE->>U: Show comparison with movement arrows

    U->>FE: Reviews changes

    alt User satisfied
        U->>FE: Creates shortlist from My Ranking
        FE->>DB: Save shortlist
    else User not satisfied
        U->>FE: Adjusts feedback, re-ranks again
        FE->>API: POST /api/rerank_with_feedback (iteration 2)
    end

    Note over U,DB: Error Handling

    Claude-->>API: Timeout (30s)
    API->>API: Retry with exponential backoff

    alt Retry succeeds
        Claude-->>API: Response on 2nd attempt
    else All retries fail
        API-->>FE: Error (refund option shown)
        FE->>U: "Re-ranking failed. Try again? No charge."
    end
```

**Critical Paths:**
1. **Feedback capture** - Stored locally before API call
2. **Batch re-ranking** - Loop through candidates with feedback
3. **Error handling** - Retry logic with user-friendly fallback
4. **Iterative refinement** - Allow multiple re-ranking cycles

---

## Interaction Diagram: Feedback → Re-Rank → Compare

```mermaid
flowchart LR
    A[Candidate Card] --> B{User Action}

    B -->|👍 Agree| C[Save Sentiment to DB]
    B -->|👎 Disagree| D[Show Reason Code Checkboxes]
    B -->|➡️ Neutral| C

    D --> E[User Selects Codes]
    E --> F[Optional: Add Free Text Note]
    F --> C

    C --> G[Feedback Badge Appears on Card]
    G --> H[Toast: Re-rank with feedback?]

    H --> I{User Clicks Toast}
    I -->|Yes| J[Show Re-rank Confirmation Modal]
    I -->|No| K[Dismiss, Continue]

    J --> L[Display: Candidates, Cost, Time]
    L --> M{Confirm?}

    M -->|Cancel| K
    M -->|Confirm| N[API Call: Re-rank]

    N --> O[Progress Modal: 1/3, 2/3, 3/3]
    O --> P[Re-ranking Complete]

    P --> Q[Auto-switch to My Ranking View]
    Q --> R[Show Movement Indicators]
    R --> S[Highlight: ↑ Moved Up, ↓ Moved Down]

    S --> T{User Reviews Changes}
    T -->|Satisfied| U[Create Shortlist]
    T -->|Not Satisfied| V[Edit Feedback]

    V --> D

    U --> W[Export PDF with Feedback Context]
```

---

## Comparison View State Flow

```mermaid
stateDiagram-v2
    [*] --> AIRankingView: Default view

    AIRankingView --> MyRankingView: User clicks "My Ranking" tab
    AIRankingView --> BlendedView: User clicks "Blended" tab

    MyRankingView --> AIRankingView: User clicks "AI Ranking" tab
    MyRankingView --> BlendedView: User clicks "Blended" tab

    BlendedView --> AIRankingView: User clicks "AI Ranking" tab
    BlendedView --> MyRankingView: User clicks "My Ranking" tab

    note right of AIRankingView
        Shows original AI scores
        No feedback considered
    end note

    note right of MyRankingView
        Shows adjusted scores
        After re-ranking with feedback
        Movement arrows visible
    end note

    note right of BlendedView
        50% AI + 50% User
        Compromise ranking
        For teams with disagreement
    end note

    AIRankingView --> ExportAI: Export PDF
    MyRankingView --> ExportMy: Export PDF
    BlendedView --> ExportBlended: Export PDF

    ExportAI --> [*]
    ExportMy --> [*]
    ExportBlended --> [*]
```

---

## Mobile Responsive Flow (Simplified)

```mermaid
flowchart TD
    A[Mobile Landing Page] --> B[Tap Try Free]
    B --> C[Simplified Job Form 3 fields]
    C --> D[Tap to Upload Photos of resumes?]
    D --> E[Upload 3 PDFs max on mobile]
    E --> F[AI Ranking Card View]

    F --> G{Swipe Left/Right on Cards}
    G -->|Swipe Right| H[👍 Agree]
    G -->|Swipe Left| I[👎 Disagree]
    G -->|Tap| J[View Details]

    H --> K[Quick Reason Popup]
    I --> K

    K --> L[Save Feedback]
    L --> M[Bottom Sheet: Re-rank? Tap to confirm]

    M --> N{Tap?}
    N -->|Yes| O[Re-ranking... Progress]
    N -->|No| P[Dismiss]

    O --> Q[Card View: My Ranking]
    Q --> R[Movement Badges: ↑↓]
    R --> S[Tap to Export]

    style G fill:#e1f5ff
    style M fill:#fff4e6
```

**Mobile Adaptations:**
- Swipe gestures for quick feedback
- Bottom sheets for modals (native feel)
- Card view instead of table
- Simplified reason codes (fewer options)

---

## Analytics Dashboard Flow (P1 Feature)

```mermaid
flowchart TD
    A[User Opens Analytics Dashboard] --> B[Fetch Data: Last 30 Days]
    B --> C[Display Summary Cards]

    C --> D[Card 1: Feedback Given 12 times]
    C --> E[Card 2: Re-rankings Triggered 3 times]
    C --> F[Card 3: Agreement % 75% → 85% trend up]
    C --> G[Card 4: Top Reason Codes]

    G --> H[Chart: Reason Code Frequency]
    H --> I[1. Culture fit 6x]
    H --> J[2. Soft skills 4x]
    H --> K[3. Experience underrated 2x]

    I --> L{Click Culture Fit}
    L --> M[Drill-down: Show 6 Candidates with This Tag]
    M --> N[Pattern: All startup backgrounds]

    N --> O{Add to Reason Library?}
    O -->|Yes| P[Save Startup Culture Fit as Quick Code]
    O -->|No| Q[Continue Browsing]

    P --> R[Future Evals: Startup Culture Fit Appears in Quick Codes]

    style H fill:#e1f5ff
    style P fill:#d4edda
```

---

## Error Handling Flow: Re-Ranking Failure

```mermaid
flowchart TD
    A[User Confirms Re-ranking] --> B[API Call to /api/rerank_with_feedback]
    B --> C{API Response}

    C -->|Success 200| D[Show New Rankings]
    C -->|Timeout 504| E[Retry Attempt 1]
    C -->|Rate Limit 429| F[Wait 5s, Retry]
    C -->|Server Error 500| G[Show Error Modal]

    E --> H{Retry Successful?}
    H -->|Yes| D
    H -->|No| I[Retry Attempt 2]

    I --> J{Retry Successful?}
    J -->|Yes| D
    J -->|No| G

    G --> K[Modal: Re-ranking failed. No charge applied.]
    K --> L[Options: Try Again | Use AI Ranking | Contact Support]

    L --> M{User Choice}
    M -->|Try Again| B
    M -->|Use AI Ranking| N[Revert to AI Rankings]
    M -->|Contact Support| O[Open Support Chat]

    F --> P{Rate Limit Resolved?}
    P -->|Yes| B
    P -->|No| G

    style G fill:#f8d7da
    style K fill:#fff3cd
```

---

## Next Steps

1. **User Testing** - Walk 2 senior recruiters through flows, identify friction
2. **Prototype Key Screens** - Build Wireframes C1-C4 in Figma or React
3. **Technical Validation** - Test re-ranking prompt with sample feedback
4. **Analytics Setup** - Instrument key events (feedback_given, rerank_triggered)
5. **Beta Launch** - Ship to 3-5 friendly users, collect qualitative feedback

---

**Document Owner:** Product & Growth Lead
**Last Updated:** 2025-11-02
**Status:** Draft for review
**Related:** [Collaborative Pivot PRD](COLLABORATIVE_PIVOT_PRD.md)
