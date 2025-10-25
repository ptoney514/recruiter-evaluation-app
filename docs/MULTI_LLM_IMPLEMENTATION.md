# Multi-LLM Provider Implementation

This document describes the implementation of multi-LLM provider support for the Batch Resume Ranker application.

## Overview

The application now supports multiple LLM providers (Anthropic Claude and OpenAI) for candidate evaluations. Users can select their preferred provider and model through the UI.

## Changes Made

### 1. Backend Architecture

#### New Files

**`api/llm_providers.py`** - Provider abstraction layer
- Base `LLMProvider` abstract class defining the interface
- `AnthropicProvider` implementation (Claude models)
- `OpenAIProvider` implementation (GPT models)
- Factory function `get_provider()` for instantiating providers
- `PROVIDER_CONFIGS` dictionary with model configurations and pricing

**Supported Providers:**
- **Anthropic Claude**
  - Claude 3.5 Haiku (~$0.003/candidate)
  - Claude 3.5 Sonnet (~$0.015/candidate)
- **OpenAI**
  - GPT-4o Mini (~$0.001/candidate)
  - GPT-4o (~$0.008/candidate)
  - GPT-4 Turbo (~$0.020/candidate)

#### Modified Files

**`api/ai_evaluator.py`**
- Updated to use the new provider abstraction
- Added `provider` and `model` parameters to `evaluate_candidate_with_ai()`
- Returns provider name in response metadata
- Removed direct Anthropic SDK dependency (now goes through provider layer)

**`api/evaluate_candidate.py`**
- Added `provider` and `model` parameters to POST request handling
- Defaults to 'anthropic' for backward compatibility
- Passes provider/model to `evaluate_candidate_with_ai()`

**`api/.env.example`**
- Added `OPENAI_API_KEY` environment variable
- Updated comments to clarify both API keys

### 2. Database Schema

**`supabase/migrations/003_add_llm_provider_tracking.sql`** - New migration
- Added `llm_provider` column to `evaluations` table (VARCHAR(50))
- Added `llm_model` column to `evaluations` table (VARCHAR(100))
- Created indexes for querying by provider and model
- Kept `claude_model` column for backward compatibility (deprecated)

### 3. Frontend Implementation

#### New Files

**`frontend/src/components/ui/Select.jsx`** - Dropdown component
- Reusable select component for provider/model selection
- Styled consistently with existing UI components

#### Modified Files

**`frontend/src/pages/ReviewPage.jsx`**
- Added `LLM_PROVIDERS` configuration object with model details and costs
- Added state variables: `llmProvider`, `llmModel`
- Added `handleProviderChange()` to update model when provider changes
- Added `getCurrentModelCost()` to calculate estimated cost dynamically
- Added UI section for provider and model selection (dropdowns)
- Updated cost estimation to use selected model's cost
- Saves provider/model selection to session storage
- Passes provider/model to evaluation service

**`frontend/src/services/evaluationService.js`**
- Added `provider` and `model` parameters to `evaluateSingleCandidate()`
- Added `provider` and `model` parameters to `evaluateWithAI()`
- Sends provider/model in API request body
- Logs provider/model in console for debugging

## Usage

### Setting Up API Keys

1. **For Anthropic Claude:**
   ```bash
   cd api
   echo "ANTHROPIC_API_KEY=your-key-here" >> .env
   ```

2. **For OpenAI (optional):**
   ```bash
   cd api
   echo "OPENAI_API_KEY=your-key-here" >> .env
   ```

### Using the UI

1. Navigate to the Review page (Step 3)
2. Select "AI Evaluation" mode
3. Choose your preferred **AI Provider** (Anthropic Claude or OpenAI)
4. Choose your preferred **Model** from the dropdown
   - Each model shows estimated cost per candidate
5. The total estimated cost updates automatically based on selection
6. Click "Run AI Evaluation" to start

### API Request Format

```json
POST /api/evaluate_candidate
{
  "job": { ... },
  "candidate": { ... },
  "stage": 1,
  "provider": "openai",
  "model": "gpt-4o-mini",
  "additional_instructions": "..."
}
```

### API Response Format

```json
{
  "success": true,
  "stage": 1,
  "evaluation": { ... },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567,
    "cost": 0.0012
  },
  "model": "gpt-4o-mini",
  "provider": "openai",
  "raw_response": "..."
}
```

## Cost Optimization

The application provides accurate cost estimates based on the selected model:

| Provider | Model | Cost/Candidate | Best For |
|----------|-------|----------------|----------|
| OpenAI | GPT-4o Mini | ~$0.001 | High volume, cost-sensitive |
| Anthropic | Claude 3.5 Haiku | ~$0.003 | Balanced cost/quality |
| OpenAI | GPT-4o | ~$0.008 | General use |
| Anthropic | Claude 3.5 Sonnet | ~$0.015 | Premium quality |
| OpenAI | GPT-4 Turbo | ~$0.020 | Maximum capability |

## Dependencies

### Python Backend
- `anthropic` - Already installed
- `openai` - **New dependency** (install with: `pip install openai`)

### Frontend
- No new dependencies required

## Migration Steps

To deploy to production:

1. **Install Python dependencies:**
   ```bash
   pip install openai
   ```

2. **Run database migration:**
   ```bash
   cd supabase
   # Apply migration 003_add_llm_provider_tracking.sql
   ```

3. **Add OpenAI API key (if using OpenAI):**
   - Add `OPENAI_API_KEY` environment variable to Vercel
   - Or keep using only Anthropic (OpenAI is optional)

4. **Deploy changes:**
   - Frontend changes are backward compatible
   - API defaults to Anthropic if no provider specified
   - Existing evaluations will continue to work

## Testing Checklist

- [ ] Test Anthropic Claude 3.5 Haiku evaluation
- [ ] Test Anthropic Claude 3.5 Sonnet evaluation
- [ ] Test OpenAI GPT-4o Mini evaluation
- [ ] Test OpenAI GPT-4o evaluation
- [ ] Verify cost calculations are accurate
- [ ] Verify provider/model saved to session storage
- [ ] Verify database stores provider/model correctly
- [ ] Test error handling for missing API keys
- [ ] Test error handling for invalid provider/model

## Future Enhancements

- Add support for more providers (Google Gemini, Cohere, etc.)
- Add model comparison view (side-by-side evaluations)
- Add provider performance analytics
- Add automatic provider failover
- Add batch cost optimization recommendations

## Notes

- The implementation maintains backward compatibility - existing code defaults to Anthropic
- OpenAI API key is optional - app works fine with only Anthropic
- Provider abstraction makes it easy to add more providers in the future
- Cost tracking is automatic and stored per evaluation
