from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.oauth2 import get_current_user
from app.services.user_roles import user_has_active_role, user_has_any_active_role


def require_role(*roles: UserRole):
    """
    Factory that returns a dependency checking active user_roles membership.
    Pass one or more UserRole values as arguments.
    Example: Depends(require_role(UserRole.admin, UserRole.counsellor))
    """
    def role_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        if not user_has_any_active_role(db, current_user.id, roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}",
            )
        return current_user

    return role_checker


def require_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_active_role(db, current_user.id, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only",
        )
    return current_user


def require_counsellor(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_active_role(db, current_user.id, UserRole.counsellor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Counsellors only",
        )
    return current_user


def require_active_counsellor(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Active counsellor role plus admin verification — required for counsellor actions."""
    if not user_has_active_role(db, current_user.id, UserRole.counsellor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Counsellors only",
        )
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Counsellor account pending approval",
        )
    return current_user


def require_student(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_active_role(db, current_user.id, UserRole.student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students only",
        )
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )
    return current_user


def require_admin_or_verified_student(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admins bypass email verification; students must have email_verified."""
    if user_has_active_role(db, current_user.id, UserRole.admin):
        return current_user
    if user_has_active_role(db, current_user.id, UserRole.student):
        if not current_user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified",
            )
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. Required role(s): ['student', 'admin']",
    )
