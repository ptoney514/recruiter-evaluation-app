"""
Vercel Serverless Function to evaluate candidates using multiple LLM providers
Supports two-stage evaluation framework:
- Stage 1: Resume Screening (determines who to interview)
- Stage 2: Final Hiring Decision (incorporates interview + references)

Supports multiple LLM providers: Anthropic Claude, OpenAI

Endpoint: /api/evaluate_candidate
"""
from http.server import BaseHTTPRequestHandler
import json
from ai_evaluator import evaluate_candidate_with_ai


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract data
            job = data.get('job', {})
            candidate = data.get('candidate', {})
            stage = data.get('stage', 1)
            provider = data.get('provider', 'anthropic')  # Default to Anthropic
            model = data.get('model', None)  # Use provider default if None

            # Validate required data
            if not job or not candidate:
                self._send_error(400, 'Missing job or candidate data')
                return

            # Call AI evaluator with provider and model (uses ai_evaluator.py module)
            result = evaluate_candidate_with_ai(
                job,
                candidate,
                stage=stage,
                provider=provider,
                model=model
            )

            # Send response
            self._send_response(200, result)

        except ValueError as e:
            # Handle missing API key, invalid stage, or unsupported provider
            self._send_error(400, str(e))
        except NotImplementedError as e:
            self._send_error(501, str(e))
        except Exception as e:
            self._send_error(500, str(e))

    def _send_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_error(self, status_code, message):
        """Send error response"""
        self._send_response(status_code, {
            'success': False,
            'error': message
        })

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
