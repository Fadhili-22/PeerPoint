# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin, require_role
from app.models import User, UserRole
from app import schemas
from app.oauth2 import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Any authenticated user can view their own profile."""
    return current_user

@router.get("/", response_model=list[schemas.UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Only admins can list all users."""
    return db.query(User).all()

@router.get("/counsellors", response_model=list[schemas.UserResponse])
def list_counsellors(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.student, UserRole.admin))
):
    """Students and admins can browse available counsellors."""
    return (
        db.query(User)
        .join(UserRoleAssignment)
        .filter(
            UserRoleAssignment.role == UserRole.counsellor,
            UserRoleAssignment.is_active.is_(True),
        )
        .all()
    )