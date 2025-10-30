"""
HTTP Utility Functions
Shared utilities for HTTP request handlers to reduce code duplication
"""
import json


class ResponseHelper:
    """Helper class for sending HTTP responses"""

    @staticmethod
    def send_json(handler, status_code, data):
        """
        Send JSON response with CORS headers

        Args:
            handler: HTTP request handler instance
            status_code: HTTP status code (200, 400, 500, etc.)
            data: Dictionary to serialize as JSON
        """
        handler.send_response(status_code)
        handler.send_header('Content-type', 'application/json')
        handler.send_header('Access-Control-Allow-Origin', '*')
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
