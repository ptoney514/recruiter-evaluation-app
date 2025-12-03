"""
SQLite Database Access Module
Provides database connectivity for Python API endpoints
"""
import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from contextlib import contextmanager
from datetime import datetime
import uuid

# Database file location - shared with frontend
DB_PATH = Path(__file__).parent.parent / "frontend" / "data" / "recruiter.db"


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def dict_from_row(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert sqlite3.Row to dictionary with JSON parsing"""
    result = dict(row)
    # Parse JSON fields
    json_fields = [
        'must_have_requirements', 'preferred_requirements',
        'quick_score_analysis', 'strengths', 'concerns',
        'interview_questions', 'observations',
        'accomplishments_analysis', 'trajectory_analysis', 'qualifications_analysis'
    ]
    for field in json_fields:
        if field in result and result[field]:
            try:
                result[field] = json.loads(result[field])
            except (json.JSONDecodeError, TypeError):
                pass
    return result


# ============ Job Functions ============

def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """Get a job by ID"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def get_jobs_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all jobs for a user"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        return [dict_from_row(row) for row in cursor.fetchall()]


def create_job(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new job"""
    job_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute("""
            INSERT INTO jobs (id, user_id, title, department, location, summary,
                              must_have_requirements, preferred_requirements, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job_id,
            user_id,
            data.get('title', ''),
            data.get('department'),
            data.get('location'),
            data.get('summary'),
            json.dumps(data.get('must_have_requirements', [])),
            json.dumps(data.get('preferred_requirements', [])),
            data.get('status', 'active')
        ))
        conn.commit()
    return get_job(job_id)


# ============ Candidate Functions ============

def get_candidate(candidate_id: str) -> Optional[Dict[str, Any]]:
    """Get a candidate by ID"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def get_candidates_for_job(job_id: str) -> List[Dict[str, Any]]:
    """Get all candidates for a job"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM candidates WHERE job_id = ? ORDER BY quick_score DESC NULLS LAST, created_at DESC",
            (job_id,)
        )
        return [dict_from_row(row) for row in cursor.fetchall()]


def create_candidate(job_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new candidate"""
    candidate_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute("""
            INSERT INTO candidates (id, job_id, name, email, phone, resume_text, resume_file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            candidate_id,
            job_id,
            data.get('name', ''),
            data.get('email'),
            data.get('phone'),
            data.get('resume_text'),
            data.get('resume_file_path')
        ))
        conn.commit()
    return get_candidate(candidate_id)


def update_candidate_quick_score(
    candidate_id: str,
    score: int,
    model: str,
    analysis: Dict[str, Any],
    recommendation: str = None
) -> None:
    """Update candidate with quick score results"""
    with get_db() as conn:
        conn.execute("""
            UPDATE candidates
            SET quick_score = ?,
                quick_score_model = ?,
                quick_score_at = ?,
                quick_score_analysis = ?,
                recommendation = COALESCE(?, recommendation),
                scoring_model = 'ATQ',
                updated_at = ?
            WHERE id = ?
        """, (
            score,
            model,
            datetime.utcnow().isoformat() + 'Z',
            json.dumps(analysis),
            recommendation,
            datetime.utcnow().isoformat() + 'Z',
            candidate_id
        ))
        conn.commit()


def update_candidate_stage1_score(
    candidate_id: str,
    score: float,
    a_score: float,
    t_score: float,
    q_score: float,
    recommendation: str = None
) -> None:
    """Update candidate with Stage 1 evaluation results"""
    with get_db() as conn:
        conn.execute("""
            UPDATE candidates
            SET stage1_score = ?,
                stage1_a_score = ?,
                stage1_t_score = ?,
                stage1_q_score = ?,
                stage1_evaluated_at = ?,
                recommendation = COALESCE(?, recommendation),
                scoring_model = 'ATQ',
                status = 'evaluated',
                updated_at = ?
            WHERE id = ?
        """, (
            score,
            a_score,
            t_score,
            q_score,
            datetime.utcnow().isoformat() + 'Z',
            recommendation,
            datetime.utcnow().isoformat() + 'Z',
            candidate_id
        ))
        conn.commit()


# ============ Evaluation Functions ============

def get_evaluation(evaluation_id: str) -> Optional[Dict[str, Any]]:
    """Get an evaluation by ID"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM evaluations WHERE id = ?", (evaluation_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def get_evaluations_for_candidate(candidate_id: str) -> List[Dict[str, Any]]:
    """Get all evaluations for a candidate"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM evaluations WHERE candidate_id = ? ORDER BY version DESC",
            (candidate_id,)
        )
        return [dict_from_row(row) for row in cursor.fetchall()]


def create_evaluation(candidate_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new evaluation record"""
    evaluation_id = str(uuid.uuid4())

    # Get next version number
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM evaluations WHERE candidate_id = ?",
            (candidate_id,)
        )
        next_version = cursor.fetchone()['next_version']

        conn.execute("""
            INSERT INTO evaluations (
                id, candidate_id, score, scoring_model,
                a_score, t_score, q_score,
                accomplishments_analysis, trajectory_analysis, qualifications_analysis,
                recommendation, reasoning, strengths, concerns, interview_questions, observations,
                llm_provider, llm_model, input_tokens, output_tokens, cost,
                version, evaluation_stage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            evaluation_id,
            candidate_id,
            data.get('score', 0),
            data.get('scoring_model', 'ATQ'),
            data.get('a_score'),
            data.get('t_score'),
            data.get('q_score'),
            json.dumps(data.get('accomplishments_analysis')) if data.get('accomplishments_analysis') else None,
            json.dumps(data.get('trajectory_analysis')) if data.get('trajectory_analysis') else None,
            json.dumps(data.get('qualifications_analysis')) if data.get('qualifications_analysis') else None,
            data.get('recommendation'),
            data.get('reasoning'),
            json.dumps(data.get('strengths')) if data.get('strengths') else None,
            json.dumps(data.get('concerns')) if data.get('concerns') else None,
            json.dumps(data.get('interview_questions')) if data.get('interview_questions') else None,
            json.dumps(data.get('observations')) if data.get('observations') else None,
            data.get('llm_provider'),
            data.get('llm_model'),
            data.get('input_tokens'),
            data.get('output_tokens'),
            data.get('cost'),
            next_version,
            data.get('evaluation_stage', 'stage1')
        ))
        conn.commit()

    return get_evaluation(evaluation_id)


# ============ User Functions (for Better Auth integration) ============

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get a user by email"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get a user by ID"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def create_user(email: str, password_hash: str, name: str = None) -> Dict[str, Any]:
    """Create a new user"""
    user_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute("""
            INSERT INTO users (id, email, password_hash, name)
            VALUES (?, ?, ?, ?)
        """, (user_id, email, password_hash, name))
        conn.commit()
    return get_user_by_id(user_id)


# ============ Session Functions ============

def create_session(user_id: str, expires_at: str) -> str:
    """Create a new session"""
    session_id = str(uuid.uuid4())
    with get_db() as conn:
        conn.execute("""
            INSERT INTO sessions (id, user_id, expires_at)
            VALUES (?, ?, ?)
        """, (session_id, user_id, expires_at))
        conn.commit()
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Get a session by ID"""
    with get_db() as conn:
        cursor = conn.execute("""
            SELECT s.*, u.email, u.name
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        """, (session_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def delete_session(session_id: str) -> None:
    """Delete a session"""
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()


def delete_expired_sessions() -> None:
    """Clean up expired sessions"""
    with get_db() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at < datetime('now')")
        conn.commit()
