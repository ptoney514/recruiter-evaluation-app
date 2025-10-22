"""
Vercel Serverless Function to parse resume files (PDF and DOCX)
Endpoint: /api/parse_resume
"""
from http.server import BaseHTTPRequestHandler
import json
import base64
import io
import pdfplumber
from docx import Document


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length and read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract file data and type
            file_data_base64 = data.get('file_data')
            file_type = data.get('file_type', 'pdf')  # 'pdf' or 'docx'

            if not file_data_base64:
                self._send_error(400, 'Missing file_data')
                return

            # Decode base64 file data
            file_bytes = base64.b64decode(file_data_base64)
            file_stream = io.BytesIO(file_bytes)

            # Parse based on file type
            if file_type.lower() == 'pdf':
                text = self._parse_pdf(file_stream)
            elif file_type.lower() in ['docx', 'doc']:
                text = self._parse_docx(file_stream)
            else:
                self._send_error(400, f'Unsupported file type: {file_type}')
                return

            # Send success response
            self._send_response(200, {
                'success': True,
                'text': text,
                'length': len(text)
            })

        except Exception as e:
            self._send_error(500, str(e))

    def _parse_pdf(self, file_stream):
        """Extract text from PDF file"""
        text_parts = []

        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

        return '\n\n'.join(text_parts)

    def _parse_docx(self, file_stream):
        """Extract text from DOCX file"""
        doc = Document(file_stream)
        text_parts = []

        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)

        return '\n\n'.join(text_parts)

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
