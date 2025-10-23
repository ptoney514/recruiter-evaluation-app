"""
Test Script for Stage 1 API (Resume Screening)
Tests the /api/evaluate_candidate endpoint with realistic data

Usage:
    python test_stage1_api.py

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

# Load environment variables from .env file
def load_env():
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

# Test payloads
TEST_CASES = {
    "strong_candidate": {
        "description": "Strong candidate who exceeds requirements",
        "payload": {
            "stage": 1,
            "job": {
                "title": "Senior Software Engineer",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "employment_type": "Full-time",
                "must_have_requirements": [
                    "5+ years of professional software development experience",
                    "Expert-level proficiency in Python",
                    "Production experience with React and modern frontend frameworks",
                    "Strong understanding of RESTful API design",
                    "Experience with SQL databases (PostgreSQL preferred)"
                ],
                "preferred_requirements": [
                    "AWS or cloud infrastructure experience",
                    "Experience with CI/CD pipelines",
                    "Open source contributions",
                    "Leadership or mentoring experience"
                ],
                "years_experience_min": 5,
                "years_experience_max": 10,
                "compensation_min": 140000,
                "compensation_max": 180000
            },
            "candidate": {
                "full_name": "Sarah Chen",
                "email": "sarah.chen@email.com",
                "location": "San Francisco, CA",
                "current_title": "Senior Software Engineer",
                "current_company": "Tech Startup Inc.",
                "years_experience": 7,
                "skills": ["Python", "React", "PostgreSQL", "AWS", "Docker", "Git", "CI/CD"],
                "resume_text": """
SARAH CHEN
Senior Software Engineer
San Francisco, CA | sarah.chen@email.com | linkedin.com/in/sarahchen

SUMMARY
Senior Software Engineer with 7 years of experience building scalable web applications.
Expert in Python, React, and cloud infrastructure. Strong track record of leading technical
initiatives and mentoring junior developers.

EXPERIENCE

Senior Software Engineer | Tech Startup Inc. | San Francisco, CA | 2020 - Present
- Led development of customer-facing dashboard using React and Python/FastAPI backend
- Architected and implemented RESTful API serving 50K+ daily active users
- Migrated legacy MySQL database to PostgreSQL, improving query performance by 40%
- Established CI/CD pipeline using GitHub Actions and AWS CodeDeploy
- Mentored 3 junior engineers, conducting code reviews and pair programming sessions
- Technologies: Python, React, PostgreSQL, AWS (EC2, RDS, S3), Docker, Redis

Software Engineer | Enterprise Corp | San Jose, CA | 2018 - 2020
- Developed internal tools using Python and Django framework
- Built data processing pipelines handling 1M+ records daily
- Implemented automated testing achieving 85% code coverage
- Collaborated with product team to define technical requirements
- Technologies: Python, Django, MySQL, Celery, RabbitMQ

Junior Software Engineer | Software Solutions Ltd. | Palo Alto, CA | 2017 - 2018
- Contributed to full-stack web application using React and Node.js
- Fixed bugs and implemented feature requests from customer feedback
- Participated in agile development process and daily standups
- Technologies: JavaScript, React, Node.js, MongoDB

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2017
GPA: 3.7/4.0

OPEN SOURCE
- Contributor to popular Python web framework (500+ commits)
- Maintainer of open source React component library (2K+ GitHub stars)

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
"""
            }
        },
        "expected": {
            "score_range": (85, 100),
            "recommendation": "ADVANCE TO INTERVIEW"
        }
    },

    "borderline_candidate": {
        "description": "Candidate with some gaps or concerns",
        "payload": {
            "stage": 1,
            "job": {
                "title": "Senior Software Engineer",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "employment_type": "Full-time",
                "must_have_requirements": [
                    "5+ years of professional software development experience",
                    "Expert-level proficiency in Python",
                    "Production experience with React and modern frontend frameworks",
                    "Strong understanding of RESTful API design",
                    "Experience with SQL databases (PostgreSQL preferred)"
                ],
                "preferred_requirements": [
                    "AWS or cloud infrastructure experience",
                    "Experience with CI/CD pipelines",
                    "Open source contributions"
                ],
                "years_experience_min": 5,
                "years_experience_max": 10,
                "compensation_min": 140000,
                "compensation_max": 180000
            },
            "candidate": {
                "full_name": "John Smith",
                "email": "john.smith@email.com",
                "location": "Remote",
                "current_title": "Software Engineer",
                "current_company": "Medium Corp",
                "years_experience": 4,
                "skills": ["Python", "JavaScript", "MySQL", "Git"],
                "resume_text": """
JOHN SMITH
Software Engineer
Remote | john.smith@email.com

EXPERIENCE

Software Engineer | Medium Corp | Remote | 2021 - Present
- Developed backend services using Python Flask
- Worked with MySQL databases and wrote SQL queries
- Fixed bugs and implemented features from Jira tickets
- Technologies: Python, Flask, MySQL, Git

Junior Developer | Small Company | Remote | 2020 - 2021
- Built internal tools with Python scripts
- Maintained legacy codebase
- Technologies: Python, SQLite

EDUCATION
B.A. in Information Systems | State University | 2019

SKILLS
Python, JavaScript, MySQL, Git, Linux
"""
            }
        },
        "expected": {
            "score_range": (60, 84),
            "recommendation": ["PHONE SCREEN FIRST", "DECLINE"]
        }
    }
}


def simulate_http_request(payload):
    """
    Simulate HTTP POST request to the evaluate_candidate handler
    """
    from io import BytesIO
    import socketserver

    # Import the handler
    from evaluate_candidate import handler

    # Create mock server and socket
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

    # Override wfile to capture response
    original_wfile = None

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

    # Create mock socket
    mock_socket = MockSocket()
    mock_server = MockServer()

    # Instantiate and call handler
    h = ResponseCapturingHandler(mock_socket, ('127.0.0.1', 8000), mock_server)

    # Parse response
    response_data = response_capture['body'].getvalue().decode('utf-8')
    return {
        'status': response_capture['status'],
        'headers': response_capture['headers'],
        'data': json.loads(response_data) if response_data else None
    }


def validate_response_structure(response_data, test_name):
    """
    Validate that the response has the expected structure
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
        'score': int,
        'qualifications_score': int,
        'experience_score': int,
        'risk_flags_score': int,
        'recommendation': str,
        'key_strengths': list,
        'key_concerns': list,
        'interview_questions': list,
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

    # Check evaluation fields
    if 'evaluation' in response_data:
        print(f"\nEvaluation Fields:")
        for field, expected_type in evaluation_fields.items():
            if field not in response_data['evaluation']:
                errors.append(f"❌ Missing evaluation field: {field}")
            elif not isinstance(response_data['evaluation'][field], expected_type):
                errors.append(f"❌ Wrong type for evaluation.{field}: expected {expected_type.__name__}, got {type(response_data['evaluation'][field]).__name__}")
            else:
                value = response_data['evaluation'][field]
                if isinstance(value, list):
                    print(f"✅ {field}: {expected_type.__name__} (length: {len(value)})")
                elif isinstance(value, str):
                    print(f"✅ {field}: {expected_type.__name__} (length: {len(value)} chars)")
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


def validate_scoring_logic(evaluation, expected):
    """
    Validate that scoring follows expected logic
    """
    print(f"\n{'='*60}")
    print(f"Validating Scoring Logic")
    print(f"{'='*60}")

    score = evaluation['score']
    recommendation = evaluation['recommendation']

    print(f"Score: {score}/100")
    print(f"Recommendation: {recommendation}")
    print(f"Expected Score Range: {expected['score_range']}")
    print(f"Expected Recommendation: {expected['recommendation']}")

    # Check score is in range
    min_score, max_score = expected['score_range']
    if not (min_score <= score <= max_score):
        print(f"❌ Score {score} outside expected range {expected['score_range']}")
        return False
    else:
        print(f"✅ Score within expected range")

    # Check recommendation matches score thresholds
    if score >= 85 and recommendation != "ADVANCE TO INTERVIEW":
        print(f"❌ Score {score} should recommend ADVANCE TO INTERVIEW, got {recommendation}")
        return False
    elif 70 <= score < 85 and recommendation != "PHONE SCREEN FIRST":
        print(f"⚠️  Score {score} typically suggests PHONE SCREEN FIRST, got {recommendation}")
    elif score < 70 and recommendation != "DECLINE":
        print(f"⚠️  Score {score} typically suggests DECLINE, got {recommendation}")
    else:
        print(f"✅ Recommendation aligns with score")

    # Check component scores
    print(f"\nComponent Scores:")
    print(f"  Qualifications: {evaluation['qualifications_score']}/100 (40% weight)")
    print(f"  Experience: {evaluation['experience_score']}/100 (40% weight)")
    print(f"  Risk Flags: {evaluation['risk_flags_score']}/100 (20% weight)")

    # Verify composite score calculation (approximate)
    calculated_score = (
        evaluation['qualifications_score'] * 0.4 +
        evaluation['experience_score'] * 0.4 +
        evaluation['risk_flags_score'] * 0.2
    )

    if abs(score - calculated_score) > 5:  # Allow 5 point variance
        print(f"⚠️  Score {score} differs from calculated {calculated_score:.1f}")
    else:
        print(f"✅ Score calculation verified (calculated: {calculated_score:.1f})")

    return True


def print_evaluation_summary(evaluation):
    """
    Print a formatted summary of the evaluation
    """
    print(f"\n{'='*60}")
    print(f"EVALUATION SUMMARY")
    print(f"{'='*60}")

    print(f"\nScore: {evaluation['score']}/100")
    print(f"Recommendation: {evaluation['recommendation']}")

    print(f"\nKey Strengths:")
    for i, strength in enumerate(evaluation['key_strengths'], 1):
        print(f"  {i}. {strength}")

    print(f"\nKey Concerns:")
    for i, concern in enumerate(evaluation['key_concerns'], 1):
        print(f"  {i}. {concern}")

    print(f"\nSuggested Interview Questions:")
    for i, question in enumerate(evaluation['interview_questions'], 1):
        print(f"  {i}. {question}")

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
    Run a single test case
    """
    print(f"\n\n{'#'*60}")
    print(f"# TEST: {test_name}")
    print(f"# {test_case['description']}")
    print(f"{'#'*60}")

    # Display test payload summary
    payload = test_case['payload']
    print(f"\nJob: {payload['job']['title']}")
    print(f"Candidate: {payload['candidate']['full_name']} ({payload['candidate']['years_experience']} years exp)")

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
    if not validate_scoring_logic(response['data']['evaluation'], test_case['expected']):
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
    print("STAGE 1 API TEST SUITE")
    print("Testing /api/evaluate_candidate with stage=1")
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
        print(f"\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
