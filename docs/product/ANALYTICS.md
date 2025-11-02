# Resume Scanner Pro - Analytics & Event Tracking Plan

**Version:** 1.0 | **Date:** 2025-11-01 | **Owner:** Product & Growth Lead

---

## Table of Contents

1. [KPI Framework](#kpi-framework)
2. [Event Tracking Plan](#event-tracking-plan)
3. [Funnel Metrics](#funnel-metrics)
4. [Dashboard Specifications](#dashboard-specifications)
5. [Growth Experiments](#growth-experiments)
6. [Implementation Guide](#implementation-guide)

---

## KPI Framework

### One Metric That Matters (MVP Launch)

**Activation Rate:** % of signups who complete their first AI evaluation within 7 days

- **Target:** 60%
- **Why:** Proves value delivery and converts free users to paid
- **Measurement:** `first_ai_evaluation_completed` events ÷ `user_signed_up` events (7-day cohort)

### North Star Metric (Post-Launch)

**Weekly Active Evaluators:** # of unique users who run at least 1 AI evaluation per week

- **Target:** 50 by Month 2, 200 by Month 6
- **Why:** Indicates product-market fit and stickiness
- **Measurement:** COUNT(DISTINCT user_id) WHERE `ai_evaluation_completed` in last 7 days

---

## AARRR Metrics (Pirate Metrics)

### Acquisition

| Metric | Definition | Target | Tracking |
|--------|------------|--------|----------|
| Website visitors | Unique visitors to landing page | 1,000/month | `page_viewed` (page: landing) |
| Landing → Signup CVR | % visitors who sign up | 5% | `user_signed_up` ÷ `page_viewed` |
| Traffic sources | Where visitors come from | ProductHunt #1 | UTM parameters in `page_viewed` |
| Bounce rate | % who leave without interaction | <50% | GA4 or PostHog |
| Avg session duration | Time on site before signup | >45 sec | PostHog session duration |

### Activation

| Metric | Definition | Target | Tracking |
|--------|------------|--------|----------|
| Signup → First job CVR | % who create a job | 80% | `job_created` ÷ `user_signed_up` |
| Signup → First AI eval | % who run AI evaluation | 60% (7d) | `ai_evaluation_completed` ÷ `user_signed_up` |
| Time to first value | Median time signup → first eval | <10 min | Timestamp diff |
| Free → Paid CVR | % who upgrade to paid | 30% | `payment_added` ÷ `user_signed_up` |
| Onboarding completion | % who finish onboarding | 90% | `onboarding_completed` ÷ `user_signed_up` |

### Retention

| Metric | Definition | Target | Tracking |
|--------|------------|--------|----------|
| D1 retention | % who return day 1 | 50% | Cohort analysis (PostHog) |
| D7 retention | % who return day 7 | 40% | Cohort analysis |
| D30 retention | % who return day 30 | 25% | Cohort analysis |
| Weekly active users (WAU) | Active in last 7 days | 100 (Month 2) | COUNT(DISTINCT user_id) |
| Monthly active users (MAU) | Active in last 30 days | 300 (Month 3) | COUNT(DISTINCT user_id) |
| Stickiness (WAU/MAU) | Engagement ratio | >33% | WAU ÷ MAU |

### Revenue

| Metric | Definition | Target | Tracking |
|--------|------------|--------|----------|
| Free → Paid CVR | % who add payment method | 15% (30d) | `payment_added` ÷ `user_signed_up` |
| ARPU | Avg revenue per user | $25/month | Total revenue ÷ total users |
| MRR | Monthly recurring revenue | $2,500 (Month 3) | SUM(subscriptions) |
| Churn rate | % who cancel subscription | <5%/month | Stripe webhook `customer.subscription.deleted` |
| LTV (Lifetime Value) | Revenue per user lifetime | $300 | ARPU ÷ churn rate |
| CAC (Customer Acq Cost) | Cost per acquired customer | <$50 | Ad spend ÷ new customers |
| LTV:CAC ratio | Return on acquisition | >3:1 | LTV ÷ CAC |

### Referral

| Metric | Definition | Target | Tracking |
|--------|------------|--------|----------|
| Invites sent | # of users who invite others | 10% of users | `invite_sent` event |
| Viral coefficient | Invites per user | 0.5 (Month 6) | `invite_sent` ÷ total users |
| Referral signups | % signups from referrals | 20% (Month 6) | UTM: `utm_source=referral` |

---

## Event Tracking Plan

### Critical Events (Must Have for Launch)

| Event Name | Trigger | Properties | Owner | Priority |
|------------|---------|------------|-------|----------|
| `page_viewed` | Page load | `page_name`, `utm_source`, `utm_medium`, `utm_campaign` | Growth | P0 |
| `user_signed_up` | Account created | `auth_method` (email/google/apple), `user_id`, `signup_source` (landing/freemium) | Growth | P0 |
| `user_logged_in` | Successful login | `user_id`, `auth_method` | Product | P0 |
| `job_created` | Job posting saved | `job_id`, `user_id`, `num_must_haves`, `num_preferred`, `from_template` (bool) | Product | P0 |
| `resumes_uploaded` | Resume upload complete | `job_id`, `user_id`, `num_resumes`, `file_types` (PDF/DOCX), `total_mb` | Product | P0 |
| `free_ranking_completed` | Regex ranking done | `job_id`, `user_id`, `num_candidates`, `duration_ms` | Product | P0 |
| `ai_evaluation_started` | AI eval initiated | `job_id`, `user_id`, `num_candidates`, `provider` (anthropic/openai), `estimated_cost` | Product | P0 |
| `ai_evaluation_completed` | AI eval finished | `job_id`, `user_id`, `candidate_id`, `score`, `recommendation`, `cost`, `duration_ms`, `provider`, `model` | Product | P0 |
| `ai_evaluation_failed` | AI eval error | `job_id`, `user_id`, `candidate_id`, `error_message`, `provider` | Product | P0 |
| `results_exported` | PDF exported | `job_id`, `user_id`, `num_candidates`, `export_type` (all/selected) | Product | P0 |
| `payment_added` | Card added | `user_id`, `payment_method` (card/apple_pay) | Revenue | P0 |
| `payment_charged` | Payment processed | `user_id`, `amount`, `currency`, `description`, `status` (success/failed) | Revenue | P0 |

### Important Events (Should Have by Week 3)

| Event Name | Trigger | Properties | Owner | Priority |
|------------|---------|------------|-------|----------|
| `interview_guide_generated` | Guide created | `job_id`, `user_id`, `candidate_id`, `num_questions` | Product | P1 |
| `stage_2_started` | Interview ratings form opened | `job_id`, `user_id`, `candidate_id` | Product | P1 |
| `stage_2_completed` | Final decision calculated | `job_id`, `user_id`, `candidate_id`, `final_score`, `recommendation` | Product | P1 |
| `candidate_hired` | Marked as hired | `job_id`, `user_id`, `candidate_id`, `final_score` | Product | P1 |
| `candidate_rejected` | Marked as rejected | `job_id`, `user_id`, `candidate_id`, `reason` | Product | P1 |
| `job_template_saved` | Job saved as template | `job_id`, `user_id`, `template_name` | Product | P1 |
| `job_cloned` | Job created from template | `job_id`, `user_id`, `source_template_id` | Product | P1 |
| `onboarding_completed` | First job + eval done | `user_id`, `time_to_complete_sec` | Growth | P1 |
| `feedback_submitted` | In-app feedback sent | `user_id`, `rating` (1-5), `comment`, `page` | Product | P1 |

### Nice to Have Events (P2)

| Event Name | Trigger | Properties | Owner | Priority |
|------------|---------|------------|-------|----------|
| `candidate_ranked_manually` | User reorders candidate | `job_id`, `user_id`, `candidate_id`, `old_rank`, `new_rank` | Product | P2 |
| `filter_applied` | Results filtered | `job_id`, `user_id`, `filter_type` (recommendation/score), `filter_value` | Product | P2 |
| `resume_preview_viewed` | Full resume opened | `job_id`, `user_id`, `candidate_id` | Product | P2 |
| `email_sent` | Email notification sent | `user_id`, `email_type` (welcome/eval_complete), `status` | Growth | P2 |
| `invite_sent` | User invites teammate | `user_id`, `invitee_email` | Growth | P2 |
| `help_docs_viewed` | Help page opened | `user_id`, `doc_name` | Product | P2 |

---

## Funnel Metrics

### Primary Conversion Funnel (Anonymous → Paid User)

```
Landing Page View
    ↓ 5% conversion
Signup
    ↓ 80% conversion
First Job Created
    ↓ 90% conversion
Resumes Uploaded
    ↓ 100% conversion
Free Ranking Viewed
    ↓ 30% conversion
Payment Added
    ↓ 100% conversion
First AI Evaluation
    ↓ ——————————
ACTIVATED USER (goal)
```

**Tracking:**
```sql
-- PostHog or Mixpanel funnel query
SELECT
  COUNT(CASE WHEN event = 'page_viewed' AND page = 'landing' THEN 1 END) AS landing_views,
  COUNT(CASE WHEN event = 'user_signed_up' THEN 1 END) AS signups,
  COUNT(CASE WHEN event = 'job_created' THEN 1 END) AS jobs_created,
  COUNT(CASE WHEN event = 'resumes_uploaded' THEN 1 END) AS uploads,
  COUNT(CASE WHEN event = 'free_ranking_completed' THEN 1 END) AS rankings,
  COUNT(CASE WHEN event = 'payment_added' THEN 1 END) AS payments,
  COUNT(CASE WHEN event = 'ai_evaluation_completed' THEN 1 END) AS activations
FROM events
WHERE timestamp >= '2025-12-01'
  AND timestamp < '2025-12-08'
GROUP BY user_id;
```

### Stage 1 → Stage 2 Funnel (Hiring Lifecycle)

```
Resume Uploaded
    ↓ 100%
AI Evaluation (Stage 1)
    ↓ 50% (Interview recommendation)
Interview Guide Generated
    ↓ 80% (Interview conducted)
Stage 2 Evaluation Started
    ↓ 95%
Stage 2 Completed (Final Decision)
    ↓ 70% (Hire recommendation)
Candidate Marked as Hired
```

**Target:** 20% of Stage 1 evaluations reach Stage 2 completion

---

## Dashboard Specifications

### Executive Dashboard (Weekly Review)

**Metrics to Display:**

1. **Acquisition (This Week vs Last Week)**
   - Landing page visitors: 850 (↑12%)
   - Signups: 42 (↑18%)
   - Signup CVR: 4.9% (↑0.4pp)

2. **Activation (7-Day Cohorts)**
   - Signup → First job: 78% (Target: 80%)
   - Signup → First AI eval: 58% (Target: 60%)
   - Time to first value: 8.5 min (Target: <10 min)

3. **Retention**
   - D7 retention: 42% (↑2pp)
   - WAU: 85 (Target: 100)
   - MAU: 280 (Target: 300)

4. **Revenue**
   - MRR: $2,100 (Target: $2,500)
   - New paid users this week: 8
   - Churn this week: 1 (4.2%)

5. **Product Usage**
   - Total jobs created: 125
   - Total resumes evaluated (AI): 2,450
   - Avg resumes/user: 28
   - Stage 2 evaluations: 34 (13.8% of Stage 1)

**Tool:** PostHog or Mixpanel dashboard, refreshed daily

---

### Product Analytics Dashboard (Daily Monitor)

**Metrics to Track:**

1. **Core Actions (Last 24 Hours)**
   - Jobs created: 12
   - Resumes uploaded: 350
   - AI evaluations: 78
   - Interview guides generated: 15
   - PDF exports: 22

2. **Performance**
   - P95 API response time: 380ms (Target: <500ms)
   - AI evaluation avg duration: 8.2s (Target: <10s)
   - Error rate: 0.8% (Target: <1%)

3. **User Behavior**
   - Avg resumes per job: 12.5
   - Avg AI evals per job: 4.8 (38% of uploads)
   - Top traffic source: ProductHunt (42%)
   - Most common auth method: Email (68%)

4. **Conversion**
   - Free ranking → AI eval: 32%
   - Anonymous → Signup: 28%
   - Signup → Payment: 14%

**Tool:** Custom dashboard (Metabase or Retool) + PostHog

---

### Growth Experiment Dashboard (A/B Tests)

**Active Experiments:**

| Experiment | Metric | Control | Variant | Winner | Status |
|------------|--------|---------|---------|--------|--------|
| Landing page CTA | Signup CVR | "Try Free" (4.8%) | "Start Ranking" (5.2%) | Variant | Running |
| Onboarding flow | Activation rate | 3-step (58%) | 1-step (62%) | Variant | Running |
| Pricing display | Payment CVR | Hidden (12%) | Visible (18%) | Variant | Complete ✅ |
| Email timing | D7 retention | Day 1 (40%) | Day 3 (43%) | Variant | Running |

**Tool:** PostHog Experiments or custom A/B testing

---

## Growth Experiments

### Experiment Framework (ICE Score)

Prioritize experiments using **ICE:**
- **Impact:** 1-10 (how much will this improve the metric?)
- **Confidence:** 1-10 (how sure are we it will work?)
- **Ease:** 1-10 (how easy to implement?)
- **Total:** Sum (max 30)

### Experiment 1: Optimize Landing Page CTA

**Hypothesis:** Changing CTA from "Try Free Ranking" to "Upload Resumes Free" will increase signup conversion by 15%

**ICE Score:**
- Impact: 8/10 (primary growth lever)
- Confidence: 7/10 (proven pattern in SaaS)
- Ease: 9/10 (1-line code change)
- **Total: 24/30** ⭐

**Metric:** Landing → Signup CVR (baseline: 5%)

**Success Rule:** Variant CVR >5.75% (15% lift) with p<0.05

**Duration:** 2 weeks (min 1,000 visitors per variant)

**Rollback Plan:** Revert CTA text if CVR drops or bounces increase

---

### Experiment 2: Simplify Onboarding (1-Step vs 3-Step)

**Hypothesis:** Reducing onboarding from 3 steps to 1 step will increase activation rate by 10%

**ICE Score:**
- Impact: 9/10 (directly impacts OMTM)
- Confidence: 6/10 (less friction, but may reduce quality)
- Ease: 5/10 (requires form redesign)
- **Total: 20/30**

**Metric:** Signup → First AI eval (baseline: 60%)

**Success Rule:** Variant >66% activation with no decrease in eval quality (score variance)

**Duration:** 2 weeks (min 200 signups per variant)

**Rollback Plan:** Feature flag `onboarding_v2` = false

---

### Experiment 3: Pricing Page Visibility

**Hypothesis:** Showing pricing upfront (vs gated) will increase free → paid CVR by 20%

**ICE Score:**
- Impact: 8/10 (revenue impact)
- Confidence: 8/10 (transparency builds trust)
- Ease: 8/10 (add link to navbar)
- **Total: 24/30** ⭐

**Metric:** Free ranking → Payment added CVR (baseline: 30%)

**Success Rule:** Variant >36% CVR

**Duration:** 3 weeks (min 300 free users per variant)

**Rollback Plan:** Remove pricing link if CVR drops

---

### Experiment 4: Email Drip Timing

**Hypothesis:** Sending activation email on Day 3 (vs Day 1) will increase D7 retention by 10%

**ICE Score:**
- Impact: 7/10 (retention is key for LTV)
- Confidence: 5/10 (timing is tricky)
- Ease: 7/10 (email scheduler change)
- **Total: 19/30**

**Metric:** D7 retention (baseline: 40%)

**Success Rule:** Variant >44% retention

**Duration:** 4 weeks (cohort analysis required)

**Rollback Plan:** Revert to Day 1 email if open rate drops

---

## Implementation Guide

### Tech Stack

**Recommended:** PostHog (open-source, privacy-first, all-in-one)

**Alternatives:**
- Mixpanel (mature product analytics)
- Amplitude (enterprise-grade)
- Segment + Mixpanel (if need multiple destinations)

**Why PostHog for MVP:**
- ✅ Free tier: 1M events/month
- ✅ Self-hosted option (privacy compliance)
- ✅ Session recording + heatmaps
- ✅ Feature flags (for A/B tests)
- ✅ Funnels, cohorts, retention built-in

---

### Frontend Integration (React)

**1. Install PostHog**

```bash
npm install posthog-js
```

**2. Initialize in `main.tsx`**

```tsx
import posthog from 'posthog-js';

posthog.init('phc_YOUR_PROJECT_API_KEY', {
  api_host: 'https://app.posthog.com',
  autocapture: false, // Disable autocapture, use manual events
  capture_pageview: true,
});
```

**3. Create Analytics Service**

```tsx
// src/services/analytics.ts
import posthog from 'posthog-js';

export const analytics = {
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits);
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  },

  page: (pageName: string, properties?: Record<string, any>) => {
    posthog.capture('page_viewed', { page_name: pageName, ...properties });
  },

  reset: () => {
    posthog.reset(); // Call on logout
  },
};
```

**4. Track Events in Components**

```tsx
// Example: Track signup
import { analytics } from '@/services/analytics';

const handleSignup = async (email: string, password: string) => {
  const { user } = await supabase.auth.signUp({ email, password });

  analytics.identify(user.id, { email });
  analytics.track('user_signed_up', {
    auth_method: 'email',
    signup_source: 'landing',
  });

  navigate('/dashboard');
};
```

**5. Track Page Views**

```tsx
// In App.tsx or Router
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics';

function App() {
  const location = useLocation();

  useEffect(() => {
    analytics.page(location.pathname);
  }, [location]);

  return <Router>...</Router>;
}
```

---

### Backend Integration (Python)

**1. Install PostHog SDK**

```bash
pip install posthog
```

**2. Initialize in `api/analytics.py`**

```python
from posthog import Posthog
import os

posthog = Posthog(
    project_api_key=os.getenv('POSTHOG_API_KEY'),
    host='https://app.posthog.com'
)

def track_event(user_id: str, event_name: str, properties: dict = None):
    """Track backend events (AI evaluations, payments, etc.)"""
    posthog.capture(
        distinct_id=user_id,
        event=event_name,
        properties=properties or {}
    )
```

**3. Track AI Evaluations**

```python
# In api/evaluate_candidate.py
from api.analytics import track_event

def evaluate_candidate(job, candidate, user_id, provider='anthropic'):
    start_time = time.time()

    # Run evaluation
    result = ai_evaluator.evaluate(job, candidate, provider)
    duration_ms = (time.time() - start_time) * 1000

    # Track event
    track_event(user_id, 'ai_evaluation_completed', {
        'job_id': job['id'],
        'candidate_id': candidate['id'],
        'score': result['score'],
        'recommendation': result['recommendation'],
        'provider': provider,
        'model': result['model'],
        'cost': result['cost'],
        'duration_ms': duration_ms,
    })

    return result
```

---

### Stripe Webhooks (Revenue Tracking)

**1. Configure Webhook in Stripe Dashboard**

Events to track:
- `customer.subscription.created` → Track: `subscription_started`
- `invoice.payment_succeeded` → Track: `payment_charged`
- `customer.subscription.deleted` → Track: `subscription_cancelled`

**2. Webhook Handler**

```python
# api/webhooks/stripe.py
from flask import request
import stripe
from api.analytics import track_event

@app.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

    if event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        track_event(
            user_id=invoice['customer'],
            event_name='payment_charged',
            properties={
                'amount': invoice['amount_paid'] / 100,
                'currency': invoice['currency'],
                'status': 'success',
            }
        )

    return {'status': 'success'}, 200
```

---

### Privacy & Compliance

**GDPR Compliance:**
- ✅ Anonymize IP addresses in PostHog settings
- ✅ Add cookie consent banner (use `posthog.opt_out()` if declined)
- ✅ Provide data export/deletion in user settings
- ✅ Don't track PII (names, emails) in event properties (use user_id only)

**Example: Anonymize Properties**

```tsx
// ❌ Bad: Tracking PII
analytics.track('resume_uploaded', {
  candidate_name: 'John Doe',
  email: 'john@example.com',
});

// ✅ Good: Use IDs only
analytics.track('resume_uploaded', {
  candidate_id: 'cand_123',
  job_id: 'job_456',
});
```

---

## Success Criteria

### Week 1 (Analytics Setup)
- ✅ PostHog installed and configured
- ✅ All P0 events tracked in frontend
- ✅ Backend AI evaluation events tracked
- ✅ Dashboard showing real-time events

### Week 2 (Validation)
- ✅ 100+ events per day tracked
- ✅ Funnels configured (Landing → Signup → Activation)
- ✅ Cohort retention chart working
- ✅ No PII leaking in event properties

### Week 4 (Optimization)
- ✅ First A/B test running (landing page CTA)
- ✅ Weekly KPI review meeting scheduled
- ✅ Activation rate improving (baseline → target)

---

## Appendix

### Event Naming Conventions

**Format:** `object_action` (e.g., `user_signed_up`, `job_created`)

**Use past tense:** `evaluation_completed` (not `evaluation_complete`)

**Be specific:** `ai_evaluation_completed` (not `evaluation_done`)

### Property Naming Conventions

**Use snake_case:** `user_id`, `num_candidates`, `auth_method`

**Include units:** `duration_ms`, `cost_usd`, `file_size_mb`

**Use consistent IDs:** Always include `user_id`, `job_id` where relevant

### Sample Event JSON

```json
{
  "event": "ai_evaluation_completed",
  "properties": {
    "user_id": "user_abc123",
    "job_id": "job_xyz789",
    "candidate_id": "cand_456",
    "score": 87,
    "recommendation": "INTERVIEW",
    "provider": "anthropic",
    "model": "claude-3-5-haiku-20241022",
    "cost_usd": 0.003,
    "duration_ms": 8200,
    "timestamp": "2025-11-01T10:30:00Z"
  }
}
```

---

**Document Owner:** Product & Growth Lead
**Last Updated:** 2025-11-01
**Status:** Ready for implementation
