"""Query + mapper helpers for the admin counsellor-management surface.

Keeps the two admin list endpoints (active counsellors, promotion candidates)
and the promote-validation gate out of the router so the SQL/mapping logic is
testable and the route handlers stay thin.
"""

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import schemas
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    PromotionCandidate,
    TrainingStatus,
    User,
    UserRole,
    UserRoleAssignment,
)
from app.services.account_emails import (
    notify_account_deactivated,
    notify_account_reactivated,
)
from app.services.session_requests import count_completed_sessions_for_counsellor
from app.services.user_roles import (
    get_active_role_values,
    revoke_role,
    user_has_active_role,
)


def _active_counsellor_user_ids(db: Session):
    """Subquery of user_ids that currently hold an active counsellor role."""
    return (
        db.query(UserRoleAssignment.user_id)
        .filter(
            UserRoleAssignment.role == UserRole.counsellor,
            UserRoleAssignment.is_active.is_(True),
        )
    )


def list_admin_counsellors(
    db: Session,
    *,
    status_filter: CounsellorProfileStatus | None = None,
    search: str | None = None,
) -> list[schemas.AdminCounsellorItem]:
    """Users with an active counsellor role AND a counsellor_profiles row.

    Optional ``status_filter`` narrows by profile status (active/inactive).
    Optional ``search`` matches name, email, or specialties (case-insensitive).
    Ordered by full name (A→Z) for a stable, scannable directory.
    """
    query = (
        db.query(CounsellorProfile, User)
        .join(User, CounsellorProfile.user_id == User.id)
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.counsellor)
            & (UserRoleAssignment.is_active.is_(True)),
        )
    )
    if status_filter is not None:
        query = query.filter(
            CounsellorProfile.status == CounsellorProfileStatus(status_filter.value)
        )

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                func.array_to_string(CounsellorProfile.specialties, ", ").ilike(term),
            )
        )

    rows = query.order_by(User.full_name.asc()).all()
    return [
        _map_admin_counsellor(profile, user, db=db) for profile, user in rows
    ]


def _map_admin_counsellor(
    profile: CounsellorProfile, user: User, *, db: Session
) -> schemas.AdminCounsellorItem:
    return schemas.AdminCounsellorItem(
        id=profile.id,  # counsellor_profiles PK (profile id)
        user_id=user.id,  # users.id — promote target
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        year=profile.year,
        program=profile.program,
        specialties=list(profile.specialties or []),
        sessions_count=count_completed_sessions_for_counsellor(db, user.id),
        status=profile.status,
        last_active_at=profile.last_active_at,
    )


def list_promotion_candidates(
    db: Session,
) -> list[schemas.PromotionCandidateItem]:
    """promotion_candidates joined to users, EXCLUDING anyone who already holds
    an active counsellor role. Ordered newest application first."""
    rows = (
        db.query(PromotionCandidate, User)
        .join(User, PromotionCandidate.user_id == User.id)
        .filter(PromotionCandidate.user_id.notin_(_active_counsellor_user_ids(db)))
        .order_by(PromotionCandidate.applied_on.desc())
        .all()
    )
    return [_map_promotion_candidate(candidate, user) for candidate, user in rows]


def list_promotable_students(
    db: Session,
    *,
    search: str | None = None,
) -> list[schemas.PromotableStudentItem]:
    """Active students eligible for counsellor promotion (no active counsellor role)."""
    query = (
        db.query(User)
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.student)
            & (UserRoleAssignment.is_active.is_(True)),
        )
        .filter(User.is_active.is_(True))
        .filter(User.id.notin_(_active_counsellor_user_ids(db)))
    )
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
            )
        )
    rows = query.order_by(User.full_name.asc()).all()
    return [
        schemas.PromotableStudentItem(
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
        )
        for user in rows
    ]


def _map_promotion_candidate(
    candidate: PromotionCandidate, user: User
) -> schemas.PromotionCandidateItem:
    return schemas.PromotionCandidateItem(
        id=candidate.id,  # promotion_candidates PK
        user_id=user.id,  # users.id — promote target
        name=user.full_name,
        email=user.email,
        course=candidate.course,
        year=candidate.year,
        training_status=candidate.training_status,
        sessions_attended=candidate.sessions_attended,
        applied_on=candidate.applied_on,
    )


def validate_promotion_candidate(db: Session, user_id: int) -> PromotionCandidate:
    """Training gate for the legacy promotion-candidates queue.

    Raises 422 when the user is not a candidate or has not completed training.
    """
    candidate = (
        db.query(PromotionCandidate)
        .filter(PromotionCandidate.user_id == user_id)
        .first()
    )
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User is not a promotion candidate",
        )
    if candidate.training_status != TrainingStatus.training_complete:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Training must be complete before promotion",
        )
    return candidate


def toggle_counsellor_active(
    db: Session, counsellor_id: int
) -> schemas.AdminStudentToggleActiveResponse:
    user = (
        db.query(User)
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.counsellor)
            & (UserRoleAssignment.is_active.is_(True)),
        )
        .filter(User.id == counsellor_id)
        .first()
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counsellor not found",
        )

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    if user.is_active:
        notify_account_reactivated(user)
        message = "Counsellor account reactivated."
    else:
        notify_account_deactivated(user)
        message = "Counsellor account deactivated."

    return schemas.AdminStudentToggleActiveResponse(
        user_id=user.id,
        is_active=user.is_active,
        message=message,
    )


def demote_counsellor(
    db: Session, user_id: int
) -> schemas.DemoteCounsellorResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    assignment = revoke_role(db, user_id=user_id, role=UserRole.counsellor)
    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User does not have an active counsellor role",
        )

    if user_has_active_role(db, user_id, UserRole.student):
        user.role = UserRole.student

    profile = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.user_id == user_id)
        .first()
    )
    if profile is not None:
        profile.status = CounsellorProfileStatus.inactive

    db.commit()

    roles = get_active_role_values(db, user_id)
    return schemas.DemoteCounsellorResponse(
        user_id=user_id,
        roles=roles,
        message="Counsellor role revoked. Student role retained.",
    )


def validate_promotion_target(db: Session, user_id: int) -> User:
    """Ensure the admin-selected user exists and holds an active student role."""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not (
        db.query(UserRoleAssignment.user_id)
        .filter(
            UserRoleAssignment.user_id == user_id,
            UserRoleAssignment.role == UserRole.student,
            UserRoleAssignment.is_active.is_(True),
        )
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User must have an active student role to be promoted",
        )
    return user
