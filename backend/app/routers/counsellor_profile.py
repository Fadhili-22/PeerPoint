from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_active_counsellor
from app.models import CounsellorProfile, User
from app.schemas.enums import AvailabilityStatus, CounsellorProfileStatus
from app.services.session_requests import count_completed_sessions_for_counsellor

router = APIRouter(prefix="/counsellor/me", tags=["Counsellor Profile"])

# Fields a counsellor may edit on their own profile. Admin/system-owned fields
# (rating, sessions_count, status, year, availability_status, is_online) are
# deliberately excluded — see description.md / task §2c.
SELF_EDITABLE_FIELDS = frozenset(
    {
        "short_name",
        "bio",
        "quote",
        "specialties",
        "languages",
        "photo_url",
        "program",
        "response_time",
        "availability_note",
    }
)


def _load_own_profile(db: Session, user: User) -> CounsellorProfile:
    profile = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.user_id == user.id)
        .first()
    )
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counsellor profile not found",
        )
    return profile


def _serialize(
    profile: CounsellorProfile, user: User, *, sessions_count: int
) -> schemas.CounsellorOwnProfile:
    return schemas.CounsellorOwnProfile(
        id=user.id,
        user_id=user.id,
        full_name=user.full_name,
        short_name=profile.short_name,
        initials=profile.initials,
        year=profile.year,
        program=profile.program,
        bio=profile.bio,
        quote=profile.quote,
        specialties=profile.specialties,
        languages=profile.languages,
        photo_url=profile.photo_url,
        rating=float(profile.rating),
        sessions_count=sessions_count,
        joined_at=profile.joined_at,
        availability_status=AvailabilityStatus(profile.availability_status.value),
        is_online=profile.is_online,
        busy_until=profile.busy_until,
        availability_note=profile.availability_note,
        response_time=profile.response_time,
        status=CounsellorProfileStatus(profile.status.value),
        last_active_at=profile.last_active_at,
    )


@router.get("/profile", response_model=schemas.CounsellorOwnProfile)
def get_my_profile(
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    profile = _load_own_profile(db, current_user)
    return _serialize(
        profile,
        current_user,
        sessions_count=count_completed_sessions_for_counsellor(db, current_user.id),
    )


@router.put("/profile", response_model=schemas.CounsellorOwnProfile)
def update_my_profile(
    payload: schemas.CounsellorProfileSelfUpdate,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    """Update self-editable fields only. Unset fields are left untouched;
    fields outside SELF_EDITABLE_FIELDS cannot be reached via this schema."""
    profile = _load_own_profile(db, current_user)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if field in SELF_EDITABLE_FIELDS:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return _serialize(
        profile,
        current_user,
        sessions_count=count_completed_sessions_for_counsellor(db, current_user.id),
    )
