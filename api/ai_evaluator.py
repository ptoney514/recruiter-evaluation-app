"""
AI Candidate Evaluator supporting multiple LLM providers
Provides Stage 1 (Resume Screening) and Stage 2 (Final Hiring) evaluations

Uses A-T-Q (Accomplishments-Trajectory-Qualifications) scoring model:
- A (Accomplishments): 50% - Comparable work, scale, and impact evidence
- T (Trajectory): 30% - Growth pattern, progression velocity, intentionality
- Q (Qualifications): 20% - Must-haves (including location) and preferreds

This module contains the core AI evaluation logic.
Supports multiple LLM providers via abstraction layer.
"""
import os
import re
from llm_providers import get_provider


# Path to recruiting-evaluation skill
SKILL_PATH = os.environ.get('RECRUITING_SKILL_PATH') or os.path.join(
    os.path.expanduser('~'), '.claude', 'skills', 'recruiting-evaluation', 'SKILL.md'
)


def load_skill_instructions():
    """Load recruiting-evaluation skill instructions"""
    try:
        with open(SKILL_PATH, 'r') as f:
            return f.read()
    except FileNotFoundError:
        # Fallback: use A-T-Q scoring instructions if skill file not found
        return """
You are evaluating a candidate using the A-T-Q (Accomplishments-Trajectory-Qualifications) scoring model.

## A-T-Q Scoring Framework

**Overall Score = A(50%) + T(30%) + Q(20%)**

### A - Accomplishments Score (50%)
Have they done work comparable to what this role requires?
- Comparable Work (50%): Did similar work to role requirements
- Comparable Scale (30%): At similar size/complexity/budget
- Impact Evidence (20%): Quantified results, not just duties

| Score | Criteria |
|-------|----------|
| 90-100 | Comparable work + comparable scale + quantified impact |
| 75-89 | Comparable work OR comparable scale (one strongly present) |
| 60-74 | Related work, scale unclear or smaller |
| 40-59 | Loosely related work, limited evidence |
| 0-39 | No comparable accomplishments evident |

### T - Trajectory Score (30%)
Is their career on an upward path? Do moves make sense?
- Growth Pattern (50%): Increasing responsibility over time
- Progression Velocity (30%): Reasonable advancement pace
- Intentionality (20%): Moves make narrative sense

| Score | Criteria |
|-------|----------|
| 90-100 | Clear upward trajectory with consistent promotions |
| 75-89 | Generally upward with explainable plateaus/laterals |
| 60-74 | Mixed trajectory—some growth, some stagnation |
| 40-59 | Flat or unclear career direction |
| 0-39 | Declining trajectory or chaotic pattern |

DO NOT auto-penalize gaps or job changes—assess them in context.

### Q - Qualifications Score (20%)
Do they meet the stated requirements? (Table stakes)
- Must-Have Requirements (70%): Non-negotiables including location
- Preferred Requirements (30%): Nice-to-haves

| Score | Criteria |
|-------|----------|
| 90-100 | All must-haves + most preferreds |
| 75-89 | All must-haves + some preferreds |
| 60-74 | Most must-haves (1 minor gap) |
| 40-59 | Missing 1+ significant must-have |
| 0-39 | Missing multiple must-haves |

Location is a REQUIREMENT (met/unmet in Q), NOT a risk penalty.

### Recommendation Thresholds
- 85+ = ADVANCE TO INTERVIEW
- 70-84 = PHONE SCREEN FIRST
- <70 = DECLINE
"""


def build_stage1_prompt(skill_instructions, job_data, candidate_data):
    """Build Stage 1: Resume Screening prompt using A-T-Q model"""
    must_haves = '\n'.join([f"- {req}" for req in job_data.get('must_have_requirements', [])])
    preferreds = '\n'.join([f"- {req}" for req in job_data.get('preferred_requirements', [])])

    # Handle both 'requirements' (frontend) and 'must_have_requirements' (backend)
    if not must_haves and job_data.get('requirements'):
        must_haves = '\n'.join([f"- {req}" for req in job_data.get('requirements', [])])

    prompt = f"""{skill_instructions}

---

TASK: Perform Stage 1 Resume Screening using the A-T-Q scoring model.

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
{job_data.get('summary', job_data.get('description', 'N/A'))}

**Performance Profile (What success looks like in this role):**
{job_data.get('performance_profile', 'Not specified - use job requirements to infer')}

---

**CANDIDATE PROFILE:**
Name: {candidate_data.get('full_name', candidate_data.get('name', 'N/A'))}
Email: {candidate_data.get('email', 'N/A')}

**RESUME:**
{candidate_data.get('resume_text', candidate_data.get('text', 'No resume provided'))}

---

Analyze this candidate using the A-T-Q framework and provide your evaluation in EXACTLY this format:

SCORE: [0-100]
A_SCORE: [0-100]
T_SCORE: [0-100]
Q_SCORE: [0-100]
RECOMMENDATION: [ADVANCE TO INTERVIEW / PHONE SCREEN FIRST / DECLINE]

ACCOMPLISHMENTS_ANALYSIS:
Comparable Work: [0-100] - [brief evidence from resume]
Comparable Scale: [0-100] - [brief evidence of scale/scope]
Impact Evidence: [0-100] - [quantified outcomes if present]

TRAJECTORY_ANALYSIS:
Growth Pattern: [0-100] - [career progression evidence]
Progression Velocity: [0-100] - [advancement pace assessment]
Intentionality: [0-100] - [career narrative coherence]

QUALIFICATIONS_ANALYSIS:
Must-Haves Met: [X/Y] - [list which ones met/unmet]
Preferreds Met: [X/Y] - [list which ones met/unmet]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

OBSERVATIONS:
- [Contextual note 1 - gaps, moves, etc. WITHOUT penalizing]
- [Contextual note 2 if applicable]

INTERVIEW_QUESTIONS:
1. [Question about accomplishments/experience]
2. [Question to verify skill or scale]
3. [Question about role fit or trajectory]

REASONING:
[2-3 paragraphs explaining the A-T-Q scores and recommendation. Focus on what they HAVE accomplished, not credentials. Note any unmet requirements factually without treating them as "risks".]
"""
    return prompt


def parse_stage1_response(response_text):
    """Parse Stage 1 A-T-Q evaluation response from Claude"""
    lines = response_text.strip().split('\n')

    evaluation = {
        'score': 0,
        'a_score': 0,
        't_score': 0,
        'q_score': 0,
        'recommendation': 'DECLINE',
        'accomplishments_analysis': {
            'comparable_work': 0,
            'comparable_scale': 0,
            'impact_evidence': 0
        },
        'trajectory_analysis': {
            'growth_pattern': 0,
            'progression_velocity': 0,
            'intentionality': 0
        },
        'qualifications_analysis': {
            'must_haves_met': '',
            'preferreds_met': ''
        },
        'key_strengths': [],
        'observations': [],
        'interview_questions': [],
        'reasoning': ''
    }

    current_section = None

    for line in lines:
        line = line.strip()

        # Main scores
        if line.startswith('SCORE:'):
            try:
                evaluation['score'] = int(re.search(r'\d+', line.split(':', 1)[1]).group())
            except:
                pass
        elif line.startswith('A_SCORE:'):
            try:
                evaluation['a_score'] = int(re.search(r'\d+', line.split(':', 1)[1]).group())
            except:
                pass
        elif line.startswith('T_SCORE:'):
            try:
                evaluation['t_score'] = int(re.search(r'\d+', line.split(':', 1)[1]).group())
            except:
                pass
        elif line.startswith('Q_SCORE:'):
            try:
                evaluation['q_score'] = int(re.search(r'\d+', line.split(':', 1)[1]).group())
            except:
                pass
        elif line.startswith('RECOMMENDATION:'):
            evaluation['recommendation'] = line.split(':', 1)[1].strip()

        # Accomplishments sub-scores
        elif line.startswith('Comparable Work:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['accomplishments_analysis']['comparable_work'] = int(score_match.group(1))
            except:
                pass
        elif line.startswith('Comparable Scale:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['accomplishments_analysis']['comparable_scale'] = int(score_match.group(1))
            except:
                pass
        elif line.startswith('Impact Evidence:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['accomplishments_analysis']['impact_evidence'] = int(score_match.group(1))
            except:
                pass

        # Trajectory sub-scores
        elif line.startswith('Growth Pattern:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['trajectory_analysis']['growth_pattern'] = int(score_match.group(1))
            except:
                pass
        elif line.startswith('Progression Velocity:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['trajectory_analysis']['progression_velocity'] = int(score_match.group(1))
            except:
                pass
        elif line.startswith('Intentionality:'):
            try:
                parts = line.split(':', 1)[1].strip()
                score_match = re.search(r'^(\d+)', parts)
                if score_match:
                    evaluation['trajectory_analysis']['intentionality'] = int(score_match.group(1))
            except:
                pass

        # Qualifications analysis
        elif line.startswith('Must-Haves Met:'):
            evaluation['qualifications_analysis']['must_haves_met'] = line.split(':', 1)[1].strip()
        elif line.startswith('Preferreds Met:'):
            evaluation['qualifications_analysis']['preferreds_met'] = line.split(':', 1)[1].strip()

        # Section markers
        elif line.startswith('KEY_STRENGTHS:'):
            current_section = 'strengths'
        elif line.startswith('OBSERVATIONS:'):
            current_section = 'observations'
        elif line.startswith('INTERVIEW_QUESTIONS:'):
            current_section = 'questions'
        elif line.startswith('REASONING:'):
            current_section = 'reasoning'
        elif line.startswith('ACCOMPLISHMENTS_ANALYSIS:'):
            current_section = 'accomplishments'
        elif line.startswith('TRAJECTORY_ANALYSIS:'):
            current_section = 'trajectory'
        elif line.startswith('QUALIFICATIONS_ANALYSIS:'):
            current_section = 'qualifications'

        # List items
        elif line.startswith('- ') and current_section == 'strengths':
            evaluation['key_strengths'].append(line[2:])
        elif line.startswith('- ') and current_section == 'observations':
            evaluation['observations'].append(line[2:])
        elif line.startswith(('1.', '2.', '3.', '4.', '5.')) and current_section == 'questions':
            # Remove the number and period prefix
            question = re.sub(r'^\d+\.\s*', '', line).strip()
            if question:
                evaluation['interview_questions'].append(question)

        # Reasoning paragraphs
        elif current_section == 'reasoning':
            if line:
                if evaluation['reasoning'] and evaluation['reasoning'][-1] not in '.!?':
                    evaluation['reasoning'] += ' '
                evaluation['reasoning'] += line + ' '
            else:
                if evaluation['reasoning'] and not evaluation['reasoning'].endswith('\n\n'):
                    evaluation['reasoning'] = evaluation['reasoning'].strip() + '\n\n'

    # Clean up reasoning
    evaluation['reasoning'] = evaluation['reasoning'].strip()
    evaluation['reasoning'] = re.sub(r'  +', ' ', evaluation['reasoning'])

    # Calculate A-T-Q scores from sub-components if main scores are 0
    if evaluation['a_score'] == 0:
        aa = evaluation['accomplishments_analysis']
        if aa['comparable_work'] > 0 or aa['comparable_scale'] > 0 or aa['impact_evidence'] > 0:
            evaluation['a_score'] = int(
                (aa['comparable_work'] * 0.50) +
                (aa['comparable_scale'] * 0.30) +
                (aa['impact_evidence'] * 0.20)
            )

    if evaluation['t_score'] == 0:
        ta = evaluation['trajectory_analysis']
        if ta['growth_pattern'] > 0 or ta['progression_velocity'] > 0 or ta['intentionality'] > 0:
            evaluation['t_score'] = int(
                (ta['growth_pattern'] * 0.50) +
                (ta['progression_velocity'] * 0.30) +
                (ta['intentionality'] * 0.20)
            )

    # Calculate overall score from A-T-Q if main score is 0
    if evaluation['score'] == 0 and (evaluation['a_score'] > 0 or evaluation['t_score'] > 0 or evaluation['q_score'] > 0):
        evaluation['score'] = int(
            (evaluation['a_score'] * 0.50) +
            (evaluation['t_score'] * 0.30) +
            (evaluation['q_score'] * 0.20)
        )

    return evaluation


def evaluate_candidate_with_ai(job_data, candidate_data, stage=1, provider='anthropic', model=None, api_key=None):
    """
    Evaluate a single candidate using specified LLM provider with A-T-Q scoring

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
    try:
        response_text, usage_metadata = llm_provider.evaluate(prompt)
    except Exception as e:
        raise Exception(f'API call failed: {str(e)}')

    # Parse response with error handling
    try:
        evaluation_data = parse_stage1_response(response_text)
    except Exception as e:
        print(f'Warning: Failed to parse AI response: {str(e)}')
        print(f'Raw response (first 500 chars): {response_text[:500]}')
        raise Exception(f'Failed to parse evaluation response. Response format may not match expected pattern.')

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
        'scoring_model': 'ATQ',
        'raw_response': response_text  # Include for debugging
    }
