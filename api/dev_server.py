#!/usr/bin/env python3
"""
⚠️  DEPRECATED - DO NOT USE ⚠️

This dev server has a broken handler-wrapping architecture that causes
BrokenPipe errors and prevents responses from reaching clients.

USE flask_server.py INSTEAD:
    cd api && python3 flask_server.py

This file is kept for reference only and will be removed in a future release.
"""

# Exit immediately with helpful error message
import sys
print("=" * 70)
print("❌ ERROR: dev_server.py is DEPRECATED and BROKEN")
print("=" * 70)
print("")
print("This server causes BrokenPipe errors and doesn't work properly.")
print("")
print("✅ USE THIS INSTEAD:")
print("   cd api && python3 flask_server.py")
print("")
print("=" * 70)
sys.exit(1)

# Original (broken) code below - DO NOT USE
"""
Simple local development server for testing API endpoints
Mimics Vercel serverless function routing
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys
import os
import importlib.util

# Add api directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables manually (simple .env parser)
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()


class DevServerHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Route POST requests to appropriate API handler"""
        # Add CORS headers to all responses
        self.send_header_called = False

        if self.path.startswith('/api/'):
            # Extract function name from path
            function_name = self.path.replace('/api/', '').split('?')[0]

            try:
                # Load the Python module
                module_path = os.path.join(os.path.dirname(__file__), f'{function_name}.py')

                if not os.path.exists(module_path):
                    self._send_cors_error(404, f'API endpoint not found: {function_name}')
                    return

                # Import the module
                spec = importlib.util.spec_from_file_location(function_name, module_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                # Create a proper handler instance by replacing attributes
                handler_instance = module.handler(
                    self.request,
                    self.client_address,
                    self.server
                )

                # Copy all important attributes from parent handler
                handler_instance.rfile = self.rfile
                handler_instance.wfile = self.wfile
                handler_instance.headers = self.headers
                handler_instance.command = self.command
                handler_instance.path = self.path
                handler_instance.request_version = self.request_version
                handler_instance.requestline = self.requestline
                handler_instance.close_connection = self.close_connection

                # Call the handler's do_POST method
                handler_instance.do_POST()

            except Exception as e:
                self._send_cors_error(500, f'Internal server error: {str(e)}')
                print(f'Error processing {function_name}: {e}')
                import traceback
                traceback.print_exc()
        else:
            self._send_cors_error(404, 'Not found')

    def _send_cors_error(self, code, message):
        """Send error with CORS headers"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        import json
        self.wfile.write(json.dumps({'success': False, 'error': message}).encode('utf-8'))

    def log_message(self, format, *args):
        """Custom log format"""
        print(f'[API] {args[0]}')


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, DevServerHandler)
    print(f'🚀 Local API dev server running on http://localhost:{port}')
    print(f'📁 Serving API functions from: {os.path.dirname(__file__)}')
    print(f'🔑 ANTHROPIC_API_KEY: {"✅ Set" if os.environ.get("ANTHROPIC_API_KEY") else "❌ Not set"}')
    print(f'\nPress Ctrl+C to stop\n')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n\n👋 Server stopped')
        httpd.shutdown()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
