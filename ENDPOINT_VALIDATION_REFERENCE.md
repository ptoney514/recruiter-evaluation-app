# Endpoint Validation Reference

Quick reference showing validation added to each endpoint.

---

## All Endpoints Now Include

```python
# 1. CORS origin whitelist (NOT wildcard *)
allowed_origins = get_allowed_origins()  # localhost:3000, localhost:5173, localhost:8000
origin = handler.headers.get('Origin', '')

if is_origin_allowed(origin, allowed_origins):
    handler.send_header('Access-Control-Allow-Origin', origin)  # ✅ Only allowed

# 2. Content-Type validation (must be application/json)
content_type = self.headers.get('Content-Type', '')
if 'application/json' not in content_type:
    self._send_error(400, 'Content-Type must be application/json')

# 3. Content-Length validation
content_length_header = self.headers.get('Content-Length')
if not content_length_header:
    self._send_error(400, 'Content-Length header is required')

try:
    content_length = int(content_length_header)
except ValueError:
    self._send_error(400, 'Content-Length must be a valid integer')

# 4. Size limit (50MB max)
MAX_BODY_SIZE = 50_000_000
if content_length > MAX_BODY_SIZE:
    self._send_error(413, f'Request body too large (max {MAX_BODY_SIZE} bytes)')

# 5. JSON parse error handling
try:
    data = json.loads(post_data.decode('utf-8'))
except json.JSONDecodeError as e:
    self._send_error(400, f'Invalid JSON: {str(e)}')
```

---

## Endpoint: /api/evaluate_candidate

**File:** `api/evaluate_candidate.py`

**What it does:** AI evaluation using Claude/OpenAI

**Validations Added:**
- ✅ Content-Type must be application/json
- ✅ Content-Length required and integer
- ✅ Max size 50MB
- ✅ JSON parse errors caught
- ✅ CORS origin whitelist
- ✅ API call error handling
- ✅ Response parsing error handling

**Test it:**
```bash
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "stage": 1,
    "job": {"title": "Engineer", "summary": "Senior role"},
    "candidate": {"name": "John", "text": "5 years experience..."}
  }'
```

---

## Endpoint: /api/parse_resume

**File:** `api/parse_resume.py`

**What it does:** Extract text from PDF/DOCX files

**Validations Added:**
- ✅ Content-Type must be application/json
- ✅ Content-Length required and integer
- ✅ Max size 50MB
- ✅ JSON parse errors caught
- ✅ CORS origin whitelist
- ✅ File format error handling

**Test it:**
```bash
# Convert PDF to base64 first
base64_pdf=$(base64 < your_resume.pdf)

curl -X POST http://localhost:8000/api/parse_resume \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d "{
    \"file_type\": \"pdf\",
    \"file_data\": \"$base64_pdf\"
  }"
```

---

## Endpoint: /api/evaluate_regex

**File:** `api/evaluate_regex.py`

**What it does:** Fast keyword matching (no AI cost)

**Validations Added:**
- ✅ Content-Type must be application/json
- ✅ Content-Length required and integer
- ✅ Max size 50MB
- ✅ JSON parse errors caught
- ✅ CORS origin whitelist

**Test it:**
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
      {"name": "John Doe", "text": "Python and React expert with AWS experience"}
    ]
  }'
```

---

## Endpoint: /api/extract_job_info

**File:** `api/extract_job_info.py`

**What it does:** Parse unstructured job descriptions

**Validations Added:**
- ✅ Content-Type must be application/json
- ✅ Content-Length required and integer
- ✅ Max size 50MB
- ✅ JSON parse errors caught
- ✅ CORS origin whitelist
- ✅ Job description required field validation

**Test it:**
```bash
curl -X POST http://localhost:8000/api/extract_job_info \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "job_description": "Senior Software Engineer, San Francisco, Full-time, $150k-$200k"
  }'
```

---

## Error Responses

### 400 Bad Request (Validation Errors)

**Missing Content-Type:**
```json
{
  "success": false,
  "error": "Content-Type must be application/json"
}
```

**Missing Content-Length:**
```json
{
  "success": false,
  "error": "Content-Length header is required"
}
```

**Invalid Content-Length:**
```json
{
  "success": false,
  "error": "Content-Length must be a valid integer"
}
```

**Invalid JSON:**
```json
{
  "success": false,
  "error": "Invalid JSON: Expecting value: line 1 column 1..."
}
```

### 413 Payload Too Large

**Payload exceeds 50MB:**
```json
{
  "success": false,
  "error": "Request body too large (max 50000000 bytes)"
}
```

### 500 Server Error

**API call or parsing failed:**
```json
{
  "success": false,
  "error": "API call failed: ..."
}
```

---

## CORS Behavior

### Preflight Request (OPTIONS)

**Browser sends:**
```
OPTIONS /api/evaluate_candidate HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
```

**API responds (if origin allowed):**
```
200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**API responds (if origin NOT allowed):**
```
200 OK
(no Access-Control-Allow-Origin header)
```

### Actual Request

**Browser sends:**
```
POST /api/evaluate_candidate HTTP/1.1
Origin: http://localhost:3000
Content-Type: application/json
```

**API responds (if origin allowed):**
```
200 OK
Access-Control-Allow-Origin: http://localhost:3000
```

**Browser behavior:**
- ✅ If CORS header present: Request succeeds, data accessible in JS
- ❌ If CORS header missing: Request succeeds on server but browser blocks JS access (CORS error in console)

---

## Environment Variables

### Development (Default)
No setup needed. Auto-allows these origins:
- http://localhost:3000 (Vite dev server)
- http://localhost:5173 (Vite default)
- http://127.0.0.1:3000
- http://127.0.0.1:5173
- http://localhost:8000 (API server)

### Production (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
```

The API will parse this comma-separated list and check all requests against it.

---

## Troubleshooting

### "Access to XMLHttpRequest has been blocked by CORS policy"

**Cause:** Origin not in whitelist

**Fix:**
- Verify frontend is on allowed origin (localhost:3000, localhost:5173)
- Check API server is running on localhost:8000
- Verify no typos in origin URL

**Debug:**
```bash
# Check what origin your browser is sending
curl -X OPTIONS http://localhost:8000/api/evaluate_candidate \
  -H "Origin: http://localhost:3000" \
  -v  # Look at response headers
```

### "400 Bad Request - Content-Type must be application/json"

**Cause:** Request missing Content-Type header

**Fix:**
- Add header to request: `-H "Content-Type: application/json"`
- Most HTTP libraries do this automatically
- Check if using fetch() with correct headers

**Debug:**
```bash
# Verify header is being sent
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

### "400 Bad Request - Content-Length header is required"

**Cause:** Request missing Content-Length header

**Fix:**
- Most HTTP libraries add this automatically
- If manually setting headers, ensure Content-Length is included
- Should be: byte size of request body

**Debug:**
```bash
# Check if Content-Length is being sent
curl -X POST http://localhost:8000/api/evaluate_candidate \
  -H "Content-Type: application/json" \
  -H "Content-Length: 15" \
  -d '{"test": "ok"}' \
  -v
```

### "413 Payload Too Large"

**Cause:** Request exceeds 50MB limit

**Fix:**
- Check file size if uploading resume/document
- For base64-encoded files, note they're ~33% larger than original
- Compress or reduce file size

**Example:**
- Original PDF: 30MB
- Base64 encoded: ~40MB (exceeds 50MB limit with other data)
- Solution: Limit to PDFs under 35MB

---

## Best Practices

1. **Always include headers:**
   ```bash
   -H "Content-Type: application/json"
   ```

2. **Validate requests before sending:**
   - Check Content-Type
   - Check Content-Length
   - Validate JSON syntax

3. **Handle errors gracefully:**
   - Check response status code
   - Read error message
   - Log for debugging

4. **Monitor in production:**
   - Check API logs for validation errors
   - Monitor parsing failures
   - Track error rates

---

## Summary

All 4 endpoints now have:
- ✅ Content-Type validation
- ✅ Content-Length validation
- ✅ Size limits (50MB)
- ✅ JSON parse error handling
- ✅ CORS origin whitelist
- ✅ Clear error messages

Development is unchanged. Everything works as before.
Production requires one environment variable for domain whitelist.
