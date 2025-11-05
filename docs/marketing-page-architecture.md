# Marketing Page Architecture

## Overview
B2B SaaS marketing page designed to convert corporate/agency recruiters to signup for free trial. Inspired by Frill's conversion-focused design.

## Page Structure

### 1. Hero Section
**Goal:** Communicate value proposition in 3 seconds

**Elements:**
- **Headline:** "Evaluate 50 Resumes in Minutes, Not Hours"
- **Subheadline:** "AI-powered batch resume screening for recruiters. Upload resumes, get instant rankings, evaluate top candidates with Claude AI."
- **CTA (Primary):** "Start Free Trial" (bright, prominent)
- **CTA (Secondary):** "Watch Demo" (1-min video)
- **Social Proof:** "Trusted by recruiters at [Company Logos]" or "500+ evaluations completed"
- **Hero Image/Video:** Screenshot of batch upload + results dashboard

**Copy Focus:**
- Time savings (quantifiable: "50 resumes → 10 minutes")
- Pain point (drowning in resumes, manual screening is tedious)
- Outcome (interview the best candidates faster)

---

### 2. Problem Statement
**Goal:** Resonate with recruiter pain points

**Content:**
- "Screening 50 resumes manually takes 4+ hours"
- "You miss great candidates buried in the pile"
- "Keyword searches are unreliable and biased"
- "You need a smarter way to prioritize who to interview"

**Visual:** Side-by-side comparison (manual process vs. Resume Scanner Pro)

---

### 3. Features Overview
**Goal:** Show what makes this tool different

**Features (3-column layout):**

1. **Batch Upload & Parse**
   - Icon: Upload cloud
   - "Upload 1-50 resumes at once (PDF, DOCX)"
   - "Automatic text extraction, no manual data entry"

2. **Instant Keyword Ranking (Free)**
   - Icon: Lightning bolt
   - "Regex-based matching against job requirements"
   - "Get ranked list in seconds, zero AI cost"

3. **AI-Powered Evaluation (Paid)**
   - Icon: Brain/AI sparkle
   - "Claude 3.5 Haiku evaluates top candidates"
   - "Structured scores: Qualifications, Experience, Risk Flags"

4. **Interview Guide Generation**
   - Icon: Checklist
   - "AI creates custom interview questions"
   - "Based on candidate's specific background"

5. **Export to PDF**
   - Icon: Download
   - "Professional evaluation reports"
   - "Share with hiring managers instantly"

6. **Multi-Device Access**
   - Icon: Devices
   - "Web + iOS (coming soon)"
   - "Access your evaluations anywhere"

---

### 4. How It Works (3-Step Process)
**Goal:** Reduce perceived complexity

**Steps:**
1. **Upload Resumes** - "Drag & drop 1-50 PDFs or DOCX files"
2. **Define Job Requirements** - "Must-have skills, preferred qualifications"
3. **Get Ranked Results** - "Instant keyword match or AI evaluation for top candidates"

**Visual:** Animated GIF or screenshot flow showing the 3 steps

---

### 5. Pricing Teaser
**Goal:** Communicate free tier + paid upgrade

**Content:**
- **Free:** "Unlimited keyword-based ranking (regex matching)"
- **Paid:** "AI evaluations: $0.01 per candidate (Claude 3.5 Haiku)"
- **CTA:** "Start Free - No Credit Card Required"

**Note:** Full pricing page linked here, but keep it simple on marketing page

---

### 6. Use Cases / Target Personas
**Goal:** Help visitors self-identify

**Personas:**
1. **Corporate Recruiter** - "Hiring for multiple roles, 100+ applications per posting"
2. **Recruiting Agency** - "Managing candidates for 5+ clients simultaneously"
3. **Hiring Manager** - "Tech startup, need to screen engineers quickly"

**Format:** Card layout with persona icon, title, pain point, outcome

---

### 7. Trust Signals
**Goal:** Overcome skepticism

**Elements:**
- **Security:** "SOC 2 compliant, data encrypted at rest" (future)
- **Privacy:** "Your resumes stay private, deleted after 30 days if requested"
- **Technology:** "Powered by Claude 3.5 Haiku (Anthropic) and Supabase"
- **Testimonials:** (once available) "This saved me 10 hours per week" - Recruiter Name, Company

---

### 8. FAQ Section
**Goal:** Address objections before signup

**Questions:**
1. **Do I need a credit card to try it?** - "No, keyword ranking is 100% free"
2. **How accurate is the AI evaluation?** - "Claude 3.5 Haiku scores based on your job requirements..."
3. **What file formats are supported?** - "PDF and DOCX resumes"
4. **Can I export results?** - "Yes, PDF reports for all evaluations"
5. **Is my data secure?** - "Encrypted storage, GDPR compliant, optional data deletion"
6. **How much does AI evaluation cost?** - "$0.01 per candidate (Claude Haiku), $0.05 for GPT-4o"

---

### 9. Final CTA
**Goal:** Convert after full page read

**Content:**
- **Headline:** "Ready to Save 10+ Hours per Week?"
- **CTA Button:** "Start Free Trial" (jumps to signup modal/page)
- **Reassurance:** "14-day trial, no credit card required, cancel anytime"

---

## Technical Implementation

### Frontend Structure
```
frontend/src/
├── pages/
│   ├── MarketingPage.jsx        # Main landing page
│   └── SignupPage.jsx           # Signup form (post-click)
├── components/
│   ├── marketing/
│   │   ├── HeroSection.jsx
│   │   ├── ProblemStatement.jsx
│   │   ├── FeaturesGrid.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── PricingTeaser.jsx
│   │   ├── UseCases.jsx
│   │   ├── TrustSignals.jsx
│   │   ├── FAQ.jsx
│   │   └── FinalCTA.jsx
│   └── shared/
│       ├── CTAButton.jsx
│       └── VideoModal.jsx (for demo video)
```

### Routing
```
/ → MarketingPage (unauthenticated visitors)
/signup → SignupPage
/app → Dashboard (authenticated users, redirects to /signup if not logged in)
```

### Supabase Auth Flow
1. User clicks "Start Free Trial" on MarketingPage
2. Redirect to `/signup`
3. SignupPage collects: Email, Full Name, Password, Company (optional)
4. `supabase.auth.signUp()` → email verification sent
5. After verification → redirect to `/app` (dashboard)
6. All data persisted to Supabase with `user_id` from auth

---

## Design System (Tailwind)

### Color Palette (following B2B SaaS patterns)
- **Primary CTA:** `bg-blue-600 hover:bg-blue-700` (trust, action)
- **Secondary CTA:** `bg-white border-blue-600 text-blue-600` (less aggressive)
- **Accent:** `bg-green-500` (success states, "Free" badges)
- **Background:** `bg-gray-50` (sections), `bg-white` (cards)
- **Text:** `text-gray-900` (headlines), `text-gray-600` (body)

### Typography
- **Headlines:** `text-4xl md:text-5xl font-bold` (hero), `text-3xl font-bold` (sections)
- **Body:** `text-lg text-gray-600 leading-relaxed`
- **CTAs:** `text-lg font-semibold`

### Spacing
- **Sections:** `py-16 md:py-24` (generous whitespace)
- **Max Width:** `max-w-7xl mx-auto px-4` (readable, not edge-to-edge)

---

## Conversion Optimization

### A/B Test Ideas (Future)
1. Hero headline variants ("Evaluate 50 Resumes..." vs "Hire Faster with AI Resume Screening")
2. CTA button color (blue vs green vs red)
3. Video demo vs static screenshot in hero
4. Pricing teaser placement (above fold vs below features)

### Analytics Tracking
- **Events:**
  - `marketing_page_view`
  - `cta_clicked` (which CTA, location on page)
  - `signup_started`
  - `signup_completed`
  - `demo_video_watched`

---

## Content Checklist

**Before Launch:**
- [ ] Write hero headline/subheadline copy
- [ ] Record 60-second demo video (Loom)
- [ ] Design feature icons (Heroicons or custom)
- [ ] Get 3-5 company logos for social proof (or wait for real customers)
- [ ] Screenshot actual tool UI (upload, results, export)
- [ ] Write FAQ answers
- [ ] Legal: Terms of Service, Privacy Policy links

**Post-Launch:**
- [ ] Collect testimonials from early users
- [ ] Add live chat widget (Intercom/Crisp)
- [ ] A/B test headline variations
- [ ] Add exit-intent popup ("Wait! Start your free trial")

---

## Mobile Considerations
- Hero CTA must be above fold on mobile
- 1-column layout for features (not 3-column)
- Sticky CTA button at bottom of screen (mobile only)
- Hamburger menu for top nav (if applicable)

---

## SEO Optimization
- **Title:** "Resume Scanner Pro - AI Resume Screening for Recruiters"
- **Meta Description:** "Upload 50 resumes, get instant AI-powered rankings. Save 10+ hours per week on candidate screening. Free keyword matching, paid AI evaluation."
- **Keywords:** "AI resume screening, batch resume upload, recruiter tools, candidate evaluation, resume ranking"
- **Structured Data:** Product schema, FAQPage schema

---

## Success Metrics

**Primary:**
- Signup conversion rate (visitors → signups): Target 3-5%
- Time on page: Target 90+ seconds (indicates engagement)

**Secondary:**
- CTA click-through rate
- Demo video view rate
- Bounce rate (lower is better)
- Mobile vs desktop conversion

---

## Next Steps

1. **Design:** Wireframe in Figma (or directly in code with Tailwind)
2. **Copy:** Write all section copy (headlines, body, CTAs)
3. **Assets:** Create/source icons, screenshots, demo video
4. **Build:** Implement MarketingPage.jsx with all sections
5. **Auth:** Implement SignupPage.jsx with Supabase auth
6. **Test:** Mobile responsiveness, CTA click tracking
7. **Launch:** Deploy to Vercel, test end-to-end flow
