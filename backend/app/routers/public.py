from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import (
    AvailabilityStatus as AvailabilityStatusModel,
    CounsellorProfile,
    CounsellorProfileStatus as CounsellorProfileStatusModel,
)
from app.schemas.enums import AvailabilityStatus

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/counsellors/featured", response_model=schemas.FeaturedCounsellorsResponse)
def get_featured_counsellors(
    status: AvailabilityStatus | None = Query(default=AvailabilityStatus.available),
    limit: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Unauthenticated landing carousel (audit §5.1).

    Returns active counsellor profiles whose availability matches ``status``
    (default ``available``). Only users that actually have an active profile are
    included; an empty result is a valid empty list, never an error.
    """
    target_status = AvailabilityStatusModel(status.value) if status else None

    query = db.query(CounsellorProfile).filter(
        CounsellorProfile.status == CounsellorProfileStatusModel.active,
    )
    if target_status is not None:
        query = query.filter(
            CounsellorProfile.availability_status == target_status
        )

    profiles = query.order_by(CounsellorProfile.id).limit(limit).all()

    cards = [
        schemas.CounsellorCard(
            id=profile.user_id,
            short_name=profile.short_name,
            initials=profile.initials,
            photo_url=profile.photo_url,
            specialties=profile.specialties,
            bio=profile.bio,
            availability_note=profile.availability_note,
        )
        for profile in profiles
    ]
    return schemas.FeaturedCounsellorsResponse(counsellors=cards)


@router.get("/stats", response_model=schemas.PublicStatsResponse)
def get_public_stats():
    # TODO: implement
    raise NotImplementedError
