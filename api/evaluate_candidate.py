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
from http_utils import ResponseHelper, get_allowed_origins, is_origin_allowed


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Validate Content-Type header
            content_type = self.headers.get('Content-Type', '')
            if 'application/json' not in content_type:
                self._send_error(400, 'Content-Type must be application/json')
                return

            # Validate Content-Length header
            content_length_header = self.headers.get('Content-Length')
            if not content_length_header:
                self._send_error(400, 'Content-Length header is required')
                return

            try:
                content_length = int(content_length_header)
            except ValueError:
                self._send_error(400, 'Content-Length must be a valid integer')
                return

            # Enforce size limit (50MB) to prevent DoS attacks
            MAX_BODY_SIZE = 50_000_000
            if content_length > MAX_BODY_SIZE:
                self._send_error(413, f'Request body too large (max {MAX_BODY_SIZE} bytes)')
                return

            # Parse request body
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self._send_error(400, f'Invalid JSON: {str(e)}')
                return

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
        """Send JSON response - delegates to ResponseHelper"""
        ResponseHelper.send_json(self, status_code, data)

    def _send_error(self, status_code, message):
        """Send error response - delegates to ResponseHelper"""
        ResponseHelper.send_error(self, status_code, message)

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        allowed_origins = get_allowed_origins()
        origin = self.headers.get('Origin', '')

        self.send_response(200)

        # Only send CORS header if origin is allowed
        if is_origin_allowed(origin, allowed_origins):
            self.send_header('Access-Control-Allow-Origin', origin)

        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
