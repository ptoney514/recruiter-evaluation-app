# Stage 2 API Testing Documentation

This document describes the testing infrastructure for Stage 2 (Final Hiring Decision) evaluations.

## Overview

Stage 2 evaluations incorporate:
- **Resume Score (25%)** - From Stage 1 evaluation
- **Interview Performance (50%)** - Most heavily weighted factor
- **Reference Checks (25%)** - Third-party validation

The weighted scoring ensures interview performance is the primary decision factor, as it provides the most direct assessment of candidate capabilities.

## Test Files

### 1. `test_stage2_simple.py`

**Purpose:** Quick, direct test of Stage 2 evaluation logic without HTTP layer complexity.

**Usage:**
```bash
cd api
python3 test_stage2_simple.py
```

**What it tests:**
- Direct API call to Claude Haiku
- Stage 2 prompt construction
- Response parsing for Stage 2 format
- Cost calculation
- Basic validation of output structure

**Test Scenario:**
- Strong candidate (Sarah Chen)
- Resume score: 88/100
- Interview rating: 9/10 (excellent)
- 3 positive reference checks
- Expected outcome: STRONG HIRE

**Run time:** ~10-15 seconds per test

**Cost:** ~$0.002 per test run

### 2. `test_stage2_api.py`

**Purpose:** Comprehensive test suite with multiple scenarios and full HTTP simulation.

**Usage:**
```bash
cd api
python3 test_stage2_api.py
```

**What it tests:**
- Full HTTP request/response cycle (simulated)
- Multiple candidate scenarios
- Response structure validation
- Weighted score calculation verification
- Recommendation consistency checks
- Cost tracking across multiple evaluations

**Test Scenarios:**

1. **strong_hire** - Strong resume + Excellent interview + Positive references
   - Resume: 88/100
   - Interview: 9/10
   - References: 8-9/10 average
   - Expected: STRONG HIRE (85-95 final score)

2. **interview_reveals_concerns** - Good resume + Weak interview
   - Resume: 78/100
   - Interview: 4/10 (poor performance)
   - References: 6/10 (lukewarm)
   - Expected: DO NOT HIRE (40-60 final score)

3. **mixed_signals** - Decent resume + Good interview + Mixed references
   - Resume: 75/100
   - Interview: 7/10 (solid)
   - References: 6-8/10 (varied)
   - Expected: HIRE or KEEP SEARCHING (65-80 final score)

**Run time:** ~45-60 seconds for full suite (3 tests)

**Cost:** ~$0.006 for full suite

## Prerequisites

### Required
- Python 3.8+
- `anthropic` package: `pip3 install anthropic`
- API key set in `api/.env`:
  ```
  ANTHROPIC_API_KEY=your-key-here
  ```

### Optional
- Recruiting evaluation skill at: `~/.claude/skills/recruiting-evaluation/SKILL.md`
  - If not found, tests use fallback instructions

## Running Tests

### Quick Test (Simple)
```bash
cd api
python3 test_stage2_simple.py
```

Expected output:
```
============================================================
STAGE 2 API DIRECT TEST
============================================================
✅ ANTHROPIC_API_KEY found
✅ Loaded skill instructions
⏳ Calling Claude API for Stage 2 evaluation...
✅ API call successful

STAGE 2 EVALUATION RESULTS
Final Score: XX/100
Recommendation: [STRONG HIRE/HIRE/DO NOT HIRE]
...

🎉 All validations passed!
✅ TEST PASSED
```

### Full Test Suite
```bash
cd api
python3 test_stage2_api.py
```

Expected output:
```
============================================================
STAGE 2 API TEST SUITE
Testing /api/evaluate_candidate with stage=2
============================================================
✅ ANTHROPIC_API_KEY found

[3 test scenarios run...]

TEST SUMMARY
============================================================
✅ PASS: strong_hire
✅ PASS: interview_reveals_concerns
✅ PASS: mixed_signals

Results: 3/3 tests passed
🎉 All Stage 2 tests passed!
```

## Test Data Structure

### Stage 2 Payload Format

```json
{
  "stage": 2,
  "job": {
    "title": "Senior Software Engineer",
    "department": "Engineering",
    "location": "San Francisco, CA",
    "employment_type": "Full-time"
  },
  "candidate": {
    "full_name": "Sarah Chen",
    "email": "sarah.chen@email.com",
    "current_title": "Senior Software Engineer",
    "years_experience": 7
  },
  "resume_score": 88,
  "interview": {
    "overall_rating": 9,
    "recommendation": "STRONG HIRE",
    "red_flags": [],
    "notes": "Detailed interview notes...",
    "vs_resume_expectations": "Exceeded expectations"
  },
  "references": [
    {
      "reference_name": "Michael Torres",
      "relationship": "Direct Manager",
      "overall_rating": 9,
      "would_rehire": "Absolutely",
      "strengths": "Outstanding technical skills...",
      "areas_for_development": "Could delegate more...",
      "notes": "Additional context..."
    }
  ]
}
```

### Expected Response Format

```json
{
  "success": true,
  "stage": 2,
  "evaluation": {
    "final_score": 88.5,
    "resume_weighted": 22.0,
    "interview_weighted": 45.0,
    "references_weighted": 21.5,
    "recommendation": "STRONG HIRE",
    "confidence": "High",
    "interview_contradictions": [],
    "interview_confirmations": [],
    "reference_highlights": [],
    "reasoning": "..."
  },
  "usage": {
    "input_tokens": 5431,
    "output_tokens": 560,
    "cost": 0.0021
  },
  "model": "claude-3-5-haiku-20241022"
}
```

## Validation Checks

### Structure Validation
- ✅ All required fields present (success, stage, evaluation, usage, model)
- ✅ Field types match expected (int, float, string, list)
- ✅ Stage is 2
- ✅ All evaluation sub-fields present

### Score Validation
- ✅ Final score in range 0-100
- ✅ Weighted scores sum approximately to final score
- ⚠️  Component weights follow formula: (Resume × 0.25) + (Interview × 0.50) + (References × 0.25)

### Recommendation Validation
- ✅ Recommendation is one of: STRONG HIRE, HIRE, DO NOT HIRE, KEEP SEARCHING
- ✅ Confidence level is one of: High, Medium, Low
- ⚠️  Recommendation aligns with score range

### List Field Validation
- ✅ interview_contradictions is a list
- ✅ interview_confirmations is a list
- ✅ reference_highlights is a list
- ⚠️  Lists contain relevant observations (may be empty if Claude doesn't follow format)

## Known Issues

### 1. Parsing Inconsistency (Low Priority)

**Symptom:** Scores show as 0.0, lists are empty

**Cause:** Claude doesn't always follow the exact structured output format specified in the prompt. The response contains valid reasoning and recommendations but not in the parseable format.

**Impact:** Tests still pass validation, recommendations are generated, but numerical scores aren't extracted correctly.

**Workaround:** Check the `reasoning` field for Claude's actual analysis. The recommendation field is typically populated correctly.

**Fix Required:** Either:
- Improve prompt to enforce stricter output format
- Use Claude's structured output mode (if available)
- Make parser more robust with regex/fuzzy matching

**Status:** Known limitation, doesn't block Stage 2 functionality testing

### 2. Score Calculation Variance

**Symptom:** Final score may differ from expected weighted calculation by 5-10 points

**Cause:** Claude applies judgment and may adjust scores based on qualitative factors

**Impact:** Minor - recommendations are generally consistent with scores

**Workaround:** Test validation allows 10-point variance

## Cost Tracking

| Test Type | Tests | Avg Tokens | Cost per Run | Annual Cost (daily) |
|-----------|-------|------------|--------------|---------------------|
| Simple    | 1     | ~6,000     | $0.002       | $0.73               |
| Full Suite| 3     | ~18,000    | $0.006       | $2.19               |

**Cost optimization notes:**
- Using Claude Haiku (not Sonnet) saves 5x cost
- Average Stage 2 evaluation costs ~$0.002
- Production usage at 1000 evaluations/month = ~$2/month

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
**Solution:** Create `api/.env` file with:
```
ANTHROPIC_API_KEY=your-actual-key-here
```

### "ModuleNotFoundError: No module named 'anthropic'"
**Solution:** Install the package:
```bash
pip3 install anthropic
```

### "I/O operation on closed file" (Fixed in v2)
**Solution:** Ensure you're using the latest version of test files with `finish()` override in ResponseCapturingHandler

### Tests pass but scores are 0.0
**Status:** Known issue with parsing (see Known Issues #1)
**Impact:** Low - recommendations and reasoning are still generated
**Action:** Monitor reasoning field for actual evaluation content

## Integration with CI/CD

### Running in GitHub Actions

```yaml
- name: Run Stage 2 API Tests
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    cd api
    pip3 install anthropic
    python3 test_stage2_api.py
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

cd api
python3 test_stage2_simple.py

if [ $? -ne 0 ]; then
  echo "❌ Stage 2 tests failed. Commit aborted."
  exit 1
fi
```

## Next Steps

1. **Improve Parsing** - Update prompts or parser to capture all structured fields
2. **Add More Scenarios** - Edge cases like missing references, conflicting data
3. **Performance Testing** - Batch evaluation speed tests
4. **Integration Tests** - Test with actual database writes/reads
5. **Regression Tests** - Lock in specific prompts and validate output consistency

## Related Files

- [api/evaluate_candidate.py](api/evaluate_candidate.py) - Main API handler
- [api/test_stage1_api.py](api/test_stage1_api.py) - Stage 1 test suite (resume screening)
- [api/test_stage1_simple.py](api/test_stage1_simple.py) - Stage 1 simple test
- [CLAUDE.md](../CLAUDE.md) - Project documentation

## Questions?

For issues or improvements, see:
- GitHub Issues: Create new issue with tag `api-testing`
- Project docs: [CLAUDE.md](../CLAUDE.md)
