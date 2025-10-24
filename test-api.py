#!/usr/bin/env python3
"""
Quick API test script for regex evaluation endpoint
"""
import requests
import json

# Test data
job = {
    "title": "Information Security Officer",
    "summary": "Banking institution seeking an experienced Information Security Officer",
    "requirements": [
        "Cybersecurity",
        "Information Security",
        "Audit and Compliance",
        "Business Continuity",
        "Vendor Management",
        "5 years experience"
    ],
    "education": "Bachelor degree in Information Technology",
    "licenses": ""
}

candidates = [
    {
        "name": "Joseph Daffer",
        "text": """Joseph Daffer
2621 S 60 St, Omaha, NE 68106
402.210.4408 | josephdaffer@gmail.com

Summary of Qualifications
My background includes over 25 years of experience in all areas of Information Technology. Information Security Officer. Business Continuity and Disaster Recovery, Vendor Management, Policy & Governance, Audit and Compliance.

Areas of Expertise
IT Management Audit & Compliance Policy & Governance
Security Management Vendor Management Operational Management

Professional Experience
TS Banking Group Treynor, IA 2018 - Present
Information Security Officer 2020 - Present
Responsibilities include Business Continuity and Disaster Recovery, Vendor Management, Policy & Governance, as well as Audit and Compliance.

Certifications
Certified Banking Business Continuity Professional SBS Cyber 2020
Certified Banking Security Manager SBS Cyber 2021

Education
Bellevue University, M.S. Cybersecurity, Bellevue, NE, 2012
Bellevue University, B.S. Business Information Systems, Bellevue, NE, 2003"""
    }
]

# Make request
try:
    response = requests.post(
        'http://localhost:8000/api/evaluate_regex',
        json={'job': job, 'candidates': candidates},
        headers={'Content-Type': 'application/json'}
    )

    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    print(json.dumps(response.json(), indent=2))

    # Verify snake_case fields are present (backend returns snake_case)
    result = response.json()
    if result.get('results'):
        candidate = result['results'][0]
        print(f"\n=== VERIFICATION ===")
        print(f"Candidate: {candidate.get('name')}")
        print(f"Score: {candidate.get('score')}")
        print(f"Recommendation: {candidate.get('recommendation')}")
        print(f"\nBackend returns snake_case:")
        print(f"  - matched_keywords: {candidate.get('matched_keywords')}")
        print(f"  - missing_keywords: {candidate.get('missing_keywords')}")
        print(f"\nFrontend should convert to camelCase:")
        print(f"  - matchedKeywords (camelCase conversion needed)")
        print(f"  - missingKeywords (camelCase conversion needed)")

except Exception as e:
    print(f"Error: {e}")
