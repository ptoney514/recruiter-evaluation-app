# Stage 1 API Testing Instructions

This document provides instructions for testing the Stage 1 Resume Screening API endpoint (`/api/evaluate_candidate`).

## Prerequisites

1. **Python 3.8+** installed
2. **Anthropic Python SDK** installed:
   ```bash
   pip install anthropic
   ```
3. **Anthropic API Key** from https://console.anthropic.com/

## Setup

### 1. Configure API Key

Edit the [api/.env](api/.env) file and replace the placeholder with your actual API key:

```bash
# api/.env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

### 2. Verify Setup

The test script will automatically check for the API key and notify you if it's missing.

## Running Tests

### Quick Start

Run the test suite from the `api` directory:

```bash
cd api
python test_stage1_api.py
```

### What the Tests Do

The test suite includes **2 test cases**:

1. **Strong Candidate Test**
   - Candidate with 7 years experience, matches all requirements
   - Expected score: 85-100
   - Expected recommendation: ADVANCE TO INTERVIEW
   - Tests that the API correctly identifies qualified candidates

2. **Borderline Candidate Test**
   - Candidate with 4 years experience, missing some requirements
   - Expected score: 60-84
   - Expected recommendation: PHONE SCREEN FIRST or DECLINE
   - Tests that the API identifies gaps and concerns

### Expected Output

The test script will:

1. ✅ Load and validate API key from `.env` file
2. ⏳ Call the API endpoint for each test case
3. ✅ Validate response structure (all required fields present)
4. ✅ Validate scoring logic (scores align with recommendations)
5. 📊 Display evaluation summary (strengths, concerns, questions)
6. 💰 Report cost and performance metrics

**Example Output:**

```
============================================================
STAGE 1 API TEST SUITE
Testing /api/evaluate_candidate with stage=1
============================================================
✅ ANTHROPIC_API_KEY found

############################################################
# TEST: strong_candidate
# Strong candidate who exceeds requirements
############################################################

Job: Senior Software Engineer
Candidate: Sarah Chen (7 years exp)

⏳ Calling API endpoint...
✅ API returned status 200

============================================================
Validating Response Structure: strong_candidate
============================================================
✅ success: bool
✅ stage: int
✅ evaluation: dict
✅ usage: dict
✅ model: str

Evaluation Fields:
✅ score: 92
✅ qualifications_score: 95
✅ experience_score: 90
✅ risk_flags_score: 88
✅ recommendation: ADVANCE TO INTERVIEW
✅ key_strengths: list (length: 5)
✅ key_concerns: list (length: 2)
✅ interview_questions: list (length: 3)
✅ reasoning: str (length: 450 chars)

Usage Fields:
✅ input_tokens: 1,234
✅ output_tokens: 456
✅ cost: 0.0029

✅ All fields validated successfully!

============================================================
EVALUATION SUMMARY
============================================================

Score: 92/100
Recommendation: ADVANCE TO INTERVIEW

Key Strengths:
  1. 7 years of experience exceeds minimum requirement
  2. Expert-level Python skills demonstrated
  3. Strong React and frontend experience
  4. AWS certification and cloud experience
  5. Open source contributions show technical leadership

Key Concerns:
  1. Verify depth of PostgreSQL optimization experience
  2. Confirm leadership experience beyond mentoring

Suggested Interview Questions:
  1. Can you walk me through the PostgreSQL migration you led?
  2. How do you approach mentoring junior developers?
  3. Describe a challenging architectural decision you made

============================================================
COST & PERFORMANCE METRICS
============================================================
Input Tokens: 1,234
Output Tokens: 456
Total Cost: $0.0029
Model: claude-3-5-haiku-20241022

============================================================
TEST SUMMARY
============================================================
✅ PASS: strong_candidate
✅ PASS: borderline_candidate

Results: 2/2 tests passed

🎉 All tests passed!
```

## Understanding the Results

### Response Structure

Each successful API call returns:

```json
{
  "success": true,
  "stage": 1,
  "evaluation": {
    "score": 85,
    "qualifications_score": 90,
    "experience_score": 85,
    "risk_flags_score": 80,
    "recommendation": "ADVANCE TO INTERVIEW",
    "key_strengths": ["strength 1", "strength 2"],
    "key_concerns": ["concern 1", "concern 2"],
    "interview_questions": ["question 1", "question 2", "question 3"],
    "reasoning": "Detailed explanation of scoring..."
  },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 456,
    "cost": 0.0029
  },
  "model": "claude-3-5-haiku-20241022"
}
```

### Scoring Logic (Stage 1)

- **Total Score**: 0-100 composite score
- **Components**:
  - Qualifications (40% weight): Skills match to requirements
  - Experience (40% weight): Years and relevance of experience
  - Risk Flags (20% weight): Job hopping, gaps, red flags

### Recommendation Thresholds

- **85-100**: ADVANCE TO INTERVIEW (strong match)
- **70-84**: PHONE SCREEN FIRST (some concerns, worth exploring)
- **0-69**: DECLINE (significant gaps or mismatches)

### Cost Metrics

- **Input tokens**: Size of job description + resume + prompt
- **Output tokens**: Length of evaluation response
- **Cost**: Calculated using Claude Haiku pricing
  - Input: $0.25 per million tokens
  - Output: $1.25 per million tokens
  - **Expected cost per evaluation: ~$0.003** (3/10 of a cent)

## Troubleshooting

### API Key Not Found

```
❌ ERROR: ANTHROPIC_API_KEY not set in api/.env
```

**Solution**: Edit [api/.env](api/.env) and add your API key from https://console.anthropic.com/

### Import Error

```
ModuleNotFoundError: No module named 'anthropic'
```

**Solution**: Install the Anthropic Python SDK:
```bash
pip install anthropic
```

### API Error Responses

If you see errors like:
- `401 Unauthorized`: API key is invalid
- `429 Too Many Requests`: Rate limit exceeded (wait a moment and retry)
- `500 Internal Server Error`: Check the error message for details

## Next Steps

After successfully running the tests:

1. ✅ Mark Issue #2 checklist items as complete
2. 📝 Document the actual cost observed (should be ~$0.003 per evaluation)
3. 🔄 Test error handling cases (see below)
4. 📊 Review evaluation quality and scoring accuracy

## Testing Error Handling (Optional)

To test error cases, you can modify the test script or make manual requests:

### Missing API Key
```bash
# Temporarily rename .env to test error handling
mv api/.env api/.env.backup
python test_stage1_api.py
# Should fail with API key error
mv api/.env.backup api/.env
```

### Invalid Stage
```python
payload = {
    "stage": 3,  # Invalid - only 1 or 2 allowed
    "job": {...},
    "candidate": {...}
}
```

### Missing Required Fields
```python
payload = {
    "stage": 1,
    # Missing job and candidate data
}
```

## Cost Estimation

Based on test data:
- **Per evaluation**: ~$0.003 (3/10 of a cent)
- **100 candidates**: ~$0.30
- **1,000 candidates**: ~$3.00
- **10,000 candidates**: ~$30.00

This is significantly cheaper than manual resume screening at typical recruiter hourly rates.
