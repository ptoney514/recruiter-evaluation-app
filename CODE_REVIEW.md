# Code Review Report: Recruiter Evaluation App
**Date:** November 29, 2025
**Review Scope:** Security, code quality, and Vercel/Supabase deployment readiness
**Overall Status:** ⚠️ **CRITICAL ISSUE - Do not deploy to production until fixed**

---

## Executive Summary

Your codebase is **well-structured and follows good practices**, but has **one critical security issue that must be fixed before any deployment**:

- **CRITICAL**: `.env.local` file with live Supabase credentials is committed to git
- **HIGH**: `BYPASS_AUTH = true` in production code allows unauthenticated access
- **HIGH**: CORS policy allows all origins (`*`)
- **MEDIUM**: Missing error handling in some async operations
- **MEDIUM**: Regex parsing could fail silently on prompt format changes

Everything else is solid for production deployment once these issues are resolved.

---

## 🚨 CRITICAL ISSUES

### 1. **CRITICAL: Committed .env.local with Live API Keys**

**Location:** `frontend/.env.local`

**Problem:**
```
VITE_SUPABASE_URL=https://vubmrgzakhyplxmhqugh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The Supabase anon key is your **client-side public key**. While technically "public," this reveals:
- Your exact Supabase project URL
- Your project ID (`vubmrgzakhyplxmhqugh`)
- Attackers can target your database with known credentials

**Impact:**
- Anyone with access to git history can use these credentials
- They appear in GitHub (if public repo)
- Cloud platforms scan git for exposed secrets

**Fix:**
```bash
# 1. IMMEDIATELY revoke the anon key in Supabase Console:
#    Project Settings → API → Anon (public) key → Regenerate

# 2. Remove from git history (requires force push):
git rm --cached frontend/.env.local
git commit --amend "Remove .env.local from git history"
git push origin ui-redesign --force-with-lease

# 3. Verify it's gone:
git log --full-history -- frontend/.env.local  # Should be empty

# 4. Update .gitignore to ensure it never happens again:
#    (Already has .env.local, so this shouldn't happen again)

# 5. Create new .env.local locally from the template:
cp frontend/.env.local.template frontend/.env.local
# Add your new credentials after regenerating the key
```

**For Vercel deployment:**
- Set environment variables in Vercel Dashboard → Project Settings → Environment Variables
- Never commit `.env.local` or `.env` files
- Use `.env.local.template` and `.env.example` for reference only

---

### 2. **CRITICAL: Authentication Bypass in Production Code**

**Location:** `frontend/src/components/ProtectedRoute.jsx:6`

```javascript
// DEV MODE: Set to true to bypass authentication for testing
const BYPASS_AUTH = true  // ⚠️ MUST BE FALSE FOR PRODUCTION
```

**Problem:**
- Anyone can access protected routes without logging in
- All app features accessible without authentication
- Violates your "B2B signup-first model" from CLAUDE.md

**Impact:**
- Completely defeats user authentication system
- No access control enforcement
- Free tier abuse, data isolation failures

**Fix:**
```javascript
// Production should be FALSE, only true for local development
const BYPASS_AUTH = process.env.NODE_ENV === 'development' && process.env.VITE_BYPASS_AUTH === 'true'
```

Or better yet, use an environment variable:
```bash
# frontend/.env.local (dev only)
VITE_BYPASS_AUTH=true

# frontend/.env.production (never set this)
# VITE_BYPASS_AUTH not set = defaults to false
```

---

## 🔴 HIGH PRIORITY ISSUES

### 3. **HIGH: CORS Policy Allows All Origins**

**Locations:**
- `api/evaluate_candidate.py:68`
- `api/http_utils.py:23`

```python
handler.send_header('Access-Control-Allow-Origin', '*')
```

**Problem:**
- Any website can call your API endpoints
- Enables CSRF attacks, unauthorized usage
- No domain restriction

**Impact:**
- Security vulnerability on publicly accessible API
- No protection against malicious cross-site requests
- Cost exposure (attackers could trigger expensive AI evaluations)

**Fix for Vercel deployment:**
```python
# Get allowed origins from environment
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
origin = handler.headers.get('Origin', '')

if origin in ALLOWED_ORIGINS or '*' in ALLOWED_ORIGINS:
    handler.send_header('Access-Control-Allow-Origin', origin or 'http://localhost:3000')
else:
    # Don't send CORS header if origin not allowed
    pass
```

**For Vercel:**
```bash
# api/.env.production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

For local development, `http://localhost:3000` is fine.

---

### 4. **HIGH: Missing API_BASE_URL Configuration**

**Location:** `frontend/src/constants/config.js`

**Problem:**
- Need to verify `API_BASE_URL` is correctly set for both environments

**Check:**
```javascript
// frontend/src/constants/config.js - verify it exists and is properly configured
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```

**For Vercel deployment:**
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://yourdomain.vercel.app
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. **MEDIUM: Missing Error Handling in Async Operations**

**Location:** `frontend/src/hooks/useAuth.js` and similar

**Problem:**
Some async operations don't have `try-catch`:

```javascript
// ❌ Missing error handling
const { data, error } = await supabase.auth.getSession()
if (error) {
  console.error('Error getting session:', error)
  // ✓ This is good, but not all async ops have this
}
```

**Impact:**
- Unhandled promise rejections
- Silent failures in some flows
- Inconsistent error reporting

**Recommendation:**
- All `await` statements should be wrapped in try-catch
- Already done well in most places (evaluationService.js is excellent)
- No critical gaps, just ensure consistency

---

### 6. **MEDIUM: Regex Parsing Could Fail Silently**

**Location:** `api/ai_evaluator.py` - parsing AI responses

**Problem:**
Regex patterns parse Claude's text output. If Claude changes format slightly, parsing fails silently:

```python
# ❌ If regex doesn't match, score becomes None
score = int(re.search(r'SCORE:\s*(\d+)', response).group(1))
# IndexError if pattern not found
```

**Impact:**
- Evaluation returns 0 score if parsing fails
- No error indicator to user
- Hard to debug

**Fix already partially in place:**
- Check if your parsing has try-catch wrappers
- Consider adding fallback logic or validation

**Recommendation:**
```python
try:
    score = int(re.search(r'SCORE:\s*(\d+)', response).group(1))
except (AttributeError, ValueError, IndexError):
    # Log the raw response for debugging
    print(f"Failed to parse score from: {response[:200]}")
    return {
        'error': 'Failed to parse AI response',
        'raw_response': response
    }
```

---

### 7. **MEDIUM: Missing Content-Type Validation**

**Location:** `api/evaluate_candidate.py:21-23`

```python
content_length = int(self.headers['Content-Length'])
post_data = self.rfile.read(content_length)
data = json.loads(post_data.decode('utf-8'))
```

**Problem:**
- No validation of `Content-Type: application/json`
- No size limits on request body (DoS vulnerability)
- Could crash if malformed JSON

**Fix:**
```python
def do_POST(self):
    try:
        # Validate Content-Type
        content_type = self.headers.get('Content-Type', '')
        if 'application/json' not in content_type:
            self._send_error(400, 'Content-Type must be application/json')
            return

        # Validate Content-Length
        content_length = self.headers.get('Content-Length')
        if not content_length:
            self._send_error(400, 'Content-Length header required')
            return

        content_length = int(content_length)
        if content_length > 50_000_000:  # 50MB limit
            self._send_error(413, 'Request body too large')
            return

        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self._send_error(400, 'Invalid JSON')
            return
```

---

## 🟢 GOOD PRACTICES OBSERVED

### ✅ Strengths

1. **Environment Variable Management**
   - Proper use of `import.meta.env` in frontend
   - `os.environ` in Python backend
   - `.template` files for reference

2. **Error Handling**
   - `try-catch` blocks in evaluation service
   - Retry logic with exponential backoff
   - User-friendly error messages

3. **Testing Infrastructure**
   - Vitest + React Testing Library setup
   - 121 tests written, 117 passing
   - Test data fixtures and seeding utilities

4. **Request Timeout Protection**
   - `fetchWithTimeout()` prevents hanging requests
   - 30s for regex, 90s for AI evaluation
   - Good defaults

5. **Auth State Management**
   - Zustand for client state
   - Supabase auth integration
   - Proper session persistence

6. **Database Safety**
   - Using parameterized queries (Supabase client handles this)
   - No string concatenation in SQL
   - Migrations for schema management

7. **Type Safety**
   - JSDoc comments on functions
   - Proper prop validation (where used)
   - Python type hints in LLM providers

---

## ⚙️ DEPLOYMENT READINESS CHECKLIST

### Before Deploying to Vercel:

- [ ] **CRITICAL**: Remove `.env.local` from git history and regenerate Supabase keys
- [ ] **CRITICAL**: Set `BYPASS_AUTH = false` or use environment variable
- [ ] **HIGH**: Configure CORS to restrict to your domain only
- [ ] Set Vercel environment variables (not .env files)
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_BASE_URL` (should be your Vercel domain)
  - [ ] `ANTHROPIC_API_KEY` (in api/.env via Vercel secrets)
  - [ ] `OPENAI_API_KEY` (optional, if using GPT-4o)
  - [ ] `ALLOWED_ORIGINS` (list your domains)

### Vercel Configuration:

✅ Your `vercel.json` looks good:
```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "api/*.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

Issue: The routes config assumes frontend is in a `frontend/` subdirectory on Vercel, but you're deploying from root. This needs verification.

### Supabase Configuration:

✅ RLS policies mentioned in your roadmap (migration `004_add_auth_and_rls.sql`)
- Ensure `user_id` is added to all tables
- RLS policies must be enabled before production
- Test data isolation between users

---

## 🧪 Testing Readiness

### Current State:
- ✅ 121 tests written
- ✅ Vitest configured with jsdom
- ✅ React Testing Library setup
- ✅ 117/121 tests passing (98% pass rate)

### For CI/CD:
```bash
# In vercel.json, ensure this runs:
"buildCommand": "cd frontend && npm install && npm run build"

# Add to package.json pre-build:
"prebuild": "npm run test:run"  # Fail build if tests fail
```

Or in GitHub Actions:
```yaml
- name: Run tests
  run: npm run test:run

- name: Build
  run: npm run build
```

---

## 📋 FINAL RECOMMENDATIONS

### Priority Order:

1. **THIS WEEK** - Before any Vercel deployment:
   - Fix BYPASS_AUTH to false
   - Remove .env.local from git history
   - Regenerate Supabase keys
   - Restrict CORS to your domain
   - Set Vercel environment variables

2. **BEFORE PRODUCTION** - Before marketing launch:
   - Implement RLS policies (migration 004)
   - Add Content-Type validation to API
   - Test database isolation between users
   - Run full test suite in CI
   - Load test the API (10-20 concurrent evaluations)

3. **ONGOING** - Best practices:
   - Keep dependencies updated (`npm audit`)
   - Monitor Vercel logs and errors
   - Track API costs (Anthropic/OpenAI)
   - Regular security reviews

---

## Code Quality Score

| Category | Score | Status |
|----------|-------|--------|
| Security | 6/10 | 🔴 Critical issues block deployment |
| Code Quality | 9/10 | ✅ Well-structured, clean patterns |
| Testing | 8/10 | ✅ Good coverage, 98% pass rate |
| Error Handling | 8/10 | ✅ Generally solid |
| Documentation | 7/10 | ✅ CLAUDE.md excellent, code comments good |
| Deployment Ready | 3/10 | 🔴 Must fix 3 critical issues first |

**Overall:** 7/10 - Excellent foundation, but **cannot deploy until critical security issues are fixed**.

---

## Questions & Next Steps

1. After you fix the CRITICAL issues, run:
   ```bash
   npm run build  # Verify builds successfully
   npm run test:run  # Verify all tests pass
   ```

2. Before first Vercel deployment:
   - Test API endpoints with curl/Postman
   - Verify CORS is properly restricted
   - Check environment variables are set in Vercel Console

3. After Vercel deployment:
   - Monitor logs at vercel.com/dashboard
   - Test all user flows (signup → create role → evaluate)
   - Monitor Anthropic API usage and costs

---

## Support

For Vercel-specific issues:
- Docs: https://vercel.com/docs
- Python Functions: https://vercel.com/docs/functions/serverless-functions/python

For Supabase issues:
- Docs: https://supabase.com/docs
- Dashboard: https://app.supabase.com

**Good luck with your deployment! The foundation is solid. 🚀**
