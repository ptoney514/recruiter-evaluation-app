# Deployment Guide - Resume Scanner Pro
**Platform**: Vercel (Frontend + Serverless API) + Supabase (Database)
**Status**: Production Ready ✅
**Last Updated**: October 30, 2025

---

## Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All critical issues fixed (PR #26 merged)
- [x] Security improvements applied
- [x] Tests passing (31 new tests added)
- [x] Supabase integration complete
- [x] Authentication implemented
- [x] Documentation comprehensive

### 🔍 Pre-Flight Verification

Run these commands locally to ensure everything works:

```bash
# 1. Verify tests pass
cd frontend && npm run test:run
cd ../api && python3 -m unittest discover -s tests

# 2. Verify build succeeds
cd ../frontend && npm run build

# 3. Verify Supabase migrations
supabase db diff --schema public  # Should show no pending changes

# 4. Check for secrets in git
git log --all --full-history -- "*/.env"  # Should be empty
```

---

## Step 1: Set Up Production Supabase

### Option A: Supabase Cloud (Recommended)

#### 1.1 Create Supabase Project
```bash
# Visit: https://supabase.com/dashboard
# Click "New Project"
# Project Name: recruiter-evaluation-app
# Database Password: [Generate strong password]
# Region: Choose closest to your users
```

#### 1.2 Apply Migrations to Production
```bash
# Link to production project
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push

# Verify migrations applied
supabase db diff --schema public  # Should show "No schema changes detected"
```

**Migrations to Verify**:
- ✅ 001_initial_schema.sql - Core tables
- ✅ 002_interview_and_references.sql - Stage 2 tables
- ✅ 003_add_llm_provider_tracking.sql - LLM tracking

#### 1.3 Get Production Credentials

**From Supabase Dashboard → Settings → API**:
- `VITE_SUPABASE_URL` - Project URL (e.g., https://xyz.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Public anon key (safe for frontend)

**Save these for Step 3**

---

### Option B: Self-Hosted Supabase (Advanced)

```bash
# Deploy Supabase to your own infrastructure
# See: https://supabase.com/docs/guides/self-hosting

# Not recommended for MVP - adds operational overhead
```

---

## Step 2: Prepare Environment Variables

### 2.1 Required Variables

Create a `.env.production` file (DO NOT commit):

```env
# === API Keys (Backend) ===
ANTHROPIC_API_KEY=sk-ant-...                    # Get from console.anthropic.com
OPENAI_API_KEY=sk-proj-...                      # Get from platform.openai.com (optional)

# === Supabase (Frontend & Backend) ===
VITE_SUPABASE_URL=https://xyz.supabase.co       # From Supabase dashboard
VITE_SUPABASE_ANON_KEY=eyJhbGci...              # From Supabase dashboard

# === Optional ===
RECRUITING_SKILL_PATH=/var/task/skills/skill.md  # Custom skill path (if needed)
```

### 2.2 Verify No Secrets in Code

```bash
# Should return empty - no .env files in git
git ls-files | grep "\.env$"

# Verify .gitignore is working
git status --ignored | grep "\.env"
```

---

## Step 3: Deploy to Vercel

### 3.1 Link Vercel Project (First Time Only)

```bash
# Login to Vercel
vercel login

# Link repository to Vercel project
vercel link

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No (create new)
# - Project name: recruiter-evaluation-app
# - Directory: ./ (root)
```

### 3.2 Configure Environment Variables

**Option A: Via CLI**
```bash
# Add production secrets
vercel env add ANTHROPIC_API_KEY production
# Paste your key when prompted

vercel env add OPENAI_API_KEY production
# Paste your key when prompted

vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your Supabase anon key
```

**Option B: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for "Production" environment

**Required Variables**:
- `ANTHROPIC_API_KEY` (Sensitive)
- `OPENAI_API_KEY` (Sensitive, optional)
- `VITE_SUPABASE_URL` (Public)
- `VITE_SUPABASE_ANON_KEY` (Public)

**Optional Variables**:
- `RECRUITING_SKILL_PATH` (if using custom skill location)

### 3.3 Deploy

```bash
# Deploy to production
vercel --prod

# Or use Git integration (recommended)
git push origin main  # Vercel auto-deploys from main branch
```

**Expected Output**:
```
✅ Production: https://recruiter-evaluation-app.vercel.app [copied]
```

---

## Step 4: Verify Production Deployment

### 4.1 Check Build Logs

```bash
# View deployment logs
vercel logs --follow

# Or in dashboard:
# https://vercel.com/[your-account]/recruiter-evaluation-app/deployments
```

**Look for**:
- ✅ Frontend build successful
- ✅ API functions deployed (evaluate_candidate, evaluate_regex, parse_resume)
- ✅ No build errors
- ✅ Environment variables loaded

### 4.2 Test Production Endpoints

```bash
# Health check
curl https://recruiter-evaluation-app.vercel.app/api/health

# Test regex endpoint (no API key needed)
curl -X POST https://recruiter-evaluation-app.vercel.app/api/evaluate_regex \
  -H "Content-Type: application/json" \
  -d @api/tests/fixtures/test_request.json

# Test AI endpoint (uses API key)
curl -X POST https://recruiter-evaluation-app.vercel.app/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{
    "job": {"title": "Test Job", "requirements": ["Python"]},
    "candidate": {"name": "Test", "text": "Python developer with 5 years experience"},
    "provider": "anthropic"
  }'
```

### 4.3 Test Frontend

**Visit**: https://recruiter-evaluation-app.vercel.app

**Test Flow**:
1. ✅ Homepage loads
2. ✅ Job input form works
3. ✅ Resume upload works
4. ✅ AI evaluation works
5. ✅ Results display correctly
6. ✅ Export to PDF/Excel works
7. ✅ Sign up/login works
8. ✅ Data persists after login

### 4.4 Test Supabase Connection

**In Browser Console**:
```javascript
// Check Supabase connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

// Test connection
import { supabase } from './src/lib/supabase'
const { data, error } = await supabase.from('jobs').select('count')
console.log('Connection:', error ? 'Failed' : 'Success')
```

---

## Step 5: Configure Production Settings

### 5.1 Update Vercel Build Settings

**In Vercel Dashboard → Settings → General**:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `./` |
| Build Command | `cd frontend && npm install && npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install` (in frontend) |

### 5.2 Configure Python Runtime

**Already configured in vercel.json**:
```json
{
  "functions": {
    "api/**/*.py": {
      "runtime": "python3.13"
    }
  }
}
```

**Verify**: Check that `api/requirements.txt` has all dependencies:
```
anthropic==0.39.0
pdfplumber==0.11.0
python-docx==1.1.0
Pillow==10.2.0
openai>=1.0.0  # Optional
```

### 5.3 Configure CORS (Already Done)

**Verified in**: `api/http_utils.py` - ResponseHelper class includes CORS headers

---

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Add Custom Domain in Vercel

```bash
# Via CLI
vercel domains add resume-scanner.yourdomain.com

# Or via Dashboard:
# Settings → Domains → Add Domain
```

### 6.2 Configure DNS

**Add CNAME record at your DNS provider**:
```
Type: CNAME
Name: resume-scanner (or @)
Value: cname.vercel-dns.com
TTL: 3600
```

### 6.3 Enable HTTPS (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Step 7: Enable Production Features

### 7.1 Implement Row Level Security (RLS) - Recommended

**Create migration 004**:
```bash
# Create new migration
supabase migration new add_rls_policies

# Edit: supabase/migrations/004_add_rls_policies.sql
```

**Migration content**:
```sql
-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_rankings ENABLE ROW LEVEL SECURITY;

-- Add user_id column to jobs table
ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Policy: Users can only view their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only view candidates for their jobs
CREATE POLICY "Users can view own candidates" ON candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid()
    )
  );

-- Similar policies for evaluations, candidate_rankings
-- See: https://supabase.com/docs/guides/auth/row-level-security
```

**Apply to production**:
```bash
supabase db push
```

---

### 7.2 Configure Email (For Auth)

**In Supabase Dashboard → Authentication → Email Templates**:

Configure:
- Confirmation email template
- Password reset email template
- Magic link template (optional)

**SMTP Settings** (optional - use transactional email service):
```
Provider: SendGrid, Mailgun, or Postmark
SMTP Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API key]
```

---

### 7.3 Set Up Monitoring

#### Application Monitoring

**Vercel Analytics** (Free):
```bash
# In Vercel Dashboard:
# Analytics → Enable Web Analytics
```

**Supabase Logs**:
```bash
# View real-time logs
supabase logs --tail

# Or in Dashboard: Database → Logs
```

#### Error Tracking (Optional)

**Sentry** (recommended):
```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin

# Configure in frontend/src/main.jsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

---

## Step 8: Performance Optimization

### 8.1 Configure Vercel Caching

**Add headers in vercel.json**:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 8.2 Enable Compression

**Already enabled by default in Vercel** (gzip/brotli)

---

## Step 9: Post-Deployment Verification

### ✅ Deployment Checklist

After deploying, verify:

- [ ] Frontend loads at production URL
- [ ] API endpoints respond correctly
  - [ ] `/api/evaluate_candidate` works
  - [ ] `/api/evaluate_regex` works
  - [ ] `/api/parse_resume` works
- [ ] Supabase connection works
- [ ] Authentication flows work
  - [ ] Sign up creates user
  - [ ] Email confirmation sent (if configured)
  - [ ] Login works
  - [ ] Data migration works
- [ ] Storage modes work
  - [ ] Anonymous users → sessionStorage
  - [ ] Authenticated users → Supabase
- [ ] Export functions work
  - [ ] Export to PDF
  - [ ] Export to Excel
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone)

---

## Quick Deploy Commands

### First Time Deployment

```bash
# 1. Ensure you're on main branch with latest code
git checkout main
git pull

# 2. Link to Vercel (if not already linked)
vercel link

# 3. Set environment variables
vercel env add ANTHROPIC_API_KEY production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# 4. Deploy to production
vercel --prod
```

### Subsequent Deployments

```bash
# Option 1: Git-based (automatic)
git push origin main  # Vercel auto-deploys

# Option 2: Manual deploy
vercel --prod
```

---

## Deployment Troubleshooting

### Issue: Build Fails

**Check**:
```bash
# View build logs
vercel logs

# Test build locally
cd frontend && npm run build
```

**Common causes**:
- Missing dependencies in package.json
- TypeScript errors
- Environment variables not set

---

### Issue: API Functions Timeout

**Check**:
- API key is set correctly
- Claude/OpenAI API is accessible
- Request payload is valid
- Function timeout limit (default: 10s, max: 60s for Pro)

**Increase timeout** (Vercel Pro only):
```json
// vercel.json
{
  "functions": {
    "api/**/*.py": {
      "maxDuration": 30
    }
  }
}
```

---

### Issue: Supabase Connection Fails

**Check**:
```javascript
// In browser console
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20))
```

**Common causes**:
- Environment variables not set in Vercel
- Supabase project paused (free tier)
- Incorrect URL/key

**Fix**:
```bash
# Update environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Redeploy
vercel --prod
```

---

### Issue: Authentication Not Working

**Check Supabase Dashboard → Authentication → Settings**:
- Site URL: https://your-app.vercel.app
- Redirect URLs: https://your-app.vercel.app/**

**Update auth config**:
```bash
# In Supabase Dashboard → Authentication → URL Configuration
Site URL: https://recruiter-evaluation-app.vercel.app
Additional Redirect URLs:
  - https://recruiter-evaluation-app.vercel.app/auth/callback
  - http://localhost:3000 (for development)
```

---

## Environment-Specific Configuration

### Development
```env
# frontend/.env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci... (local key)

# api/.env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
```

### Production (Vercel Environment Variables)
```env
ANTHROPIC_API_KEY=sk-ant-... (production key)
OPENAI_API_KEY=sk-proj-... (production key)
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (production key)
```

---

## Cost Estimation

### Vercel Costs

**Hobby Plan** (Free):
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ❌ Limited to 10s function timeout
- ❌ No custom domains

**Pro Plan** ($20/month):
- ✅ Everything in Hobby
- ✅ 60s function timeout (needed for large batches)
- ✅ Custom domains
- ✅ Team collaboration
- ✅ Analytics

**Recommendation**: Start with Hobby, upgrade to Pro if needed

---

### Supabase Costs

**Free Tier**:
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ❌ Projects pause after 7 days inactivity

**Pro Plan** ($25/month):
- ✅ 8GB database
- ✅ 100GB file storage
- ✅ No pausing
- ✅ Daily backups

**Recommendation**: Free tier is sufficient for MVP

---

### AI API Costs

**Claude 3.5 Haiku** (default):
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- **Average**: ~$0.003 per evaluation

**OpenAI GPT-4o Mini** (optional):
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- **Average**: ~$0.001 per evaluation

**Example**: 1,000 evaluations/month = $3 (Haiku) or $1 (GPT-4o Mini)

---

## Security Best Practices

### Production Checklist

- [ ] **API Keys**: Never commit to git (verified ✅)
- [ ] **Environment Variables**: Set in Vercel dashboard
- [ ] **HTTPS**: Enforced by Vercel (automatic)
- [ ] **CORS**: Configured in API handlers (verified ✅)
- [ ] **RLS Policies**: Implement for multi-user security
- [ ] **Rate Limiting**: Already implemented in flask_server.py
- [ ] **Input Validation**: Already implemented in API handlers
- [ ] **CSP Headers**: Consider adding Content Security Policy

**Optional CSP Headers** (add to vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

---

## Rollback Plan

### If Deployment Fails

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
git checkout <previous-commit>
vercel --prod
```

### If Database Issue

```bash
# Rollback migration (local test first!)
supabase db reset

# Or restore from backup (Pro plan)
# Dashboard → Database → Backups → Restore
```

---

## Continuous Deployment

### Auto-Deploy from GitHub

**Vercel automatically deploys when you push to main**:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel detects push and deploys automatically
# View progress: https://vercel.com/dashboard
```

**Branch Previews**:
- Each PR gets a preview deployment
- Test before merging to main
- Automatic URL: `https://recruiter-evaluation-app-git-branch-name.vercel.app`

---

## Performance Monitoring

### Key Metrics to Track

**Vercel Analytics**:
- Page load time (target: <2s)
- API response time (target: <500ms excluding AI)
- Error rate (target: <1%)
- Traffic patterns

**Supabase Metrics**:
- Database connections
- Query performance
- Storage usage
- Active users

**AI Usage**:
- Evaluations per day
- Cost per evaluation
- Token usage trends
- Provider distribution (Claude vs OpenAI)

---

## Next Steps After Deployment

### Immediate (Week 1)

1. **Monitor Errors**
   - Check Vercel logs daily
   - Watch for API failures
   - Monitor Supabase errors

2. **Gather User Feedback**
   - Test with real users
   - Collect bug reports
   - Track feature requests

3. **Implement RLS**
   - Create migration 004
   - Test with multiple users
   - Deploy to production

---

### Short Term (Month 1)

1. **Refactor Large Components**
   - Split ResultsPage.jsx (972 lines)
   - Improve load times
   - Better maintainability

2. **Address xlsx Vulnerability**
   - Move Excel export to server-side
   - Or accept risk and document

3. **Add More Tests**
   - Frontend component tests
   - E2E tests with Playwright
   - Increase coverage to 80%+

---

### Long Term (Quarter 1)

1. **Advanced Features**
   - Evaluation history page
   - Jobs management dashboard
   - User profile settings
   - Team workspaces

2. **Mobile App**
   - iOS app with Supabase sync
   - Offline support
   - Push notifications

3. **Integrations**
   - ATS integrations
   - Calendar scheduling
   - Email notifications

---

## Deployment Command Summary

**One-time Setup**:
```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
supabase link --project-ref <your-project-ref>
supabase db push
```

**Deploy**:
```bash
git push origin main  # Auto-deploys via GitHub integration
# OR
vercel --prod  # Manual deploy
```

**Verify**:
```bash
curl https://your-app.vercel.app/api/health
```

---

## Support & Resources

**Vercel**:
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com/

**Supabase**:
- Dashboard: https://app.supabase.com/
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com/

**APIs**:
- Anthropic Console: https://console.anthropic.com/
- OpenAI Platform: https://platform.openai.com/

---

## Emergency Contacts

**If production goes down**:

1. Check Vercel status page
2. Check Supabase status page
3. View deployment logs: `vercel logs --follow`
4. Rollback if needed: `vercel rollback`
5. Contact support (Pro plan)

---

**Deployment Status**: 🚀 Ready to Deploy!

**Estimated Time**: 30-60 minutes for first deployment
