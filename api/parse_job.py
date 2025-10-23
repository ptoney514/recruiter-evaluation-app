"""
Vercel Serverless Function to parse job description files using Claude API
Extracts structured job data from PDF, DOCX, or TXT files
Endpoint: /api/parse_job
"""
from http.server import BaseHTTPRequestHandler
import json
import base64
import io
import os
import pdfplumber
from docx import Document
import anthropic


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get API key from environment
            api_key = os.environ.get('ANTHROPIC_API_KEY')
            if not api_key:
                self._send_error(500, 'Missing ANTHROPIC_API_KEY environment variable')
                return

            # Get content length and read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract file data and type
            file_data_base64 = data.get('file_data')
            file_type = data.get('file_type', 'pdf')  # 'pdf', 'docx', or 'txt'

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
            elif file_type.lower() == 'txt':
                text = file_bytes.decode('utf-8')
            else:
                self._send_error(400, f'Unsupported file type: {file_type}')
                return

            # Use Claude to extract structured job data
            job_data = self._extract_job_data(api_key, text)

            # Send success response
            self._send_response(200, {
                'success': True,
                'job_data': job_data,
                'raw_text': text[:500] + '...' if len(text) > 500 else text  # Preview
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

    def _extract_job_data(self, api_key, job_text):
        """Use Claude to extract structured job data from text"""

        prompt = f"""You are a job description parser. Extract structured information from the following job posting.

Job Description Text:
{job_text}

Please extract and return the following information in valid JSON format:

{{
  "title": "Job title (string)",
  "department": "Department name (string or null if not specified)",
  "location": "Work location (string or null if not specified)",
  "employment_type": "Employment type - must be one of: Full-time, Part-time, Contract, Temporary, or Internship (default to Full-time if unclear)",
  "description": "Full job description (string)",
  "must_have_requirements": ["Array of required qualifications and skills"],
  "preferred_requirements": ["Array of preferred/nice-to-have qualifications"],
  "years_experience_min": minimum years of experience required (number or null),
  "years_experience_max": maximum years of experience (number or null),
  "compensation_min": minimum salary/compensation (number or null),
  "compensation_max": maximum salary/compensation (number or null)
}}

Important:
- Extract all must-have requirements from sections like "Requirements", "Qualifications", "Required Skills"
- Extract preferred requirements from sections like "Nice to have", "Preferred", "Bonus"
- For experience, look for phrases like "3-5 years", "5+ years", etc.
- For compensation, extract any salary ranges mentioned
- If information is not available, use null
- Return ONLY valid JSON, no markdown formatting or code blocks"""

        # Call Claude API
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse response - should be JSON
        response_text = message.content[0].text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith('```'):
            # Remove first line (```json or ```)
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1])  # Remove first and last lines

        job_data = json.loads(response_text)

        # Ensure arrays are not None
        if job_data.get('must_have_requirements') is None:
            job_data['must_have_requirements'] = []
        if job_data.get('preferred_requirements') is None:
            job_data['preferred_requirements'] = []

        return job_data

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
