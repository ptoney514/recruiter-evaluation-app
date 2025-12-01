# Workflow Guide

Quick reference for common tasks in Resume Scanner Pro.

---

## Starting Development

### 1. Start All Services (3 terminals)

**Terminal 1: Supabase**
```bash
supabase start
# Wait for: "supabase local development setup is running"
# Studio: http://localhost:54323
```

**Terminal 2: API Server**
```bash
cd api && python3 flask_server.py
# Wait for: "Running on http://localhost:8000"
```

**Terminal 3: Frontend**
```bash
cd frontend && npm run dev
# Wait for: "Local: http://localhost:3000"
```

### 2. Create Test Account
- Go to http://localhost:3000
- Click "Get Started"
- Sign up with: test@example.com / TestPassword123!
- You're now logged in

---

## Common Development Tasks

### Add a New Feature

1. **Plan** - Update PROJECT_STATUS.md with task description
2. **Create branch** - `git checkout -b feature/brief-description`
3. **Implement** - Write code following CLAUDE.md rules
4. **Test locally** - Run: `npm run test:run` (frontend) or tests exist
5. **Test in browser** - Verify auth flow, data persistence
6. **Commit** - Use conventional commits: `feat: Description`
7. **Update** - Update PROJECT_STATUS.md "In Progress" section

### Fix a Bug

1. **Identify** - Note exact error/reproduction steps
2. **Create branch** - `git checkout -b fix/bug-name`
3. **Debug** - Check browser console, API logs, database
4. **Fix** - Make minimal change to fix issue
5. **Test** - Verify fix doesn't break other features
6. **Commit** - Use: `fix: Description of what was wrong`
7. **Document** - Add to PROJECT_STATUS.md "Known Issues" if recurring

### Run Tests

**Frontend unit/integration tests:**
```bash
cd frontend && npm run test:run        # Run all
cd frontend && npm run test:run -- --watch   # Watch mode
```

**E2E tests (Playwright):**
```bash
cd frontend && npm run test:e2e        # Run all E2E tests
# Uses 3 projects: setup, chromium, chromium-auth
```

**Specific test file:**
```bash
cd frontend && npm run test:run -- resumeUploadService
```

---

## API Testing

### Test Evaluation Endpoint

```bash
# Set auth token
TOKEN="your-bearer-token-here"

# Test regex evaluation
curl -X POST http://localhost:8000/api/evaluate_regex \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Python, React, JavaScript",
    "job_requirements": ["Python", "JavaScript"]
  }'

# Test AI evaluation (costs Claude tokens!)
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": 1,
    "job": {"title": "Senior React Dev", "description": "..."},
    "candidate": {"name": "John", "resume_text": "..."},
    "provider": "anthropic",
    "model": "claude-3-5-haiku-20241022"
  }'
```

### Check API Health

```bash
curl http://localhost:8000/health
# Response: {"status": "ok", ...}
```

---

## Database Management

### View Data in Supabase Studio

1. Open http://localhost:54323
2. Select your project
3. Browse tables: jobs, candidates, evaluations, etc.

### Run Database Migrations

```bash
# Create new migration
supabase migration new "description_of_change"

# Apply migrations
supabase db push

# Reset database to clean state (WARNING: loses data)
supabase db reset
```

### Check Database Connection

```bash
# From psql:
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
\dt  # List tables
\q  # Quit
```

---

## Frontend Development Patterns

### Adding a New Page

1. Create file: `frontend/src/pages/NewPage.jsx`
2. Follow component structure:
   ```jsx
   import { useAuth } from '../hooks/useAuth'
   import { ProtectedRoute } from '../components/ProtectedRoute'

   export function NewPage() {
     const user = useAuth((state) => state.user)
     return <div>{/* content */}</div>
   }
   ```
3. Add route in `App.jsx`:
   ```jsx
   <Route path="/app/new-page" element={
     <ProtectedRoute><AppLayout><NewPage /></AppLayout></ProtectedRoute>
   } />
   ```

### Using Resume Upload Service

```javascript
import { processAndUploadResume } from '../services/resumeUploadService'

// In your component:
const handleFileUpload = async (file) => {
  try {
    const result = await processAndUploadResume(
      file,
      user.id,  // userId for Supabase Storage path
      { bucket: 'resumes' }
    )

    console.log('Processed:', {
      name: result.name,           // Extracted from filename
      text: result.text,           // Full resume text
      fileUrl: result.fileUrl,     // Supabase Storage URL
      uploadedAt: result.uploadedAt
    })
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}
```

### State Management Pattern

```javascript
// ✅ CORRECT - Use React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['candidates', jobId],
  queryFn: () => fetchCandidates(jobId)
})

// ❌ WRONG - Don't use useState for server data
const [candidates, setCandidates] = useState([])
useEffect(() => {
  // Causes cache issues, hard to keep in sync
  fetchCandidates().then(setCandidates)
}, [])
```

### Component File Structure

```
src/components/MyComponent/
├── MyComponent.jsx           # Component code
├── MyComponent.test.jsx      # Unit tests
└── index.js                  # Export
```

---

## Git Workflow

### Creating a Pull Request

1. **Update branch with main first:**
   ```bash
   git fetch origin
   git merge origin/main
   ```

2. **Run quality checks:**
   ```bash
   npm run lint
   npm run build
   npm run test:run
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: Description of change"
   git push origin feature-branch-name
   ```

4. **Create PR on GitHub:**
   ```bash
   gh pr create --title "feat: Description" --body "Details about change"
   ```

### Branch Naming

- Features: `feature/issue-123-description` or `feature/description`
- Fixes: `fix/issue-456-description` or `fix/description`
- Docs: `docs/api-guide`

---

## Debugging

### Frontend Issues

1. **Check browser console** - Most errors show here (F12)
2. **Check Network tab** - API errors, response codes
3. **Check Supabase logs** - http://localhost:54323 → Logs
4. **React DevTools** - Component state, props

### API Issues

1. **Check terminal output** - Flask server shows errors
2. **Check API response** - Use curl or Postman
3. **Check environment variables** - ANTHROPIC_API_KEY set?
4. **Check Supabase connection** - `supabase status`

### Authentication Issues

1. **Check auth token** - Browser DevTools → Application → Cookies
2. **Check Supabase Auth** - http://localhost:54323 → Auth → Users
3. **Check E2E fixtures** - `frontend/e2e/auth.setup.js`
4. **Clear localStorage** - `localStorage.clear()` in console

---

## Performance Optimization

### Check Performance

```bash
# Lighthouse audit
npm run build && npm run preview
# Then use Chrome DevTools → Lighthouse

# Bundle size
npm run build
# Check dist/ folder size
```

### Common Optimizations

- Lazy load components: `React.lazy(() => import('./Page'))`
- Memoize expensive calculations: `useMemo`
- Cache query results: React Query handles this
- Optimize images: Use appropriate formats/sizes

---

## Code Quality

### Formatting & Linting

```bash
cd frontend && npm run lint        # Check for issues
cd frontend && npm run lint:fix    # Auto-fix many issues
```

### Code Review Checklist

Before committing:
- [ ] Code follows CLAUDE.md patterns
- [ ] No `console.log` statements (except error logging)
- [ ] No commented-out code
- [ ] All imports used
- [ ] No magic numbers (extract to constants)
- [ ] Error handling in place
- [ ] Tests updated if behavior changed

---

## Session Management

### Starting a Session

1. Read [CLAUDE.md](CLAUDE.md) - Project architecture
2. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current status
3. Read "Next Session Goals" section
4. Start services (3 terminals)
5. Open http://localhost:3000

### Ending a Session

1. Update [PROJECT_STATUS.md](PROJECT_STATUS.md):
   - Move completed tasks from "In Progress" to "Completed"
   - Update blockers if any
   - Write "Next Session Goals"
2. Commit if changes made:
   ```bash
   git add PROJECT_STATUS.md
   git commit -m "docs: Update project status"
   git push
   ```
3. Note any issues discovered

---

## Useful Commands Quick Reference

```bash
# Development
npm run dev                    # Frontend dev server
supabase start               # Local Supabase
python3 flask_server.py      # API server

# Testing
npm run test:run             # Unit tests
npm run test:e2e             # E2E tests
npm run test:watch           # Watch mode

# Code Quality
npm run lint                 # Check linting
npm run lint:fix             # Auto-fix
npm run build                # Production build

# Database
supabase status              # Check status
supabase db reset            # Reset DB
supabase db push             # Apply migrations

# Git
git log --oneline -5         # Recent commits
git status                   # Current state
gh pr create                 # Create PR
```

---

## Resources

- [CLAUDE.md](CLAUDE.md) - Architecture & decisions
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current progress
- [Frontend /src](frontend/src/) - React components
- [API](api/) - Python backend
- [Supabase Studio](http://localhost:54323) - Database UI
