"""Authorization helpers for the user_roles membership model."""

import re
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import (
    CounsellorProfile,
    PromotionCandidate,
    User,
    UserRole,
    UserRoleAssignment,
)

# Fallback study year when no PromotionCandidate record exists. The audit's
# studyYears vocabulary is 2–4; 2 (the minimum) is the most conservative default.
# FLAG: confirm this default (and whether a profile should require a real year).
DEFAULT_COUNSELLOR_YEAR = 2


def _derive_short_name(full_name: str) -> str:
    """First token of the full name, e.g. "John Doe" -> "John"."""
    parts = full_name.split()
    return parts[0] if parts else full_name.strip()


def _derive_initials(full_name: str) -> str:
    """First + last initials, e.g. "John Doe" -> "JD"; single name -> "J"."""
    parts = [p for p in full_name.split() if p]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def _derive_year(db: Session, user_id: int) -> int:
    """Pull study year from the PromotionCandidate row (a String column) if one
    exists, else fall back to DEFAULT_COUNSELLOR_YEAR."""
    candidate = (
        db.query(PromotionCandidate)
        .filter(PromotionCandidate.user_id == user_id)
        .first()
    )
    if candidate and candidate.year:
        match = re.search(r"\d+", candidate.year)
        if match:
            return int(match.group())
    return DEFAULT_COUNSELLOR_YEAR


def ensure_counsellor_profile(db: Session, user: User) -> CounsellorProfile:
    """Create a default CounsellorProfile for ``user`` if none exists.

    Idempotent: honors the UNIQUE user_id constraint so re-promotion never
    creates a second profile. NOT NULL columns without a natural promotion-time
    value (short_name, initials, year) are derived from the user's name and
    PromotionCandidate record — see description.md for the flagged judgment calls.
    """
    existing = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.user_id == user.id)
        .first()
    )
    if existing is not None:
        return existing

    profile = CounsellorProfile(
        user_id=user.id,
        short_name=_derive_short_name(user.full_name),
        initials=_derive_initials(user.full_name),
        year=_derive_year(db, user.id),
    )
    db.add(profile)
    return profile


def get_active_role_assignments(db: Session, user_id: int) -> list[UserRoleAssignment]:
    return (
        db.query(UserRoleAssignment)
        .filter(
            UserRoleAssignment.user_id == user_id,
            UserRoleAssignment.is_active.is_(True),
        )
        .all()
    )


def get_active_roles_from_user(user: User) -> list[UserRole]:
    return [
        assignment.role
        for assignment in user.role_assignments
        if assignment.is_active
    ]


def get_active_role_values(db: Session, user_id: int) -> list[str]:
    return [role.value for role in _get_active_roles(db, user_id)]


def _get_active_roles(db: Session, user_id: int) -> list[UserRole]:
    assignments = get_active_role_assignments(db, user_id)
    return [assignment.role for assignment in assignments]


def user_has_active_role(db: Session, user_id: int, role: UserRole) -> bool:
    return role in _get_active_roles(db, user_id)


def user_has_any_active_role(db: Session, user_id: int, roles: tuple[UserRole, ...]) -> bool:
    active_roles = set(_get_active_roles(db, user_id))
    return bool(active_roles.intersection(roles))


def grant_role(
    db: Session,
    *,
    user_id: int,
    role: UserRole,
    granted_by: int | None = None,
    allow_admin_bootstrap: bool = False,
) -> UserRoleAssignment:
    """Insert an active user_roles row. Admin grants require an existing admin grantor."""
    if role == UserRole.admin:
        if granted_by is None:
            if not allow_admin_bootstrap:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin roles can only be granted via seed scripts or by an existing admin",
                )
        elif not user_has_active_role(db, granted_by, UserRole.admin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an existing admin may grant the admin role",
            )

    existing = (
        db.query(UserRoleAssignment)
        .filter(
            UserRoleAssignment.user_id == user_id,
            UserRoleAssignment.role == role,
            UserRoleAssignment.is_active.is_(True),
        )
        .first()
    )
    if existing:
        return existing

    assignment = UserRoleAssignment(
        user_id=user_id,
        role=role,
        is_active=True,
        granted_by=granted_by,
    )
    db.add(assignment)
    return assignment


def grant_counsellor_role(
    db: Session,
    *,
    user_id: int,
    granted_by: int,
) -> UserRoleAssignment:
    """Additive counsellor promotion — leaves an existing active student role untouched."""
    if not user_has_active_role(db, granted_by, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only an existing admin may promote users to counsellor",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    assignment = grant_role(
        db,
        user_id=user_id,
        role=UserRole.counsellor,
        granted_by=granted_by,
    )

    # Provision a default profile in the same transaction (idempotent). A
    # counsellor must have a profile to be visible in the directory / act as one.
    ensure_counsellor_profile(db, user)

    # Admin promotion is approval: verified counsellors skip /pending-approval.
    # Idempotent on re-promote — leaves is_verified True if already set.
    user.is_verified = True

    # Update non-authoritative primary context hint for UI defaults.
    user.role = UserRole.counsellor
    return assignment


def revoke_role(
    db: Session,
    *,
    user_id: int,
    role: UserRole,
) -> UserRoleAssignment | None:
    assignment = (
        db.query(UserRoleAssignment)
        .filter(
            UserRoleAssignment.user_id == user_id,
            UserRoleAssignment.role == role,
            UserRoleAssignment.is_active.is_(True),
        )
        .first()
    )
    if assignment is None:
        return None

    assignment.is_active = False
    assignment.revoked_at = datetime.now(timezone.utc)
    return assignment


def compute_login_redirect(roles: list[str], is_verified: bool) -> str:
    role_set = set(roles)
    if UserRole.admin.value in role_set:
        return "/admin"
    if UserRole.counsellor.value in role_set:
        return "/counsellor" if is_verified else "/pending-approval"
    return "/student"
