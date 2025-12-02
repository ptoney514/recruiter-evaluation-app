"""
Ollama Local LLM Provider
Provides quick candidate scoring using locally-running Ollama models
"""
import requests
from typing import Dict, Any, Tuple, List
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
    Build a simplified prompt for quick scoring

    This is shorter than the full Stage 1 prompt for faster local evaluation.
    Focus on key qualifications match.

    Args:
        job_data: Job details (title, requirements)
        candidate_data: Candidate details (resume text, skills)

    Returns:
        Formatted prompt string
    """
    job_title = job_data.get('title', 'Unknown Position')
    must_have = job_data.get('must_have_requirements', job_data.get('mustHaveRequirements', []))
    preferred = job_data.get('preferred_requirements', job_data.get('preferredRequirements', []))

    # Format requirements
    must_have_text = "\n".join(f"- {req}" for req in must_have) if must_have else "- Not specified"
    preferred_text = "\n".join(f"- {req}" for req in preferred) if preferred else "- Not specified"

    # Get resume text
    resume_text = candidate_data.get('resumeText', candidate_data.get('resume_text', ''))
    if not resume_text:
        resume_text = "No resume text available"

    # Truncate resume if too long (for faster processing)
    if len(resume_text) > 4000:
        resume_text = resume_text[:4000] + "\n\n[Resume truncated for quick evaluation]"

    prompt = f"""You are a recruiter doing a quick initial screening of a candidate.

JOB: {job_title}

MUST-HAVE REQUIREMENTS:
{must_have_text}

PREFERRED REQUIREMENTS:
{preferred_text}

CANDIDATE RESUME:
{resume_text}

---

Provide a quick assessment with:
1. SCORE: A number from 0-100 (0=no match, 100=perfect match)
2. REASONING: 1-2 sentences explaining the score

Format your response EXACTLY like this:
SCORE: [number]
REASONING: [your brief explanation]

Be direct and concise."""

    return prompt


def parse_quick_score_response(response_text: str) -> Dict[str, Any]:
    """
    Parse the quick score response from Ollama

    Args:
        response_text: Raw response from Ollama

    Returns:
        Dict with 'score' and 'reasoning'
    """
    result = {
        'score': None,
        'reasoning': ''
    }

    lines = response_text.strip().split('\n')

    for line in lines:
        line = line.strip()

        # Parse score
        if line.upper().startswith('SCORE:'):
            score_str = line.split(':', 1)[1].strip()
            # Extract number from string (handle "85/100" or just "85")
            import re
            numbers = re.findall(r'\d+', score_str)
            if numbers:
                score = int(numbers[0])
                # Clamp to 0-100
                result['score'] = max(0, min(100, score))

        # Parse reasoning
        elif line.upper().startswith('REASONING:'):
            result['reasoning'] = line.split(':', 1)[1].strip()

    # Fallback: try to find a number if SCORE: wasn't found
    if result['score'] is None:
        import re
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
