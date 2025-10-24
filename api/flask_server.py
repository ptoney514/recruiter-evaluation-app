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
    print('   GET  /health - Health check')
    print('\nPress Ctrl+C to stop\n')

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
