# 🚀 Supabase Cloud Production Setup Guide

## 📋 Pre-Setup Checklist

- [ ] Have your Anthropic API key ready
- [ ] Have a GitHub account (for OAuth if needed)
- [ ] Have access to your domain's DNS settings (for custom domain)
- [ ] Have your Vercel account ready for deployment

## 🔧 Step-by-Step Setup

### Step 1: Create Supabase Cloud Project

1. **Go to** [app.supabase.com](https://app.supabase.com)
2. **Click** "New project"
3. **Configure with these settings:**
   - **Name:** `resume-scanner-pro`
   - **Database Password:** Generate strong password (SAVE IT!)
   - **Region:** Choose closest to your users
   - **Pricing:** Start with Free tier

4. **Wait** ~2 minutes for provisioning
5. **Save these values:**
   ```
   Project URL: https://[YOUR-PROJECT-REF].supabase.co
   Anon Key: [Found in Settings → API]
   Service Role Key: [Found in Settings → API]
   ```

### Step 2: Configure Authentication

1. **Navigate to** Authentication → Settings
2. **Configure Email Auth:**
   ```
   ✅ Enable Email Signup
   ✅ Enable Email Confirmations
   ✅ Double Confirm Email Changes

   Password Requirements:
   - Minimum length: 8
   - Require: lower_upper_letters_digits
   ```

3. **Set Redirect URLs:**
   ```
   Site URL: https://your-domain.com

   Additional Redirect URLs:
   - http://localhost:3001
   - http://localhost:5173
   - https://your-domain.com/app
   - https://your-domain.com/auth/callback
   ```

4. **Configure Email Templates:**
   - Go to Authentication → Email Templates
   - Customize confirmation email:
   ```html
   <h2>Welcome to Resume Scanner Pro!</h2>
   <p>Please confirm your email to start evaluating candidates.</p>
   <a href="{{ .ConfirmationURL }}">Confirm Email</a>
   ```

5. **Set up Custom SMTP (Production):**
   ```
   Host: smtp.sendgrid.net (or your provider)
   Port: 587
   User: apikey
   Pass: [Your SendGrid API Key]
   Sender Email: noreply@your-domain.com
   Sender Name: Resume Scanner Pro
   ```

### Step 3: Push Migrations to Cloud

```bash
# 1. Link to cloud project
cd /Users/pernelltoney/My Projects/recruiter-evaluation-app
supabase link --project-ref [YOUR-PROJECT-REF]

# 2. Push migrations
supabase db push

# 3. Verify migrations
supabase db diff
```

### Step 4: Configure Storage

1. **Navigate to** Storage in Supabase Dashboard
2. **Verify** `resumes` bucket was created
3. **Check policies** are active (should be created by migration 006)
4. **Test upload** with a sample PDF

### Step 5: Set Up Row Level Security

1. **Navigate to** Authentication → Policies
2. **Verify all RLS policies** are enabled (created by migration 004)
3. **Test with SQL Editor:**
   ```sql
   -- Check RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

### Step 6: Configure Environment Variables

#### Frontend (.env.local)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application URLs
VITE_APP_URL=http://localhost:3001
VITE_API_URL=http://localhost:8000
```

#### API (.env)
```env
# AI Provider
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY

# Supabase (for server operations)
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
ALLOWED_ORIGINS=http://localhost:3001,https://your-domain.com
```

### Step 7: Deploy to Vercel

1. **Push code to GitHub**
2. **Import project** in Vercel
3. **Configure Build Settings:**
   ```
   Framework: Vite
   Build Command: cd frontend && npm run build
   Output Directory: frontend/dist
   Install Command: cd frontend && npm install
   ```

4. **Set Environment Variables** in Vercel:
   - All `VITE_*` variables from .env.local
   - Update URLs to production values

5. **Configure Serverless Functions:**
   ```
   Functions Directory: api/
   Python Version: 3.13
   ```

6. **Add API Environment Variables:**
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

## ✅ Verification Checklist

### 1. Database Verification
```sql
-- Run in SQL Editor
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. Authentication Testing
- [ ] Sign up with email works
- [ ] Email confirmation received
- [ ] Login works after confirmation
- [ ] Password reset works
- [ ] Redirect to /app after login

### 3. Storage Testing
- [ ] Upload PDF resume works
- [ ] File appears in user's folder
- [ ] Download URL works
- [ ] Delete file works
- [ ] Other users can't access files

### 4. RLS Testing
- [ ] User can only see their own jobs
- [ ] User can only see their own candidates
- [ ] User can only see their own evaluations
- [ ] Cross-user data isolation works

### 5. API Testing
```bash
# Test parse endpoint
curl -X POST http://localhost:8000/api/parse_resume \
  -H "Content-Type: application/json" \
  -d '{"file_content": "base64_pdf_here"}'

# Test evaluation endpoint
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{"stage": 1, "job": {...}, "candidate": {...}}'
```

## 🔒 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key NOT exposed to frontend
- [ ] CORS configured correctly
- [ ] Email verification required
- [ ] Strong password requirements
- [ ] API rate limiting configured
- [ ] SSL enabled (automatic on Supabase)

## 🚨 Common Issues & Solutions

### Issue: Migrations fail with "column already exists"
**Solution:** Our migrations use `IF NOT EXISTS` clauses. If still failing, check for conflicting migrations.

### Issue: RLS policies blocking all queries
**Solution:** Ensure user_id is being set when inserting records:
```javascript
const { data, error } = await supabase
  .from('jobs')
  .insert({ ...jobData, user_id: user.id });
```

### Issue: Storage uploads failing
**Solution:** Check file size (max 50MB) and MIME types (PDF, DOCX only)

### Issue: Email confirmations not arriving
**Solution:**
1. Check spam folder
2. Configure custom SMTP provider
3. Verify redirect URLs in Auth settings

### Issue: CORS errors on API calls
**Solution:** Update `ALLOWED_ORIGINS` in api/.env to include your domain

## 📊 Monitoring & Maintenance

### Daily Checks
- Monitor auth signups
- Check error logs
- Review API usage

### Weekly Tasks
- Review database performance
- Check storage usage
- Update dependencies

### Monthly Tasks
- Backup database
- Review security policies
- Audit user access logs

## 🆘 Support Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Discord:** [discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues:** Your repository issues
- **Status Page:** [status.supabase.com](https://status.supabase.com)

## 📝 Final Notes

1. **Start with Free Tier** - Upgrade when you hit limits
2. **Enable Backups** - Once on Pro plan
3. **Monitor Usage** - Set up alerts for quotas
4. **Test Everything** - Use staging environment first
5. **Document Changes** - Keep this guide updated

---

Created: November 5, 2024
Version: 1.0
Author: Supabase Dev Admin Agent