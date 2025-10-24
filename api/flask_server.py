#!/usr/bin/env python3
"""
Flask-based API server - WORKING replacement for broken dev_server.py
Properly handles requests and returns responses without BrokenPipe errors
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def extract_required_years(job):
    """Extract required years of experience from job requirements"""
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

def extract_candidate_years(resume_text):
    """Extract years of experience from resume"""
    patterns = [
        r'(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience',
        r'(\d+)\s*\+?\s*years?\s+in\s+',
    ]

    for pattern in patterns:
        match = re.search(pattern, resume_text)
        if match:
            years = match.group(1)
            if '+' in match.group(0):
                return int(years)
            return int(years)

    # Try to calculate from employment dates
    date_ranges = re.findall(r'(\d{4})\s*[-–]\s*(\d{4}|present)', resume_text, re.IGNORECASE)

    if date_ranges:
        total_years = 0
        current_year = 2025

        for start, end in date_ranges:
            start_year = int(start)
            end_year = current_year if end.lower() == 'present' else int(end)
            years = end_year - start_year
            if years > 0 and years < 50:
                total_years += years

        if total_years > 0:
            return total_years

    return None

def score_education(required, resume_text):
    """Score education match"""
    phd_keywords = ['ph.d', 'phd', 'doctorate', 'doctoral']
    masters_keywords = ['master', 'm.a.', 'm.s.', 'mba', 'm.div', 'm.t.s']
    bachelors_keywords = ['bachelor', 'b.a.', 'b.s.', 'b.sc', 'undergraduate degree']

    required_lower = required.lower()

    if any(kw in required_lower for kw in phd_keywords):
        if any(kw in resume_text for kw in phd_keywords):
            return 20
        elif any(kw in resume_text for kw in masters_keywords):
            return 10
        elif any(kw in resume_text for kw in bachelors_keywords):
            return 5
        return 0

    elif any(kw in required_lower for kw in masters_keywords):
        if any(kw in resume_text for kw in phd_keywords):
            return 20
        elif any(kw in resume_text for kw in masters_keywords):
            return 20
        elif any(kw in resume_text for kw in bachelors_keywords):
            return 10
        return 0

    elif any(kw in required_lower for kw in bachelors_keywords):
        if any(kw in resume_text for kw in phd_keywords + masters_keywords):
            return 20
        elif any(kw in resume_text for kw in bachelors_keywords):
            return 20
        return 0

    if any(kw in resume_text for kw in phd_keywords + masters_keywords + bachelors_keywords):
        return 20

    return 0

def evaluate_candidate(job, candidate):
    """Evaluate a single candidate using keyword matching"""
    name = candidate.get('name', 'Unknown')
    resume_text = candidate.get('text', '').lower()

    # Extract all keywords to look for
    all_keywords = []

    requirements = job.get('requirements', [])
    for req in requirements:
        all_keywords.append(req.lower())

    if job.get('education'):
        all_keywords.append(job.get('education').lower())

    if job.get('licenses'):
        all_keywords.append(job.get('licenses').lower())

    # Score breakdown
    breakdown = {
        'required_keywords': 0,
        'experience_years': 0,
        'education_match': 0
    }

    # 1. Required Keywords (60 points)
    if all_keywords:
        matched = []
        missing = []

        for keyword in all_keywords:
            if keyword in resume_text:
                matched.append(keyword)
            else:
                missing.append(keyword)

        match_percentage = len(matched) / len(all_keywords)
        breakdown['required_keywords'] = match_percentage * 60
    else:
        matched = []
        missing = []
        breakdown['required_keywords'] = 60

    # 2. Experience Years (20 points)
    required_years = extract_required_years(job)
    candidate_years = extract_candidate_years(resume_text)

    if required_years and candidate_years:
        if candidate_years >= required_years:
            breakdown['experience_years'] = 20
        else:
            breakdown['experience_years'] = (candidate_years / required_years) * 20
    elif required_years is None:
        breakdown['experience_years'] = 20

    # 3. Education Match (20 points)
    education_required = job.get('education', '').lower()
    if education_required:
        education_score = score_education(education_required, resume_text)
        breakdown['education_match'] = education_score
    else:
        breakdown['education_match'] = 20

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
        'matched_keywords': matched[:10],
        'missing_keywords': missing[:10],
        'breakdown': breakdown,
        'experience_years_found': candidate_years,
        'experience_years_required': required_years
    }

def generate_summary(results):
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

@app.route('/api/evaluate_regex', methods=['POST', 'OPTIONS'])
def evaluate_regex():
    """Evaluate candidates using regex keyword matching"""
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.json
        job = data.get('job', {})
        candidates = data.get('candidates', [])

        if not job or not candidates:
            return jsonify({
                'success': False,
                'error': 'Missing job or candidates data'
            }), 400

        # Evaluate all candidates
        results = []
        for candidate in candidates:
            result = evaluate_candidate(job, candidate)
            results.append(result)

        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)

        # Generate summary
        summary = generate_summary(results)

        return jsonify({
            'success': True,
            'results': results,
            'summary': summary
        })

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Flask API server is running'})

if __name__ == '__main__':
    print('✅ Flask API server starting...')
    print('📍 Running on http://localhost:8000')
    print('🔌 Endpoints:')
    print('   POST /api/evaluate_regex - Evaluate candidates')
    print('   GET  /health - Health check')
    print('\nPress Ctrl+C to stop\n')
    app.run(host='0.0.0.0', port=8000, debug=True)
