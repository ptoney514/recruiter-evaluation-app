"""
Unit tests for http_utils.py
Tests the ResponseHelper class for HTTP response handling
"""
import unittest
from unittest.mock import Mock, MagicMock, call
import json
import sys
import os

# Add api directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from http_utils import ResponseHelper


class TestResponseHelper(unittest.TestCase):
    """Test cases for ResponseHelper class"""

    def setUp(self):
        """Set up mock handler for each test"""
        self.handler = Mock()
        self.handler.send_response = Mock()
        self.handler.send_header = Mock()
        self.handler.end_headers = Mock()
        self.handler.wfile = Mock()
        self.handler.wfile.write = Mock()

    def test_send_json_basic(self):
        """Test basic JSON response sending"""
        data = {'message': 'Hello', 'value': 42}
        status_code = 200

        ResponseHelper.send_json(self.handler, status_code, data)

        # Verify status code
        self.handler.send_response.assert_called_once_with(200)

        # Verify headers
        expected_headers = [
            call('Content-type', 'application/json'),
            call('Access-Control-Allow-Origin', '*'),
            call('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'),
            call('Access-Control-Allow-Headers', 'Content-Type')
        ]
        self.handler.send_header.assert_has_calls(expected_headers)

        # Verify end_headers called
        self.handler.end_headers.assert_called_once()

        # Verify body written
        expected_body = json.dumps(data).encode('utf-8')
        self.handler.wfile.write.assert_called_once_with(expected_body)

    def test_send_json_with_nested_data(self):
        """Test JSON response with nested objects"""
        data = {
            'user': {'name': 'John', 'email': 'john@example.com'},
            'items': [1, 2, 3]
        }
        status_code = 200

        ResponseHelper.send_json(self.handler, status_code, data)

        # Verify JSON serialization
        written_data = self.handler.wfile.write.call_args[0][0]
        decoded = json.loads(written_data.decode('utf-8'))
        self.assertEqual(decoded, data)

    def test_send_error_basic(self):
        """Test basic error response"""
        message = 'Something went wrong'
        status_code = 400

        ResponseHelper.send_error(self.handler, status_code, message)

        # Verify status code
        self.handler.send_response.assert_called_once_with(400)

        # Verify error format
        written_data = self.handler.wfile.write.call_args[0][0]
        decoded = json.loads(written_data.decode('utf-8'))

        self.assertEqual(decoded['success'], False)
        self.assertEqual(decoded['error'], message)

    def test_send_error_500(self):
        """Test internal server error response"""
        message = 'Database connection failed'
        status_code = 500

        ResponseHelper.send_error(self.handler, status_code, message)

        # Verify 500 status
        self.handler.send_response.assert_called_once_with(500)

        # Verify error structure
        written_data = self.handler.wfile.write.call_args[0][0]
        decoded = json.loads(written_data.decode('utf-8'))

        self.assertIn('success', decoded)
        self.assertIn('error', decoded)
        self.assertFalse(decoded['success'])

    def test_send_success_basic(self):
        """Test successful response helper"""
        data = {'result': 'completed', 'count': 10}

        ResponseHelper.send_success(self.handler, data)

        # Verify 200 status
        self.handler.send_response.assert_called_once_with(200)

        # Verify success format
        written_data = self.handler.wfile.write.call_args[0][0]
        decoded = json.loads(written_data.decode('utf-8'))

        self.assertTrue(decoded['success'])
        self.assertEqual(decoded['result'], 'completed')
        self.assertEqual(decoded['count'], 10)

    def test_send_json_cors_headers(self):
        """Test that all CORS headers are set correctly"""
        ResponseHelper.send_json(self.handler, 200, {})

        # Extract all header calls
        header_calls = self.handler.send_header.call_args_list
        headers = {call[0][0]: call[0][1] for call in header_calls}

        # Verify CORS headers
        self.assertEqual(headers['Access-Control-Allow-Origin'], '*')
        self.assertIn('POST', headers['Access-Control-Allow-Methods'])
        self.assertIn('GET', headers['Access-Control-Allow-Methods'])
        self.assertIn('OPTIONS', headers['Access-Control-Allow-Methods'])
        self.assertEqual(headers['Access-Control-Allow-Headers'], 'Content-Type')

    def test_send_json_different_status_codes(self):
        """Test various HTTP status codes"""
        test_cases = [
            (200, {'status': 'ok'}),
            (201, {'created': True}),
            (400, {'error': 'bad request'}),
            (404, {'error': 'not found'}),
            (500, {'error': 'internal error'})
        ]

        for status_code, data in test_cases:
            with self.subTest(status_code=status_code):
                # Reset mock
                self.handler.send_response.reset_mock()

                ResponseHelper.send_json(self.handler, status_code, data)

                self.handler.send_response.assert_called_once_with(status_code)

    def test_send_error_preserves_message(self):
        """Test that error messages are not modified"""
        messages = [
            'Simple error',
            'Error with "quotes"',
            "Error with 'single quotes'",
            'Error with\nnewlines',
            'Error with special chars: <>&'
        ]

        for message in messages:
            with self.subTest(message=message):
                # Reset mock
                self.handler.wfile.write.reset_mock()

                ResponseHelper.send_error(self.handler, 400, message)

                # Verify message preserved
                written_data = self.handler.wfile.write.call_args[0][0]
                decoded = json.loads(written_data.decode('utf-8'))
                self.assertEqual(decoded['error'], message)


if __name__ == '__main__':
    unittest.main()
