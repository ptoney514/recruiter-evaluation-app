"""
Ollama Local LLM Provider
Provides quick candidate scoring using locally-running Ollama models
"""
import requests
import re
from typing import Dict, Any, Tuple, List
from datetime import datetime
import time


class OllamaProvider:
    """Ollama local LLM provider for quick scoring"""

    DEFAULT_BASE_URL = "http://localhost:11434"
    DEFAULT_MODEL = "mistral"

    # Available models with descriptions
    AVAILABLE_MODELS = [
        {'id': 'phi3', 'name': 'Phi-3 (Fast)', 'description': 'Fastest, good for simple roles'},
        {'id': 'mistral', 'name': 'Mistral (Balanced)', 'description': 'Good balance of speed and quality'},
        {'id': 'llama3', 'name': 'Llama 3 (Best)', 'description': 'Highest quality, slower'},
    ]

    def __init__(self, model: str = None, base_url: str = None):
        """
        Initialize Ollama provider

        Args:
            model: Ollama model to use (default: mistral)
            base_url: Ollama API base URL (default: http://localhost:11434)
        """
        self.model = model or self.DEFAULT_MODEL
        self.base_url = base_url or self.DEFAULT_BASE_URL

    def is_available(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except (requests.ConnectionError, requests.Timeout):
            return False

    def get_available_models(self) -> List[str]:
        """Get list of models available in local Ollama installation"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except (requests.ConnectionError, requests.Timeout):
            return []

    def evaluate(self, prompt: str) -> Tuple[str, Dict[str, Any]]:
        """
        Run evaluation using Ollama

        Args:
            prompt: The evaluation prompt

        Returns:
            Tuple of (response_text, usage_metadata)
        """
        start_time = time.time()

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 1024,  # Limit output for quick scoring
                    }
                },
                timeout=60  # 60 second timeout for generation
            )

            if response.status_code != 200:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")

            data = response.json()
            response_text = data.get('response', '')

            elapsed_time = time.time() - start_time

            # Ollama provides token counts in response
            usage_metadata = {
                'input_tokens': data.get('prompt_eval_count', 0),
                'output_tokens': data.get('eval_count', 0),
                'cost': 0.0,  # Local = free
                'model': self.model,
                'elapsed_seconds': round(elapsed_time, 2),
                'provider': 'ollama'
            }

            return response_text, usage_metadata

        except requests.Timeout:
            raise Exception(f"Ollama request timed out after 60 seconds")
        except requests.ConnectionError:
            raise Exception(f"Cannot connect to Ollama at {self.base_url}. Is Ollama running?")

    def get_provider_name(self) -> str:
        return 'ollama'


def build_quick_score_prompt(job_data: Dict[str, Any], candidate_data: Dict[str, Any]) -> str:
    """
    Build a prompt for quick scoring with requirements analysis

    Asks the model to:
    1. Echo back the requirements it identified (transparency)
    2. Analyze each requirement against the resume (MET/NOT_MET/PARTIAL)
    3. Provide overall score and reasoning

    Args:
        job_data: Job details (title, requirements)
        candidate_data: Candidate details (resume text, skills)

    Returns:
        Formatted prompt string
    """
    job_title = job_data.get('title', 'Unknown Position')
    must_have = job_data.get('must_have_requirements', job_data.get('mustHaveRequirements', []))
    preferred = job_data.get('preferred_requirements', job_data.get('preferredRequirements', []))

    # Format requirements with numbering for easier parsing
    must_have_text = "\n".join(f"- {req}" for req in must_have) if must_have else "- Not specified"
    preferred_text = "\n".join(f"- {req}" for req in preferred) if preferred else "- Not specified"

    # Get resume text
    resume_text = candidate_data.get('resumeText', candidate_data.get('resume_text', ''))
    if not resume_text:
        resume_text = "No resume text available"

    # Truncate resume if too long (for faster processing)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000] + "\n\n[Resume truncated for quick evaluation]"

    prompt = f"""You are a recruiter doing initial screening of a candidate.

JOB: {job_title}

MUST-HAVE REQUIREMENTS:
{must_have_text}

PREFERRED REQUIREMENTS:
{preferred_text}

CANDIDATE RESUME:
{resume_text}

---

Provide your assessment in this EXACT format:

MUST-HAVE IDENTIFIED:
- [list each must-have requirement you found in the job]

PREFERRED IDENTIFIED:
- [list each preferred requirement you found in the job]

MATCH ANALYSIS:
- [requirement text]: [MET/NOT_MET/PARTIAL] - [brief evidence from resume]
- [requirement text]: [MET/NOT_MET/PARTIAL] - [brief evidence from resume]
(analyze each must-have and preferred requirement)

SCORE: [0-100]
REASONING: [2-3 sentences explaining the overall fit]

Be thorough in analyzing each requirement."""

    return prompt


def parse_quick_score_response(response_text: str, model: str = None) -> Dict[str, Any]:
    """
    Parse the quick score response from Ollama with full requirements analysis

    Args:
        response_text: Raw response from Ollama
        model: The model used for evaluation (for metadata)

    Returns:
        Dict with score, reasoning, requirements_identified, and match_analysis
    """
    result = {
        'score': None,
        'reasoning': '',
        'requirements_identified': {
            'must_have': [],
            'preferred': []
        },
        'match_analysis': [],
        'methodology': 'Q(40%) + E(40%) + R(20%)',
        'evaluated_at': datetime.utcnow().isoformat() + 'Z',
        'model': model
    }

    lines = response_text.strip().split('\n')
    current_section = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Detect section headers
        upper_line = line.upper()
        if upper_line.startswith('MUST-HAVE IDENTIFIED:'):
            current_section = 'must_have'
            continue
        elif upper_line.startswith('PREFERRED IDENTIFIED:'):
            current_section = 'preferred'
            continue
        elif upper_line.startswith('MATCH ANALYSIS:'):
            current_section = 'match_analysis'
            continue
        elif upper_line.startswith('SCORE:'):
            current_section = None
            score_str = line.split(':', 1)[1].strip()
            numbers = re.findall(r'\d+', score_str)
            if numbers:
                score = int(numbers[0])
                result['score'] = max(0, min(100, score))
            continue
        elif upper_line.startswith('REASONING:'):
            current_section = 'reasoning'
            result['reasoning'] = line.split(':', 1)[1].strip()
            continue

        # Parse content based on current section
        if current_section == 'must_have' and line.startswith('-'):
            req = line[1:].strip()
            if req:
                result['requirements_identified']['must_have'].append(req)

        elif current_section == 'preferred' and line.startswith('-'):
            req = line[1:].strip()
            if req:
                result['requirements_identified']['preferred'].append(req)

        elif current_section == 'match_analysis' and line.startswith('-'):
            # Parse: "- requirement: STATUS - evidence"
            content = line[1:].strip()
            match_entry = parse_match_line(content)
            if match_entry:
                result['match_analysis'].append(match_entry)

        elif current_section == 'reasoning':
            # Multi-line reasoning support
            result['reasoning'] += ' ' + line

    # Clean up reasoning
    result['reasoning'] = result['reasoning'].strip()

    # Fallback: try to find a score if SCORE: wasn't found
    if result['score'] is None:
        numbers = re.findall(r'\b(\d{1,3})\b', response_text)
        for num in numbers:
            n = int(num)
            if 0 <= n <= 100:
                result['score'] = n
                break

    # If still no score, default to 50 (neutral)
    if result['score'] is None:
        result['score'] = 50
        result['reasoning'] = result['reasoning'] or "Could not parse evaluation response"

    return result


def parse_match_line(content: str) -> Dict[str, Any]:
    """
    Parse a single match analysis line

    Expected format: "requirement text: STATUS - evidence"
    Examples:
        "5 years experience: MET - 7 years at Company X"
        "Python skills: NOT_MET - No Python mentioned"
        "Leadership: PARTIAL - Team lead but not senior"

    Args:
        content: Line content after the dash

    Returns:
        Dict with requirement, status, evidence or None if parsing fails
    """
    # Try to split by status keywords
    status_pattern = r':\s*(MET|NOT_MET|NOT MET|PARTIAL)\s*[-–—]?\s*'
    match = re.split(status_pattern, content, maxsplit=1, flags=re.IGNORECASE)

    if len(match) >= 2:
        requirement = match[0].strip()
        status_raw = match[1].upper().replace(' ', '_')
        evidence = match[2].strip() if len(match) > 2 else ''

        # Normalize status
        if status_raw in ['MET']:
            status = 'MET'
        elif status_raw in ['NOT_MET', 'NOT MET']:
            status = 'NOT_MET'
        elif status_raw in ['PARTIAL']:
            status = 'PARTIAL'
        else:
            status = 'UNKNOWN'

        return {
            'requirement': requirement,
            'status': status,
            'evidence': evidence
        }

    # Fallback: try simpler parsing
    if ':' in content:
        parts = content.split(':', 1)
        requirement = parts[0].strip()
        rest = parts[1].strip() if len(parts) > 1 else ''

        # Try to detect status from rest
        status = 'UNKNOWN'
        evidence = rest
        if 'MET' in rest.upper() and 'NOT' not in rest.upper():
            status = 'MET'
        elif 'NOT' in rest.upper() or 'NO ' in rest.upper():
            status = 'NOT_MET'
        elif 'PARTIAL' in rest.upper():
            status = 'PARTIAL'

        return {
            'requirement': requirement,
            'status': status,
            'evidence': evidence
        }

    return None
