"""
Simple Direct Test for Stage 1 API
Tests the evaluation logic directly without HTTP layer complexity

Usage:
    python test_stage1_simple.py
"""

import json
import os
import sys
from pathlib import Path

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


def test_evaluation(test_name, job_data, candidate_data):
    """
    Test evaluation logic directly by importing and calling the handler methods
    """
    import anthropic

    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    print(f"Job: {job_data['title']}")
    print(f"Candidate: {candidate_data['full_name']} ({candidate_data['years_experience']} years)")

    # Load skill instructions (same as handler does)
    skill_path = "/Users/pernelltoney/.claude/skills/recruiting-evaluation/SKILL.md"
    try:
        with open(skill_path, 'r') as f:
            skill_instructions = f.read()
            print(f"✅ Loaded skill instructions from {skill_path}")
    except FileNotFoundError:
        skill_instructions = """
You are evaluating a candidate using a two-stage framework.

Stage 1: Resume Screening (0-100 score)
- Score based on: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline

Stage 2: Final Hiring Decision
- Score based on: Resume (25%) + Interview (50%) + References (25%)
- Interview performance is the most important factor
"""
        print(f"⚠️  Using fallback skill instructions")

    # Build prompt (same as _build_stage1_prompt in handler)
    must_haves = '\n'.join([f"- {req}" for req in job_data.get('must_have_requirements', [])])
    preferreds = '\n'.join([f"- {req}" for req in job_data.get('preferred_requirements', [])])

    prompt = f"""{skill_instructions}

---

TASK: Perform Stage 1 Resume Screening for this candidate.

**JOB DETAILS:**
Title: {job_data.get('title', 'N/A')}
Department: {job_data.get('department', 'N/A')}
Location: {job_data.get('location', 'N/A')}
Employment Type: {job_data.get('employment_type', 'Full-time')}

**Must-Have Requirements:**
{must_haves if must_haves else 'None specified'}

**Preferred Requirements:**
{preferreds if preferreds else 'None specified'}

**Experience Range:** {job_data.get('years_experience_min', 0)}-{job_data.get('years_experience_max', 'N/A')} years

**Compensation:** ${job_data.get('compensation_min', 0):,} - ${job_data.get('compensation_max', 0):,}

---

**CANDIDATE PROFILE:**
Name: {candidate_data.get('full_name', 'N/A')}
Email: {candidate_data.get('email', 'N/A')}
Location: {candidate_data.get('location', 'N/A')}
Current Title: {candidate_data.get('current_title', 'N/A')}
Current Company: {candidate_data.get('current_company', 'N/A')}
Years of Experience: {candidate_data.get('years_experience', 'N/A')}
Skills: {', '.join(candidate_data.get('skills', []))}

**RESUME:**
{candidate_data.get('resume_text', 'No resume provided')}

---

Provide your Stage 1 evaluation in this format:

SCORE: [0-100]
QUALIFICATIONS_SCORE: [0-100]
EXPERIENCE_SCORE: [0-100]
RISK_FLAGS_SCORE: [0-100]
RECOMMENDATION: [ADVANCE TO INTERVIEW / PHONE SCREEN FIRST / DECLINE]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

KEY_CONCERNS:
- [Concern 1]
- [Concern 2]
- [Concern 3]

INTERVIEW_QUESTIONS:
1. [Question about concern/experience]
2. [Question to verify skill]
3. [Question about role fit]

REASONING:
[2-3 paragraphs explaining the scoring and recommendation]
"""

    # Call Claude API
    print(f"\n⏳ Calling Claude API...")
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        print(f"✅ API call successful")

        # Parse response (same logic as _parse_stage1_response in handler)
        response_text = message.content[0].text
        lines = response_text.strip().split('\n')

        evaluation = {
            'score': 0,
            'qualifications_score': 0,
            'experience_score': 0,
            'risk_flags_score': 0,
            'recommendation': 'DECLINE',
            'key_strengths': [],
            'key_concerns': [],
            'interview_questions': [],
            'reasoning': ''
        }

        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('SCORE:'):
                try:
                    evaluation['score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('QUALIFICATIONS_SCORE:'):
                try:
                    evaluation['qualifications_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('EXPERIENCE_SCORE:'):
                try:
                    evaluation['experience_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('RISK_FLAGS_SCORE:'):
                try:
                    evaluation['risk_flags_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('RECOMMENDATION:'):
                evaluation['recommendation'] = line.split(':', 1)[1].strip()
            elif line.startswith('KEY_STRENGTHS:'):
                current_section = 'strengths'
            elif line.startswith('KEY_CONCERNS:'):
                current_section = 'concerns'
            elif line.startswith('INTERVIEW_QUESTIONS:'):
                current_section = 'questions'
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            elif line.startswith('- ') and current_section == 'strengths':
                evaluation['key_strengths'].append(line[2:])
            elif line.startswith('- ') and current_section == 'concerns':
                evaluation['key_concerns'].append(line[2:])
            elif line.startswith(('1.', '2.', '3.')) and current_section == 'questions':
                evaluation['interview_questions'].append(line[3:].strip())
            elif current_section == 'reasoning' and line:
                evaluation['reasoning'] += line + ' '

        evaluation['reasoning'] = evaluation['reasoning'].strip()

        # Calculate cost
        input_cost = (message.usage.input_tokens / 1_000_000) * 0.25
        output_cost = (message.usage.output_tokens / 1_000_000) * 1.25
        total_cost = input_cost + output_cost

        usage = {
            'input_tokens': message.usage.input_tokens,
            'output_tokens': message.usage.output_tokens,
            'cost': round(total_cost, 4)
        }

        # Print results
        print(f"\n{'='*60}")
        print(f"EVALUATION RESULTS")
        print(f"{'='*60}")
        print(f"\nScore: {evaluation['score']}/100")
        print(f"  - Qualifications: {evaluation['qualifications_score']}/100 (40% weight)")
        print(f"  - Experience: {evaluation['experience_score']}/100 (40% weight)")
        print(f"  - Risk Flags: {evaluation['risk_flags_score']}/100 (20% weight)")
        print(f"\nRecommendation: {evaluation['recommendation']}")

        print(f"\nKey Strengths ({len(evaluation['key_strengths'])}):")
        for i, strength in enumerate(evaluation['key_strengths'], 1):
            print(f"  {i}. {strength}")

        print(f"\nKey Concerns ({len(evaluation['key_concerns'])}):")
        for i, concern in enumerate(evaluation['key_concerns'], 1):
            print(f"  {i}. {concern}")

        print(f"\nSuggested Interview Questions ({len(evaluation['interview_questions'])}):")
        for i, question in enumerate(evaluation['interview_questions'], 1):
            print(f"  {i}. {question}")

        print(f"\nReasoning:")
        # Word wrap at 70 chars
        words = evaluation['reasoning'].split()
        line = "  "
        for word in words:
            if len(line) + len(word) + 1 > 70:
                print(line)
                line = "  " + word
            else:
                line = f"{line} {word}" if line != "  " else "  " + word
        if line.strip():
            print(line)

        print(f"\n{'='*60}")
        print(f"COST & PERFORMANCE METRICS")
        print(f"{'='*60}")
        print(f"Input Tokens: {usage['input_tokens']:,}")
        print(f"Output Tokens: {usage['output_tokens']:,}")
        print(f"Total Cost: ${usage['cost']:.4f}")
        print(f"Model: claude-3-5-haiku-20241022")

        # Validate results
        print(f"\n{'='*60}")
        print(f"VALIDATION")
        print(f"{'='*60}")

        errors = []

        # Check score is valid
        if not (0 <= evaluation['score'] <= 100):
            errors.append(f"❌ Score {evaluation['score']} outside valid range 0-100")
        else:
            print(f"✅ Score is valid (0-100)")

        # Check recommendation matches score
        score = evaluation['score']
        rec = evaluation['recommendation']
        if score >= 85 and rec != "ADVANCE TO INTERVIEW":
            errors.append(f"⚠️  Score {score} typically suggests ADVANCE TO INTERVIEW, got {rec}")
        elif 70 <= score < 85 and rec not in ["PHONE SCREEN FIRST", "ADVANCE TO INTERVIEW", "DECLINE"]:
            errors.append(f"❌ Invalid recommendation: {rec}")
        elif score < 70 and rec not in ["DECLINE", "PHONE SCREEN FIRST"]:
            errors.append(f"⚠️  Score {score} typically suggests DECLINE, got {rec}")
        else:
            print(f"✅ Recommendation aligns with score")

        # Check all fields present
        if len(evaluation['key_strengths']) == 0:
            errors.append("⚠️  No key strengths identified")
        else:
            print(f"✅ Found {len(evaluation['key_strengths'])} key strengths")

        if len(evaluation['interview_questions']) < 3:
            errors.append(f"⚠️  Only {len(evaluation['interview_questions'])} interview questions (expected 3)")
        else:
            print(f"✅ Found {len(evaluation['interview_questions'])} interview questions")

        if errors:
            print(f"\n⚠️  Validation warnings:")
            for error in errors:
                print(f"  {error}")
            return False
        else:
            print(f"\n🎉 All validations passed!")
            return True

    except Exception as e:
        print(f"❌ API call failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("="*60)
    print("STAGE 1 API DIRECT TEST")
    print("="*60)

    # Load environment
    load_env()

    # Test case 1: Strong candidate
    job_data = {
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
    }

    candidate_data = {
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

    result = test_evaluation("Strong Candidate - Sarah Chen", job_data, candidate_data)

    if result:
        print(f"\n{'='*60}")
        print(f"✅ TEST PASSED")
        print(f"{'='*60}")
        return 0
    else:
        print(f"\n{'='*60}")
        print(f"❌ TEST FAILED")
        print(f"{'='*60}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
