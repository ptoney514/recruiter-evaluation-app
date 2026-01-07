"""
SQLite Database Access Module
Provides database connectivity for Python API endpoints
"""
import os
import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from contextlib import contextmanager
from datetime import datetime
import uuid

# Database file location - shared with frontend
DB_PATH = Path(__file__).parent.parent / "frontend" / "data" / "recruiter.db"

# Single-user mode settings
SINGLE_USER_MODE = os.environ.get('SINGLE_USER_MODE', 'true').lower() == 'true'
LOCAL_USER_ID = 'local-user'
LOCAL_USER_EMAIL = 'local@localhost'
LOCAL_USER_NAME = 'Local User'


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
        'accomplishments_analysis', 'trajectory_analysis', 'qualifications_analysis',
        'quick_tags'  # New pipeline status tags field
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
    """Get a job by ID with requirements"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if not row:
            return None

        job = dict_from_row(row)
        # Include requirements array
        job['requirements'] = get_requirements_for_job(job_id)
        return job


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


def update_job(job_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update a job"""
    with get_db() as conn:
        # Build dynamic update statement
        update_fields = []
        values = []

        for key in ['title', 'department', 'location', 'summary', 'status']:
            if key in updates:
                update_fields.append(f"{key} = ?")
                values.append(updates[key])

        if update_fields:
            update_fields.append("updated_at = ?")
            values.append(datetime.utcnow().isoformat() + 'Z')
            values.append(job_id)

            query = f"UPDATE jobs SET {', '.join(update_fields)} WHERE id = ?"
            conn.execute(query, values)
            conn.commit()

    return get_job(job_id)


def delete_job(job_id: str) -> None:
    """Delete a job and all associated candidates"""
    with get_db() as conn:
        conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        conn.commit()


# ============ Requirements Functions ============

def get_requirements_for_job(job_id: str) -> List[Dict[str, Any]]:
    """Get all requirements for a job"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM requirements WHERE job_id = ? ORDER BY sort_order ASC, created_at ASC",
            (job_id,)
        )
        return [dict_from_row(row) for row in cursor.fetchall()]


def get_requirement(requirement_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific requirement"""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM requirements WHERE id = ?", (requirement_id,))
        row = cursor.fetchone()
        return dict_from_row(row) if row else None


def create_requirement(job_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new requirement"""
    requirement_id = str(uuid.uuid4())
    with get_db() as conn:
        # Get next sort_order
        cursor = conn.execute(
            "SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM requirements WHERE job_id = ?",
            (job_id,)
        )
        next_order = cursor.fetchone()['next_order']

        conn.execute("""
            INSERT INTO requirements (id, job_id, text, is_required, category, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            requirement_id,
            job_id,
            data.get('text', ''),
            data.get('is_required', True),
            data.get('category', 'other'),
            next_order
        ))
        conn.commit()

    return get_requirement(requirement_id)


def update_requirement(requirement_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update a requirement"""
    with get_db() as conn:
        update_fields = []
        values = []

        for key in ['text', 'is_required', 'category']:
            if key in updates:
                update_fields.append(f"{key} = ?")
                values.append(updates[key])

        if update_fields:
            update_fields.append("updated_at = ?")
            values.append(datetime.utcnow().isoformat() + 'Z')
            values.append(requirement_id)

            query = f"UPDATE requirements SET {', '.join(update_fields)} WHERE id = ?"
            conn.execute(query, values)
            conn.commit()

    return get_requirement(requirement_id)


def delete_requirement(requirement_id: str) -> None:
    """Delete a requirement"""
    with get_db() as conn:
        conn.execute("DELETE FROM requirements WHERE id = ?", (requirement_id,))
        conn.commit()


def bulk_create_requirements(job_id: str, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create multiple requirements at once"""
    created_requirements = []

    with get_db() as conn:
        for sort_order, req_data in enumerate(requirements):
            requirement_id = str(uuid.uuid4())
            conn.execute("""
                INSERT INTO requirements (id, job_id, text, is_required, category, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                requirement_id,
                job_id,
                req_data.get('text', ''),
                req_data.get('is_required', True),
                req_data.get('category', 'other'),
                sort_order
            ))
        conn.commit()

    return get_requirements_for_job(job_id)


def reorder_requirements(job_id: str, requirement_ids: List[str]) -> List[Dict[str, Any]]:
    """Reorder requirements"""
    with get_db() as conn:
        for new_order, requirement_id in enumerate(requirement_ids):
            conn.execute(
                "UPDATE requirements SET sort_order = ? WHERE id = ? AND job_id = ?",
                (new_order, requirement_id, job_id)
            )
        conn.commit()

    return get_requirements_for_job(job_id)


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


def update_candidate(candidate_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update candidate fields"""
    with get_db() as conn:
        update_fields = []
        values = []

        # Allowed fields to update
        allowed_fields = [
            'name', 'email', 'phone', 'resume_text', 'pipeline_status',
            'recruiter_notes', 'status'
        ]

        for key in allowed_fields:
            if key in updates:
                update_fields.append(f"{key} = ?")
                values.append(updates[key])

        # Handle quick_tags specially (JSON)
        if 'quick_tags' in updates:
            update_fields.append("quick_tags = ?")
            values.append(json.dumps(updates['quick_tags']) if isinstance(updates['quick_tags'], list) else updates['quick_tags'])

        if update_fields:
            update_fields.append("notes_updated_at = ?")
            values.append(datetime.utcnow().isoformat() + 'Z')
            update_fields.append("updated_at = ?")
            values.append(datetime.utcnow().isoformat() + 'Z')
            values.append(candidate_id)

            query = f"UPDATE candidates SET {', '.join(update_fields)} WHERE id = ?"
            conn.execute(query, values)
            conn.commit()

    return get_candidate(candidate_id)


def update_candidate_pipeline_status(
    candidate_id: str,
    pipeline_status: str,
    recruiter_notes: str = None,
    quick_tags: List[str] = None
) -> Dict[str, Any]:
    """Update candidate pipeline status and notes"""
    # Validate pipeline status
    valid_statuses = ['new', 'meets-reqs', 'doesnt-meet', 'reviewed-forward', 'reviewed-maybe', 'reviewed-decline']
    if pipeline_status not in valid_statuses:
        raise ValueError(f"Invalid pipeline_status: {pipeline_status}")

    updates = {'pipeline_status': pipeline_status}
    if recruiter_notes is not None:
        updates['recruiter_notes'] = recruiter_notes
    if quick_tags is not None:
        updates['quick_tags'] = quick_tags

    return update_candidate(candidate_id, updates)


def delete_candidate(candidate_id: str) -> None:
    """Delete a candidate"""
    with get_db() as conn:
        conn.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
        conn.commit()


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


# ============ Single-User Mode Initialization ============

def ensure_local_user_exists() -> None:
    """
    Ensure the local user exists in the database for single-user mode.
    This is called at app startup to ensure the foreign key constraint is satisfied.
    """
    if not SINGLE_USER_MODE:
        return

    with get_db() as conn:
        # Check if local user already exists
        cursor = conn.execute("SELECT id FROM users WHERE id = ?", (LOCAL_USER_ID,))
        if cursor.fetchone() is None:
            # Create local user with a dummy password hash (won't be used)
            conn.execute("""
                INSERT INTO users (id, email, password_hash, name, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            """, (LOCAL_USER_ID, LOCAL_USER_EMAIL, 'local-mode-no-password', LOCAL_USER_NAME))
            conn.commit()
            print(f"✅ Created local user for single-user mode: {LOCAL_USER_EMAIL}")


# ============ Settings Functions ============

def ensure_settings_table_exists() -> None:
    """
    Create settings table if it doesn't exist.
    This is called at app startup.
    """
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, key)
            )
        """)
        conn.commit()

    # Initialize default settings for local user if they don't exist
    if SINGLE_USER_MODE:
        ensure_default_settings()


def ensure_default_settings() -> None:
    """
    Initialize default settings for the local user.
    Called during app startup in single-user mode.
    """
    default_settings = {
        'stage1_model': 'claude-3-5-haiku-20241022',
        'stage2_model': 'claude-sonnet-4-5-20251022',
        'default_provider': 'anthropic'
    }

    for key, value in default_settings.items():
        # Only insert if the setting doesn't already exist
        existing = get_user_setting(LOCAL_USER_ID, key)
        if existing is None:
            update_user_setting(LOCAL_USER_ID, key, value)


def get_user_settings(user_id: str) -> Dict[str, str]:
    """Get all settings for a user as a dictionary"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT key, value FROM settings WHERE user_id = ? ORDER BY key",
            (user_id,)
        )
        rows = cursor.fetchall()
        return {row['key']: row['value'] for row in rows}


def get_user_setting(user_id: str, key: str, default: Optional[str] = None) -> Optional[str]:
    """Get a specific setting value for a user"""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT value FROM settings WHERE user_id = ? AND key = ?",
            (user_id, key)
        )
        row = cursor.fetchone()
        return row['value'] if row else default


def update_user_setting(user_id: str, key: str, value: str) -> None:
    """Update or create a setting for a user"""
    with get_db() as conn:
        # Try to insert, if it already exists (unique constraint), update instead
        try:
            conn.execute("""
                INSERT INTO settings (id, user_id, key, value, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (str(uuid.uuid4()), user_id, key, value))
        except sqlite3.IntegrityError:
            # Setting already exists, update it
            conn.execute("""
                UPDATE settings SET value = ?, updated_at = datetime('now')
                WHERE user_id = ? AND key = ?
            """, (value, user_id, key))

        conn.commit()
