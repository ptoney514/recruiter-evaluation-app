# API Testing Guide - After Security Fixes

Quick reference for testing the API endpoints locally.

---

## Start the API Server

```bash
cd api
python3 dev_server.py 8000
# Output: Serving on port 8000...
```

API is now available at: `http://localhost:8000`

---

## Test 1: CORS Restrictions

### ✅ Allowed Origin (localhost:3000)

```bash
curl -X OPTIONS http://localhost:8000/api/evaluate_candidate \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Look for in response headers:
# Access-Control-Allow-Origin: http://localhost:3000
```

### ❌ Blocked Origin (unknown.com)

```bash
curl -X OPTIONS http://localhost:8000/api/evaluate_candidate \
  -H "Origin: http://unknown.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Response should NOT include Access-Control-Allow-Origin header
```

---

## Test 2: Content-Type Validation

### ❌ Missing Content-Type

```bash
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -d '{"job": {}, "candidate": {}}' \
  -v

# Response:
# 400 Bad Request
# {"error": "Content-Type must be application/json"}
```

### ✅ Correct Content-Type

```bash
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{"job": {"title": "Engineer"}, "candidate": {"name": "John"}}' \
  -v

# Will fail with missing data, but passes validation
```

---

## Test 3: Valid Request (Full Evaluation)

```bash
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{
    "stage": 1,
    "provider": "anthropic",
    "job": {
      "title": "Software Engineer",
      "department": "Engineering",
      "location": "Remote",
      "summary": "Looking for a skilled engineer with 5+ years of experience",
      "must_have_requirements": ["Python", "React", "AWS"],
      "preferred_requirements": ["TypeScript", "Docker"]
    },
    "candidate": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "text": "Senior Software Engineer with 7 years of experience. Expert in Python, React, and AWS. Proficient in TypeScript and Docker."
    }
  }' \
  -v
```

Expected response: 200 OK with evaluation results

---

## Test 4: Request Size Limit

### ❌ Payload Too Large (over 50MB)

```bash
# Create a large payload
python3 << 'EOF'
import requests
large_data = "x" * (51 * 1000 * 1000)  # 51MB
try:
    requests.post(
        'http://localhost:8000/api/evaluate_candidate',
        json={'data': large_data},
        headers={'Content-Type': 'application/json'},
        timeout=5
    )
except Exception as e:
    print(f"Error: {e}")
EOF

# Response: 413 Payload Too Large
```

---

## Test 5: Invalid JSON

### ❌ Malformed JSON

```bash
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{invalid json}' \
  -v

# Response:
# 400 Bad Request
# {"error": "Invalid JSON: ..."}
```

---

## Test All Endpoints

### 1. Parse Resume

```bash
curl -X POST http://localhost:8000/api/parse_resume \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "file_type": "pdf",
    "file_data": "'$(base64 < sample_resume.pdf)'"
  }' \
  -v
```

### 2. Evaluate with Regex

```bash
curl -X POST http://localhost:8000/api/evaluate_regex \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "job": {
      "title": "Engineer",
      "requirements": ["Python", "React", "AWS"]
    },
    "candidates": [
      {
        "name": "John",
        "text": "Python developer with 5 years experience using React and AWS"
      }
    ]
  }' \
  -v
```

### 3. Extract Job Info

```bash
curl -X POST http://localhost:8000/api/extract_job_info \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "job_description": "Senior Software Engineer, San Francisco, CA, $120k-$180k, Full-time. We seek a talented engineer with 5+ years experience."
  }' \
  -v
```

---

## Checking Headers in Browser

### Open DevTools → Network Tab

1. Go to `http://localhost:3000`
2. Open browser DevTools (F12)
3. Click "Network" tab
4. Trigger an API call in the app
5. Click on the request and check:
   - **Request Headers** → `Origin: http://localhost:3000`
   - **Response Headers** → `Access-Control-Allow-Origin: http://localhost:3000`

---

## Common Errors and Fixes

### "CORS error in browser"
- ❌ Origin not in whitelist
- ✅ Check that frontend is on `localhost:3000` or `localhost:5173`
- ✅ API server must be running on `localhost:8000`

### "400 Bad Request - Content-Type must be application/json"
- ❌ Request missing `Content-Type: application/json` header
- ✅ Add header to all POST requests

### "413 Payload Too Large"
- ❌ Request body exceeds 50MB
- ✅ Check file size, especially for base64-encoded files

### "Invalid JSON" error
- ❌ JSON is malformed
- ✅ Use `python3 -m json.tool` to validate: `cat file.json | python3 -m json.tool`

### "Content-Length header is required"
- ❌ Missing Content-Length header
- ✅ Most HTTP clients add this automatically; verify with `-v` flag

---

## Environment Variables

For local testing, no setup needed. Defaults are:
- Allowed origins: `localhost:3000`, `localhost:5173`, `localhost:8000`
- Max request size: 50MB
- Max API response timeout: 90 seconds (AI), 30 seconds (regex)

For production, set in Vercel Environment Variables:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Debugging Tips

### View API Logs
```bash
cd api
python3 dev_server.py 8000
# All requests and errors will be printed here
```

### Enable Verbose Curl
Add `-v` flag to curl commands to see:
- Request headers
- Response headers
- Response body

### Check Supabase Connection
```bash
curl -X GET https://vubmrgzakhyplxmhqugh.supabase.co/rest/v1/jobs \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Validate JSON
```bash
echo '{"test": "json"}' | python3 -m json.tool
```

---

## Next: Frontend Testing

Once API is working:

```bash
cd frontend
npm run dev
# Opens http://localhost:3000 in browser
```

Test the complete flow:
1. Sign up / Log in
2. Create a new role/job
3. Upload resumes
4. Run evaluations
5. Check console for any errors

---

## All Tests Passing? ✅

Great! Your API is secure and ready for:
- ✅ Local development
- ✅ Staging deployment
- ✅ Production deployment (with ALLOWED_ORIGINS env var)

See [FIXES_APPLIED.md](FIXES_APPLIED.md) for full details on what was fixed.
