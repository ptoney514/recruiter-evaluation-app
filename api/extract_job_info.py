"""
Extract Job Information API Endpoint
Parses unstructured job descriptions and extracts structured fields
Uses Claude to intelligently parse job postings from any source
"""

import json
import os
from http.server import BaseHTTPRequestHandler
from anthropic import Anthropic

def extract_job_info(job_description: str) -> dict:
    """
    Extract structured information from job description text

    Args:
        job_description: Unstructured job description text (from Oracle, email, etc.)

    Returns:
        dict with extracted fields:
        - title: Job title
        - location: Office location or "Remote"
        - employment_type: Full-time, Part-time, Contract, Internship
        - compensation_min: Minimum salary/compensation
        - compensation_max: Maximum salary/compensation
    """

    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    extraction_prompt = f"""You are a job description parser. Extract key information from this job posting.

JOB DESCRIPTION:
{job_description}

Extract the following fields (return ONLY valid JSON, no markdown):

{{
  "title": "exact job title (e.g., 'Senior Software Engineer')",
  "location": "city, state or 'Remote' (null if not found)",
  "employment_type": "Full-time, Part-time, Contract, or Internship (null if not found)",
  "compensation_min": numeric value only (e.g., 120000, null if not found),
  "compensation_max": numeric value only (e.g., 180000, null if not found)
}}

RULES:
- Return ONLY the JSON object, no other text
- Use null for fields not found
- For title, extract the primary role name
- For compensation, convert ranges like "$120k-$180k" to 120000 and 180000
- For location, include city and state if present, or "Remote" if remote work mentioned
- Be conservative: Only extract if clearly stated

Example inputs and outputs:

Input: "Senior Software Engineer\\nLocation: San Francisco, CA\\nSalary: $120,000 - $180,000"
Output: {{"title": "Senior Software Engineer", "location": "San Francisco, CA", "employment_type": null, "compensation_min": 120000, "compensation_max": 180000}}

Input: "We're hiring a Marketing Director for our NYC office. Full-time role, $150k+"
Output: {{"title": "Marketing Director", "location": "New York, NY", "employment_type": "Full-time", "compensation_min": 150000, "compensation_max": null}}

Input: "Chief Internal Auditor (Remote)\\nCompensation: $200k-$250k"
Output: {{"title": "Chief Internal Auditor", "location": "Remote", "employment_type": null, "compensation_min": 200000, "compensation_max": 250000}}

Now extract from the job description above:"""

    try:
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            temperature=0,  # Deterministic extraction
            messages=[{
                "role": "user",
                "content": extraction_prompt
            }]
        )

        # Parse Claude's response
        extracted_text = response.content[0].text.strip()

        # Remove markdown code blocks if present
        if extracted_text.startswith("```json"):
            extracted_text = extracted_text.replace("```json", "").replace("```", "").strip()
        elif extracted_text.startswith("```"):
            extracted_text = extracted_text.replace("```", "").strip()

        extracted_data = json.loads(extracted_text)

        # Calculate cost
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cost = (input_tokens * 0.00000025) + (output_tokens * 0.00000125)

        return {
            "success": True,
            "data": extracted_data,
            "metadata": {
                "model": "claude-3-5-haiku-20241022",
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": round(cost, 6)
            }
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": "Failed to parse AI response",
            "details": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "error": "Extraction failed",
            "details": str(e)
        }


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST request to extract job information"""

        # CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            job_description = data.get('job_description', '')

            if not job_description or not job_description.strip():
                response = {
                    "success": False,
                    "error": "job_description is required"
                }
                self.wfile.write(json.dumps(response).encode())
                return

            # Extract information
            result = extract_job_info(job_description)

            # Return result
            self.wfile.write(json.dumps(result).encode())

        except json.JSONDecodeError:
            response = {
                "success": False,
                "error": "Invalid JSON in request body"
            }
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            response = {
                "success": False,
                "error": str(e)
            }
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


# For local testing
if __name__ == "__main__":
    # Test extraction
    test_jd = """
    Senior Software Engineer
    Location: San Francisco, CA
    Salary Range: $120,000 - $180,000 per year
    Employment Type: Full-time

    We are seeking a talented Senior Software Engineer to join our growing team.
    The ideal candidate will have 5+ years of experience with React, TypeScript,
    and Node.js. You'll lead the development of our microservices architecture
    and mentor junior engineers.
    """

    result = extract_job_info(test_jd)
    print(json.dumps(result, indent=2))
