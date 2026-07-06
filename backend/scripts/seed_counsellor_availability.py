"""Backfill counsellor_availability_schedule for active peer counsellors.

Reuses configure_always_available from seed_counsellor.py. Skips counsellors
that already have any schedule rows (safe to re-run).

Does not create or modify users; only inserts/updates availability schedule
rows (configure_always_available may also set profile.status and clear
unavailable_dates on counsellor_profiles — same behaviour as seed_counsellor).

Usage (from backend/ with venv active):
    python -m scripts.seed_counsellor_availability
"""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.orm import joinedload

from app.database import SessionLocal
from app.models import CounsellorProfile, UserRole, UserRoleAssignment
from scripts.seed_counsellor import configure_always_available


def seed_counsellor_availability() -> None:
    db = SessionLocal()
    try:
        profiles = (
            db.query(CounsellorProfile)
            .join(
                UserRoleAssignment,
                UserRoleAssignment.user_id == CounsellorProfile.user_id,
            )
            .filter(
                UserRoleAssignment.role == UserRole.counsellor,
                UserRoleAssignment.is_active.is_(True),
            )
            .options(joinedload(CounsellorProfile.availability_schedule))
            .order_by(CounsellorProfile.id)
            .all()
        )

        updated = 0
        skipped = 0

        for profile in profiles:
            if profile.availability_schedule:
                skipped += 1
                continue
            configure_always_available(db, profile)
            updated += 1

        db.commit()

        total_counsellors = len(profiles)
        schedule_rows = db.execute(
            text("SELECT COUNT(*) FROM counsellor_availability_schedule")
        ).scalar()
        counsellors_with_schedule = db.execute(
            text(
                """
                SELECT COUNT(DISTINCT cp.id)
                FROM counsellor_profiles cp
                JOIN user_roles ur
                  ON ur.user_id = cp.user_id
                 AND ur.role = 'counsellor'
                 AND ur.is_active = true
                JOIN counsellor_availability_schedule cas
                  ON cas.counsellor_id = cp.id
                """
            )
        ).scalar()
        spot_check = db.execute(
            text(
                """
                SELECT u.email, cas.day_of_week, cas.enabled, cardinality(cas.slots)
                FROM counsellor_profiles cp
                JOIN users u ON u.id = cp.user_id
                JOIN user_roles ur
                  ON ur.user_id = cp.user_id
                 AND ur.role = 'counsellor'
                 AND ur.is_active = true
                JOIN counsellor_availability_schedule cas ON cas.counsellor_id = cp.id
                WHERE cas.day_of_week BETWEEN 1 AND 5
                ORDER BY u.email, cas.day_of_week
                LIMIT 5
                """
            )
        ).fetchall()

        print("Counsellor availability backfill complete")
        print(f"Active counsellors found: {total_counsellors}")
        print(f"Counsellors updated: {updated}")
        print(f"Counsellors skipped (already had schedule): {skipped}")
        print(f"Total schedule rows: {schedule_rows}")
        print(f"Counsellors with schedule rows: {counsellors_with_schedule}")
        print("Spot-check (Mon–Fri sample, email / day / enabled / slot_count):")
        for row in spot_check:
            print(f"  {row}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def main() -> None:
    seed_counsellor_availability()


if __name__ == "__main__":
    main()
