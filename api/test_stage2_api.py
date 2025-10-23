"""
Test Script for Stage 2 API (Final Hiring Decision)
Tests the /api/evaluate_candidate endpoint with stage=2

Usage:
    python test_stage2_api.py

Requirements:
    - ANTHROPIC_API_KEY set in api/.env file
    - anthropic package installed: pip install anthropic
"""

import json
import os
import sys
from pathlib import Path

# Add parent directory to path to import the handler
sys.path.insert(0, str(Path(__file__).parent))


def load_env():
    """Load environment variables from .env file"""
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

    # Verify API key is set
    if not os.environ.get('ANTHROPIC_API_KEY') or os.environ.get('ANTHROPIC_API_KEY') == 'your-anthropic-api-key-here':
        print("❌ ERROR: ANTHROPIC_API_KEY not set in api/.env")
        print("Please edit api/.env and add your API key from https://console.anthropic.com/")
        sys.exit(1)
    else:
        print("✅ ANTHROPIC_API_KEY found")


# Test cases for Stage 2 evaluation
TEST_CASES = {
    "strong_hire": {
        "description": "Strong resume + Excellent interview + Positive references = STRONG HIRE",
        "payload": {
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
                "location": "San Francisco, CA",
                "current_title": "Senior Software Engineer",
                "current_company": "Tech Startup Inc.",
                "years_experience": 7
            },
            "resume_score": 88,  # Strong Stage 1 score
            "interview": {
                "overall_rating": 9,
                "recommendation": "STRONG HIRE",
                "red_flags": [],
                "notes": """
Sarah demonstrated exceptional technical depth in the interview. Her coding exercise
was clean, well-structured, and showed strong understanding of design patterns.

Key highlights:
- Solved the algorithmic challenge efficiently with O(n log n) solution
- Discussed trade-offs between different approaches thoughtfully
- Asked clarifying questions before diving into implementation
- Code was production-ready with proper error handling and edge cases
- System design discussion showed real-world experience with scaling challenges

Cultural fit:
- Collaborative communication style
- Growth mindset - acknowledged areas for improvement
- Excited about our tech stack and product mission
- Experience mentoring aligns with team needs

Technical assessment:
- Python expertise: 9/10
- System design: 8/10
- React/Frontend: 8/10
- Problem-solving: 9/10
- Communication: 9/10
""",
                "vs_resume_expectations": "Exceeded expectations - demonstrated deeper technical knowledge than resume suggested"
            },
            "references": [
                {
                    "reference_name": "Michael Torres",
                    "relationship": "Direct Manager at Tech Startup Inc.",
                    "overall_rating": 9,
                    "would_rehire": "Absolutely",
                    "strengths": "Outstanding technical skills, natural leader, proactive problem solver",
                    "areas_for_development": "Could delegate more - tends to take on too much",
                    "notes": "Sarah is one of the best engineers I've managed. She consistently delivers high-quality work and has mentored several junior engineers successfully."
                },
                {
                    "reference_name": "Jennifer Liu",
                    "relationship": "Tech Lead at Enterprise Corp (previous employer)",
                    "overall_rating": 8,
                    "would_rehire": "Yes",
                    "strengths": "Fast learner, reliable, great code quality",
                    "areas_for_development": "Was still developing system design skills when she left",
                    "notes": "Sarah was a solid mid-level engineer who grew quickly. She took feedback well and improved significantly during her time here."
                },
                {
                    "reference_name": "David Kim",
                    "relationship": "Peer Engineer at Tech Startup Inc.",
                    "overall_rating": 9,
                    "would_rehire": "Absolutely",
                    "strengths": "Collaborative, excellent communicator, mentors others naturally",
                    "areas_for_development": "Sometimes gets too focused on perfection over shipping",
                    "notes": "Sarah is the person everyone wants on their team. She makes everyone around her better."
                }
            ]
        },
        "expected": {
            "score_range": (85, 95),
            "recommendation": ["STRONG HIRE", "HIRE"],
            "confidence": ["High", "Medium"]
        }
    },

    "interview_reveals_concerns": {
        "description": "Good resume + Weak interview performance = DO NOT HIRE",
        "payload": {
            "stage": 2,
            "job": {
                "title": "Senior Software Engineer",
                "department": "Engineering",
                "location": "Remote",
                "employment_type": "Full-time"
            },
            "candidate": {
                "full_name": "Alex Johnson",
                "email": "alex.johnson@email.com",
                "location": "Remote",
                "current_title": "Software Engineer",
                "current_company": "Mid-Size Tech Co",
                "years_experience": 6
            },
            "resume_score": 78,  # Decent Stage 1 score
            "interview": {
                "overall_rating": 4,
                "recommendation": "DO NOT HIRE",
                "red_flags": ["Struggled with basic algorithms", "Couldn't explain past projects in depth", "Communication issues"],
                "notes": """
Alex struggled significantly in the technical interview. While the resume looked solid,
the interview revealed concerning gaps in technical depth and problem-solving ability.

Concerns:
- Could not solve a medium-difficulty coding challenge despite 6 years of experience
- When asked to explain previous projects, gave surface-level answers lacking technical detail
- Seemed unfamiliar with common design patterns mentioned on resume
- Communication was unclear and rambling when explaining thought process
- Defensive when given hints or feedback during coding exercise

Positive notes:
- Seemed motivated and enthusiastic about the role
- Has domain knowledge in our industry
- Brought interesting questions about the team and product

Technical assessment:
- Problem-solving: 4/10 (concerning)
- Code quality: 3/10 (poor)
- System design: 5/10 (weak)
- Communication: 4/10 (needs improvement)

Overall: Interview performance does not match resume. Would not recommend moving forward.
""",
                "vs_resume_expectations": "Significantly below expectations - technical skills claimed on resume not demonstrated in interview"
            },
            "references": [
                {
                    "reference_name": "Rachel Moore",
                    "relationship": "Manager at Mid-Size Tech Co",
                    "overall_rating": 6,
                    "would_rehire": "Maybe",
                    "strengths": "Reliable, meets deadlines, good team player",
                    "areas_for_development": "Needs more senior guidance on technical decisions, sometimes requires detailed direction",
                    "notes": "Alex is a solid contributor on well-defined tasks but struggles with ambiguous problems. Better suited for mid-level roles with clear guidance."
                },
                {
                    "reference_name": "Tom Wilson",
                    "relationship": "Tech Lead at Previous Company",
                    "overall_rating": 6,
                    "would_rehire": "Probably not",
                    "strengths": "Hard worker, willing to learn",
                    "areas_for_development": "Technical depth, independent problem-solving",
                    "notes": "Alex was okay but didn't grow as fast as we hoped. Left for a senior role elsewhere, which seemed premature."
                }
            ]
        },
        "expected": {
            "score_range": (40, 60),
            "recommendation": ["DO NOT HIRE", "KEEP SEARCHING"],
            "confidence": ["High", "Medium"]
        }
    },

    "mixed_signals": {
        "description": "Decent resume + Good interview + Mixed references = HIRE (but lower confidence)",
        "payload": {
            "stage": 2,
            "job": {
                "title": "Senior Backend Engineer",
                "department": "Engineering",
                "location": "New York, NY",
                "employment_type": "Full-time"
            },
            "candidate": {
                "full_name": "Marcus Williams",
                "email": "marcus.w@email.com",
                "location": "Brooklyn, NY",
                "current_title": "Backend Engineer",
                "current_company": "Startup XYZ",
                "years_experience": 5
            },
            "resume_score": 75,  # Borderline Stage 1 score
            "interview": {
                "overall_rating": 7,
                "recommendation": "HIRE",
                "red_flags": ["Limited leadership experience"],
                "notes": """
Marcus performed well in the technical interview, demonstrating solid backend engineering skills.
Some concerns about leadership for a senior role, but technical abilities are strong.

Strengths:
- Solved coding challenge efficiently with clean, testable code
- Good understanding of database optimization and API design
- Thoughtful about trade-offs and edge cases
- Asked good clarifying questions
- System design showed practical experience

Areas of concern:
- Limited mentoring or leadership experience for a senior role
- Hasn't worked on very large-scale systems (biggest was 100K users)
- Some gaps in distributed systems knowledge (learning opportunity)

Technical assessment:
- Backend engineering: 8/10 (strong)
- System design: 7/10 (good)
- Problem-solving: 7/10 (good)
- Communication: 7/10 (good)

Overall: Solid hire with growth potential. Could be strong senior engineer with mentorship.
""",
                "vs_resume_expectations": "Met expectations - skills on resume accurately reflected, though some gaps in senior-level experience"
            },
            "references": [
                {
                    "reference_name": "Lisa Chen",
                    "relationship": "Engineering Manager at Startup XYZ",
                    "overall_rating": 7,
                    "would_rehire": "Yes",
                    "strengths": "Strong technical skills, reliable, self-starter",
                    "areas_for_development": "Communication could be clearer, needs to build confidence in presenting ideas",
                    "notes": "Marcus is a solid engineer who delivers quality work. He's grown a lot here but still has room to develop senior-level skills like mentoring and architecture decisions."
                },
                {
                    "reference_name": "Kevin Park",
                    "relationship": "Senior Engineer at Previous Company",
                    "overall_rating": 6,
                    "would_rehire": "Unsure",
                    "strengths": "Good coder, learns quickly",
                    "areas_for_development": "Needed a lot of code review feedback, sometimes missed big-picture concerns",
                    "notes": "Marcus was fine but left after only 10 months. Seemed to be job-hopping for better titles. Technically competent but questioned commitment."
                },
                {
                    "reference_name": "Angela Davis",
                    "relationship": "Peer Engineer at Startup XYZ",
                    "overall_rating": 8,
                    "would_rehire": "Yes",
                    "strengths": "Great teammate, collaborative, helps others",
                    "areas_for_development": "Could take on more ownership of projects",
                    "notes": "Marcus is one of the most helpful people on the team. He's always willing to pair program or help debug issues. He'll be missed."
                }
            ]
        },
        "expected": {
            "score_range": (65, 80),
            "recommendation": ["HIRE", "KEEP SEARCHING"],
            "confidence": ["Medium", "Low"]
        }
    }
}


def simulate_http_request(payload):
    """
    Simulate HTTP POST request to the evaluate_candidate handler
    """
    from io import BytesIO
    from evaluate_candidate import handler

    class MockSocket:
        def makefile(self, mode):
            if 'r' in mode:
                # Request data
                request_line = b"POST /api/evaluate_candidate HTTP/1.1\r\n"
                headers = b"Content-Type: application/json\r\n"
                payload_bytes = json.dumps(payload).encode('utf-8')
                headers += f"Content-Length: {len(payload_bytes)}\r\n".encode('utf-8')
                headers += b"\r\n"
                return BytesIO(request_line + headers + payload_bytes)
            elif 'w' in mode:
                return BytesIO()
            else:
                return BytesIO()

    class MockServer:
        def __init__(self):
            self.server_address = ('localhost', 8000)

    # Create response capture
    response_capture = {
        'status': None,
        'headers': {},
        'body': BytesIO()
    }

    class ResponseCapturingHandler(handler):
        def setup(self):
            self.rfile = self.request.makefile('rb')
            self.wfile = response_capture['body']

        def send_response(self, code, message=None):
            response_capture['status'] = code

        def send_header(self, keyword, value):
            response_capture['headers'][keyword] = value

        def end_headers(self):
            pass

        def finish(self):
            # Override finish to prevent closing wfile
            pass

    # Create mock socket and server
    mock_socket = MockSocket()
    mock_server = MockServer()

    # Instantiate and call handler
    h = ResponseCapturingHandler(mock_socket, ('127.0.0.1', 8000), mock_server)

    # Parse response (capture before it can be closed)
    response_data = response_capture['body'].getvalue().decode('utf-8')
    return {
        'status': response_capture['status'],
        'headers': response_capture['headers'],
        'data': json.loads(response_data) if response_data else None
    }


def validate_response_structure(response_data, test_name):
    """
    Validate that the response has the expected Stage 2 structure
    """
    print(f"\n{'='*60}")
    print(f"Validating Response Structure: {test_name}")
    print(f"{'='*60}")

    required_fields = {
        'success': bool,
        'stage': int,
        'evaluation': dict,
        'usage': dict,
        'model': str
    }

    evaluation_fields = {
        'final_score': (int, float),
        'resume_weighted': (int, float),
        'interview_weighted': (int, float),
        'references_weighted': (int, float),
        'recommendation': str,
        'confidence': str,
        'interview_contradictions': list,
        'interview_confirmations': list,
        'reference_highlights': list,
        'reasoning': str
    }

    usage_fields = {
        'input_tokens': int,
        'output_tokens': int,
        'cost': float
    }

    errors = []

    # Check top-level fields
    for field, expected_type in required_fields.items():
        if field not in response_data:
            errors.append(f"❌ Missing field: {field}")
        elif not isinstance(response_data[field], expected_type):
            errors.append(f"❌ Wrong type for {field}: expected {expected_type.__name__}, got {type(response_data[field]).__name__}")
        else:
            print(f"✅ {field}: {expected_type.__name__}")

    # Check stage is 2
    if response_data.get('stage') != 2:
        errors.append(f"❌ Expected stage=2, got stage={response_data.get('stage')}")
    else:
        print(f"✅ stage: 2")

    # Check evaluation fields
    if 'evaluation' in response_data:
        print(f"\nEvaluation Fields:")
        for field, expected_types in evaluation_fields.items():
            if field not in response_data['evaluation']:
                errors.append(f"❌ Missing evaluation field: {field}")
            else:
                value = response_data['evaluation'][field]
                if isinstance(expected_types, tuple):
                    # Multiple acceptable types
                    if not isinstance(value, expected_types):
                        errors.append(f"❌ Wrong type for evaluation.{field}")
                    else:
                        if isinstance(value, list):
                            print(f"✅ {field}: list (length: {len(value)})")
                        elif isinstance(value, str):
                            print(f"✅ {field}: string (length: {len(value)} chars)")
                        else:
                            print(f"✅ {field}: {value}")
                else:
                    if not isinstance(value, expected_types):
                        errors.append(f"❌ Wrong type for evaluation.{field}")
                    else:
                        if isinstance(value, list):
                            print(f"✅ {field}: {expected_types.__name__} (length: {len(value)})")
                        elif isinstance(value, str):
                            print(f"✅ {field}: {expected_types.__name__} (length: {len(value)} chars)")
                        else:
                            print(f"✅ {field}: {value}")

    # Check usage fields
    if 'usage' in response_data:
        print(f"\nUsage Fields:")
        for field, expected_type in usage_fields.items():
            if field not in response_data['usage']:
                errors.append(f"❌ Missing usage field: {field}")
            elif not isinstance(response_data['usage'][field], (int, float)) if expected_type in [int, float] else not isinstance(response_data['usage'][field], expected_type):
                errors.append(f"❌ Wrong type for usage.{field}")
            else:
                print(f"✅ {field}: {response_data['usage'][field]}")

    if errors:
        print(f"\n❌ Validation Errors:")
        for error in errors:
            print(f"  {error}")
        return False
    else:
        print(f"\n✅ All fields validated successfully!")
        return True


def validate_stage2_scoring(evaluation, payload, expected):
    """
    Validate that Stage 2 scoring follows expected logic
    """
    print(f"\n{'='*60}")
    print(f"Validating Stage 2 Scoring Logic")
    print(f"{'='*60}")

    final_score = evaluation['final_score']
    recommendation = evaluation['recommendation']
    confidence = evaluation['confidence']

    print(f"Final Score: {final_score:.1f}/100")
    print(f"  - Resume (25%): {evaluation['resume_weighted']:.1f}")
    print(f"  - Interview (50%): {evaluation['interview_weighted']:.1f}")
    print(f"  - References (25%): {evaluation['references_weighted']:.1f}")
    print(f"\nRecommendation: {recommendation}")
    print(f"Confidence: {confidence}")

    print(f"\nExpected Score Range: {expected['score_range']}")
    print(f"Expected Recommendation: {expected['recommendation']}")

    # Check score is in expected range
    min_score, max_score = expected['score_range']
    if not (min_score <= final_score <= max_score):
        print(f"⚠️  Score {final_score:.1f} outside expected range {expected['score_range']}")
    else:
        print(f"✅ Score within expected range")

    # Check recommendation is valid
    if recommendation not in expected['recommendation']:
        print(f"⚠️  Recommendation '{recommendation}' not in expected {expected['recommendation']}")
    else:
        print(f"✅ Recommendation matches expected values")

    # Check confidence is valid
    if confidence not in expected['confidence']:
        print(f"⚠️  Confidence '{confidence}' not in expected {expected['confidence']}")
    else:
        print(f"✅ Confidence level is appropriate")

    # Verify weighted score calculation
    resume_score = payload['resume_score']
    interview_rating = payload['interview']['overall_rating'] * 10  # Convert to 0-100

    # Calculate reference average
    references = payload['references']
    if references:
        ref_ratings = [ref['overall_rating'] for ref in references]
        reference_rating = (sum(ref_ratings) / len(ref_ratings)) * 10
    else:
        reference_rating = 50

    expected_final = (resume_score * 0.25) + (interview_rating * 0.50) + (reference_rating * 0.25)

    print(f"\nWeighted Score Verification:")
    print(f"  Expected: (Resume {resume_score} × 0.25) + (Interview {interview_rating:.0f} × 0.50) + (Ref {reference_rating:.0f} × 0.25)")
    print(f"  Expected Final: {expected_final:.1f}")
    print(f"  Actual Final: {final_score:.1f}")

    if abs(final_score - expected_final) > 10:  # Allow 10 point variance for AI judgment
        print(f"⚠️  Final score {final_score:.1f} differs significantly from calculated {expected_final:.1f}")
    else:
        print(f"✅ Score calculation roughly matches expected")

    return True


def print_evaluation_summary(evaluation):
    """
    Print a formatted summary of the Stage 2 evaluation
    """
    print(f"\n{'='*60}")
    print(f"STAGE 2 EVALUATION SUMMARY")
    print(f"{'='*60}")

    print(f"\nFinal Score: {evaluation['final_score']:.1f}/100")
    print(f"Recommendation: {evaluation['recommendation']}")
    print(f"Confidence: {evaluation['confidence']}")

    print(f"\nWhere Interview Contradicted Resume:")
    if evaluation['interview_contradictions']:
        for i, item in enumerate(evaluation['interview_contradictions'], 1):
            print(f"  {i}. {item}")
    else:
        print(f"  (None)")

    print(f"\nWhere Interview Confirmed Resume:")
    if evaluation['interview_confirmations']:
        for i, item in enumerate(evaluation['interview_confirmations'], 1):
            print(f"  {i}. {item}")
    else:
        print(f"  (None)")

    print(f"\nReference Highlights:")
    if evaluation['reference_highlights']:
        for i, item in enumerate(evaluation['reference_highlights'], 1):
            print(f"  {i}. {item}")
    else:
        print(f"  (None)")

    print(f"\nReasoning:")
    # Word wrap reasoning at 80 chars
    words = evaluation['reasoning'].split()
    line = ""
    for word in words:
        if len(line) + len(word) + 1 > 80:
            print(f"  {line}")
            line = word
        else:
            line = f"{line} {word}" if line else word
    if line:
        print(f"  {line}")


def run_test(test_name, test_case):
    """
    Run a single Stage 2 test case
    """
    print(f"\n\n{'#'*60}")
    print(f"# TEST: {test_name}")
    print(f"# {test_case['description']}")
    print(f"{'#'*60}")

    # Display test payload summary
    payload = test_case['payload']
    print(f"\nJob: {payload['job']['title']}")
    print(f"Candidate: {payload['candidate']['full_name']} ({payload['candidate']['years_experience']} years exp)")
    print(f"Stage 1 Resume Score: {payload['resume_score']}/100")
    print(f"Interview Rating: {payload['interview']['overall_rating']}/10")
    print(f"Reference Checks: {len(payload['references'])}")

    # Make request
    print(f"\n⏳ Calling API endpoint...")
    response = simulate_http_request(payload)

    # Check status
    if response['status'] != 200:
        print(f"❌ Request failed with status {response['status']}")
        print(f"Response: {json.dumps(response['data'], indent=2)}")
        return False

    print(f"✅ API returned status 200")

    # Validate structure
    if not validate_response_structure(response['data'], test_name):
        return False

    # Validate scoring
    if not validate_stage2_scoring(response['data']['evaluation'], payload, test_case['expected']):
        return False

    # Print summary
    print_evaluation_summary(response['data']['evaluation'])

    # Print cost metrics
    usage = response['data']['usage']
    print(f"\n{'='*60}")
    print(f"COST & PERFORMANCE METRICS")
    print(f"{'='*60}")
    print(f"Input Tokens: {usage['input_tokens']:,}")
    print(f"Output Tokens: {usage['output_tokens']:,}")
    print(f"Total Cost: ${usage['cost']:.4f}")
    print(f"Model: {response['data']['model']}")

    return True


def main():
    """
    Main test runner
    """
    print("="*60)
    print("STAGE 2 API TEST SUITE")
    print("Testing /api/evaluate_candidate with stage=2")
    print("Final Hiring Decision (Interview + References)")
    print("="*60)

    # Load environment
    load_env()

    # Run tests
    results = {}
    for test_name, test_case in TEST_CASES.items():
        try:
            results[test_name] = run_test(test_name, test_case)
        except Exception as e:
            print(f"\n❌ Test '{test_name}' failed with exception:")
            print(f"   {str(e)}")
            import traceback
            traceback.print_exc()
            results[test_name] = False

    # Print summary
    print(f"\n\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")

    passed = sum(1 for result in results.values() if result)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nResults: {passed}/{total} tests passed")

    if passed == total:
        print(f"\n🎉 All Stage 2 tests passed!")
        return 0
    else:
        print(f"\n⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
