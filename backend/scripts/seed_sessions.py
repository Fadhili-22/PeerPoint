"""Seed sample session_requests for admin session log smoke tests.

Idempotent: looks up student/counsellor by email and upserts a fixed set of
requests keyed by (student_id, counsellor_id, preferred_date, preferred_time).

Usage (from backend/ with venv active):

    .\.venv\Scripts\Activate.ps1
    python -m scripts.seed_sessions
"""

from __future__ import annotations

import argparse
from datetime import date, timedelta

from app.database import SessionLocal
from app.models import (
    SessionFormat,
    SessionRequest,
    SessionRequestStatus,
    SessionTopic,
    User,
)

DEFAULT_STUDENT_EMAIL = "student@strathmore.edu"
DEFAULT_COUNSELLOR_EMAIL = "counsellor@strathmore.edu"

_SEED_ROWS = (
    {
        "topic": SessionTopic.anxiety,
        "preferred_date_offset": 7,
        "preferred_time": "10:00 AM",
        "format": SessionFormat.video,
        "status": SessionRequestStatus.pending,
        "notes": "Seed pending request",
    },
    {
        "topic": SessionTopic.academic_stress,
        "preferred_date_offset": 3,
        "preferred_time": "2:00 PM",
        "format": SessionFormat.in_person,
        "status": SessionRequestStatus.accepted,
        "notes": "Seed accepted upcoming session",
    },
    {
        "topic": SessionTopic.relationships,
        "preferred_date_offset": -5,
        "preferred_time": "11:00 AM",
        "format": SessionFormat.phone,
        "status": SessionRequestStatus.completed,
        "notes": "Seed completed session",
    },
    {
        "topic": SessionTopic.other,
        "other_topic": "Self-esteem",
        "preferred_date_offset": 1,
        "preferred_time": "9:00 AM",
        "format": SessionFormat.video,
        "status": SessionRequestStatus.rejected,
        "notes": "Seed rejected request",
        "rejection_reason": "Schedule conflict",
    },
)


def _find_user(db, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _upsert_request(
    db,
    *,
    student_id: int,
    counsellor_id: int,
    row: dict,
    today: date,
) -> None:
    preferred_date = today + timedelta(days=row["preferred_date_offset"])
    preferred_time = row["preferred_time"]

    existing = (
        db.query(SessionRequest)
        .filter(
            SessionRequest.student_id == student_id,
            SessionRequest.counsellor_id == counsellor_id,
            SessionRequest.preferred_date == preferred_date,
            SessionRequest.preferred_time == preferred_time,
        )
        .first()
    )

    if existing is None:
        existing = SessionRequest(
            student_id=student_id,
            counsellor_id=counsellor_id,
            topic=row["topic"],
            other_topic=row.get("other_topic"),
            preferred_date=preferred_date,
            preferred_time=preferred_time,
            format=row["format"],
            notes=row.get("notes"),
            status=row["status"],
            rejection_reason=row.get("rejection_reason"),
        )
        db.add(existing)
    else:
        existing.topic = row["topic"]
        existing.other_topic = row.get("other_topic")
        existing.format = row["format"]
        existing.notes = row.get("notes")
        existing.status = row["status"]
        existing.rejection_reason = row.get("rejection_reason")


def seed_sessions(
    student_email: str = DEFAULT_STUDENT_EMAIL,
    counsellor_email: str = DEFAULT_COUNSELLOR_EMAIL,
) -> None:
    db = SessionLocal()
    try:
        student = _find_user(db, student_email)
        counsellor = _find_user(db, counsellor_email)
        if student is None:
            raise SystemExit(
                f"Student not found ({student_email}). Run scripts.seed_student first."
            )
        if counsellor is None:
            raise SystemExit(
                f"Counsellor not found ({counsellor_email}). Run scripts.seed_counsellor first."
            )

        today = date.today()
        for row in _SEED_ROWS:
            _upsert_request(
                db,
                student_id=student.id,
                counsellor_id=counsellor.id,
                row=row,
                today=today,
            )

        db.commit()
        print(
            f"Seeded {len(_SEED_ROWS)} session_requests for "
            f"{student_email} ↔ {counsellor_email}"
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed PeerPoint session_requests")
    parser.add_argument("--student-email", default=DEFAULT_STUDENT_EMAIL)
    parser.add_argument("--counsellor-email", default=DEFAULT_COUNSELLOR_EMAIL)
    args = parser.parse_args()
    seed_sessions(args.student_email, args.counsellor_email)


if __name__ == "__main__":
    main()
