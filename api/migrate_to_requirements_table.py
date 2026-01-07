#!/usr/bin/env python3
"""
Migration Script: JSON Requirements to Requirements Table
Converts existing JSON-based requirements to normalized table format.

CRITICAL: Creates database backup before running migration
"""

import sqlite3
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Tuple
import shutil

# Database path
DB_PATH = Path(__file__).parent.parent / "frontend" / "data" / "recruiter.db"
MIGRATIONS_DIR = Path(__file__).parent / "migrations"

def backup_database() -> Path:
    """Create backup of database before migration"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = DB_PATH.with_name(f"recruiter_backup_{timestamp}.db")
    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ Database backup created: {backup_path}")
    return backup_path


def apply_migrations() -> None:
    """Apply all SQL migrations in order"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    try:
        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

        for migration_file in migration_files:
            print(f"\n📝 Applying migration: {migration_file.name}")
            with open(migration_file, "r") as f:
                sql = f.read()
                cursor.executescript(sql)
            conn.commit()
            print(f"✅ Migration applied: {migration_file.name}")

        print("\n✅ All SQL migrations applied successfully")
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def auto_detect_category(requirement_text: str) -> str:
    """Auto-detect requirement category from text"""
    text_lower = requirement_text.lower()

    # Education keywords
    if any(word in text_lower for word in ["degree", "bachelor", "master", "phd", "diploma", "education"]):
        return "education"

    # Experience keywords
    if any(word in text_lower for word in ["years", "experience", "exp", "experience level"]):
        return "experience"

    # Certification keywords
    if any(word in text_lower for word in ["certification", "certified", "cert", "aws", "gcp", "azure"]):
        return "certification"

    # Skill keywords (everything else defaults to skill)
    if any(word in text_lower for word in ["skill", "knowledge", "proficiency", "expertise"]):
        return "skill"

    # Check if it's a specific tech skill
    tech_skills = ["python", "javascript", "react", "node", "sql", "java", "c++", "golang", "rust",
                   "kubernetes", "docker", "git", "rest", "graphql", "typescript", "html", "css"]
    if any(skill in text_lower for skill in tech_skills):
        return "skill"

    return "other"


def migrate_json_requirements_to_table() -> Tuple[int, int]:
    """
    Migrate existing JSON requirements to requirements table
    Returns: (jobs_processed, requirements_created)
    """
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Get all jobs with requirements
        cursor.execute("""
            SELECT id, must_have_requirements, preferred_requirements
            FROM jobs
            WHERE must_have_requirements IS NOT NULL
               OR preferred_requirements IS NOT NULL
        """)
        jobs = cursor.fetchall()

        jobs_processed = 0
        requirements_created = 0

        for job in jobs:
            job_id = job['id']

            # Check if this job already has requirements in the new table
            cursor.execute("SELECT COUNT(*) as count FROM requirements WHERE job_id = ?", (job_id,))
            existing = cursor.fetchone()
            existing_count = existing[0] if existing else 0

            if existing_count > 0:
                print(f"⊘ Job {job_id} already migrated (skipping)")
                continue

            # Process must-have requirements
            must_have_json = job['must_have_requirements']
            if must_have_json:
                try:
                    must_have_list = json.loads(must_have_json)
                    if isinstance(must_have_list, list):
                        for sort_order, text in enumerate(must_have_list):
                            if text.strip():
                                req_id = str(uuid.uuid4())
                                category = auto_detect_category(text)
                                cursor.execute("""
                                    INSERT INTO requirements
                                    (id, job_id, text, is_required, category, sort_order)
                                    VALUES (?, ?, ?, 1, ?, ?)
                                """, (req_id, job_id, text, category, sort_order))
                                requirements_created += 1
                except json.JSONDecodeError:
                    print(f"⚠️  Warning: Could not parse must_have_requirements for job {job_id}")

            # Process preferred requirements
            preferred_json = job['preferred_requirements']
            if preferred_json:
                try:
                    preferred_list = json.loads(preferred_json)
                    if isinstance(preferred_list, list):
                        # Start sort_order after must-have requirements
                        cursor.execute(
                            "SELECT COUNT(*) as count FROM requirements WHERE job_id = ?",
                            (job_id,)
                        )
                        count_row = cursor.fetchone()
                        start_order = count_row[0] if count_row else 0

                        for offset, text in enumerate(preferred_list):
                            if text.strip():
                                req_id = str(uuid.uuid4())
                                category = auto_detect_category(text)
                                cursor.execute("""
                                    INSERT INTO requirements
                                    (id, job_id, text, is_required, category, sort_order)
                                    VALUES (?, ?, ?, 0, ?, ?)
                                """, (req_id, job_id, text, category, start_order + offset))
                                requirements_created += 1
                except json.JSONDecodeError:
                    print(f"⚠️  Warning: Could not parse preferred_requirements for job {job_id}")

            jobs_processed += 1
            print(f"✅ Migrated job {job_id}: {requirements_created} requirements created")

        conn.commit()
        return jobs_processed, requirements_created

    except Exception as e:
        print(f"❌ Error migrating requirements: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def verify_migration() -> bool:
    """Verify migration was successful"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        print("\n🔍 Verifying migration...")

        # Check requirements table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='requirements'")
        if not cursor.fetchone():
            print("❌ Requirements table does not exist")
            return False
        print("✅ Requirements table exists")

        # Check pipeline_status column exists
        cursor.execute("PRAGMA table_info(candidates)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'pipeline_status' not in columns:
            print("❌ pipeline_status column does not exist")
            return False
        print("✅ pipeline_status column exists")

        # Check data integrity
        cursor.execute("SELECT COUNT(*) as count FROM requirements")
        req_count = cursor.fetchone()['count']
        print(f"✅ Requirements table has {req_count} records")

        # Check foreign keys are valid
        cursor.execute("""
            SELECT COUNT(*) as orphaned
            FROM requirements r
            LEFT JOIN jobs j ON r.job_id = j.id
            WHERE j.id IS NULL
        """)
        orphaned = cursor.fetchone()['orphaned']
        if orphaned > 0:
            print(f"❌ Found {orphaned} orphaned requirements (job_id has no matching job)")
            return False
        print("✅ All requirements have valid job_id references")

        # Check pipeline_status values
        cursor.execute("""
            SELECT DISTINCT pipeline_status
            FROM candidates
            WHERE pipeline_status NOT IN
            ('new', 'meets-reqs', 'doesnt-meet', 'reviewed-forward', 'reviewed-maybe', 'reviewed-decline')
        """)
        invalid = cursor.fetchall()
        if invalid:
            print(f"❌ Found invalid pipeline_status values: {[row[0] for row in invalid]}")
            return False
        print("✅ All pipeline_status values are valid")

        print("\n✅ Migration verification passed!")
        return True

    except Exception as e:
        print(f"❌ Error verifying migration: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        conn.close()


def main():
    """Run complete migration process"""
    print("=" * 60)
    print("Resume Scanner Pro - Database Migration")
    print("Converting JSON requirements to normalized table")
    print("=" * 60)

    # Check database exists
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        return False

    print(f"📊 Database: {DB_PATH}")

    try:
        # Step 1: Backup
        print("\n📍 Step 1/4: Backing up database...")
        backup_path = backup_database()

        # Step 2: Apply migrations
        print("\n📍 Step 2/4: Applying schema migrations...")
        apply_migrations()

        # Step 3: Migrate data
        print("\n📍 Step 3/4: Migrating JSON requirements to table...")
        jobs_processed, requirements_created = migrate_json_requirements_to_table()
        print(f"✅ Migration complete: {jobs_processed} jobs, {requirements_created} requirements")

        # Step 4: Verify
        print("\n📍 Step 4/4: Verifying migration...")
        if not verify_migration():
            print("\n❌ Migration verification failed!")
            print(f"Backup saved at: {backup_path}")
            return False

        print("\n" + "=" * 60)
        print("✅ MIGRATION SUCCESSFUL")
        print("=" * 60)
        print(f"Backup location: {backup_path}")
        print("You can now start the API server with the new schema")
        return True

    except Exception as e:
        print(f"\n❌ MIGRATION FAILED: {e}")
        print("Database backup preserved - check logs above for details")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
