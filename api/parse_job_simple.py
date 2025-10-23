"""
Simple job description parser - extracts text and uses regex patterns
No AI API calls needed - fast and free!
Endpoint: /api/parse_job_simple
"""
from http.server import BaseHTTPRequestHandler
import json
import base64
import io
import re
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
            file_type = data.get('file_type', 'pdf')

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

            # Extract structured data using regex patterns
            job_data = self._extract_job_data(text)

            # Send success response
            self._send_response(200, {
                'success': True,
                'job_data': job_data
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

    def _extract_job_data(self, text):
        """Extract structured data using regex patterns"""

        # Initialize result
        result = {
            'title': None,
            'department': None,
            'location': None,
            'employment_type': 'Full-time',
            'description': text,  # Always include full text
            'must_have_requirements': [],
            'preferred_requirements': [],
            'years_experience_min': None,
            'years_experience_max': None,
            'compensation_min': None,
            'compensation_max': None
        }

        lines = text.split('\n')

        # Extract title (usually first non-empty line or line with job-related keywords)
        for line in lines[:10]:
            line = line.strip()
            if line and len(line) < 100 and any(word in line.lower() for word in ['engineer', 'developer', 'manager', 'designer', 'analyst', 'lead', 'director']):
                result['title'] = line
                break

        # Extract department
        dept_match = re.search(r'department\s*:?\s*([^\n]+)', text, re.IGNORECASE)
        if dept_match:
            result['department'] = dept_match.group(1).strip()

        # Extract location
        location_match = re.search(r'location\s*:?\s*([^\n]+)', text, re.IGNORECASE)
        if location_match:
            result['location'] = location_match.group(1).strip()

        # Extract employment type
        if re.search(r'\b(part[-\s]time)\b', text, re.IGNORECASE):
            result['employment_type'] = 'Part-time'
        elif re.search(r'\b(contract)\b', text, re.IGNORECASE):
            result['employment_type'] = 'Contract'
        elif re.search(r'\b(internship)\b', text, re.IGNORECASE):
            result['employment_type'] = 'Internship'

        # Extract years of experience
        exp_patterns = [
            r'(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience',
            r'(\d+)\s*-\s*(\d+)\s*years?',
            r'minimum\s+of\s+(\d+)\s+years?'
        ]

        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 1:
                    result['years_experience_min'] = int(match.group(1))
                else:
                    result['years_experience_min'] = int(match.group(1))
                    result['years_experience_max'] = int(match.group(2))
                break

        # Extract compensation
        salary_patterns = [
            r'\$\s*([\d,]+)\s*-\s*\$?\s*([\d,]+)',
            r'\$\s*([\d,]+)\s+to\s+\$?\s*([\d,]+)',
        ]

        for pattern in salary_patterns:
            match = re.search(pattern, text)
            if match:
                result['compensation_min'] = int(match.group(1).replace(',', ''))
                result['compensation_max'] = int(match.group(2).replace(',', ''))
                break

        # Extract requirements (simple approach - look for bullet points or numbered lists)
        # This is basic - just looks for lines that start with bullets or numbers
        in_requirements = False
        in_preferred = False

        for line in lines:
            line = line.strip()

            # Check section headers
            if re.match(r'(required|requirements|qualifications|must[-\s]have)', line, re.IGNORECASE):
                in_requirements = True
                in_preferred = False
                continue
            elif re.match(r'(preferred|nice[-\s]to[-\s]have|bonus|plus)', line, re.IGNORECASE):
                in_requirements = False
                in_preferred = True
                continue
            elif re.match(r'(responsibilities|about|description|how to apply)', line, re.IGNORECASE):
                in_requirements = False
                in_preferred = False
                continue

            # Extract bullet points
            if line and re.match(r'^[-•*]\s+', line):
                clean_line = re.sub(r'^[-•*]\s+', '', line).strip()
                if in_requirements and clean_line:
                    result['must_have_requirements'].append(clean_line)
                elif in_preferred and clean_line:
                    result['preferred_requirements'].append(clean_line)

        return result

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
