"""Test-only factories. Not part of the application package."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    SessionFormat,
    SessionRequest,
    SessionRequestStatus,
    SessionTopic,
    User,
    UserRole,
)
from app.oauth2 import create_access_token
from app.services.user_roles import grant_role
from app.utils import hash_password


def unique_email(prefix: str = "user") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}@strathmore.edu"


def create_user(
    db: Session,
    *,
    email: str | None = None,
    password: str = "TestPass123!",
    full_name: str = "Test User",
    role: UserRole = UserRole.student,
    email_verified: bool = True,
    is_verified: bool = False,
    is_active: bool = True,
    admission_number: str | None = None,
) -> User:
    user = User(
        email=email or unique_email(),
        password=hash_password(password),
        full_name=full_name,
        role=role,
        email_verified=email_verified,
        is_verified=is_verified,
        is_active=is_active,
        admission_number=admission_number or f"ADM-{uuid.uuid4().hex[:8]}",
    )
    db.add(user)
    db.flush()
    return user


def grant_student_role(db: Session, user: User) -> None:
    grant_role(db, user_id=user.id, role=UserRole.student, granted_by=None)


def grant_admin_role(db: Session, admin: User) -> None:
    grant_role(
        db,
        user_id=admin.id,
        role=UserRole.admin,
        granted_by=None,
        allow_admin_bootstrap=True,
    )


def create_counsellor_profile(
    db: Session,
    user: User,
    *,
    status: CounsellorProfileStatus = CounsellorProfileStatus.active,
    specialties: list[str] | None = None,
    languages: list[str] | None = None,
) -> CounsellorProfile:
    profile = CounsellorProfile(
        user_id=user.id,
        short_name=user.full_name.split()[0],
        initials="TU",
        year=2,
        status=status,
        specialties=specialties or [],
        languages=languages or ["English"],
    )
    db.add(profile)
    db.flush()
    return profile


def create_listed_counsellor(
    db: Session,
    *,
    full_name: str,
    specialties: list[str],
    languages: list[str] | None = None,
    is_verified: bool = True,
) -> tuple[User, CounsellorProfile]:
    user = create_user(
        db,
        full_name=full_name,
        role=UserRole.counsellor,
        is_verified=is_verified,
        email_verified=True,
    )
    grant_role(db, user_id=user.id, role=UserRole.counsellor, granted_by=None)
    profile = create_counsellor_profile(
        db,
        user,
        specialties=specialties,
        languages=languages,
    )
    return user, profile


def login_headers(client, email: str, password: str) -> dict[str, str]:
    response = client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )
    assert response.status_code == 200
    token = response.json()["token"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_completed_session_request(
    db: Session,
    *,
    student: User,
    counsellor: User,
) -> SessionRequest:
    request = SessionRequest(
        student_id=student.id,
        counsellor_id=counsellor.id,
        topic=SessionTopic.anxiety,
        preferred_date=date.today(),
        preferred_time="10:00",
        format=SessionFormat.video,
        status=SessionRequestStatus.completed,
    )
    db.add(request)
    db.flush()
    return request


def bearer_headers(user_id: int, roles: list[str]) -> dict[str, str]:
    token = create_access_token({"user_id": user_id, "roles": roles})
    return {"Authorization": f"Bearer {token}"}
