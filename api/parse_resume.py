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
