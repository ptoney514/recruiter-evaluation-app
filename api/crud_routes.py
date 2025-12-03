"""
CRUD Routes for Jobs and Candidates
RESTful API endpoints for database operations
"""
from flask import request, jsonify
from auth import require_auth
import database as db


def register_crud_routes(app):
    """Register CRUD routes with Flask app"""

    # ============ Jobs ============

    @app.route('/api/jobs', methods=['GET', 'OPTIONS'])
    @require_auth
    def list_jobs():
        """Get all jobs for the current user"""
        if request.method == 'OPTIONS':
            return '', 200

        jobs = db.get_jobs_for_user(request.user['id'])
        return jsonify({'success': True, 'jobs': jobs})

    @app.route('/api/jobs/<job_id>', methods=['GET', 'OPTIONS'])
    @require_auth
    def get_job(job_id):
        """Get a specific job"""
        if request.method == 'OPTIONS':
            return '', 200

        job = db.get_job(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        # Verify ownership
        if job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        return jsonify({'success': True, 'job': job})

    @app.route('/api/jobs', methods=['POST', 'OPTIONS'])
    @require_auth
    def create_job():
        """Create a new job"""
        if request.method == 'OPTIONS':
            return '', 200

        data = request.json or {}
        job = db.create_job(request.user['id'], data)
        return jsonify({'success': True, 'job': job})

    @app.route('/api/jobs/<job_id>', methods=['PUT', 'OPTIONS'])
    @require_auth
    def update_job(job_id):
        """Update a job"""
        if request.method == 'OPTIONS':
            return '', 200

        job = db.get_job(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        if job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        # TODO: Implement update_job in database.py
        return jsonify({'success': True, 'job': job})

    @app.route('/api/jobs/<job_id>', methods=['DELETE', 'OPTIONS'])
    @require_auth
    def delete_job(job_id):
        """Delete a job"""
        if request.method == 'OPTIONS':
            return '', 200

        job = db.get_job(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404

        if job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        # TODO: Implement delete_job in database.py
        return jsonify({'success': True})

    # ============ Candidates ============

    @app.route('/api/jobs/<job_id>/candidates', methods=['GET', 'OPTIONS'])
    @require_auth
    def list_candidates(job_id):
        """Get all candidates for a job"""
        if request.method == 'OPTIONS':
            return '', 200

        # Verify job ownership
        job = db.get_job(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404
        if job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        candidates = db.get_candidates_for_job(job_id)
        return jsonify({'success': True, 'candidates': candidates})

    @app.route('/api/candidates/<candidate_id>', methods=['GET', 'OPTIONS'])
    @require_auth
    def get_candidate(candidate_id):
        """Get a specific candidate"""
        if request.method == 'OPTIONS':
            return '', 200

        candidate = db.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'success': False, 'error': 'Candidate not found'}), 404

        # Verify ownership via job
        job = db.get_job(candidate['job_id'])
        if not job or job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        return jsonify({'success': True, 'candidate': candidate})

    @app.route('/api/jobs/<job_id>/candidates', methods=['POST', 'OPTIONS'])
    @require_auth
    def create_candidate(job_id):
        """Create a new candidate"""
        if request.method == 'OPTIONS':
            return '', 200

        # Verify job ownership
        job = db.get_job(job_id)
        if not job:
            return jsonify({'success': False, 'error': 'Job not found'}), 404
        if job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        data = request.json or {}
        candidate = db.create_candidate(job_id, data)
        return jsonify({'success': True, 'candidate': candidate})

    @app.route('/api/candidates/<candidate_id>', methods=['PUT', 'OPTIONS'])
    @require_auth
    def update_candidate(candidate_id):
        """Update a candidate"""
        if request.method == 'OPTIONS':
            return '', 200

        candidate = db.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'success': False, 'error': 'Candidate not found'}), 404

        # Verify ownership via job
        job = db.get_job(candidate['job_id'])
        if not job or job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        # TODO: Implement update_candidate in database.py
        return jsonify({'success': True, 'candidate': candidate})

    @app.route('/api/candidates/<candidate_id>', methods=['DELETE', 'OPTIONS'])
    @require_auth
    def delete_candidate(candidate_id):
        """Delete a candidate"""
        if request.method == 'OPTIONS':
            return '', 200

        candidate = db.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'success': False, 'error': 'Candidate not found'}), 404

        # Verify ownership via job
        job = db.get_job(candidate['job_id'])
        if not job or job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        # TODO: Implement delete_candidate in database.py
        return jsonify({'success': True})

    # ============ Evaluations ============

    @app.route('/api/candidates/<candidate_id>/evaluations', methods=['GET', 'OPTIONS'])
    @require_auth
    def list_evaluations(candidate_id):
        """Get all evaluations for a candidate"""
        if request.method == 'OPTIONS':
            return '', 200

        candidate = db.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'success': False, 'error': 'Candidate not found'}), 404

        # Verify ownership via job
        job = db.get_job(candidate['job_id'])
        if not job or job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        evaluations = db.get_evaluations_for_candidate(candidate_id)
        return jsonify({'success': True, 'evaluations': evaluations})

    @app.route('/api/candidates/<candidate_id>/evaluations', methods=['POST', 'OPTIONS'])
    @require_auth
    def create_evaluation(candidate_id):
        """Create a new evaluation"""
        if request.method == 'OPTIONS':
            return '', 200

        candidate = db.get_candidate(candidate_id)
        if not candidate:
            return jsonify({'success': False, 'error': 'Candidate not found'}), 404

        # Verify ownership via job
        job = db.get_job(candidate['job_id'])
        if not job or job['user_id'] != request.user['id']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403

        data = request.json or {}
        evaluation = db.create_evaluation(candidate_id, data)
        return jsonify({'success': True, 'evaluation': evaluation})
