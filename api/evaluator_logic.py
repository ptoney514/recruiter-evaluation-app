"""
Shared evaluation logic for regex-based candidate ranking
Extracted from evaluate_regex.py and flask_server.py to follow DRY principle
"""
from datetime import datetime
import re

# Scoring thresholds (configurable constants)
SCORE_THRESHOLD_INTERVIEW = 85  # Score >= 85: Advance to interview
SCORE_THRESHOLD_PHONE = 70      # Score 70-84: Phone screen first
# Score < 70: Decline

# Scoring weights
WEIGHT_KEYWORDS = 60  # Keywords account for 60% of score
WEIGHT_EXPERIENCE = 20  # Experience years account for 20%
WEIGHT_EDUCATION = 20   # Education match accounts for 20%


def extract_required_years(job):
    """
    Extract required years of experience from job requirements

    Args:
        job (dict): Job object with requirements, summary fields

    Returns:
        int or None: Required years of experience, or None if not specified
    """
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
    """
    Extract years of experience from resume text

    Args:
        resume_text (str): Resume text (should be lowercase)

    Returns:
        int or None: Years of experience found, or None if not found
    """
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
        current_year = datetime.now().year

        for start, end in date_ranges:
            start_year = int(start)
            end_year = current_year if end.lower() == 'present' else int(end)
            years = end_year - start_year
            if years > 0 and years < 50:  # Sanity check
                total_years += years

        if total_years > 0:
            return total_years

    return None


def score_education(required, resume_text):
    """
    Score education match between job requirement and candidate education

    Args:
        required (str): Required education level
        resume_text (str): Resume text (should be lowercase)

    Returns:
        int: Education match score (0-20 points)
    """
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


def evaluate_candidate(job, candidate):
    """
    Evaluate a single candidate using keyword matching

    Scoring breakdown:
    - Keywords (60 points): Percentage of required keywords found in resume
    - Experience (20 points): Years of experience vs requirement
    - Education (20 points): Education level match

    Args:
        job (dict): Job description with requirements, education, etc.
        candidate (dict): Candidate with name and text fields

    Returns:
        dict: Evaluation result with score, recommendation, breakdown
    """
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
        breakdown['required_keywords'] = match_percentage * WEIGHT_KEYWORDS
    else:
        matched = []
        missing = []
        breakdown['required_keywords'] = WEIGHT_KEYWORDS

    # 2. Experience Years (20 points)
    required_years = extract_required_years(job)
    candidate_years = extract_candidate_years(resume_text)

    if required_years and candidate_years:
        if candidate_years >= required_years:
            breakdown['experience_years'] = WEIGHT_EXPERIENCE
        else:
            breakdown['experience_years'] = (candidate_years / required_years) * WEIGHT_EXPERIENCE
    elif required_years is None:
        breakdown['experience_years'] = WEIGHT_EXPERIENCE

    # 3. Education Match (20 points)
    education_required = job.get('education', '').lower()
    if education_required:
        education_score = score_education(education_required, resume_text)
        breakdown['education_match'] = education_score
    else:
        breakdown['education_match'] = WEIGHT_EDUCATION

    # Calculate total score
    total_score = sum(breakdown.values())

    # Determine recommendation based on thresholds
    if total_score >= SCORE_THRESHOLD_INTERVIEW:
        recommendation = 'ADVANCE TO INTERVIEW'
    elif total_score >= SCORE_THRESHOLD_PHONE:
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


def generate_summary(results):
    """
    Generate summary statistics from evaluation results

    Args:
        results (list): List of evaluation results

    Returns:
        dict: Summary with counts and top candidate info
    """
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
