"""
Vercel Serverless Function to extract job details from a job description using AI
Endpoint: /api/extract_job_details
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from llm_providers import AnthropicProvider
from http_utils import ResponseHelper


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get content length and read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # Extract job description
            job_description = data.get('job_description', '').strip()

            if not job_description:
                self._send_error(400, 'Missing job_description in request body')
                return

            # Initialize AI provider (Claude Haiku for cost-effective extraction)
            provider = AnthropicProvider(model='claude-3-5-haiku-20241022')

            # Create extraction prompt
            prompt = self._create_extraction_prompt(job_description)

            # Call AI to extract details
            response_text, usage_metadata = provider.evaluate(prompt)

            # Parse the AI response to extract structured data
            extracted_data = self._parse_extraction_response(response_text)

            # Add usage metadata for tracking
            extracted_data['_metadata'] = {
                'cost': usage_metadata['cost'],
                'input_tokens': usage_metadata['input_tokens'],
                'output_tokens': usage_metadata['output_tokens'],
                'model': usage_metadata['model']
            }

            # Send success response
            self._send_response(200, extracted_data)

        except ValueError as e:
            self._send_error(400, str(e))
        except Exception as e:
            print(f'Error in extract_job_details: {str(e)}')
            self._send_error(500, f'Failed to extract job details: {str(e)}')

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        ResponseHelper.send_cors_headers(self)
        self.send_response(200)
        self.end_headers()

    def _create_extraction_prompt(self, job_description: str) -> str:
        """Create prompt for extracting structured job details from description"""
        return f"""You are a job description parser. Extract key information from the job description below and return it in a structured format.

Job Description:
{job_description}

Extract the following information:
1. Job Title
2. Department (e.g., Engineering, Product, Operations, Sales, Marketing)
3. Location (city, state/country, or "Remote")
4. Employment Type (full-time, part-time, or contract)
5. Must-Have Requirements (required skills, experience, qualifications - list each separately)
6. Preferred Qualifications (nice-to-have skills, bonus qualifications - list each separately)

Return ONLY the extracted information in this exact JSON format:

{{
  "title": "extracted job title",
  "department": "extracted department",
  "location": "extracted location",
  "employment_type": "full-time|part-time|contract",
  "must_have_requirements": [
    "requirement 1",
    "requirement 2",
    "requirement 3"
  ],
  "preferred_qualifications": [
    "preferred qualification 1",
    "preferred qualification 2"
  ]
}}

Guidelines:
- If a field cannot be determined, use an empty string "" or empty array []
- Extract 3-8 must-have requirements (the most important ones)
- Extract 2-5 preferred qualifications
- Be concise: each requirement should be 1-2 sentences max
- For requirements with years of experience, include the number (e.g., "Python 5+ years")
- Distinguish between must-have (required) and preferred (nice-to-have) carefully

Return ONLY the JSON, no additional text or explanation."""

    def _parse_extraction_response(self, response_text: str) -> dict:
        """Parse the AI response to extract structured job data"""
        try:
            # Find JSON in response (sometimes AI wraps it in markdown code blocks)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1

            if json_start == -1 or json_end == 0:
                raise ValueError('No JSON found in AI response')

            json_str = response_text[json_start:json_end]
            extracted_data = json.loads(json_str)

            # Validate required fields
            required_fields = ['title', 'department', 'location', 'employment_type',
                             'must_have_requirements', 'preferred_qualifications']

            for field in required_fields:
                if field not in extracted_data:
                    extracted_data[field] = '' if field != 'must_have_requirements' and field != 'preferred_qualifications' else []

            # Ensure arrays are arrays
            if not isinstance(extracted_data['must_have_requirements'], list):
                extracted_data['must_have_requirements'] = []
            if not isinstance(extracted_data['preferred_qualifications'], list):
                extracted_data['preferred_qualifications'] = []

            return extracted_data

        except json.JSONDecodeError as e:
            print(f'JSON parse error: {str(e)}')
            print(f'Response text: {response_text}')
            raise ValueError(f'Failed to parse AI response as JSON: {str(e)}')

    def _send_response(self, status_code: int, data: dict):
        """Send JSON response with CORS headers"""
        ResponseHelper.send_cors_headers(self)
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_error(self, status_code: int, error_message: str):
        """Send error response with CORS headers"""
        ResponseHelper.send_cors_headers(self)
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        error_response = {
            'success': False,
            'error': error_message
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))
