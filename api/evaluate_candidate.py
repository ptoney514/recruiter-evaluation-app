"""
Vercel Serverless Function to evaluate candidates using Claude Haiku API
Supports two-stage evaluation framework:
- Stage 1: Resume Screening (determines who to interview)
- Stage 2: Final Hiring Decision (incorporates interview + references)

Endpoint: /api/evaluate_candidate
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import anthropic


# Path to recruiting-evaluation skill
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

            # Determine evaluation stage (default to Stage 1)
            stage = data.get('stage', 1)

            if stage not in [1, 2]:
                self._send_error(400, 'Invalid stage. Must be 1 or 2.')
                return

            # Load skill instructions
            skill_instructions = self._load_skill_instructions()

            # Build prompt based on stage
            if stage == 1:
                prompt = self._build_stage1_prompt(skill_instructions, data)
            else:
                prompt = self._build_stage2_prompt(skill_instructions, data)

            # Call Claude API
            client = anthropic.Anthropic(api_key=api_key)

            message = client.messages.create(
                model="claude-3-5-haiku-20241022",  # Claude Haiku for cost efficiency
                max_tokens=4096,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse response
            response_text = message.content[0].text

            if stage == 1:
                evaluation_data = self._parse_stage1_response(response_text)
            else:
                evaluation_data = self._parse_stage2_response(response_text)

            # Calculate cost (Haiku pricing)
            input_cost = (message.usage.input_tokens / 1_000_000) * 0.25
            output_cost = (message.usage.output_tokens / 1_000_000) * 1.25
            total_cost = input_cost + output_cost

            # Send response
            self._send_response(200, {
                'success': True,
                'stage': stage,
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
            # Fallback: use basic instructions if skill file not found
            return """
You are evaluating a candidate using a two-stage framework.

Stage 1: Resume Screening (0-100 score)
- Score based on: Qualifications (40%) + Experience (40%) + Risk Flags (20%)
- Thresholds: 85+ = Interview, 70-84 = Phone Screen, <70 = Decline

Stage 2: Final Hiring Decision
- Score based on: Resume (25%) + Interview (50%) + References (25%)
- Interview performance is the most important factor
"""

    def _build_stage1_prompt(self, skill_instructions, data):
        """Build Stage 1: Resume Screening prompt"""
        job_data = data.get('job', {})
        candidate_data = data.get('candidate', {})

        must_haves = '\n'.join([f"- {req}" for req in job_data.get('must_have_requirements', [])])
        preferreds = '\n'.join([f"- {req}" for req in job_data.get('preferred_requirements', [])])

        prompt = f"""{skill_instructions}

---

TASK: Perform Stage 1 Resume Screening for this candidate.

**JOB DETAILS:**
Title: {job_data.get('title', 'N/A')}
Department: {job_data.get('department', 'N/A')}
Location: {job_data.get('location', 'N/A')}
Employment Type: {job_data.get('employment_type', 'Full-time')}

**Must-Have Requirements:**
{must_haves if must_haves else 'None specified'}

**Preferred Requirements:**
{preferreds if preferreds else 'None specified'}

**Experience Range:** {job_data.get('years_experience_min', 0)}-{job_data.get('years_experience_max', 'N/A')} years

**Compensation:** ${job_data.get('compensation_min', 0):,} - ${job_data.get('compensation_max', 0):,}

---

**CANDIDATE PROFILE:**
Name: {candidate_data.get('full_name', 'N/A')}
Email: {candidate_data.get('email', 'N/A')}
Location: {candidate_data.get('location', 'N/A')}
Current Title: {candidate_data.get('current_title', 'N/A')}
Current Company: {candidate_data.get('current_company', 'N/A')}
Years of Experience: {candidate_data.get('years_experience', 'N/A')}
Skills: {', '.join(candidate_data.get('skills', []))}

**RESUME:**
{candidate_data.get('resume_text', 'No resume provided')}

{f"**COVER LETTER:**\n{candidate_data.get('cover_letter')}" if candidate_data.get('cover_letter') else ''}

---

Provide your Stage 1 evaluation in this format:

SCORE: [0-100]
QUALIFICATIONS_SCORE: [0-100]
EXPERIENCE_SCORE: [0-100]
RISK_FLAGS_SCORE: [0-100]
RECOMMENDATION: [ADVANCE TO INTERVIEW / PHONE SCREEN FIRST / DECLINE]

KEY_STRENGTHS:
- [Strength 1]
- [Strength 2]
- [Strength 3]

KEY_CONCERNS:
- [Concern 1]
- [Concern 2]
- [Concern 3]

INTERVIEW_QUESTIONS:
1. [Question about concern/experience]
2. [Question to verify skill]
3. [Question about role fit]

REASONING:
[2-3 paragraphs explaining the scoring and recommendation]
"""
        return prompt

    def _build_stage2_prompt(self, skill_instructions, data):
        """Build Stage 2: Post-Interview Evaluation prompt"""
        job_data = data.get('job', {})
        candidate_data = data.get('candidate', {})
        resume_score = data.get('resume_score', 0)  # From Stage 1
        interview_data = data.get('interview', {})  # Interview ratings
        references_data = data.get('references', [])  # Reference check data

        # Calculate average interview rating (1-10 scale, convert to 0-100)
        interview_rating = interview_data.get('overall_rating', 5) * 10

        # Calculate average reference rating (1-10 scale, convert to 0-100)
        if references_data:
            ref_ratings = [ref.get('overall_rating', 5) for ref in references_data]
            reference_rating = (sum(ref_ratings) / len(ref_ratings)) * 10
        else:
            reference_rating = 50  # Default if no references

        prompt = f"""{skill_instructions}

---

TASK: Perform Stage 2 Final Hiring Evaluation for this candidate.

**CANDIDATE:** {candidate_data.get('full_name', 'N/A')}
**JOB TITLE:** {job_data.get('title', 'N/A')}

---

**STAGE 1 RESUME SCORE:** {resume_score}/100 (Weight: 25%)

---

**STAGE 2 DATA:**

**INTERVIEW PERFORMANCE:** {interview_rating}/100 (Weight: 50%)
Overall Rating: {interview_data.get('overall_rating', 'N/A')}/10
Recommendation: {interview_data.get('recommendation', 'N/A')}
Red Flags: {', '.join(interview_data.get('red_flags', [])) if interview_data.get('red_flags') else 'None'}

Interview Notes:
{interview_data.get('notes', 'No notes provided')}

Compared to Resume: {interview_data.get('vs_resume_expectations', 'N/A')}

---

**REFERENCE CHECKS:** {reference_rating}/100 (Weight: 25%)

{self._format_references(references_data) if references_data else 'No reference checks conducted yet'}

---

Calculate the final score and provide your Stage 2 evaluation:

FINAL_SCORE: [Calculated: (Resume × 0.25) + (Interview × 0.50) + (References × 0.25)]
RESUME_WEIGHTED: [Resume score × 0.25]
INTERVIEW_WEIGHTED: [Interview score × 0.50]
REFERENCES_WEIGHTED: [Reference score × 0.25]

RECOMMENDATION: [STRONG HIRE / HIRE / DO NOT HIRE / KEEP SEARCHING]
CONFIDENCE: [High / Medium / Low]

WHERE_INTERVIEW_CONTRADICTED_RESUME:
- [Observation 1]
- [Observation 2]

WHERE_INTERVIEW_CONFIRMED_RESUME:
- [Confirmation 1]
- [Confirmation 2]

REFERENCE_HIGHLIGHTS:
- [Theme 1]
- [Theme 2]

REASONING:
[2-3 paragraphs explaining why this is/isn't the right hire, weighing the interview performance (50%) most heavily, and how references validate or contradict the interview observations]
"""
        return prompt

    def _format_references(self, references_data):
        """Format reference check data for prompt"""
        formatted = []
        for i, ref in enumerate(references_data, 1):
            formatted.append(f"""
Reference {i}:
- Name: {ref.get('reference_name', 'N/A')}
- Relationship: {ref.get('relationship', 'N/A')}
- Rating: {ref.get('overall_rating', 'N/A')}/10
- Would Rehire: {ref.get('would_rehire', 'N/A')}
- Strengths: {ref.get('strengths', 'N/A')}
- Areas for Development: {ref.get('areas_for_development', 'N/A')}
- Notes: {ref.get('notes', 'N/A')}
""")
        return '\n'.join(formatted)

    def _parse_stage1_response(self, response_text):
        """Parse Stage 1 evaluation response"""
        lines = response_text.strip().split('\n')

        evaluation = {
            'score': 0,
            'qualifications_score': 0,
            'experience_score': 0,
            'risk_flags_score': 0,
            'recommendation': 'DECLINE',
            'key_strengths': [],
            'key_concerns': [],
            'interview_questions': [],
            'reasoning': ''
        }

        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('SCORE:'):
                try:
                    evaluation['score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('QUALIFICATIONS_SCORE:'):
                try:
                    evaluation['qualifications_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('EXPERIENCE_SCORE:'):
                try:
                    evaluation['experience_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('RISK_FLAGS_SCORE:'):
                try:
                    evaluation['risk_flags_score'] = int(line.split(':', 1)[1].strip())
                except:
                    pass
            elif line.startswith('RECOMMENDATION:'):
                evaluation['recommendation'] = line.split(':', 1)[1].strip()
            elif line.startswith('KEY_STRENGTHS:'):
                current_section = 'strengths'
            elif line.startswith('KEY_CONCERNS:'):
                current_section = 'concerns'
            elif line.startswith('INTERVIEW_QUESTIONS:'):
                current_section = 'questions'
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            elif line.startswith('- ') and current_section == 'strengths':
                evaluation['key_strengths'].append(line[2:])
            elif line.startswith('- ') and current_section == 'concerns':
                evaluation['key_concerns'].append(line[2:])
            elif line.startswith(('1.', '2.', '3.')) and current_section == 'questions':
                evaluation['interview_questions'].append(line[3:].strip())
            elif current_section == 'reasoning' and line:
                evaluation['reasoning'] += line + ' '

        evaluation['reasoning'] = evaluation['reasoning'].strip()

        return evaluation

    def _parse_stage2_response(self, response_text):
        """Parse Stage 2 evaluation response"""
        lines = response_text.strip().split('\n')

        evaluation = {
            'final_score': 0,
            'resume_weighted': 0,
            'interview_weighted': 0,
            'references_weighted': 0,
            'recommendation': 'DO NOT HIRE',
            'confidence': 'Medium',
            'interview_contradictions': [],
            'interview_confirmations': [],
            'reference_highlights': [],
            'reasoning': ''
        }

        current_section = None

        for line in lines:
            line = line.strip()

            if line.startswith('FINAL_SCORE:'):
                try:
                    score_text = line.split(':', 1)[1].strip()
                    # Extract number from text like "[Calculated: 85.5]" or just "85.5"
                    import re
                    match = re.search(r'[\d.]+', score_text)
                    if match:
                        evaluation['final_score'] = float(match.group())
                except:
                    pass
            elif line.startswith('RESUME_WEIGHTED:'):
                try:
                    evaluation['resume_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('INTERVIEW_WEIGHTED:'):
                try:
                    evaluation['interview_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('REFERENCES_WEIGHTED:'):
                try:
                    evaluation['references_weighted'] = float(line.split(':', 1)[1].strip().split()[0])
                except:
                    pass
            elif line.startswith('RECOMMENDATION:'):
                evaluation['recommendation'] = line.split(':', 1)[1].strip()
            elif line.startswith('CONFIDENCE:'):
                evaluation['confidence'] = line.split(':', 1)[1].strip()
            elif line.startswith('WHERE_INTERVIEW_CONTRADICTED_RESUME:'):
                current_section = 'contradictions'
            elif line.startswith('WHERE_INTERVIEW_CONFIRMED_RESUME:'):
                current_section = 'confirmations'
            elif line.startswith('REFERENCE_HIGHLIGHTS:'):
                current_section = 'references'
            elif line.startswith('REASONING:'):
                current_section = 'reasoning'
            elif line.startswith('- ') and current_section == 'contradictions':
                evaluation['interview_contradictions'].append(line[2:])
            elif line.startswith('- ') and current_section == 'confirmations':
                evaluation['interview_confirmations'].append(line[2:])
            elif line.startswith('- ') and current_section == 'references':
                evaluation['reference_highlights'].append(line[2:])
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
