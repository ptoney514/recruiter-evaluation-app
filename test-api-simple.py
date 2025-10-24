#!/usr/bin/env python3
"""
Simple test to verify API endpoint works with real data from UI
"""
import http.client
import json

# Test data matching what the UI sends
data = {
    "job": {
        "name": "Registered Nurse",
        "title": "Registered Nurse (RN)",
        "summary": "Seeking an experienced Registered Nurse",
        "requirements": [
            "Active RN license",
            "BSN or ADN",
            "2+ years experience"
        ],
        "duties": [],
        "education": "BSN or ADN required",
        "licenses": "Active RN license"
    },
    "candidates": [
        {
            "name": "Joseph Daffer",
            "text": "Over 25 years of experience in Information Technology. Master of Cybersecurity from Bellevue University. Information Security Officer. Business Continuity."
        }
    ]
}

try:
    # Create connection
    conn = http.client.HTTPConnection('localhost', 8000, timeout=10)

    # Prepare request
    headers = {'Content-Type': 'application/json'}
    body = json.dumps(data)

    print(f"Sending request to http://localhost:8000/api/evaluate_regex")
    print(f"Request body size: {len(body)} bytes")
    print(f"=" * 60)

    # Send request
    conn.request('POST', '/api/evaluate_regex', body, headers)

    # Get response
    response = conn.getresponse()

    print(f"Response status: {response.status} {response.reason}")
    print(f"Response headers: {dict(response.getheaders())}")
    print(f"=" * 60)

    # Read response data
    response_data = response.read().decode('utf-8')
    print(f"Response body ({len(response_data)} bytes):")

    # Try to parse as JSON
    try:
        result = json.loads(response_data)
        print(json.dumps(result, indent=2))

        if result.get('success'):
            print(f"\n✅ SUCCESS! Received {len(result.get('results', []))} results")
        else:
            print(f"\n❌ API returned error: {result.get('error')}")
    except json.JSONDecodeError:
        print(f"Raw response:\n{response_data}")

    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
