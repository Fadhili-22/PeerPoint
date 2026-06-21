"""Seed or bootstrap admin accounts with user_roles membership.

Usage:
    python -m scripts.seed_admin --email admin@strathmore.edu --password <password> --full-name "PeerPoint Admin"

Admin role rows can only be created through this script (bootstrap) or by an
existing admin via protected endpoints — never through public signup.
"""

import argparse

from app.database import SessionLocal
from app.models import User, UserRole
from app.services.user_roles import grant_role
from app import utils


def seed_admin(email: str, password: str, full_name: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                email=email,
                password=utils.hash_password(password),
                full_name=full_name,
                role=UserRole.admin,
                is_verified=True,
            )
            db.add(user)
            db.flush()
        else:
            user.role = UserRole.admin
            user.is_verified = True

        grant_role(
            db,
            user_id=user.id,
            role=UserRole.admin,
            granted_by=None,
            allow_admin_bootstrap=True,
        )
        db.commit()
        print(f"Admin account ready for {email}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a PeerPoint admin account")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", required=True)
    args = parser.parse_args()
    seed_admin(args.email, args.password, args.full_name)


if __name__ == "__main__":
    main()
