# Supabase Integration Guide

## Overview

The app now supports **hybrid storage**: anonymous users use sessionStorage, authenticated users use Supabase database.

## Setup Complete ✅

- ✅ Supabase CLI installed (v2.40.7)
- ✅ Local Supabase instance running (Docker)
- ✅ All migrations applied (001, 002, 003)
- ✅ Frontend environment configured ([frontend/.env.local](../frontend/.env.local))
- ✅ Supabase client created ([frontend/src/lib/supabase.js](../frontend/src/lib/supabase.js))
- ✅ Supabase service layer created ([frontend/src/services/storage/supabaseStore.js](../frontend/src/services/storage/supabaseStore.js))
- ✅ Hybrid storage manager created ([frontend/src/services/storage/storageManager.js](../frontend/src/services/storage/storageManager.js))

## Database Schema

### Tables
- **jobs** - Job postings with JSONB requirements
- **candidates** - Candidate profiles linked to jobs
- **evaluations** - AI evaluation results with LLM tracking
  - `llm_provider` - Provider used (anthropic, openai)
  - `llm_model` - Specific model (claude-3-5-haiku-20241022, gpt-4o-mini)
  - `claude_model` - (deprecated, kept for backwards compatibility)
- **candidate_rankings** - Manual ranking overrides
- **interview_ratings** - Stage 2 interview data
- **reference_checks** - Stage 2 reference data

## Services Running

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio (DB UI) | http://127.0.0.1:54323 |
| Inbucket (Email) | http://127.0.0.1:54324 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

## Usage in Components

### Using the Storage Manager (Recommended)

The storage manager automatically routes to sessionStorage or Supabase based on auth status:

```javascript
import { storageManager } from '@/services/storage/storageManager'

// Save evaluation (auto-routes to correct storage)
const result = await storageManager.saveEvaluation({
  job: jobData,
  resumes: resumesArray,
  aiResults: evaluationResults,
  provider: 'anthropic',
  model: 'claude-3-5-haiku-20241022'
})

// Get current evaluation
const current = await storageManager.getCurrentEvaluation()

// Get evaluation history (database only)
const history = await storageManager.getEvaluationHistory({ limit: 10 })

// Check storage info
const info = await storageManager.getStorageInfo()
// Returns: { mode: 'session'|'database', isAuthenticated, userId, ... }
```

### Using Supabase Directly (Advanced)

```javascript
import { supabaseStore } from '@/services/storage/supabaseStore'

// Save job
const job = await supabaseStore.saveJob({
  title: 'Senior Software Engineer',
  requirements: ['React', 'Node.js'],
  ...
})

// Save candidate
const candidate = await supabaseStore.saveCandidate(job.id, {
  name: 'John Doe',
  email: 'john@example.com',
  text: 'Resume text...'
})

// Save evaluation
const evaluation = await supabaseStore.saveEvaluation(
  candidate.id,
  job.id,
  evaluationResult,
  {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    inputTokens: 1500,
    outputTokens: 500,
    cost: 0.003
  }
)

// Get job with all evaluations
const jobWithEvals = await supabaseStore.getJobWithEvaluations(job.id)
```

### Using Session Storage (Anonymous Users)

```javascript
import { sessionStore } from '@/services/storage/sessionStore'

// Session storage for anonymous users
const evaluation = sessionStore.saveEvaluation(data)
const current = sessionStore.getCurrentEvaluation()
sessionStore.clearEvaluation()
```

## Migration from Session to Database

When a user logs in, migrate their session data:

```javascript
import { storageManager } from '@/services/storage/storageManager'

// After successful login
const result = await storageManager.migrateSessionToDatabase()
// Returns: { success: true, message: 'Data migrated successfully', data: {...} }
```

## Testing the Integration

### Browser Console Test

```javascript
// Import test function
import { testSupabaseSetup } from './test-supabase'

// Run test
await testSupabaseSetup()
// Output:
// 🧪 Supabase Setup Test
// 1. Checking configuration... ✓ Configured: true
// 2. Testing database connection... ✓ Connection: OK
// 3. Testing table access... ✓ Jobs table: Accessible
// ...
```

### Manual Database Queries

```bash
# Connect to database
docker exec -it supabase_db_recruiter-evaluation-app psql -U postgres

# Check tables
\dt

# View evaluations with LLM tracking
SELECT id, candidate_id, llm_provider, llm_model, overall_score, recommendation
FROM evaluations
LIMIT 5;

# Count evaluations by provider
SELECT llm_provider, COUNT(*)
FROM evaluations
GROUP BY llm_provider;
```

## Next Steps

To complete the integration, update these components:

1. **UploadResumesPage** - Save evaluations to storage manager
   - Replace direct sessionStore calls with storageManager

2. **ResultsPage** - Load from storage manager
   - Update to use storageManager.getCurrentEvaluation()

3. **Navigation** - Add history/jobs page
   - Show evaluation history for authenticated users
   - Allow viewing past evaluations

4. **Auth** - Add login/signup UI
   - Supabase Auth helpers already available
   - Trigger migration on login

5. **React Query** - Add data fetching hooks (per CLAUDE.md)
   - `useEvaluations()` hook
   - `useJobs()` hook
   - Cache management

## Supabase Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Check status
supabase status

# View logs
supabase logs

# Reset database (WARNING: deletes all data)
supabase db reset

# Create new migration
supabase migration new migration_name

# Apply migrations
docker exec -i supabase_db_recruiter-evaluation-app psql -U postgres < supabase/migrations/xxx.sql
```

## Environment Variables

### Development ([frontend/.env.local](../frontend/.env.local))
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Production (Vercel Environment Variables)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## Troubleshooting

### Supabase not starting
```bash
# Stop any conflicting instances
supabase stop --project-id tne-2025

# Start again
supabase start
```

### Port conflicts
Edit [supabase/config.toml](../supabase/config.toml):
```toml
[api]
port = 54321

[db]
port = 54322

[studio]
port = 54323
```

### Migration issues
```bash
# Check which migrations are applied
docker exec supabase_db_recruiter-evaluation-app psql -U postgres -c "SELECT version, name FROM supabase_migrations.schema_migrations;"

# Manually apply migration
docker exec -i supabase_db_recruiter-evaluation-app psql -U postgres < supabase/migrations/003_add_llm_provider_tracking.sql
```

### Connection issues in browser
1. Verify Supabase is running: `supabase status`
2. Check environment variables loaded: `console.log(import.meta.env.VITE_SUPABASE_URL)`
3. Test connection: `import { testConnection } from './lib/supabase'; await testConnection()`

## Security Notes

- Local credentials are safe to commit (demo tokens)
- Production credentials must be environment variables (never commit)
- Anonymous users get read/write via RLS policies (to be implemented)
- Authenticated users get full access to their own data
- Row Level Security (RLS) policies coming in migration 004

## Resources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
