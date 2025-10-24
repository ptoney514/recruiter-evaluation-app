#!/usr/bin/env python3
"""
Test script for regex evaluator
Run this to verify the evaluator works before UI testing
"""
import json
import requests

API_URL = "http://localhost:8000/api/evaluate_regex"

def test_basic_evaluation():
    """Test basic keyword matching"""
    print("\n=== Test 1: Basic Keyword Matching ===")

    payload = {
        "job": {
            "title": "Senior Software Engineer",
            "requirements": ["Python", "React", "5+ years experience"],
            "education": "Bachelor's degree"
        },
        "candidates": [
            {
                "name": "John Doe",
                "text": "Experienced Python and React developer with 7 years of professional experience. Bachelor's degree in Computer Science."
            },
            {
                "name": "Jane Smith",
                "text": "Junior developer with 2 years experience. Knows Python. High school graduate."
            }
        ]
    }

    response = requests.post(API_URL, json=payload)

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result['success']}")
        print(f"\nSummary:")
        print(f"  Total Candidates: {result['summary']['total_candidates']}")
        print(f"  Advance to Interview: {result['summary']['advance_to_interview']}")
        print(f"  Phone Screen: {result['summary']['phone_screen']}")
        print(f"  Declined: {result['summary']['declined']}")

        print(f"\nResults:")
        for candidate in result['results']:
            print(f"\n  {candidate['name']}:")
            print(f"    Score: {candidate['score']}")
            print(f"    Recommendation: {candidate['recommendation']}")
            print(f"    Matched Keywords: {candidate['matched_keywords']}")
            print(f"    Missing Keywords: {candidate['missing_keywords']}")

        return True
    else:
        print(f"ERROR: {response.text}")
        return False


def test_campus_minister_realistic():
    """Test with realistic campus minister job data"""
    print("\n=== Test 2: Realistic Campus Minister Evaluation ===")

    payload = {
        "job": {
            "title": "Senior Campus Minister Graduate Ministry",
            "requirements": [
                "Master's degree in theology",
                "3+ years campus ministry experience",
                "Catholic faith",
                "Ignatian spirituality",
                "CPE certification"
            ],
            "education": "Master's in theology required",
            "licenses": "CPE"
        },
        "candidates": [
            {
                "name": "Mary Feuerbach",
                "text": """Mary Sully Feuerbach
                Board Certified Chaplain (BCC)
                M.A. Theology-Ethics, Loyola University Chicago
                CPE Residency completed
                Currently serving as Creighton chaplain for School of Pharmacy
                4+ years serving graduate students at Creighton
                Catholic faith, Ignatian spirituality
                """
            },
            {
                "name": "Steven Smith",
                "text": """Steven Smith
                Baptist ordained minister
                20+ years chaplaincy experience
                BCC, CPE Supervisor
                No Catholic background
                """
            }
        ]
    }

    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
        result = response.json()

        print(f"\nTop Candidate: {result['summary']['top_candidate']} (Score: {result['summary']['top_score']})")

        for candidate in result['results']:
            print(f"\n  {candidate['name']}: {candidate['score']} - {candidate['recommendation']}")
            print(f"    Matched: {', '.join(candidate['matched_keywords'][:5])}")
            if candidate['missing_keywords']:
                print(f"    Missing: {', '.join(candidate['missing_keywords'][:5])}")

        return True
    else:
        print(f"ERROR: {response.text}")
        return False


def test_edge_cases():
    """Test edge cases"""
    print("\n=== Test 3: Edge Cases ===")

    # Test with no requirements
    payload = {
        "job": {"title": "Generic Job"},
        "candidates": [{"name": "Test", "text": "Some resume text"}]
    }

    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
        print("✅ Handles job with no requirements")
        return True
    else:
        print(f"❌ Failed edge case test: {response.text}")
        return False


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("REGEX EVALUATOR API TESTS")
    print("=" * 60)

    results = []

    try:
        results.append(("Basic Evaluation", test_basic_evaluation()))
        results.append(("Realistic Scenario", test_campus_minister_realistic()))
        results.append(("Edge Cases", test_edge_cases()))

        print("\n" + "=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)

        all_passed = True
        for test_name, passed in results:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status}: {test_name}")
            if not passed:
                all_passed = False

        if all_passed:
            print("\n🎉 All tests passed! Ready for UI testing.")
        else:
            print("\n⚠️  Some tests failed. Check errors above.")

        return all_passed

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API server at http://localhost:8000")
        print("Make sure the API server is running:")
        print("  cd api && python3 dev_server.py 8000")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    exit(0 if success else 1)
