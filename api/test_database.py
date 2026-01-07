#!/usr/bin/env python3
"""
Unit tests for database.py - Database functions
Tests all CRUD operations for requirements, jobs, and candidates
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
import json
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

import database as db


class TestDatabase:
    """Database tests with temporary database"""

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown test database"""
        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp()
        self.original_db_path = db.DB_PATH

        # Point to temp database
        db.DB_PATH = Path(self.temp_dir) / "test.db"

        # Initialize tables
        self._init_tables()

        # Create test user
        self.user_id = "test-user-1"
        self.create_test_user()

        yield

        # Cleanup
        shutil.rmtree(self.temp_dir)
        db.DB_PATH = self.original_db_path

    def _init_tables(self):
        """Initialize database tables"""
        with db.get_db() as conn:
            # Users table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    name TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            """)

            # Jobs table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    department TEXT,
                    location TEXT,
                    summary TEXT,
                    must_have_requirements TEXT DEFAULT '[]',
                    preferred_requirements TEXT DEFAULT '[]',
                    status TEXT DEFAULT 'active',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)

            # Requirements table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS requirements (
                    id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL,
                    text TEXT NOT NULL,
                    is_required BOOLEAN DEFAULT 1,
                    category TEXT DEFAULT 'other',
                    sort_order INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
                )
            """)

            # Candidates table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS candidates (
                    id TEXT PRIMARY KEY,
                    job_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT,
                    phone TEXT,
                    resume_text TEXT,
                    resume_file_path TEXT,
                    quick_score INTEGER,
                    quick_score_model TEXT,
                    quick_score_at TEXT,
                    quick_score_analysis TEXT,
                    stage1_score REAL,
                    stage1_a_score REAL,
                    stage1_t_score REAL,
                    stage1_q_score REAL,
                    stage1_evaluated_at TEXT,
                    stage2_score REAL,
                    stage2_evaluated_at TEXT,
                    recommendation TEXT,
                    status TEXT DEFAULT 'pending',
                    pipeline_status TEXT DEFAULT 'new',
                    recruiter_notes TEXT,
                    quick_tags TEXT DEFAULT '[]',
                    notes_updated_at TEXT,
                    scoring_model TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
                )
            """)

            conn.commit()

    def create_test_user(self):
        """Create test user"""
        with db.get_db() as conn:
            conn.execute("""
                INSERT INTO users (id, email, password_hash, name)
                VALUES (?, ?, ?, ?)
            """, (self.user_id, "test@example.com", "hashed", "Test User"))
            conn.commit()

    # ========== Job Tests ==========

    def test_create_job(self):
        """Test creating a job"""
        job_data = {
            'title': 'Senior Developer',
            'department': 'Engineering',
            'location': 'San Francisco',
            'summary': 'Looking for a senior developer',
            'must_have_requirements': ['5+ years experience', 'Python'],
            'preferred_requirements': ['AWS', 'Docker']
        }

        job = db.create_job(self.user_id, job_data)

        assert job is not None
        assert job['title'] == 'Senior Developer'
        assert job['user_id'] == self.user_id
        assert isinstance(job['requirements'], list)
        assert len(job['requirements']) == 0  # No requirements yet (JSON migration)

    def test_get_job(self):
        """Test getting a job by ID"""
        job_data = {'title': 'Test Job', 'department': 'Engineering'}
        created = db.create_job(self.user_id, job_data)

        job = db.get_job(created['id'])

        assert job is not None
        assert job['id'] == created['id']
        assert job['title'] == 'Test Job'

    def test_update_job(self):
        """Test updating a job"""
        job_data = {'title': 'Original Title', 'department': 'Sales'}
        job = db.create_job(self.user_id, job_data)

        updated = db.update_job(job['id'], {'title': 'Updated Title'})

        assert updated['title'] == 'Updated Title'
        assert updated['department'] == 'Sales'  # Unchanged

    def test_delete_job(self):
        """Test deleting a job"""
        job_data = {'title': 'To Delete'}
        job = db.create_job(self.user_id, job_data)

        db.delete_job(job['id'])
        retrieved = db.get_job(job['id'])

        assert retrieved is None

    def test_get_jobs_for_user(self):
        """Test getting all jobs for a user"""
        db.create_job(self.user_id, {'title': 'Job 1'})
        db.create_job(self.user_id, {'title': 'Job 2'})

        other_user_id = "other-user"
        with db.get_db() as conn:
            conn.execute(
                "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)",
                (other_user_id, "other@test.com", "hash")
            )
            conn.commit()

        db.create_job(other_user_id, {'title': 'Other Job'})

        jobs = db.get_jobs_for_user(self.user_id)

        assert len(jobs) == 2
        assert all(j['user_id'] == self.user_id for j in jobs)

    # ========== Requirements Tests ==========

    def test_create_requirement(self):
        """Test creating a requirement"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        req_data = {
            'text': '5+ years Python experience',
            'is_required': True,
            'category': 'experience'
        }
        req = db.create_requirement(job['id'], req_data)

        assert req is not None
        assert req['text'] == '5+ years Python experience'
        assert req['is_required'] == 1
        assert req['category'] == 'experience'

    def test_get_requirements_for_job(self):
        """Test getting all requirements for a job"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        db.create_requirement(job['id'], {'text': 'Req 1', 'is_required': True})
        db.create_requirement(job['id'], {'text': 'Req 2', 'is_required': False})

        reqs = db.get_requirements_for_job(job['id'])

        assert len(reqs) == 2
        assert reqs[0]['text'] == 'Req 1'
        assert reqs[1]['text'] == 'Req 2'

    def test_update_requirement(self):
        """Test updating a requirement"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        req = db.create_requirement(job['id'], {
            'text': 'Original text',
            'category': 'skill'
        })

        updated = db.update_requirement(req['id'], {
            'text': 'Updated text'
        })

        assert updated['text'] == 'Updated text'
        assert updated['category'] == 'skill'

    def test_delete_requirement(self):
        """Test deleting a requirement"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        req = db.create_requirement(job['id'], {'text': 'To delete'})

        db.delete_requirement(req['id'])
        retrieved = db.get_requirement(req['id'])

        assert retrieved is None

    def test_reorder_requirements(self):
        """Test reordering requirements"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        req1 = db.create_requirement(job['id'], {'text': 'First'})
        req2 = db.create_requirement(job['id'], {'text': 'Second'})
        req3 = db.create_requirement(job['id'], {'text': 'Third'})

        # Reorder: 3, 1, 2
        reordered = db.reorder_requirements(job['id'], [req3['id'], req1['id'], req2['id']])

        assert reordered[0]['id'] == req3['id']
        assert reordered[1]['id'] == req1['id']
        assert reordered[2]['id'] == req2['id']

    def test_bulk_create_requirements(self):
        """Test bulk creating requirements"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        reqs_data = [
            {'text': 'Req 1', 'is_required': True, 'category': 'experience'},
            {'text': 'Req 2', 'is_required': True, 'category': 'skill'},
            {'text': 'Req 3', 'is_required': False, 'category': 'education'}
        ]

        reqs = db.bulk_create_requirements(job['id'], reqs_data)

        assert len(reqs) == 3
        assert reqs[0]['text'] == 'Req 1'
        assert reqs[2]['category'] == 'education'

    # ========== Candidate Tests ==========

    def test_create_candidate(self):
        """Test creating a candidate"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        candidate_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '555-1234',
            'resume_text': 'My resume content',
        }

        candidate = db.create_candidate(job['id'], candidate_data)

        assert candidate is not None
        assert candidate['name'] == 'John Doe'
        assert candidate['pipeline_status'] == 'new'
        assert candidate['status'] == 'pending'

    def test_get_candidate(self):
        """Test getting a candidate by ID"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        candidate = db.create_candidate(job['id'], {'name': 'Jane Doe'})

        retrieved = db.get_candidate(candidate['id'])

        assert retrieved is not None
        assert retrieved['name'] == 'Jane Doe'

    def test_update_candidate(self):
        """Test updating a candidate"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        candidate = db.create_candidate(job['id'], {'name': 'Original Name'})

        updated = db.update_candidate(candidate['id'], {'name': 'Updated Name'})

        assert updated['name'] == 'Updated Name'

    def test_update_candidate_pipeline_status(self):
        """Test updating candidate pipeline status"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        candidate = db.create_candidate(job['id'], {'name': 'Test'})

        updated = db.update_candidate_pipeline_status(
            candidate['id'],
            'reviewed-forward',
            recruiter_notes='Great candidate!',
            quick_tags=['strong-fit', 'follow-up']
        )

        assert updated['pipeline_status'] == 'reviewed-forward'
        assert updated['recruiter_notes'] == 'Great candidate!'
        assert isinstance(updated['quick_tags'], list)
        assert 'strong-fit' in updated['quick_tags']

    def test_update_candidate_pipeline_status_invalid(self):
        """Test that invalid pipeline status raises error"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        candidate = db.create_candidate(job['id'], {'name': 'Test'})

        with pytest.raises(ValueError):
            db.update_candidate_pipeline_status(candidate['id'], 'invalid-status')

    def test_delete_candidate(self):
        """Test deleting a candidate"""
        job = db.create_job(self.user_id, {'title': 'Job'})
        candidate = db.create_candidate(job['id'], {'name': 'To delete'})

        db.delete_candidate(candidate['id'])
        retrieved = db.get_candidate(candidate['id'])

        assert retrieved is None

    def test_get_candidates_for_job(self):
        """Test getting candidates for a job"""
        job = db.create_job(self.user_id, {'title': 'Job'})

        db.create_candidate(job['id'], {'name': 'Candidate 1'})
        db.create_candidate(job['id'], {'name': 'Candidate 2'})

        candidates = db.get_candidates_for_job(job['id'])

        assert len(candidates) == 2


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
