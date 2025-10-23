"""
Simple Direct Test for Stage 2 API (Final Hiring Decision)
Tests the evaluation logic directly without HTTP layer complexity

Usage:
    python test_stage2_simple.py

Requirements:
    - ANTHROPIC_API_KEY set in api/.env file
    - anthropic package installed: pip install anthropic
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


def test_stage2_evaluation(test_name, job_data, candidate_data, resume_score, interview_data, references_data):
    """
    Test Stage 2 evaluation logic directly
    """
    import anthropic

    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")
    print(f"Job: {job_data['title']}")
    print(f"Candidate: {candidate_data['full_name']} ({candidate_data['years_experience']} years)")
    print(f"Resume Score (Stage 1): {resume_score}/100")
    print(f"Interview Rating: {interview_data['overall_rating']}/10")
    print(f"References: {len(references_data)} checks")

    # Load skill instructions
    skill_path = Path.home() / ".claude" / "skills" / "recruiting-evaluation" / "SKILL.md"
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

    # Calculate average interview rating (1-10 scale, convert to 0-100)
    interview_rating = interview_data.get('overall_rating', 5) * 10

    # Calculate average reference rating (1-10 scale, convert to 0-100)
    if references_data:
        ref_ratings = [ref.get('overall_rating', 5) for ref in references_data]
        reference_rating = (sum(ref_ratings) / len(ref_ratings)) * 10
    else:
        reference_rating = 50

    # Format references
    formatted_refs = []
    for i, ref in enumerate(references_data, 1):
        formatted_refs.append(f"""
Reference {i}:
- Name: {ref.get('reference_name', 'N/A')}
- Relationship: {ref.get('relationship', 'N/A')}
- Rating: {ref.get('overall_rating', 'N/A')}/10
- Would Rehire: {ref.get('would_rehire', 'N/A')}
- Strengths: {ref.get('strengths', 'N/A')}
- Areas for Development: {ref.get('areas_for_development', 'N/A')}
- Notes: {ref.get('notes', 'N/A')}
""")
    references_section = '\n'.join(formatted_refs) if formatted_refs else 'No reference checks conducted yet'

    # Build Stage 2 prompt
    prompt = f"""{skill_instructions}

---

TASK: Perform Stage 2 Final Hiring Evaluation for this candidate.

**CANDIDATE:** {candidate_data.get('full_name', 'N/A')}
**JOB TITLE:** {job_data.get('title', 'N/A')}

---

**STAGE 1 RESUME SCORE:** {resume_score}/100 (Weight: 25%)

---

**STAGE 2 DATA:**

**INTERVIEW PERFORMANCE:** {interview_rating}/100 (Weight: 50%)
Overall Rating: {interview_data.get('overall_rating', 'N/A')}/10
Recommendation: {interview_data.get('recommendation', 'N/A')}
Red Flags: {', '.join(interview_data.get('red_flags', [])) if interview_data.get('red_flags') else 'None'}

Interview Notes:
{interview_data.get('notes', 'No notes provided')}

Compared to Resume: {interview_data.get('vs_resume_expectations', 'N/A')}

---

**REFERENCE CHECKS:** {reference_rating}/100 (Weight: 25%)

{references_section}

---

Calculate the final score and provide your Stage 2 evaluation:

FINAL_SCORE: [Calculated: (Resume × 0.25) + (Interview × 0.50) + (References × 0.25)]
RESUME_WEIGHTED: [Resume score × 0.25]
INTERVIEW_WEIGHTED: [Interview score × 0.50]
REFERENCES_WEIGHTED: [Reference score × 0.25]

RECOMMENDATION: [STRONG HIRE / HIRE / DO NOT HIRE / KEEP SEARCHING]
CONFIDENCE: [High / Medium / Low]

WHERE_INTERVIEW_CONTRADICTED_RESUME:
- [Observation 1]
- [Observation 2]

WHERE_INTERVIEW_CONFIRMED_RESUME:
- [Confirmation 1]
- [Confirmation 2]

REFERENCE_HIGHLIGHTS:
- [Theme 1]
- [Theme 2]

REASONING:
[2-3 paragraphs explaining why this is/isn't the right hire, weighing the interview performance (50%) most heavily, and how references validate or contradict the interview observations]
"""

    # Call Claude API
    print(f"\n⏳ Calling Claude API for Stage 2 evaluation...")
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

        # Parse Stage 2 response
        response_text = message.content[0].text
        lines = response_text.strip().split('\n')

        evaluation = {
            'final_score': 0,
            'resume_weighted': 0,
            'interview_weighted': 0,
            'references_weighted': 0,
            'recommendation': 'DO NOT HIRE',
            'confidence': 'Medium',
            'interview_contradictions': [],
            'interview_confirmations': [],
            'reference_highlights': [],
            'reasoning': ''
        }

        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('FINAL_SCORE:'):
                try:
                    score_text = line.split(':', 1)[1].strip()
                    # Extract number from text
                    import re
                    match = re.search(r'[\d.]+', score_text)
                    if match:
                        evaluation['final_score'] = float(match.group())
                except:
                    pass
            elif line.startswith('RESUME_WEIGHTED:'):
                try:
                    evaluation['resume_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('INTERVIEW_WEIGHTED:'):
                try:
                    evaluation['interview_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('REFERENCES_WEIGHTED:'):
                try:
                    evaluation['references_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('RECOMMENDATION:'):
                evaluation['recommendation'] = line.split(':', 1)[1].strip()
            elif line.startswith('CONFIDENCE:'):
                evaluation['confidence'] = line.split(':', 1)[1].strip()
            elif line.startswith('WHERE_INTERVIEW_CONTRADICTED_RESUME:'):
                current_section = 'contradictions'
            elif line.startswith('WHERE_INTERVIEW_CONFIRMED_RESUME:'):
                current_section = 'confirmations'
            elif line.startswith('REFERENCE_HIGHLIGHTS:'):
                current_section = 'references'
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            elif line.startswith('- ') and current_section == 'contradictions':
                evaluation['interview_contradictions'].append(line[2:])
            elif line.startswith('- ') and current_section == 'confirmations':
                evaluation['interview_confirmations'].append(line[2:])
            elif line.startswith('- ') and current_section == 'references':
                evaluation['reference_highlights'].append(line[2:])
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
        print(f"STAGE 2 EVALUATION RESULTS")
        print(f"{'='*60}")
        print(f"\nFinal Score: {evaluation['final_score']:.1f}/100")
        print(f"  - Resume (25%): {evaluation['resume_weighted']:.1f}")
        print(f"  - Interview (50%): {evaluation['interview_weighted']:.1f}")
        print(f"  - References (25%): {evaluation['references_weighted']:.1f}")
        print(f"\nRecommendation: {evaluation['recommendation']}")
        print(f"Confidence: {evaluation['confidence']}")

        print(f"\nWhere Interview Contradicted Resume ({len(evaluation['interview_contradictions'])}):")
        for i, item in enumerate(evaluation['interview_contradictions'], 1):
            print(f"  {i}. {item}")

        print(f"\nWhere Interview Confirmed Resume ({len(evaluation['interview_confirmations'])}):")
        for i, item in enumerate(evaluation['interview_confirmations'], 1):
            print(f"  {i}. {item}")

        print(f"\nReference Highlights ({len(evaluation['reference_highlights'])}):")
        for i, item in enumerate(evaluation['reference_highlights'], 1):
            print(f"  {i}. {item}")

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

        # Check final score is valid
        if not (0 <= evaluation['final_score'] <= 100):
            errors.append(f"❌ Final score {evaluation['final_score']} outside valid range 0-100")
        else:
            print(f"✅ Final score is valid (0-100)")

        # Verify weighted score calculation
        expected_score = (resume_score * 0.25) + (interview_rating * 0.50) + (reference_rating * 0.25)
        if abs(evaluation['final_score'] - expected_score) > 5:  # Allow 5 point variance
            print(f"⚠️  Final score {evaluation['final_score']:.1f} differs from expected {expected_score:.1f}")
        else:
            print(f"✅ Score calculation verified (expected: {expected_score:.1f})")

        # Check recommendation is valid
        valid_recommendations = ['STRONG HIRE', 'HIRE', 'DO NOT HIRE', 'KEEP SEARCHING']
        if evaluation['recommendation'] not in valid_recommendations:
            errors.append(f"❌ Invalid recommendation: {evaluation['recommendation']}")
        else:
            print(f"✅ Recommendation is valid")

        # Check confidence level
        valid_confidence = ['High', 'Medium', 'Low']
        if evaluation['confidence'] not in valid_confidence:
            print(f"⚠️  Non-standard confidence level: {evaluation['confidence']}")
        else:
            print(f"✅ Confidence level is valid")

        # Check all sections present
        if len(evaluation['interview_contradictions']) == 0:
            print("⚠️  No interview contradictions identified")
        else:
            print(f"✅ Found {len(evaluation['interview_contradictions'])} interview contradictions")

        if len(evaluation['interview_confirmations']) == 0:
            print("⚠️  No interview confirmations identified")
        else:
            print(f"✅ Found {len(evaluation['interview_confirmations'])} interview confirmations")

        if len(evaluation['reference_highlights']) == 0:
            print("⚠️  No reference highlights identified")
        else:
            print(f"✅ Found {len(evaluation['reference_highlights'])} reference highlights")

        if errors:
            print(f"\n❌ Validation errors found:")
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
    print("STAGE 2 API DIRECT TEST")
    print("Final Hiring Decision with Interview + References")
    print("="*60)

    # Load environment
    load_env()

    # Test case: Strong interview performance confirms strong resume
    job_data = {
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "employment_type": "Full-time"
    }

    candidate_data = {
        "full_name": "Sarah Chen",
        "email": "sarah.chen@email.com",
        "location": "San Francisco, CA",
        "current_title": "Senior Software Engineer",
        "current_company": "Tech Startup Inc.",
        "years_experience": 7
    }

    # Stage 1 resume score (from previous evaluation)
    resume_score = 88

    # Interview data - strong performance
    interview_data = {
        "overall_rating": 9,  # Out of 10
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
- Python expertise: 9/10 (excellent)
- System design: 8/10 (strong)
- React/Frontend: 8/10 (solid)
- Problem-solving: 9/10 (excellent)
- Communication: 9/10 (excellent)
""",
        "vs_resume_expectations": "Exceeded expectations - demonstrated deeper technical knowledge than resume suggested, particularly in distributed systems"
    }

    # Reference checks - positive feedback
    references_data = [
        {
            "reference_name": "Michael Torres",
            "relationship": "Direct Manager at Tech Startup Inc.",
            "overall_rating": 9,
            "would_rehire": "Absolutely",
            "strengths": "Outstanding technical skills, natural leader, proactive problem solver",
            "areas_for_development": "Could delegate more - tends to take on too much",
            "notes": "Sarah is one of the best engineers I've managed. She consistently delivers high-quality work and has mentored several junior engineers successfully. Losing her would be a big loss for our team."
        },
        {
            "reference_name": "Jennifer Liu",
            "relationship": "Tech Lead at Enterprise Corp (previous employer)",
            "overall_rating": 8,
            "would_rehire": "Yes",
            "strengths": "Fast learner, reliable, great code quality",
            "areas_for_development": "Was still developing system design skills when she left, but showed rapid growth",
            "notes": "Sarah was a solid mid-level engineer who grew quickly. She took feedback well and improved significantly during her time here. I'd hire her again without hesitation."
        },
        {
            "reference_name": "David Kim",
            "relationship": "Peer Engineer at Tech Startup Inc.",
            "overall_rating": 9,
            "would_rehire": "Absolutely",
            "strengths": "Collaborative, excellent communicator, mentors others naturally",
            "areas_for_development": "Sometimes gets too focused on perfection over shipping",
            "notes": "Sarah is the person everyone wants on their team. She makes everyone around her better and is always willing to help debug issues or review code."
        }
    ]

    result = test_stage2_evaluation(
        "Strong Hire - Sarah Chen (Interview Confirms Resume)",
        job_data,
        candidate_data,
        resume_score,
        interview_data,
        references_data
    )

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
