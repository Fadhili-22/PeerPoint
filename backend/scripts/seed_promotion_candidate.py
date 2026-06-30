"""Seed a promotion candidate for the admin promote-flow demo.

Creates (or updates) a student account with an active student role and a
promotion_candidates row. By default training_status is "Training Complete" so
the candidate is immediately promotable from the admin UI; pass --in-review to
seed a candidate the Promote button should keep disabled.

Usage:
    python -m scripts.seed_promotion_candidate \\
        --email trainee@strathmore.edu \\
        --password 123456 \\
        --full-name "Trainee Student" \\
        --course "BSc Computer Science" \\
        --year "Year 3"

    # Negative-path candidate (Promote button stays disabled / API returns 422):
    python -m scripts.seed_promotion_candidate \\
        --email inreview@strathmore.edu --password 123456 \\
        --full-name "In Review Student" --in-review
"""

import argparse

from app import utils
from app.database import SessionLocal
from app.models import (
    AccountApprovalRequest,
    AccountRequestStatus,
    AccountRequestType,
    PromotionCandidate,
    TrainingStatus,
    User,
    UserRole,
)
from app.services.user_roles import grant_role


def seed_promotion_candidate(
    email: str,
    password: str,
    full_name: str,
    course: str,
    year: str,
    sessions_attended: int,
    *,
    training_complete: bool = True,
) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                email=email,
                password=utils.hash_password(password),
                full_name=full_name,
                role=UserRole.student,
                is_verified=True,
                email_verified=True,
            )
            db.add(user)
            db.flush()
        else:
            user.is_verified = True
            user.email_verified = True
            if password:
                user.password = utils.hash_password(password)
            if full_name:
                user.full_name = full_name

        grant_role(db, user_id=user.id, role=UserRole.student, granted_by=None)

        training_status = (
            TrainingStatus.training_complete
            if training_complete
            else TrainingStatus.in_review
        )
        candidate = (
            db.query(PromotionCandidate)
            .filter(PromotionCandidate.user_id == user.id)
            .first()
        )
        if candidate is None:
            db.add(
                PromotionCandidate(
                    user_id=user.id,
                    course=course,
                    year=year,
                    training_status=training_status,
                    sessions_attended=sessions_attended,
                )
            )
        else:
            candidate.course = course
            candidate.year = year
            candidate.training_status = training_status
            candidate.sessions_attended = sessions_attended

        open_promotion_request = (
            db.query(AccountApprovalRequest)
            .filter(
                AccountApprovalRequest.user_id == user.id,
                AccountApprovalRequest.type == AccountRequestType.promotion,
                AccountApprovalRequest.status.in_(
                    (
                        AccountRequestStatus.pending_review,
                        AccountRequestStatus.verifying_id,
                    )
                ),
            )
            .first()
        )
        if open_promotion_request is None:
            db.add(
                AccountApprovalRequest(
                    user_id=user.id,
                    type=AccountRequestType.promotion,
                    status=AccountRequestStatus.pending_review,
                    note="Promotion candidate awaiting admin review",
                )
            )

        user.role = UserRole.student
        db.commit()
        print(
            f"Promotion candidate ready for {email} "
            f"(training_status={training_status.value})"
        )
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed a PeerPoint promotion candidate"
    )
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", required=True)
    parser.add_argument("--course", default="BSc Computer Science")
    parser.add_argument("--year", default="Year 3")
    parser.add_argument("--sessions-attended", type=int, default=10)
    parser.add_argument(
        "--in-review",
        action="store_true",
        help="Seed with training_status='In Review' (Promote stays disabled / 422)",
    )
    args = parser.parse_args()
    seed_promotion_candidate(
        args.email,
        args.password,
        args.full_name,
        args.course,
        args.year,
        args.sessions_attended,
        training_complete=not args.in_review,
    )


if __name__ == "__main__":
    main()
