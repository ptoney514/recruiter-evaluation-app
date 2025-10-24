#!/usr/bin/env python3
"""
WORKING simple API server - bypasses the broken dev_server.py
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os

# Add api directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import the evaluation logic directly
from evaluate_regex import handler as RegexHandler

class WorkingAPIServer(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/evaluate_regex':
            # Create an instance of the regex handler WITH proper initialization
            # Pass our request/client/server to it
            handler = RegexHandler(self.request, self.client_address, self.server)

            # Copy all attributes the handler needs
            handler.rfile = self.rfile
            handler.wfile = self.wfile
            handler.headers = self.headers
            handler.path = self.path
            handler.command = self.command
            handler.request_version = self.request_version
            handler.requestline = self.requestline  # CRITICAL: needed for logging
            handler.close_connection = self.close_connection

            # Call the handler's POST method
            try:
                handler.do_POST()
            except Exception as e:
                print(f"Error in handler: {e}")
                import traceback
                traceback.print_exc()
                # Send error response manually
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    error_response = json.dumps({'success': False, 'error': str(e)})
                    self.wfile.write(error_response.encode('utf-8'))
                except:
                    pass  # Connection might be closed
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def log_message(self, format, *args):
        print(f"[API] {args[0]}")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(('', port), WorkingAPIServer)
    print(f'✅ Working API server running on http://localhost:{port}')
    print(f'📁 Serving /api/evaluate_regex')
    print(f'\nPress Ctrl+C to stop\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Server stopped')
        server.shutdown()
