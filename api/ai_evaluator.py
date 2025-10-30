"""
AI Candidate Evaluator supporting multiple LLM providers
Provides Stage 1 (Resume Screening) and Stage 2 (Final Hiring) evaluations

This module contains the core AI evaluation logic extracted from evaluate_candidate.py
and refactored for use with Flask server. Supports multiple LLM providers via abstraction layer.
"""
import os
import re
from llm_providers import get_provider


# Path to recruiting-evaluation skill
# Use environment variable if set, otherwise use standard Claude skills location
SKILL_PATH = os.environ.get(
    'RECRUITING_SKILL_PATH',
    os.path.join(os.path.expanduser('~'), '.claude', 'skills', 'recruiting-evaluation', 'SKILL.md')
)


def load_skill_instructions():
    """Load recruiting-evaluation skill instructions"""
    try:
        with open(SKILL_PATH, 'r') as f:
            return f.read()
    except FileNotFoundError:
        # Fallback: use basic instructions if skill file not found
        return """
You are evaluating a candidate using a two-stage framework.

Stage 1: Resume Screening (0-100 score)
- Score based on: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline

Stage 2: Final Hiring Decision
- Score based on: Resume (25%) + Interview (50%) + References (25%)
- Interview performance is the most important factor
"""


def build_stage1_prompt(skill_instructions, job_data, candidate_data):
    """Build Stage 1: Resume Screening prompt"""
    must_haves = '\n'.join([f"- {req}" for req in job_data.get('must_have_requirements', [])])
    preferreds = '\n'.join([f"- {req}" for req in job_data.get('preferred_requirements', [])])

    # Handle both 'requirements' (frontend) and 'must_have_requirements' (backend)
    if not must_haves and job_data.get('requirements'):
        must_haves = '\n'.join([f"- {req}" for req in job_data.get('requirements', [])])

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

**Job Summary/Description:**
{job_data.get('summary', 'N/A')}

---

**CANDIDATE PROFILE:**
Name: {candidate_data.get('full_name', candidate_data.get('name', 'N/A'))}
Email: {candidate_data.get('email', 'N/A')}

**RESUME:**
{candidate_data.get('resume_text', candidate_data.get('text', 'No resume provided'))}

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
    return prompt


def parse_stage1_response(response_text):
    """Parse Stage 1 evaluation response from Claude"""
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
        elif current_section == 'reasoning':
            if line:
                # Add line with space, but detect sentence endings
                if evaluation['reasoning'] and evaluation['reasoning'][-1] not in '.!?':
                    evaluation['reasoning'] += ' '
                evaluation['reasoning'] += line + ' '
            else:
                # Empty line = paragraph break
                if evaluation['reasoning'] and not evaluation['reasoning'].endswith('\n\n'):
                    evaluation['reasoning'] = evaluation['reasoning'].strip() + '\n\n'

    # Clean up reasoning and ensure proper paragraph formatting
    evaluation['reasoning'] = evaluation['reasoning'].strip()
    # Replace multiple spaces with single space within paragraphs
    import re
    evaluation['reasoning'] = re.sub(r'  +', ' ', evaluation['reasoning'])

    return evaluation


def evaluate_candidate_with_ai(job_data, candidate_data, stage=1, provider='anthropic', model=None, api_key=None):
    """
    Evaluate a single candidate using specified LLM provider

    Args:
        job_data: Dictionary containing job details
        candidate_data: Dictionary containing candidate details
        stage: Evaluation stage (1 or 2)
        provider: LLM provider to use ('anthropic' or 'openai')
        model: Specific model to use (if None, uses provider default)
        api_key: API key for the provider (if None, reads from environment)

    Returns:
        Dictionary with evaluation results and usage metrics

    Raises:
        ValueError: If API key is missing, stage is invalid, or provider is unsupported
        Exception: If API call fails
    """
    # Validate stage
    if stage not in [1, 2]:
        raise ValueError('Invalid stage. Must be 1 or 2.')

    # Currently only Stage 1 is implemented
    if stage == 2:
        raise NotImplementedError('Stage 2 evaluation not yet implemented in this module')

    # Load skill instructions
    skill_instructions = load_skill_instructions()

    # Build prompt
    prompt = build_stage1_prompt(skill_instructions, job_data, candidate_data)

    # Get LLM provider instance
    try:
        llm_provider = get_provider(provider, api_key=api_key, model=model)
    except ValueError as e:
        raise ValueError(f'Failed to initialize {provider} provider: {str(e)}')

    # Call LLM provider
    response_text, usage_metadata = llm_provider.evaluate(prompt)

    # Parse response
    evaluation_data = parse_stage1_response(response_text)

    return {
        'success': True,
        'stage': stage,
        'evaluation': evaluation_data,
        'usage': {
            'input_tokens': usage_metadata['input_tokens'],
            'output_tokens': usage_metadata['output_tokens'],
            'cost': usage_metadata['cost']
        },
        'model': usage_metadata['model'],
        'provider': llm_provider.get_provider_name(),
        'raw_response': response_text  # Include for debugging
    }
