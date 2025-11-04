#!/usr/bin/env python3
"""
Flask-based API server - WORKING replacement for broken dev_server.py
Properly handles requests and returns responses without BrokenPipe errors
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Import shared evaluation logic (DRY principle - no duplication)
from evaluator_logic import evaluate_candidate, generate_summary
from ai_evaluator import evaluate_candidate_with_ai
from llm_providers import AnthropicProvider
import json
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Rate limiting to prevent abuse
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per minute"],
    storage_uri="memory://"  # In-memory storage for development
)

@app.route('/api/evaluate_regex', methods=['POST', 'OPTIONS'])
@limiter.limit("20 per minute")  # More restrictive for evaluation endpoint
def evaluate_regex():
    """Evaluate candidates using regex keyword matching"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidates = data.get('candidates', [])

        if not job or not candidates:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidates data'
            }), 400

        # Evaluate all candidates
        results = []
        for candidate in candidates:
            result = evaluate_candidate(job, candidate)
            results.append(result)

        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)

        # Generate summary
        summary = generate_summary(results)

        return jsonify({
            'success': True,
            'results': results,
            'summary': summary
        })

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/evaluate_candidate', methods=['POST', 'OPTIONS'])
@limiter.limit("100 per minute")  # Generous limit for local dev (Vercel will have its own limits)
def evaluate_with_ai():
    """Evaluate a single candidate using Claude Haiku AI"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidate = data.get('candidate', {})
        stage = data.get('stage', 1)

        if not job or not candidate:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidate data'
            }), 400

        # Call AI evaluator
        result = evaluate_candidate_with_ai(job, candidate, stage)

        return jsonify(result)

    except ValueError as e:
        # Handle missing API key or invalid stage
        print(f"ValueError: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/extract_job_details', methods=['POST', 'OPTIONS'])
@limiter.limit("20 per minute")
def extract_job_details():
    """Extract structured job details from a job description using AI"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job_description = data.get('job_description', '').strip()

        if not job_description:
            return jsonify({
                'success': False,
                'error': 'Missing job_description in request body'
            }), 400

        # Initialize AI provider (Claude Haiku for cost-effective extraction)
        provider = AnthropicProvider(model='claude-3-5-haiku-20241022')

        # Create extraction prompt
        prompt = f"""You are a job description parser. Extract key information from the job description below and return it in a structured format.

Job Description:
{job_description}

Extract the following information:
1. Job Title
2. Department (e.g., Engineering, Product, Operations, Sales, Marketing)
3. Location (city, state/country, or "Remote")
4. Employment Type (full-time, part-time, or contract)
5. Must-Have Requirements (required skills, experience, qualifications - list each separately)
6. Preferred Qualifications (nice-to-have skills, bonus qualifications - list each separately)

Return ONLY the extracted information in this exact JSON format:

{{
  "title": "extracted job title",
  "department": "extracted department",
  "location": "extracted location",
  "employment_type": "full-time|part-time|contract",
  "must_have_requirements": [
    "requirement 1",
    "requirement 2",
    "requirement 3"
  ],
  "preferred_qualifications": [
    "preferred qualification 1",
    "preferred qualification 2"
  ]
}}

Guidelines:
- If a field cannot be determined, use an empty string "" or empty array []
- Extract 3-8 must-have requirements (the most important ones)
- Extract 2-5 preferred qualifications
- Be concise: each requirement should be 1-2 sentences max
- For requirements with years of experience, include the number (e.g., "Python 5+ years")
- Distinguish between must-have (required) and preferred (nice-to-have) carefully

Return ONLY the JSON, no additional text or explanation."""

        # Call AI to extract details
        response_text, usage_metadata = provider.evaluate(prompt)

        # Parse the AI response to extract structured data
        # Find JSON in response (sometimes AI wraps it in markdown code blocks)
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1

        if json_start == -1 or json_end == 0:
            return jsonify({
                'success': False,
                'error': 'No JSON found in AI response'
            }), 500

        json_str = response_text[json_start:json_end]
        extracted_data = json.loads(json_str)

        # Validate and ensure required fields exist
        required_fields = ['title', 'department', 'location', 'employment_type',
                         'must_have_requirements', 'preferred_qualifications']

        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = '' if field not in ['must_have_requirements', 'preferred_qualifications'] else []

        # Ensure arrays are arrays
        if not isinstance(extracted_data['must_have_requirements'], list):
            extracted_data['must_have_requirements'] = []
        if not isinstance(extracted_data['preferred_qualifications'], list):
            extracted_data['preferred_qualifications'] = []

        # Add usage metadata
        extracted_data['_metadata'] = {
            'cost': usage_metadata['cost'],
            'input_tokens': usage_metadata['input_tokens'],
            'output_tokens': usage_metadata['output_tokens'],
            'model': usage_metadata['model']
        }

        return jsonify(extracted_data)

    except json.JSONDecodeError as e:
        print(f'JSON parse error: {str(e)}')
        return jsonify({
            'success': False,
            'error': f'Failed to parse AI response as JSON: {str(e)}'
        }), 500
    except ValueError as e:
        print(f'ValueError: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Flask API server is running'})

if __name__ == '__main__':
    # Environment-based debug mode (NEVER enable in production)
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 8000))

    print('✅ Flask API server starting...')
    print(f'📍 Running on http://localhost:{port}')
    print(f'🔧 Debug mode: {"ON" if debug_mode else "OFF"}')
    print(f'🛡️  Rate limiting: 100 req/min (AI & regex - generous for local dev)')
    print('🔌 Endpoints:')
    print('   POST /api/evaluate_regex - Regex evaluation')
    print('   POST /api/evaluate_candidate - AI evaluation')
    print('   POST /api/extract_job_details - Extract job from description')
    print('   GET  /health - Health check')
    print('\nPress Ctrl+C to stop\n')

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
