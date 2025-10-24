"""
Unit tests for Flask AI Evaluation Endpoint
Tests the /api/evaluate_candidate endpoint with mocked Anthropic API calls
"""
import pytest
import json
import os
from unittest.mock import Mock, patch, MagicMock
from flask_server import app


@pytest.fixture
def client():
    """Create Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_job():
    """Sample job description for testing"""
    return {
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "summary": "We are looking for a senior software engineer",
        "requirements": [
            "5+ years of experience",
            "Python expertise",
            "React experience"
        ]
    }


@pytest.fixture
def sample_candidate():
    """Sample candidate for testing"""
    return {
        "name": "John Doe",
        "email": "john@example.com",
        "text": """
John Doe
Senior Software Engineer
john@example.com

SUMMARY
Experienced software engineer with 7 years of Python and React development.

EXPERIENCE
Senior Engineer at Tech Corp (2018-2025)
- Built scalable web applications using Python and React
- Led a team of 3 engineers
        """
    }


@pytest.fixture
def mock_claude_response():
    """Mock Claude API response"""
    mock_message = Mock()
    mock_message.content = [Mock(text="""
SCORE: 85
QUALIFICATIONS_SCORE: 90
EXPERIENCE_SCORE: 85
RISK_FLAGS_SCORE: 80
RECOMMENDATION: ADVANCE TO INTERVIEW

KEY_STRENGTHS:
- 7 years of experience exceeds requirement
- Strong Python and React skills
- Leadership experience

KEY_CONCERNS:
- Need to verify depth of React experience
- Confirm team leadership examples

INTERVIEW_QUESTIONS:
1. Can you describe a complex React application you built?
2. How do you approach mentoring junior developers?
3. Tell me about your experience with scalable architectures

REASONING:
This candidate shows strong qualifications matching the job requirements.
The 7 years of experience exceeds the 5 year minimum, and they have
demonstrated expertise in both Python and React which are key requirements.
    """)]
    mock_message.usage = Mock(
        input_tokens=1200,
        output_tokens=400
    )
    return mock_message


class TestAIEvaluationEndpoint:
    """Test suite for /api/evaluate_candidate endpoint"""

    @patch('ai_evaluator.anthropic.Anthropic')
    def test_successful_evaluation(self, mock_anthropic_class, client, sample_job,
                                   sample_candidate, mock_claude_response):
        """Test successful AI evaluation"""
        # Setup mock
        mock_client = Mock()
        mock_client.messages.create.return_value = mock_claude_response
        mock_anthropic_class.return_value = mock_client

        # Set API key
        os.environ['ANTHROPIC_API_KEY'] = 'test-key'

        # Make request
        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'job': sample_job,
                                  'candidate': sample_candidate,
                                  'stage': 1
                              }),
                              content_type='application/json')

        # Assertions
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['success'] is True
        assert data['stage'] == 1
        assert 'evaluation' in data
        assert 'usage' in data
        assert 'model' in data

        # Check evaluation structure
        evaluation = data['evaluation']
        assert evaluation['score'] == 85
        assert evaluation['qualifications_score'] == 90
        assert evaluation['experience_score'] == 85
        assert evaluation['risk_flags_score'] == 80
        assert evaluation['recommendation'] == 'ADVANCE TO INTERVIEW'
        assert len(evaluation['key_strengths']) == 3
        assert len(evaluation['key_concerns']) == 2
        assert len(evaluation['interview_questions']) == 3
        assert len(evaluation['reasoning']) > 0

        # Check usage
        usage = data['usage']
        assert usage['input_tokens'] == 1200
        assert usage['output_tokens'] == 400
        assert usage['cost'] > 0

    def test_missing_job_data(self, client, sample_candidate):
        """Test error when job data is missing"""
        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'candidate': sample_candidate,
                                  'stage': 1
                              }),
                              content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data

    def test_missing_candidate_data(self, client, sample_job):
        """Test error when candidate data is missing"""
        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'job': sample_job,
                                  'stage': 1
                              }),
                              content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data

    @patch('ai_evaluator.anthropic.Anthropic')
    def test_missing_api_key(self, mock_anthropic_class, client, sample_job, sample_candidate):
        """Test error when API key is missing"""
        # Remove API key
        if 'ANTHROPIC_API_KEY' in os.environ:
            del os.environ['ANTHROPIC_API_KEY']

        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'job': sample_job,
                                  'candidate': sample_candidate,
                                  'stage': 1
                              }),
                              content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'ANTHROPIC_API_KEY' in data['error']

    def test_invalid_stage(self, client, sample_job, sample_candidate):
        """Test error when invalid stage is provided"""
        os.environ['ANTHROPIC_API_KEY'] = 'test-key'

        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'job': sample_job,
                                  'candidate': sample_candidate,
                                  'stage': 3  # Invalid
                              }),
                              content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

    def test_cors_preflight(self, client):
        """Test CORS preflight request"""
        response = client.options('/api/evaluate_candidate')
        assert response.status_code == 200

    @patch('ai_evaluator.anthropic.Anthropic')
    def test_api_error_handling(self, mock_anthropic_class, client, sample_job, sample_candidate):
        """Test handling of Anthropic API errors"""
        # Setup mock to raise exception
        mock_client = Mock()
        mock_client.messages.create.side_effect = Exception("API Error")
        mock_anthropic_class.return_value = mock_client

        os.environ['ANTHROPIC_API_KEY'] = 'test-key'

        response = client.post('/api/evaluate_candidate',
                              data=json.dumps({
                                  'job': sample_job,
                                  'candidate': sample_candidate,
                                  'stage': 1
                              }),
                              content_type='application/json')

        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
