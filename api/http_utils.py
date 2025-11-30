"""
HTTP Utility Functions
Shared utilities for HTTP request handlers to reduce code duplication
"""
import json
import os


def get_allowed_origins():
    """
    Get allowed origins from environment variable or use defaults

    For development: allows localhost:3000, localhost:5173, localhost:8000
    For production: use ALLOWED_ORIGINS env var (comma-separated)
    """
    env_origins = os.environ.get('ALLOWED_ORIGINS', '')
    if env_origins:
        return [origin.strip() for origin in env_origins.split(',')]

    # Development defaults
    return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
    ]


def is_origin_allowed(origin, allowed_origins):
    """Check if request origin is in allowed list"""
    if not origin:
        return False
    return origin in allowed_origins


class ResponseHelper:
    """Helper class for sending HTTP responses"""

    @staticmethod
    def send_json(handler, status_code, data, allowed_origins=None):
        """
        Send JSON response with CORS headers

        Args:
            handler: HTTP request handler instance
            status_code: HTTP status code (200, 400, 500, etc.)
            data: Dictionary to serialize as JSON
            allowed_origins: List of allowed origins (uses env if not provided)
        """
        if allowed_origins is None:
            allowed_origins = get_allowed_origins()

        # Get the origin from the request
        origin = handler.headers.get('Origin', '')

        handler.send_response(status_code)
        handler.send_header('Content-type', 'application/json')

        # Only send CORS header if origin is allowed
        if is_origin_allowed(origin, allowed_origins):
            handler.send_header('Access-Control-Allow-Origin', origin)

        handler.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
        handler.end_headers()
        handler.wfile.write(json.dumps(data).encode('utf-8'))

    @staticmethod
    def send_error(handler, status_code, message):
        """
        Send error response

        Args:
            handler: HTTP request handler instance
            status_code: HTTP error code (400, 500, etc.)
            message: Error message string
        """
        ResponseHelper.send_json(handler, status_code, {
            'success': False,
            'error': message
        })

    @staticmethod
    def send_success(handler, data):
        """
        Send successful response (200 OK)

        Args:
            handler: HTTP request handler instance
            data: Dictionary to send as response
        """
        ResponseHelper.send_json(handler, 200, {
            'success': True,
            **data
        })
