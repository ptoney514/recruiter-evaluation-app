"""
LLM Provider Abstraction Layer
Supports multiple LLM providers (Anthropic Claude, OpenAI) for candidate evaluations
"""
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import anthropic


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    @abstractmethod
    def evaluate(self, prompt: str) -> Tuple[str, Dict[str, Any]]:
        """
        Evaluate a candidate using the provider's LLM

        Args:
            prompt: The formatted evaluation prompt

        Returns:
            Tuple of (response_text, usage_metadata)
            where usage_metadata contains: input_tokens, output_tokens, cost, model
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return the provider name (e.g., 'anthropic', 'openai')"""
        pass


class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider implementation"""

    def __init__(self, api_key: str = None, model: str = "claude-3-5-haiku-20241022"):
        """
        Initialize Anthropic provider

        Args:
            api_key: Anthropic API key (if None, reads from ANTHROPIC_API_KEY env var)
            model: Claude model to use (default: claude-3-5-haiku-20241022)
        """
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError('Missing ANTHROPIC_API_KEY')

        self.model = model
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def evaluate(self, prompt: str) -> Tuple[str, Dict[str, Any]]:
        """Call Claude API for evaluation"""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        response_text = message.content[0].text

        # Calculate cost (Haiku pricing: $0.25/1M input, $1.25/1M output)
        input_cost = (message.usage.input_tokens / 1_000_000) * 0.25
        output_cost = (message.usage.output_tokens / 1_000_000) * 1.25
        total_cost = input_cost + output_cost

        usage_metadata = {
            'input_tokens': message.usage.input_tokens,
            'output_tokens': message.usage.output_tokens,
            'cost': round(total_cost, 4),
            'model': self.model
        }

        return response_text, usage_metadata

    def get_provider_name(self) -> str:
        return 'anthropic'


class OpenAIProvider(LLMProvider):
    """OpenAI provider implementation"""

    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        """
        Initialize OpenAI provider

        Args:
            api_key: OpenAI API key (if None, reads from OPENAI_API_KEY env var)
            model: OpenAI model to use (default: gpt-4o)
        """
        self.api_key = api_key or os.environ.get('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError('Missing OPENAI_API_KEY')

        self.model = model

        # Import OpenAI client (lazy import to avoid requiring it if not used)
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.api_key)
        except ImportError:
            raise ImportError('openai package not installed. Run: pip install openai')

    def evaluate(self, prompt: str) -> Tuple[str, Dict[str, Any]]:
        """Call OpenAI API for evaluation"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert recruiter evaluating candidates for job positions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4096,
            temperature=0.7
        )

        response_text = response.choices[0].message.content

        # Calculate cost based on model pricing
        # GPT-4o pricing (as of Jan 2025): $2.50/1M input, $10.00/1M output
        # GPT-4o-mini: $0.15/1M input, $0.60/1M output
        pricing = self._get_model_pricing(self.model)
        input_cost = (response.usage.prompt_tokens / 1_000_000) * pricing['input']
        output_cost = (response.usage.completion_tokens / 1_000_000) * pricing['output']
        total_cost = input_cost + output_cost

        usage_metadata = {
            'input_tokens': response.usage.prompt_tokens,
            'output_tokens': response.usage.completion_tokens,
            'cost': round(total_cost, 4),
            'model': self.model
        }

        return response_text, usage_metadata

    def _get_model_pricing(self, model: str) -> Dict[str, float]:
        """Get pricing for OpenAI models (per 1M tokens)"""
        pricing_map = {
            'gpt-4o': {'input': 2.50, 'output': 10.00},
            'gpt-4o-mini': {'input': 0.15, 'output': 0.60},
            'gpt-4': {'input': 30.00, 'output': 60.00},
            'gpt-4-turbo': {'input': 10.00, 'output': 30.00},
            'gpt-3.5-turbo': {'input': 0.50, 'output': 1.50},
        }
        return pricing_map.get(model, {'input': 2.50, 'output': 10.00})  # Default to gpt-4o pricing

    def get_provider_name(self) -> str:
        return 'openai'


def get_provider(provider_name: str, api_key: str = None, model: str = None) -> LLMProvider:
    """
    Factory function to get an LLM provider instance

    Args:
        provider_name: Provider name ('anthropic', 'openai', or 'ollama')
        api_key: API key for the provider (optional, reads from env if None)
        model: Model name (optional, uses provider default if None)

    Returns:
        LLMProvider instance

    Raises:
        ValueError: If provider_name is not supported
    """
    provider_name = provider_name.lower()

    if provider_name == 'anthropic':
        if model:
            return AnthropicProvider(api_key=api_key, model=model)
        return AnthropicProvider(api_key=api_key)

    elif provider_name == 'openai':
        if model:
            return OpenAIProvider(api_key=api_key, model=model)
        return OpenAIProvider(api_key=api_key)

    elif provider_name == 'ollama':
        from ollama_provider import OllamaProvider
        return OllamaProvider(model=model)

    else:
        raise ValueError(f"Unsupported provider: {provider_name}. Supported: 'anthropic', 'openai', 'ollama'")


# Provider configurations (default models and display names)
PROVIDER_CONFIGS = {
    'anthropic': {
        'display_name': 'Anthropic Claude',
        'models': [
            {'id': 'claude-3-5-haiku-20241022', 'name': 'Claude 3.5 Haiku', 'cost': 'Low'},
            {'id': 'claude-3-5-sonnet-20241022', 'name': 'Claude 3.5 Sonnet', 'cost': 'Medium'},
        ],
        'default_model': 'claude-3-5-haiku-20241022'
    },
    'openai': {
        'display_name': 'OpenAI',
        'models': [
            {'id': 'gpt-4o-mini', 'name': 'GPT-4o Mini', 'cost': 'Very Low'},
            {'id': 'gpt-4o', 'name': 'GPT-4o', 'cost': 'Medium'},
            {'id': 'gpt-4-turbo', 'name': 'GPT-4 Turbo', 'cost': 'High'},
        ],
        'default_model': 'gpt-4o'
    },
    'ollama': {
        'display_name': 'Ollama (Local)',
        'models': [
            {'id': 'phi3', 'name': 'Phi-3 (Fast)', 'cost': 'Free'},
            {'id': 'mistral', 'name': 'Mistral (Balanced)', 'cost': 'Free'},
            {'id': 'llama3', 'name': 'Llama 3 (Best)', 'cost': 'Free'},
        ],
        'default_model': 'mistral'
    }
}
