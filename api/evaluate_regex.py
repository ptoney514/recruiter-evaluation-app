"""
Regex-based candidate evaluator - Free, instant keyword matching
Provides quick filtering without AI API costs
Endpoint: /api/evaluate_regex
"""
from http.server import BaseHTTPRequestHandler
import json
import re


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            job = data.get('job', {})
            candidates = data.get('candidates', [])

            if not job or not candidates:
                self._send_error(400, 'Missing job or candidates data')
                return

            # Evaluate all candidates
            results = []
            for candidate in candidates:
                result = self._evaluate_candidate(job, candidate)
                results.append(result)

            # Sort by score descending
            results.sort(key=lambda x: x['score'], reverse=True)

            # Send response
            self._send_response(200, {
                'success': True,
                'results': results,
                'summary': self._generate_summary(results)
            })

        except Exception as e:
            self._send_error(500, str(e))

    def _evaluate_candidate(self, job, candidate):
        """Evaluate a single candidate using keyword matching"""
        name = candidate.get('name', 'Unknown')
        resume_text = candidate.get('text', '').lower()

        # Extract all keywords to look for
        all_keywords = []

        # Add requirements as keywords
        requirements = job.get('requirements', [])
        for req in requirements:
            all_keywords.append(req.lower())

        # Add education keywords if specified
        if job.get('education'):
            all_keywords.append(job.get('education').lower())

        # Add license keywords if specified
        if job.get('licenses'):
            all_keywords.append(job.get('licenses').lower())

        # Score breakdown
        breakdown = {
            'required_keywords': 0,  # 60 points
            'experience_years': 0,   # 20 points
            'education_match': 0     # 20 points
        }

        # 1. Required Keywords (60 points)
        if all_keywords:
            matched = []
            missing = []

            for keyword in all_keywords:
                # Check if keyword appears in resume (case-insensitive)
                if keyword in resume_text:
                    matched.append(keyword)
                else:
                    missing.append(keyword)

            match_percentage = len(matched) / len(all_keywords)
            breakdown['required_keywords'] = match_percentage * 60
        else:
            matched = []
            missing = []
            breakdown['required_keywords'] = 60  # If no keywords specified, give full points

        # 2. Experience Years (20 points)
        required_years = self._extract_required_years(job)
        candidate_years = self._extract_candidate_years(resume_text)

        if required_years and candidate_years:
            if candidate_years >= required_years:
                breakdown['experience_years'] = 20
            else:
                breakdown['experience_years'] = (candidate_years / required_years) * 20
        elif required_years is None:
            breakdown['experience_years'] = 20  # No requirement, give full points
        # If candidate years not found, leave at 0

        # 3. Education Match (20 points)
        education_required = job.get('education', '').lower()
        if education_required:
            education_score = self._score_education(education_required, resume_text)
            breakdown['education_match'] = education_score
        else:
            breakdown['education_match'] = 20  # No requirement, give full points

        # Calculate total score
        total_score = sum(breakdown.values())

        # Determine recommendation
        if total_score >= 85:
            recommendation = 'ADVANCE TO INTERVIEW'
        elif total_score >= 70:
            recommendation = 'PHONE SCREEN FIRST'
        else:
            recommendation = 'DECLINE'

        return {
            'name': name,
            'score': round(total_score),
            'recommendation': recommendation,
            'matched_keywords': matched[:10],  # Limit to 10 for display
            'missing_keywords': missing[:10],
            'breakdown': breakdown,
            'experience_years_found': candidate_years,
            'experience_years_required': required_years
        }

    def _extract_required_years(self, job):
        """Extract required years of experience from job requirements"""
        # Look in requirements array and summary
        text = ' '.join(job.get('requirements', []) + [job.get('summary', '')])

        patterns = [
            r'(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience',
            r'minimum\s+of\s+(\d+)\s+years?',
            r'at\s+least\s+(\d+)\s+years?'
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))

        return None

    def _extract_candidate_years(self, resume_text):
        """Extract years of experience from resume"""
        # Look for explicit statements
        patterns = [
            r'(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience',
            r'(\d+)\s*\+?\s*years?\s+in\s+',
        ]

        for pattern in patterns:
            match = re.search(pattern, resume_text)
            if match:
                years = match.group(1)
                if '+' in match.group(0):
                    return int(years)  # "5+ years" = at least 5
                return int(years)

        # Try to calculate from employment dates
        # Look for patterns like "2018-2023" or "2018-Present"
        date_ranges = re.findall(r'(\d{4})\s*[-–]\s*(\d{4}|present)', resume_text, re.IGNORECASE)

        if date_ranges:
            total_years = 0
            current_year = 2025  # Update this or make dynamic

            for start, end in date_ranges:
                start_year = int(start)
                end_year = current_year if end.lower() == 'present' else int(end)
                years = end_year - start_year
                if years > 0 and years < 50:  # Sanity check
                    total_years += years

            if total_years > 0:
                return total_years

        return None

    def _score_education(self, required, resume_text):
        """Score education match"""
        # Education keywords by level
        phd_keywords = ['ph.d', 'phd', 'doctorate', 'doctoral']
        masters_keywords = ['master', 'm.a.', 'm.s.', 'mba', 'm.div', 'm.t.s']
        bachelors_keywords = ['bachelor', 'b.a.', 'b.s.', 'b.sc', 'undergraduate degree']

        # Determine what's required
        required_lower = required.lower()

        if any(kw in required_lower for kw in phd_keywords):
            # PhD required
            if any(kw in resume_text for kw in phd_keywords):
                return 20
            elif any(kw in resume_text for kw in masters_keywords):
                return 10  # Has Master's, not PhD
            elif any(kw in resume_text for kw in bachelors_keywords):
                return 5   # Only Bachelor's
            return 0

        elif any(kw in required_lower for kw in masters_keywords):
            # Master's required
            if any(kw in resume_text for kw in phd_keywords):
                return 20  # Exceeds requirement
            elif any(kw in resume_text for kw in masters_keywords):
                return 20
            elif any(kw in resume_text for kw in bachelors_keywords):
                return 10  # Only Bachelor's
            return 0

        elif any(kw in required_lower for kw in bachelors_keywords):
            # Bachelor's required
            if any(kw in resume_text for kw in phd_keywords + masters_keywords):
                return 20  # Exceeds requirement
            elif any(kw in resume_text for kw in bachelors_keywords):
                return 20
            return 0

        # No specific requirement, give full points if any degree found
        if any(kw in resume_text for kw in phd_keywords + masters_keywords + bachelors_keywords):
            return 20

        return 0

    def _generate_summary(self, results):
        """Generate summary statistics"""
        total = len(results)
        advance = sum(1 for r in results if r['recommendation'] == 'ADVANCE TO INTERVIEW')
        phone = sum(1 for r in results if r['recommendation'] == 'PHONE SCREEN FIRST')
        decline = sum(1 for r in results if r['recommendation'] == 'DECLINE')

        return {
            'total_candidates': total,
            'advance_to_interview': advance,
            'phone_screen': phone,
            'declined': decline,
            'top_candidate': results[0]['name'] if results else None,
            'top_score': results[0]['score'] if results else 0
        }

    def _send_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
        self.wfile.flush()  # CRITICAL: Flush the buffer to actually send the response

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
