"""
Unit tests for ai_evaluator.py path resolution
Tests environment variable handling and fallback behavior
"""
import unittest
import os
import sys
from unittest.mock import patch, mock_open

# Add api directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestSkillPathResolution(unittest.TestCase):
    """Test cases for SKILL_PATH resolution"""

    def test_skill_path_uses_environment_variable(self):
        """Test that SKILL_PATH uses environment variable when set"""
        custom_path = '/custom/path/to/skill.md'

        with patch.dict(os.environ, {'RECRUITING_SKILL_PATH': custom_path}):
            # Reimport module to get new path
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            self.assertEqual(ai_evaluator.SKILL_PATH, custom_path)

    def test_skill_path_falls_back_to_default(self):
        """Test that SKILL_PATH uses default when env var not set"""
        # Ensure env var is not set
        with patch.dict(os.environ, {}, clear=True):
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            # Should use home directory path
            self.assertIn('.claude', ai_evaluator.SKILL_PATH)
            self.assertIn('skills', ai_evaluator.SKILL_PATH)
            self.assertIn('recruiting-evaluation', ai_evaluator.SKILL_PATH)
            self.assertIn('SKILL.md', ai_evaluator.SKILL_PATH)

    def test_skill_path_expands_tilde(self):
        """Test that default path properly expands home directory"""
        with patch.dict(os.environ, {}, clear=True):
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            # Should not contain literal tilde
            self.assertNotIn('~', ai_evaluator.SKILL_PATH)

            # Should be absolute path
            self.assertTrue(os.path.isabs(ai_evaluator.SKILL_PATH))

    def test_load_skill_instructions_success(self):
        """Test successful loading of skill instructions"""
        mock_content = "Test skill instructions content"

        with patch('builtins.open', mock_open(read_data=mock_content)):
            from ai_evaluator import load_skill_instructions
            result = load_skill_instructions()

            self.assertEqual(result, mock_content)

    def test_load_skill_instructions_fallback(self):
        """Test fallback when skill file not found"""
        with patch('builtins.open', side_effect=FileNotFoundError()):
            from ai_evaluator import load_skill_instructions
            result = load_skill_instructions()

            # Should return fallback instructions
            self.assertIsInstance(result, str)
            self.assertGreater(len(result), 0)
            self.assertIn('Stage 1', result)
            self.assertIn('Stage 2', result)

    def test_load_skill_instructions_contains_framework(self):
        """Test that fallback instructions contain evaluation framework"""
        with patch('builtins.open', side_effect=FileNotFoundError()):
            from ai_evaluator import load_skill_instructions
            result = load_skill_instructions()

            # Verify fallback contains key information
            self.assertIn('Qualifications', result)
            self.assertIn('Experience', result)
            self.assertIn('Risk Flags', result)
            self.assertIn('Interview', result)

    def test_path_works_cross_platform(self):
        """Test that path construction works on different platforms"""
        with patch.dict(os.environ, {}, clear=True):
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            # Verify path uses os.path.join (platform-independent)
            # This test verifies the code structure, actual path varies by OS
            path = ai_evaluator.SKILL_PATH

            # Should be valid path string
            self.assertIsInstance(path, str)
            self.assertGreater(len(path), 0)


class TestPathEdgeCases(unittest.TestCase):
    """Test edge cases for path resolution"""

    def test_empty_environment_variable(self):
        """Test behavior when environment variable is empty string"""
        with patch.dict(os.environ, {'RECRUITING_SKILL_PATH': ''}):
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            # Empty string is falsy, should use fallback
            self.assertIn('.claude', ai_evaluator.SKILL_PATH)

    def test_load_with_nonexistent_directory(self):
        """Test loading when directory structure doesn't exist"""
        nonexistent_path = '/definitely/does/not/exist/skill.md'

        with patch.dict(os.environ, {'RECRUITING_SKILL_PATH': nonexistent_path}):
            import importlib
            import ai_evaluator
            importlib.reload(ai_evaluator)

            # Should set path without error
            self.assertEqual(ai_evaluator.SKILL_PATH, nonexistent_path)

            # Loading should use fallback
            with patch('builtins.open', side_effect=FileNotFoundError()):
                result = ai_evaluator.load_skill_instructions()
                self.assertIn('Stage 1', result)  # Fallback content


if __name__ == '__main__':
    unittest.main()
