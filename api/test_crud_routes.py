#!/usr/bin/env python3
"""
Integration tests for crud_routes.py - Flask API endpoints
Tests all CRUD operations through HTTP endpoints
"""

import pytest
import tempfile
import shutil
from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).parent))

import flask_server
import database as db


class TestCRUDRoutes:
    """API route tests"""

    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown test Flask app"""
        # Create temporary database
        self.temp_dir = tempfile.mkdtemp()
        self.original_db_path = db.DB_PATH
        db.DB_PATH = Path(self.temp_dir) / "test.db"

        # Initialize database
        self._init_database()

        # Create Flask test client
        flask_server.app.config['TESTING'] = True
        self.client = flask_server.app.test_client()

        yield

        # Cleanup
        shutil.rmtree(self.temp_dir)
        db.DB_PATH = self.original_db_path

    def _init_database(self):
        """Initialize test database"""
        with db.get_db() as conn:
            # Create tables
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

            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    expires_at TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)

            # Create local user (used by default auth in single-user mode)
            conn.execute("""
                INSERT INTO users (id, email, password_hash, name)
                VALUES (?, ?, ?, ?)
            """, ('local-user', 'local@localhost', 'local-mode-no-password', 'Local User'))

            conn.commit()

    # ========== Job Endpoints ==========

    def test_create_job(self):
        """Test POST /api/jobs"""
        response = self.client.post('/api/jobs', json={
            'title': 'Senior Developer',
            'department': 'Engineering',
            'location': 'SF',
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['job']['title'] == 'Senior Developer'

    def test_get_jobs(self):
        """Test GET /api/jobs"""
        # Create a job first
        self.client.post('/api/jobs', json={'title': 'Test Job'})

        response = self.client.get('/api/jobs')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['jobs']) > 0

    def test_get_job_with_requirements(self):
        """Test GET /api/jobs/<job_id> includes requirements"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Test Job'})
        job_id = job_response.get_json()['job']['id']

        # Create requirements
        self.client.post(f'/api/jobs/{job_id}/requirements', json={
            'text': '5+ years experience',
            'is_required': True,
            'category': 'experience'
        })

        response = self.client.get(f'/api/jobs/{job_id}')

        assert response.status_code == 200
        data = response.get_json()
        assert 'requirements' in data['job']
        assert len(data['job']['requirements']) == 1

    def test_update_job(self):
        """Test PUT /api/jobs/<job_id>"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Original'})
        job_id = job_response.get_json()['job']['id']

        # Update
        response = self.client.put(f'/api/jobs/{job_id}', json={'title': 'Updated'})

        assert response.status_code == 200
        data = response.get_json()
        assert data['job']['title'] == 'Updated'

    def test_delete_job(self):
        """Test DELETE /api/jobs/<job_id>"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'To delete'})
        job_id = job_response.get_json()['job']['id']

        # Delete
        response = self.client.delete(f'/api/jobs/{job_id}')

        assert response.status_code == 200
        assert response.get_json()['success'] is True

        # Verify deleted
        get_response = self.client.get(f'/api/jobs/{job_id}')
        assert get_response.status_code == 404

    # ========== Requirements Endpoints ==========

    def test_create_requirement(self):
        """Test POST /api/jobs/<job_id>/requirements"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        # Create requirement
        response = self.client.post(f'/api/jobs/{job_id}/requirements', json={
            'text': '5+ years Python',
            'is_required': True,
            'category': 'experience'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['requirement']['text'] == '5+ years Python'

    def test_get_requirements(self):
        """Test GET /api/jobs/<job_id>/requirements"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        # Create requirements
        self.client.post(f'/api/jobs/{job_id}/requirements', json={'text': 'Req 1'})
        self.client.post(f'/api/jobs/{job_id}/requirements', json={'text': 'Req 2'})

        response = self.client.get(f'/api/jobs/{job_id}/requirements')

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['requirements']) == 2

    def test_update_requirement(self):
        """Test PUT /api/requirements/<req_id>"""
        # Create job and requirement
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        req_response = self.client.post(f'/api/jobs/{job_id}/requirements', json={
            'text': 'Original text',
            'category': 'skill'
        })
        req_id = req_response.get_json()['requirement']['id']

        # Update
        response = self.client.put(f'/api/requirements/{req_id}', json={
            'text': 'Updated text'
        })

        assert response.status_code == 200
        assert response.get_json()['requirement']['text'] == 'Updated text'

    def test_delete_requirement(self):
        """Test DELETE /api/requirements/<req_id>"""
        # Create job and requirement
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        req_response = self.client.post(f'/api/jobs/{job_id}/requirements', json={
            'text': 'To delete'
        })
        req_id = req_response.get_json()['requirement']['id']

        # Delete
        response = self.client.delete(f'/api/requirements/{req_id}')

        assert response.status_code == 200

    def test_reorder_requirements(self):
        """Test POST /api/jobs/<job_id>/requirements/reorder"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        # Create requirements
        req1_response = self.client.post(f'/api/jobs/{job_id}/requirements', json={'text': 'First'})
        req2_response = self.client.post(f'/api/jobs/{job_id}/requirements', json={'text': 'Second'})
        req3_response = self.client.post(f'/api/jobs/{job_id}/requirements', json={'text': 'Third'})

        req1_id = req1_response.get_json()['requirement']['id']
        req2_id = req2_response.get_json()['requirement']['id']
        req3_id = req3_response.get_json()['requirement']['id']

        # Reorder
        response = self.client.post(f'/api/jobs/{job_id}/requirements/reorder', json={
            'requirement_ids': [req3_id, req1_id, req2_id]
        })

        assert response.status_code == 200
        reqs = response.get_json()['requirements']
        assert reqs[0]['id'] == req3_id
        assert reqs[1]['id'] == req1_id
        assert reqs[2]['id'] == req2_id

    # ========== Candidate Endpoints ==========

    def test_create_candidate(self):
        """Test POST /api/jobs/<job_id>/candidates"""
        # Create job
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        # Create candidate
        response = self.client.post(f'/api/jobs/{job_id}/candidates', json={
            'name': 'John Doe',
            'email': 'john@example.com'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['candidate']['name'] == 'John Doe'
        assert data['candidate']['pipeline_status'] == 'new'

    def test_update_candidate_pipeline_status(self):
        """Test PATCH /api/candidates/<id>/pipeline-status"""
        # Create job and candidate
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        cand_response = self.client.post(f'/api/jobs/{job_id}/candidates', json={
            'name': 'Jane Doe'
        })
        cand_id = cand_response.get_json()['candidate']['id']

        # Update pipeline status
        response = self.client.patch(f'/api/candidates/{cand_id}/pipeline-status', json={
            'pipeline_status': 'reviewed-forward',
            'recruiter_notes': 'Great fit!',
            'quick_tags': ['strong-candidate', 'follow-up']
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['candidate']['pipeline_status'] == 'reviewed-forward'
        assert data['candidate']['recruiter_notes'] == 'Great fit!'
        assert 'strong-candidate' in data['candidate']['quick_tags']

    def test_update_candidate_pipeline_status_invalid(self):
        """Test invalid pipeline status returns error"""
        # Create job and candidate
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        cand_response = self.client.post(f'/api/jobs/{job_id}/candidates', json={
            'name': 'Jane Doe'
        })
        cand_id = cand_response.get_json()['candidate']['id']

        # Try invalid status
        response = self.client.patch(f'/api/candidates/{cand_id}/pipeline-status', json={
            'pipeline_status': 'invalid-status'
        })

        assert response.status_code == 400
        assert response.get_json()['success'] is False

    def test_delete_candidate(self):
        """Test DELETE /api/candidates/<id>"""
        # Create job and candidate
        job_response = self.client.post('/api/jobs', json={'title': 'Test'})
        job_id = job_response.get_json()['job']['id']

        cand_response = self.client.post(f'/api/jobs/{job_id}/candidates', json={
            'name': 'To delete'
        })
        cand_id = cand_response.get_json()['candidate']['id']

        # Delete
        response = self.client.delete(f'/api/candidates/{cand_id}')

        assert response.status_code == 200


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
