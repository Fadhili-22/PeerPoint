"""Seed or bootstrap student accounts with user_roles membership.

Usage:
    python -m scripts.seed_student --email student@strathmore.edu --password <password> --full-name "PeerPoint Student"
"""

import argparse

from app import utils
from app.database import SessionLocal
from app.models import User, UserRole
from app.services.user_roles import grant_role


def seed_student(email: str, password: str, full_name: str) -> None:
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

        grant_role(
            db,
            user_id=user.id,
            role=UserRole.student,
            granted_by=None,
        )

        user.role = UserRole.student
        db.commit()
        print(f"Student account ready for {email}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a PeerPoint student account")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", required=True)
    args = parser.parse_args()
    seed_student(args.email, args.password, args.full_name)


if __name__ == "__main__":
    main()
