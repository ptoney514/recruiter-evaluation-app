"""
Vercel Serverless Function to evaluate candidates using Claude Haiku API
Endpoint: /api/evaluate_candidate
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import anthropic


# Path to recruiting-evaluation skill (update this path as needed)
SKILL_PATH = "/Users/pernelltoney/.claude/skills/recruiting-evaluation/SKILL.md"


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get API key from environment
            api_key = os.environ.get('ANTHROPIC_API_KEY')
            if not api_key:
                self._send_error(500, 'Missing ANTHROPIC_API_KEY environment variable')
                return

            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            job_data = data.get('job')
            candidate_data = data.get('candidate')

            if not job_data or not candidate_data:
                self._send_error(400, 'Missing job or candidate data')
                return

            # Load skill instructions
            skill_instructions = self._load_skill_instructions()

            # Build evaluation prompt
            prompt = self._build_prompt(skill_instructions, job_data, candidate_data)

            # Call Claude API
            client = anthropic.Anthropic(api_key=api_key)

            message = client.messages.create(
                model="claude-3-5-haiku-20241022",  # Claude Haiku
                max_tokens=4096,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse response
            response_text = message.content[0].text
            evaluation_data = self._parse_evaluation(response_text)

            # Calculate cost (Haiku pricing)
            input_cost = (message.usage.input_tokens / 1_000_000) * 0.25
            output_cost = (message.usage.output_tokens / 1_000_000) * 1.25
            total_cost = input_cost + output_cost

            # Send response
            self._send_response(200, {
                'success': True,
                'evaluation': evaluation_data,
                'usage': {
                    'input_tokens': message.usage.input_tokens,
                    'output_tokens': message.usage.output_tokens,
                    'cost': round(total_cost, 4)
                },
                'model': 'claude-3-5-haiku-20241022'
            })

        except Exception as e:
            self._send_error(500, str(e))

    def _load_skill_instructions(self):
        """Load recruiting-evaluation skill instructions"""
        try:
            with open(SKILL_PATH, 'r') as f:
                return f.read()
        except FileNotFoundError:
            # Fallback: use embedded instructions if skill file not found
            return """
You are evaluating a candidate for a job position.

Provide your evaluation in this exact format:

RECOMMENDATION: [ADVANCE|DISPOSITION|HOLD|REQUEST_INTERVIEW]
CONFIDENCE: [High|Medium|Low]
OVERALL_SCORE: [0-10]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

CONCERNS:
- [Concern 1]
- [Concern 2]
- [Concern 3]

REASONING:
[2-3 paragraphs explaining your recommendation]
"""

    def _build_prompt(self, skill_instructions, job_data, candidate_data):
        """Build the evaluation prompt"""
        # Format requirements
        must_haves = '\n'.join([f"- {req}" for req in job_data.get('must_have_requirements', [])])
        preferreds = '\n'.join([f"- {req}" for req in job_data.get('preferred_requirements', [])])

        prompt = f"""{skill_instructions}

---

You are evaluating a candidate for a job position. Use the recruiting-evaluation framework above.

**Job Details:**
Title: {job_data.get('title', 'N/A')}
Department: {job_data.get('department', 'N/A')}
Location: {job_data.get('location', 'N/A')}
Employment Type: {job_data.get('employment_type', 'N/A')}

**Must-Have Requirements:**
{must_haves if must_haves else 'None specified'}

**Preferred Requirements:**
{preferreds if preferreds else 'None specified'}

**Years of Experience:** {job_data.get('years_experience_min', 0)}-{job_data.get('years_experience_max', 'N/A')}
**Compensation Range:** ${job_data.get('compensation_min', 'N/A'):,} - ${job_data.get('compensation_max', 'N/A'):,}

---

**Candidate Profile:**
Name: {candidate_data.get('full_name', 'N/A')}
Email: {candidate_data.get('email', 'N/A')}
Location: {candidate_data.get('location', 'N/A')}
Current Title: {candidate_data.get('current_title', 'N/A')}
Current Company: {candidate_data.get('current_company', 'N/A')}
Years of Experience: {candidate_data.get('years_experience', 'N/A')}
Skills: {', '.join(candidate_data.get('skills', []))}

**Resume:**
{candidate_data.get('resume_text', 'No resume text provided')}

{f"**Cover Letter:**\n{candidate_data.get('cover_letter', '')}" if candidate_data.get('cover_letter') else ''}

---

Please evaluate this candidate and provide your assessment in the following format:

RECOMMENDATION: [ADVANCE|DISPOSITION|HOLD|REQUEST_INTERVIEW]
CONFIDENCE: [High|Medium|Low]
OVERALL_SCORE: [0-10]

KEY_STRENGTHS:
- [List 3-5 key strengths]

CONCERNS:
- [List 3-5 concerns or gaps]

REASONING:
[Provide 2-3 paragraphs explaining your recommendation, referencing specific evidence from the candidate's background]
"""
        return prompt

    def _parse_evaluation(self, response_text):
        """Parse Claude's response into structured data"""
        lines = response_text.strip().split('\n')

        evaluation = {
            'recommendation': 'HOLD',
            'confidence': 'Medium',
            'overall_score': 5.0,
            'key_strengths': [],
            'concerns': [],
            'reasoning': ''
        }

        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('RECOMMENDATION:'):
                evaluation['recommendation'] = line.split(':', 1)[1].strip()
            elif line.startswith('CONFIDENCE:'):
                evaluation['confidence'] = line.split(':', 1)[1].strip()
            elif line.startswith('OVERALL_SCORE:'):
                try:
                    score = float(line.split(':', 1)[1].strip())
                    evaluation['overall_score'] = score
                except:
                    pass
            elif line.startswith('KEY_STRENGTHS:'):
                current_section = 'strengths'
            elif line.startswith('CONCERNS:'):
                current_section = 'concerns'
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            elif line.startswith('- ') and current_section == 'strengths':
                evaluation['key_strengths'].append(line[2:])
            elif line.startswith('- ') and current_section == 'concerns':
                evaluation['concerns'].append(line[2:])
            elif current_section == 'reasoning' and line:
                evaluation['reasoning'] += line + ' '

        evaluation['reasoning'] = evaluation['reasoning'].strip()

        return evaluation

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
