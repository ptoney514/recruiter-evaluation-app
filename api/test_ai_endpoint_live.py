#!/usr/bin/env python3
"""
Live integration test for AI evaluation endpoint
Tests the actual Flask server running on localhost:8000
"""
import requests
import json
import sys

API_URL = "http://localhost:8000/api/evaluate_candidate"

# Sample test data
test_payload = {
    "stage": 1,
    "job": {
        "title": "Senior Software Engineer",
        "summary": "Looking for an experienced software engineer",
        "requirements": [
            "5+ years of experience",
            "Python expertise",
            "React experience"
        ]
    },
    "candidate": {
        "name": "Test Candidate",
        "text": """
Test Candidate
Senior Software Engineer

EXPERIENCE
Senior Engineer at Tech Corp (2018-2025)
- 7 years of Python development
- Built React applications
- Led team of 3 engineers
        """
    }
}

def test_ai_endpoint():
    """Test the AI evaluation endpoint"""
    print("=" * 60)
    print("AI EVALUATION ENDPOINT - LIVE INTEGRATION TEST")
    print("=" * 60)
    print(f"\nTarget: {API_URL}")
    print(f"Testing with: {test_payload['candidate']['name']}")
    print(f"Job: {test_payload['job']['title']}")
    print("\n⏳ Calling API endpoint (this may take 30+ seconds)...")

    try:
        response = requests.post(
            API_URL,
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=120  # 2 minute timeout
        )

        print(f"\n✅ Response status: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ ERROR: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False

        data = response.json()

        # Validate response structure
        assert 'success' in data, "Missing 'success' field"
        assert data['success'] is True, f"success is False: {data}"
        assert 'evaluation' in data, "Missing 'evaluation' field"
        assert 'usage' in data, "Missing 'usage' field"

        evaluation = data['evaluation']
        usage = data['usage']

        # Validate evaluation structure
        print("\n" + "=" * 60)
        print("EVALUATION RESULT")
        print("=" * 60)
        print(f"Score: {evaluation.get('score')}/100")
        print(f"Recommendation: {evaluation.get('recommendation')}")
        print(f"Qualifications Score: {evaluation.get('qualifications_score')}")
        print(f"Experience Score: {evaluation.get('experience_score')}")
        print(f"Risk Flags Score: {evaluation.get('risk_flags_score')}")

        print(f"\nKey Strengths ({len(evaluation.get('key_strengths', []))}):")
        for strength in evaluation.get('key_strengths', []):
            print(f"  ✓ {strength}")

        print(f"\nKey Concerns ({len(evaluation.get('key_concerns', []))}):")
        for concern in evaluation.get('key_concerns', []):
            print(f"  ⚠ {concern}")

        print(f"\nInterview Questions ({len(evaluation.get('interview_questions', []))}):")
        for i, question in enumerate(evaluation.get('interview_questions', []), 1):
            print(f"  {i}. {question}")

        print(f"\n" + "=" * 60)
        print("USAGE METRICS")
        print("=" * 60)
        print(f"Input Tokens: {usage.get('input_tokens'):,}")
        print(f"Output Tokens: {usage.get('output_tokens'):,}")
        print(f"Total Cost: ${usage.get('cost'):.4f}")
        print(f"Model: {data.get('model')}")

        # Validate all required fields are present
        required_fields = ['score', 'qualifications_score', 'experience_score',
                          'risk_flags_score', 'recommendation', 'key_strengths',
                          'key_concerns', 'interview_questions', 'reasoning']

        for field in required_fields:
            assert field in evaluation, f"Missing required field: {field}"

        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n✓ Response structure is valid")
        print("✓ All required fields are present")
        print("✓ Evaluation data is properly formatted")
        print("✓ AI endpoint is working correctly")

        return True

    except requests.exceptions.Timeout:
        print("\n❌ ERROR: Request timed out after 120 seconds")
        print("This could mean:")
        print("  - The API server is not running")
        print("  - The Anthropic API is slow")
        print("  - There's a network issue")
        return False

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API server")
        print("Make sure the Flask server is running on http://localhost:8000")
        print("Run: cd api && FLASK_ENV=development python3 flask_server.py")
        return False

    except AssertionError as e:
        print(f"\n❌ ASSERTION ERROR: {e}")
        return False

    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_ai_endpoint()
    sys.exit(0 if success else 1)
