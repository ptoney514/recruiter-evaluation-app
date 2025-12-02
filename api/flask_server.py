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
from extract_job_info import extract_job_info
from parse_performance_profile import parse_performance_profile
from ollama_provider import OllamaProvider, build_quick_score_prompt, parse_quick_score_response

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


@app.route('/api/extract_job_info', methods=['POST', 'OPTIONS'])
@limiter.limit("50 per minute")
def extract_info():
    """Extract structured information from job description text"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job_description = data.get('job_description', '')

        if not job_description or not job_description.strip():
            return jsonify({
                'success': False,
                'error': 'job_description is required'
            }), 400

        # Extract information using AI
        result = extract_job_info(job_description)

        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parse_performance_profile', methods=['POST', 'OPTIONS'])
@limiter.limit("50 per minute")
def parse_profile():
    """Parse uploaded Performance Profile text into structured format"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        profile_text = data.get('profile_text', '')

        if not profile_text or not profile_text.strip():
            return jsonify({
                'success': False,
                'error': 'profile_text is required'
            }), 400

        # Parse with AI
        result = parse_performance_profile(profile_text)

        return jsonify(result)

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ollama/status', methods=['GET', 'OPTIONS'])
def ollama_status():
    """Check if Ollama is running and get available models"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        provider = OllamaProvider()
        is_available = provider.is_available()
        available_models = provider.get_available_models() if is_available else []

        return jsonify({
            'success': True,
            'available': is_available,
            'models': available_models,
            'configured_models': OllamaProvider.AVAILABLE_MODELS
        })

    except Exception as e:
        print(f"Error checking Ollama status: {e}")
        return jsonify({
            'success': True,
            'available': False,
            'models': [],
            'configured_models': OllamaProvider.AVAILABLE_MODELS,
            'error': str(e)
        })


@app.route('/api/evaluate_quick', methods=['POST', 'OPTIONS'])
@limiter.limit("50 per minute")
def evaluate_quick():
    """Quick evaluation using local Ollama LLM"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidate = data.get('candidate', {})
        model = data.get('model', 'mistral')  # Default to mistral

        if not job or not candidate:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidate data'
            }), 400

        # Initialize Ollama provider
        provider = OllamaProvider(model=model)

        # Check if Ollama is available
        if not provider.is_available():
            return jsonify({
                'success': False,
                'error': 'Ollama is not running. Please start Ollama first.',
                'ollama_available': False
            }), 503

        # Build prompt and run evaluation
        prompt = build_quick_score_prompt(job, candidate)
        response_text, usage = provider.evaluate(prompt)

        # Parse the response with full analysis
        result = parse_quick_score_response(response_text, model=model)

        return jsonify({
            'success': True,
            'score': result['score'],
            'reasoning': result['reasoning'],
            'requirements_identified': result['requirements_identified'],
            'match_analysis': result['match_analysis'],
            'methodology': result['methodology'],
            'evaluated_at': result['evaluated_at'],
            'model': model,
            'usage': usage,
            'ollama_available': True
        })

    except Exception as e:
        print(f"Error in quick evaluation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'ollama_available': False
        }), 500


@app.route('/api/evaluate_quick/batch', methods=['POST', 'OPTIONS'])
@limiter.limit("10 per minute")  # More restrictive for batch
def evaluate_quick_batch():
    """Batch quick evaluation using local Ollama LLM"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidates = data.get('candidates', [])
        model = data.get('model', 'mistral')

        if not job or not candidates:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidates data'
            }), 400

        # Initialize Ollama provider
        provider = OllamaProvider(model=model)

        # Check if Ollama is available
        if not provider.is_available():
            return jsonify({
                'success': False,
                'error': 'Ollama is not running. Please start Ollama first.',
                'ollama_available': False
            }), 503

        # Evaluate each candidate
        results = []
        for candidate in candidates:
            try:
                prompt = build_quick_score_prompt(job, candidate)
                response_text, usage = provider.evaluate(prompt)
                result = parse_quick_score_response(response_text, model=model)

                results.append({
                    'candidate_id': candidate.get('id'),
                    'success': True,
                    'score': result['score'],
                    'reasoning': result['reasoning'],
                    'requirements_identified': result['requirements_identified'],
                    'match_analysis': result['match_analysis'],
                    'methodology': result['methodology'],
                    'evaluated_at': result['evaluated_at'],
                    'model': model,
                    'usage': usage
                })
            except Exception as e:
                results.append({
                    'candidate_id': candidate.get('id'),
                    'success': False,
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'results': results,
            'model': model,
            'ollama_available': True
        })

    except Exception as e:
        print(f"Error in batch quick evaluation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'ollama_available': False
        }), 500


@app.route('/api/evaluate_quick/compare', methods=['POST', 'OPTIONS'])
@limiter.limit("20 per minute")
def evaluate_quick_compare():
    """Compare multiple Ollama models on the same candidate"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidate = data.get('candidate', {})
        models = data.get('models', ['phi3', 'mistral', 'llama3'])

        if not job or not candidate:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidate data'
            }), 400

        # Check if Ollama is available
        test_provider = OllamaProvider()
        if not test_provider.is_available():
            return jsonify({
                'success': False,
                'error': 'Ollama is not running. Please start Ollama first.',
                'ollama_available': False
            }), 503

        # Build prompt once (same for all models)
        prompt = build_quick_score_prompt(job, candidate)

        # Run each model
        results = []
        for model in models:
            try:
                provider = OllamaProvider(model=model)
                response_text, usage = provider.evaluate(prompt)
                result = parse_quick_score_response(response_text, model=model)

                results.append({
                    'model': model,
                    'success': True,
                    'score': result['score'],
                    'reasoning': result['reasoning'],
                    'requirements_identified': result['requirements_identified'],
                    'match_analysis': result['match_analysis'],
                    'methodology': result['methodology'],
                    'evaluated_at': result['evaluated_at'],
                    'elapsed_seconds': usage.get('elapsed_seconds', 0),
                    'usage': usage
                })
            except Exception as e:
                results.append({
                    'model': model,
                    'success': False,
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'candidate_id': candidate.get('id'),
            'results': results,
            'ollama_available': True
        })

    except Exception as e:
        print(f"Error in model comparison: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'ollama_available': False
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
    print(f'🛡️  Rate limiting: 100 req/min (generous for local dev)')
    print('🔌 Endpoints:')
    print('   POST /api/evaluate_regex - Regex evaluation')
    print('   POST /api/evaluate_candidate - AI evaluation (Anthropic/OpenAI)')
    print('   POST /api/evaluate_quick - Quick score (Ollama local)')
    print('   POST /api/evaluate_quick/batch - Batch quick score')
    print('   POST /api/evaluate_quick/compare - Model comparison')
    print('   GET  /api/ollama/status - Check Ollama status')
    print('   POST /api/extract_job_info - Extract job info from description')
    print('   POST /api/parse_performance_profile - Parse uploaded Performance Profile')
    print('   GET  /health - Health check')
    print('\nPress Ctrl+C to stop\n')

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
