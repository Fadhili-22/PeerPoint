from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus as CounsellorProfileStatusModel,
    Resource,
    ResourceStatus,
    SessionRequest,
    SessionRequestStatus as SessionRequestStatusModel,
)

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/counsellors/featured", response_model=schemas.FeaturedCounsellorsResponse)
def get_featured_counsellors(
    limit: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Unauthenticated landing carousel (audit §5.1).

    Returns active counsellor profiles. Only users that actually have an active
    profile are included; an empty result is a valid empty list, never an error.
    """
    profiles = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.status == CounsellorProfileStatusModel.active)
        .order_by(CounsellorProfile.id)
        .limit(limit)
        .all()
    )

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
def get_public_stats(db: Session = Depends(get_db)):
    counsellor_count = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.status == CounsellorProfileStatusModel.active)
        .count()
    )

    students_supported = (
        db.query(func.count(func.distinct(SessionRequest.student_id)))
        .filter(
            SessionRequest.status.in_(
                [
                    SessionRequestStatusModel.accepted,
                    SessionRequestStatusModel.completed,
                ]
            )
        )
        .scalar()
        or 0
    )

    sessions_completed = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatusModel.completed)
        .count()
    )

    resources_published = (
        db.query(Resource)
        .filter(Resource.status == ResourceStatus.published)
        .count()
    )

    return schemas.PublicStatsResponse(
        counsellor_count=counsellor_count,
        students_supported=students_supported,
        sessions_completed=sessions_completed,
        resources_published=resources_published,
    )
