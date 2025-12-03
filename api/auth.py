"""
Authentication Module
Simple session-based authentication for the Python API
"""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, jsonify, make_response

from database import (
    get_user_by_email, get_user_by_id, create_user,
    create_session, get_session, delete_session, delete_expired_sessions
)


# Session configuration
SESSION_COOKIE_NAME = 'session_id'
SESSION_DURATION_DAYS = 7


def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((salt + password).encode())
    return f"{salt}:{hash_obj.hexdigest()}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt, stored_hash = password_hash.split(':')
        hash_obj = hashlib.sha256((salt + password).encode())
        return hash_obj.hexdigest() == stored_hash
    except ValueError:
        return False


def generate_session_id() -> str:
    """Generate a secure session ID"""
    return secrets.token_urlsafe(32)


def signup(email: str, password: str, name: str = None) -> Dict[str, Any]:
    """
    Create a new user account

    Returns:
        Dict with 'success', 'user', and optionally 'error'
    """
    # Check if user already exists
    existing = get_user_by_email(email)
    if existing:
        return {'success': False, 'error': 'Email already registered'}

    # Validate password
    if len(password) < 8:
        return {'success': False, 'error': 'Password must be at least 8 characters'}

    # Create user
    password_hash = hash_password(password)
    user = create_user(email, password_hash, name)

    if user:
        # Remove password hash from response
        user_data = {k: v for k, v in user.items() if k != 'password_hash'}
        return {'success': True, 'user': user_data}

    return {'success': False, 'error': 'Failed to create user'}


def login(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticate user and create session

    Returns:
        Dict with 'success', 'user', 'session_id', and optionally 'error'
    """
    user = get_user_by_email(email)
    if not user:
        return {'success': False, 'error': 'Invalid email or password'}

    if not verify_password(password, user['password_hash']):
        return {'success': False, 'error': 'Invalid email or password'}

    # Create session
    expires_at = (datetime.utcnow() + timedelta(days=SESSION_DURATION_DAYS)).isoformat() + 'Z'
    session_id = create_session(user['id'], expires_at)

    # Clean up expired sessions periodically
    delete_expired_sessions()

    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    return {
        'success': True,
        'user': user_data,
        'session_id': session_id,
        'expires_at': expires_at
    }


def logout(session_id: str) -> Dict[str, Any]:
    """
    End a user session

    Returns:
        Dict with 'success'
    """
    delete_session(session_id)
    return {'success': True}


def get_current_user(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Get the current user from a session ID

    Returns:
        User dict or None if session invalid/expired
    """
    if not session_id:
        return None

    session = get_session(session_id)
    if not session:
        return None

    # Check if session expired
    expires_at = datetime.fromisoformat(session['expires_at'].replace('Z', '+00:00'))
    if expires_at < datetime.now(expires_at.tzinfo):
        delete_session(session_id)
        return None

    return {
        'id': session['user_id'],
        'email': session['email'],
        'name': session.get('name')
    }


def require_auth(f):
    """
    Decorator to require authentication for an endpoint

    Usage:
        @app.route('/api/protected')
        @require_auth
        def protected_endpoint():
            # request.user is available here
            return jsonify({'user': request.user})
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        session_id = request.cookies.get(SESSION_COOKIE_NAME)

        if not session_id:
            # Try Authorization header as fallback
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                session_id = auth_header[7:]

        user = get_current_user(session_id)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        request.user = user
        return f(*args, **kwargs)

    return decorated


# Flask route handlers for auth endpoints

def register_auth_routes(app):
    """Register authentication routes with Flask app"""

    @app.route('/api/auth/signup', methods=['POST', 'OPTIONS'])
    def auth_signup():
        if request.method == 'OPTIONS':
            return '', 200

        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password required'}), 400

        result = signup(email, password, name or None)

        if result['success']:
            # Auto-login after signup
            login_result = login(email, password)
            if login_result['success']:
                response = make_response(jsonify({
                    'success': True,
                    'user': login_result['user']
                }))
                response.set_cookie(
                    SESSION_COOKIE_NAME,
                    login_result['session_id'],
                    httponly=True,
                    samesite='Lax',
                    max_age=SESSION_DURATION_DAYS * 24 * 60 * 60
                )
                return response

        status_code = 400 if not result['success'] else 200
        return jsonify(result), status_code

    @app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
    def auth_login():
        if request.method == 'OPTIONS':
            return '', 200

        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password required'}), 400

        result = login(email, password)

        if result['success']:
            response = make_response(jsonify({
                'success': True,
                'user': result['user']
            }))
            response.set_cookie(
                SESSION_COOKIE_NAME,
                result['session_id'],
                httponly=True,
                samesite='Lax',
                max_age=SESSION_DURATION_DAYS * 24 * 60 * 60
            )
            return response

        return jsonify(result), 401

    @app.route('/api/auth/logout', methods=['POST', 'OPTIONS'])
    def auth_logout():
        if request.method == 'OPTIONS':
            return '', 200

        session_id = request.cookies.get(SESSION_COOKIE_NAME)
        if session_id:
            logout(session_id)

        response = make_response(jsonify({'success': True}))
        response.delete_cookie(SESSION_COOKIE_NAME)
        return response

    @app.route('/api/auth/session', methods=['GET', 'OPTIONS'])
    def auth_session():
        if request.method == 'OPTIONS':
            return '', 200

        session_id = request.cookies.get(SESSION_COOKIE_NAME)
        user = get_current_user(session_id)

        if user:
            return jsonify({'success': True, 'user': user})

        return jsonify({'success': False, 'user': None}), 200
