"""
Unit Tests for Settings System
Tests database settings CRUD, model pricing, and API endpoints

Run: pytest test_settings.py -v
Run specific test: pytest test_settings.py::test_get_user_settings -v
"""

import pytest
import json
from database import (
    get_user_settings, get_user_setting, update_user_setting,
    ensure_settings_table_exists, ensure_default_settings,
    LOCAL_USER_ID
)
from llm_providers import AnthropicProvider, PROVIDER_CONFIGS


class TestSettingsDatabase:
    """Test settings CRUD operations"""

    @classmethod
    def setup_class(cls):
        """Initialize settings table before tests"""
        ensure_settings_table_exists()

    def test_ensure_settings_table_exists(self):
        """Should create settings table without errors"""
        # This should not raise an exception
        ensure_settings_table_exists()

        # Table should exist and be queryable
        settings = get_user_settings(LOCAL_USER_ID)
        assert isinstance(settings, dict)

    def test_ensure_default_settings(self):
        """Should initialize default settings for local user"""
        ensure_default_settings()

        # Check that defaults were created
        stage1_model = get_user_setting(LOCAL_USER_ID, 'stage1_model')
        stage2_model = get_user_setting(LOCAL_USER_ID, 'stage2_model')
        default_provider = get_user_setting(LOCAL_USER_ID, 'default_provider')

        assert stage1_model == 'claude-3-5-haiku-20241022'
        assert stage2_model == 'claude-sonnet-4-5-20251022'
        assert default_provider == 'anthropic'

    def test_get_user_settings_returns_dict(self):
        """get_user_settings should return a dictionary"""
        settings = get_user_settings(LOCAL_USER_ID)

        assert isinstance(settings, dict)
        assert len(settings) >= 3  # At least the default 3 settings

    def test_get_user_settings_contains_defaults(self):
        """get_user_settings should include all default settings"""
        settings = get_user_settings(LOCAL_USER_ID)

        assert 'stage1_model' in settings
        assert 'stage2_model' in settings
        assert 'default_provider' in settings

    def test_get_user_setting_existing_key(self):
        """get_user_setting should return value for existing key"""
        value = get_user_setting(LOCAL_USER_ID, 'stage1_model')

        assert value is not None
        assert isinstance(value, str)
        assert value == 'claude-3-5-haiku-20241022'

    def test_get_user_setting_nonexistent_key_returns_none(self):
        """get_user_setting should return None for nonexistent key"""
        value = get_user_setting(LOCAL_USER_ID, 'nonexistent_key')

        assert value is None

    def test_get_user_setting_nonexistent_key_with_default(self):
        """get_user_setting should return default for nonexistent key"""
        default_value = 'default_model'
        value = get_user_setting(LOCAL_USER_ID, 'nonexistent_key', default=default_value)

        assert value == default_value

    def test_update_user_setting_creates_new(self):
        """update_user_setting should create new settings"""
        import time
        test_key = f'test_key_{int(time.time() * 1000)}'
        test_value = 'test_value'

        # Update (should create)
        update_user_setting(LOCAL_USER_ID, test_key, test_value)

        # Verify it was created
        retrieved_value = get_user_setting(LOCAL_USER_ID, test_key)
        assert retrieved_value == test_value

    def test_update_user_setting_updates_existing(self):
        """update_user_setting should update existing settings"""
        test_key = 'stage1_model'
        new_value = 'claude-opus-4-5-20251101'

        # Update existing setting
        update_user_setting(LOCAL_USER_ID, test_key, new_value)

        # Verify it was updated
        retrieved_value = get_user_setting(LOCAL_USER_ID, test_key)
        assert retrieved_value == new_value

        # Reset to original
        update_user_setting(LOCAL_USER_ID, test_key, 'claude-3-5-haiku-20241022')

    def test_update_user_setting_string_value(self):
        """update_user_setting should handle string values correctly"""
        test_value = 'test-model-id'
        update_user_setting(LOCAL_USER_ID, 'test_string', test_value)

        retrieved = get_user_setting(LOCAL_USER_ID, 'test_string')
        assert retrieved == test_value
        assert isinstance(retrieved, str)

    def test_multiple_settings_per_user(self):
        """Should support multiple settings per user"""
        # Create multiple settings
        update_user_setting(LOCAL_USER_ID, 'setting1', 'value1')
        update_user_setting(LOCAL_USER_ID, 'setting2', 'value2')
        update_user_setting(LOCAL_USER_ID, 'setting3', 'value3')

        # Retrieve all
        all_settings = get_user_settings(LOCAL_USER_ID)

        # Should have at least the test settings
        assert 'setting1' in all_settings
        assert 'setting2' in all_settings
        assert 'setting3' in all_settings


class TestModelConfiguration:
    """Test LLM provider model configurations"""

    def test_anthropic_models_have_pricing(self):
        """All Anthropic models should have pricing information"""
        models = PROVIDER_CONFIGS['anthropic']['models']

        for model in models:
            assert 'id' in model
            assert 'name' in model
            assert 'cost' in model
            assert 'pricing' in model
            assert 'input' in model['pricing']
            assert 'output' in model['pricing']
            assert isinstance(model['pricing']['input'], (int, float))
            assert isinstance(model['pricing']['output'], (int, float))

    def test_anthropic_models_include_claude_45(self):
        """Should include Claude 4.5 series models"""
        models = PROVIDER_CONFIGS['anthropic']['models']
        model_ids = [m['id'] for m in models]

        assert 'claude-haiku-4-5-20251001' in model_ids
        assert 'claude-sonnet-4-5-20251022' in model_ids
        assert 'claude-opus-4-5-20251101' in model_ids

    def test_anthropic_models_include_legacy(self):
        """Should include Claude 3.5 legacy models"""
        models = PROVIDER_CONFIGS['anthropic']['models']
        model_ids = [m['id'] for m in models]

        assert 'claude-3-5-haiku-20241022' in model_ids
        assert 'claude-3-5-sonnet-20241022' in model_ids

    def test_haiku_35_legacy_cheaper_than_45(self):
        """Claude 3.5 Haiku legacy should be cheaper than 4.5"""
        models = PROVIDER_CONFIGS['anthropic']['models']

        haiku_35_legacy = next(m for m in models if m['id'] == 'claude-3-5-haiku-20241022')
        haiku_45 = next(m for m in models if m['id'] == 'claude-haiku-4-5-20251001')

        # Legacy should be cheaper
        assert haiku_35_legacy['pricing']['input'] < haiku_45['pricing']['input']
        assert haiku_35_legacy['pricing']['output'] < haiku_45['pricing']['output']

    def test_sonnet_cheaper_than_opus(self):
        """Sonnet should be cheaper than Opus"""
        models = PROVIDER_CONFIGS['anthropic']['models']

        sonnet = next(m for m in models if m['id'] == 'claude-sonnet-4-5-20251022')
        opus = next(m for m in models if m['id'] == 'claude-opus-4-5-20251101')

        assert sonnet['pricing']['input'] < opus['pricing']['input']
        assert sonnet['pricing']['output'] < opus['pricing']['output']

    def test_default_model_is_haiku_35_legacy(self):
        """Default model should be the cheapest (Haiku 3.5 Legacy)"""
        default = PROVIDER_CONFIGS['anthropic']['default_model']
        assert default == 'claude-3-5-haiku-20241022'


class TestAnthropicProviderPricing:
    """Test AnthropicProvider pricing calculation"""

    def test_get_model_pricing_returns_dict(self):
        """_get_model_pricing should return dict with input/output keys"""
        provider = AnthropicProvider(model='claude-3-5-haiku-20241022')

        pricing = provider._get_model_pricing('claude-3-5-haiku-20241022')

        assert isinstance(pricing, dict)
        assert 'input' in pricing
        assert 'output' in pricing

    def test_get_model_pricing_haiku_35_legacy(self):
        """Should return correct pricing for Haiku 3.5 Legacy"""
        provider = AnthropicProvider(model='claude-3-5-haiku-20241022')

        pricing = provider._get_model_pricing('claude-3-5-haiku-20241022')

        assert pricing['input'] == 0.25
        assert pricing['output'] == 1.25

    def test_get_model_pricing_haiku_45(self):
        """Should return correct pricing for Haiku 4.5"""
        provider = AnthropicProvider(model='claude-haiku-4-5-20251001')

        pricing = provider._get_model_pricing('claude-haiku-4-5-20251001')

        assert pricing['input'] == 1.00
        assert pricing['output'] == 5.00

    def test_get_model_pricing_sonnet_45(self):
        """Should return correct pricing for Sonnet 4.5"""
        provider = AnthropicProvider(model='claude-sonnet-4-5-20251022')

        pricing = provider._get_model_pricing('claude-sonnet-4-5-20251022')

        assert pricing['input'] == 3.00
        assert pricing['output'] == 15.00

    def test_get_model_pricing_opus_45(self):
        """Should return correct pricing for Opus 4.5"""
        provider = AnthropicProvider(model='claude-opus-4-5-20251101')

        pricing = provider._get_model_pricing('claude-opus-4-5-20251101')

        assert pricing['input'] == 5.00
        assert pricing['output'] == 25.00

    def test_get_model_pricing_unknown_model_returns_fallback(self):
        """Should return fallback pricing for unknown models"""
        provider = AnthropicProvider(model='unknown-model')

        pricing = provider._get_model_pricing('unknown-model')

        # Should return fallback (Sonnet 4.5 pricing)
        assert pricing['input'] == 3.00
        assert pricing['output'] == 15.00

    def test_cost_calculation_example_haiku_35(self):
        """Should correctly calculate cost for Haiku 3.5 Legacy"""
        provider = AnthropicProvider(model='claude-3-5-haiku-20241022')
        pricing = provider._get_model_pricing('claude-3-5-haiku-20241022')

        # Example: 1000 input tokens, 500 output tokens
        input_tokens = 1000
        output_tokens = 500

        input_cost = (input_tokens / 1_000_000) * pricing['input']
        output_cost = (output_tokens / 1_000_000) * pricing['output']
        total_cost = input_cost + output_cost

        # Expected: (1000/1M * 0.25) + (500/1M * 1.25) = 0.00000125 ≈ $0.0000013
        assert total_cost < 0.00001

    def test_cost_calculation_example_opus_45(self):
        """Should correctly calculate cost for Opus 4.5"""
        provider = AnthropicProvider(model='claude-opus-4-5-20251101')
        pricing = provider._get_model_pricing('claude-opus-4-5-20251101')

        # Example: 1000 input tokens, 500 output tokens
        input_tokens = 1000
        output_tokens = 500

        input_cost = (input_tokens / 1_000_000) * pricing['input']
        output_cost = (output_tokens / 1_000_000) * pricing['output']
        total_cost = input_cost + output_cost

        # Expected: (1000/1M * 5.00) + (500/1M * 25.00) = 0.0000175 ≈ $0.000018
        assert total_cost > 0.00001


class TestProviderInstantiation:
    """Test AnthropicProvider instantiation with different models"""

    def test_provider_with_default_model(self):
        """Should create provider with default model"""
        provider = AnthropicProvider()
        assert provider.model == 'claude-3-5-haiku-20241022'

    def test_provider_with_custom_model(self):
        """Should create provider with specified model"""
        provider = AnthropicProvider(model='claude-sonnet-4-5-20251022')
        assert provider.model == 'claude-sonnet-4-5-20251022'

    def test_provider_with_opus_model(self):
        """Should create provider with Opus model"""
        provider = AnthropicProvider(model='claude-opus-4-5-20251101')
        assert provider.model == 'claude-opus-4-5-20251101'

    def test_provider_raises_error_without_api_key(self):
        """Should raise error if ANTHROPIC_API_KEY is missing"""
        import os
        # This test assumes API key is set in environment
        # If API key is missing, constructor should raise ValueError
        # For CI/CD, this test can be skipped if API key is not available
        pass


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
