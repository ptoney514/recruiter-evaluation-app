#!/usr/bin/env python3
"""
Simple standalone server to test evaluate_regex
Just for testing - bypasses dev_server complexity
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os

# Import the evaluation logic directly
sys.path.insert(0, os.path.dirname(__file__))
import evaluate_regex


class SimpleTestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # Read request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            print(f"[TEST] Received request with {len(data.get('candidates', []))} candidates")

            # Get the handler class
            handler_class = evaluate_regex.handler

            # Create instance with proper initialization
            h = handler_class.__new__(handler_class)

            # Evaluate
            job = data.get('job', {})
            candidates = data.get('candidates', [])

            results = []
            for candidate in candidates:
                result = h._evaluate_candidate(job, candidate)
                results.append(result)

            # Sort by score
            results.sort(key=lambda x: x['score'], reverse=True)

            # Generate summary
            summary = h._generate_summary(results)

            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'results': results,
                'summary': summary
            }

            self.wfile.write(json.dumps(response).encode('utf-8'))
            print(f"[TEST] Sent response with {len(results)} results")

        except Exception as e:
            print(f"[TEST] Error: {e}")
            import traceback
            traceback.print_exc()

            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))


if __name__ == '__main__':
    port = 9000  # Different port to avoid conflicts
    server = HTTPServer(('', port), SimpleTestHandler)
    print(f'🧪 Test server running on http://localhost:{port}')
    print(f'Testing evaluate_regex endpoint')
    print(f'Press Ctrl+C to stop\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
