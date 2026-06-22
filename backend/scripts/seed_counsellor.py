"""Seed or bootstrap counsellor accounts (profile + always-on availability).

Counsellors retain an active student role so they can still use student-side flows.
By default this script marks the counsellor as always available: status ``available``,
online, active profile, all seven weekdays enabled with the full slot palette, and
no blocked dates.

Usage:
    python -m scripts.seed_counsellor \\
        --email counsellor@strathmore.edu \\
        --password <password> \\
        --full-name "PeerPoint Counsellor"
"""

import argparse

from app import utils
from app.database import SessionLocal
from app.models import (
    AvailabilityStatus,
    CounsellorAvailabilitySchedule,
    CounsellorProfile,
    CounsellorProfileStatus,
    User,
    UserRole,
)
from app.services.availability import MAX_DAY_OF_WEEK, MIN_DAY_OF_WEEK, TIME_SLOT_OPTIONS
from app.services.user_roles import ensure_counsellor_profile, grant_role


def configure_always_available(db, profile: CounsellorProfile) -> None:
    """Enable every weekday with the full canonical slot palette."""
    profile.availability_status = AvailabilityStatus.available
    profile.is_online = True
    profile.status = CounsellorProfileStatus.active
    profile.unavailable_dates = []

    existing_by_day = {
        row.day_of_week: row for row in profile.availability_schedule
    }
    all_slots = list(TIME_SLOT_OPTIONS)

    for day in range(MIN_DAY_OF_WEEK, MAX_DAY_OF_WEEK + 1):
        row = existing_by_day.get(day)
        if row is None:
            db.add(
                CounsellorAvailabilitySchedule(
                    counsellor_id=profile.id,
                    day_of_week=day,
                    enabled=True,
                    slots=all_slots,
                )
            )
        else:
            row.enabled = True
            row.slots = all_slots


def seed_counsellor(
    email: str,
    password: str,
    full_name: str,
    *,
    always_available: bool = True,
) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                email=email,
                password=utils.hash_password(password),
                full_name=full_name,
                role=UserRole.counsellor,
                is_verified=True,
            )
            db.add(user)
            db.flush()
        else:
            user.is_verified = True
            if password:
                user.password = utils.hash_password(password)
            if full_name:
                user.full_name = full_name

        grant_role(
            db,
            user_id=user.id,
            role=UserRole.student,
            granted_by=None,
        )
        grant_role(
            db,
            user_id=user.id,
            role=UserRole.counsellor,
            granted_by=None,
        )

        profile = ensure_counsellor_profile(db, user)
        db.flush()
        if always_available:
            configure_always_available(db, profile)

        user.role = UserRole.counsellor
        db.commit()
        availability = "always available" if always_available else "default profile only"
        print(f"Counsellor account ready for {email} ({availability})")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a PeerPoint counsellor account")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", required=True)
    parser.add_argument(
        "--no-always-available",
        action="store_true",
        help="Skip full weekly schedule / available+online setup",
    )
    args = parser.parse_args()
    seed_counsellor(
        args.email,
        args.password,
        args.full_name,
        always_available=not args.no_always_available,
    )


if __name__ == "__main__":
    main()
