#!/bin/bash
# Quick API test to verify the endpoint is working

echo "Testing API endpoint: http://localhost:8000/api/evaluate_regex"
echo "=================================================="

curl -X POST http://localhost:8000/api/evaluate_regex \
  -H "Content-Type: application/json" \
  -d '{
    "job": {
      "title": "Test Job",
      "requirements": ["JavaScript", "React"],
      "education": "Bachelor degree"
    },
    "candidates": [
      {
        "name": "Test Candidate",
        "text": "I have 5 years experience with JavaScript and React. I have a Bachelor degree in Computer Science."
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "=================================================="
echo "Test complete!"
