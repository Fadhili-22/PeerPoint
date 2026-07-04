from datetime import date



from fastapi import APIRouter, Depends, HTTPException, Query, status as http_status

from sqlalchemy import func, or_

from sqlalchemy.orm import Session



from app import schemas

from app.database import get_db

from app.dependencies import require_student

from app.models import (

    CounsellorProfile,

    CounsellorProfileStatus as CounsellorProfileStatusModel,

    User,

)

from app.services.availability import get_bookable_slots_for_date

from app.services.session_requests import count_completed_sessions_for_counsellor



router = APIRouter(prefix="/counsellors", tags=["Counsellors"])





def _to_directory_item(

    profile: CounsellorProfile, *, sessions_count: int

) -> schemas.CounsellorDirectoryItem:

    """Map a profile to the directory shape. External ``id`` is ``users.id``

    (identity contract §4); ``user_id`` is intentionally equal to it."""

    return schemas.CounsellorDirectoryItem(

        id=profile.user_id,

        user_id=profile.user_id,

        full_name=profile.user.full_name,

        short_name=profile.short_name,

        initials=profile.initials,

        year=profile.year,

        program=profile.program,

        bio=profile.bio,

        quote=profile.quote,

        specialties=profile.specialties,

        languages=profile.languages,

        photo_url=profile.photo_url,

        sessions_count=sessions_count,

        availability_note=profile.availability_note,

        response_time=profile.response_time,

    )





def _get_active_profile_or_404(db: Session, counsellor_id: int) -> CounsellorProfile:

    profile = (

        db.query(CounsellorProfile)

        .filter(

            CounsellorProfile.user_id == counsellor_id,

            CounsellorProfile.status == CounsellorProfileStatusModel.active,

        )

        .first()

    )

    if profile is None:

        raise HTTPException(

            status_code=http_status.HTTP_404_NOT_FOUND,

            detail="Counsellor not found",

        )

    return profile





@router.get("", response_model=schemas.CounsellorListResponse)

def list_counsellors(

    search: str | None = None,

    specialties: list[str] | None = Query(default=None),

    language: str | None = None,

    year: int | None = Query(default=None, ge=2, le=4),

    _: User = Depends(require_student),

    db: Session = Depends(get_db),

):

    """Student-facing directory (audit §5.2). Lists active counsellors with

    optional filters. Specialties match any (overlap); search spans name and

    specialties."""

    query = (

        db.query(CounsellorProfile)

        .join(User, CounsellorProfile.user_id == User.id)

        .filter(CounsellorProfile.status == CounsellorProfileStatusModel.active)

    )



    if year is not None:

        query = query.filter(CounsellorProfile.year == year)



    if language:

        query = query.filter(CounsellorProfile.languages.any(language))



    if specialties:

        query = query.filter(CounsellorProfile.specialties.overlap(specialties))



    if search:

        pattern = f"%{search}%"

        query = query.filter(

            or_(

                User.full_name.ilike(pattern),

                CounsellorProfile.short_name.ilike(pattern),

                func.array_to_string(CounsellorProfile.specialties, ",").ilike(

                    pattern

                ),

            )

        )



    profiles = query.order_by(CounsellorProfile.id).all()

    return schemas.CounsellorListResponse(

        counsellors=[

            _to_directory_item(

                profile,

                sessions_count=count_completed_sessions_for_counsellor(

                    db, profile.user_id

                ),

            )

            for profile in profiles

        ]

    )





@router.get("/{counsellor_id}", response_model=schemas.CounsellorProfileDetail)

def get_counsellor(

    counsellor_id: int,

    _: User = Depends(require_student),

    db: Session = Depends(get_db),

):

    """Full profile + per-weekday slot COUNT map (audit §9 risk #16)."""

    profile = _get_active_profile_or_404(db, counsellor_id)



    summary: dict[str, int] = {str(day): 0 for day in range(7)}

    for row in profile.availability_schedule:

        if row.enabled:

            summary[str(row.day_of_week)] = len(row.slots)



    base = _to_directory_item(

        profile,

        sessions_count=count_completed_sessions_for_counsellor(db, profile.user_id),

    )

    return schemas.CounsellorProfileDetail(

        **base.model_dump(),

        joined_at=profile.joined_at,

        weekly_availability_summary=summary,

    )





@router.get(

    "/{counsellor_id}/availability",

    response_model=schemas.CounsellorAvailabilityResponse,

)

def get_counsellor_availability(

    counsellor_id: int,

    _: User = Depends(require_student),

    db: Session = Depends(get_db),

):

    """Weekly slots keyed by day_of_week (0–6), plus unavailable dates."""

    profile = _get_active_profile_or_404(db, counsellor_id)



    weekly_slots: dict[int, list[str]] = {

        row.day_of_week: row.slots

        for row in profile.availability_schedule

        if row.enabled and row.slots

    }

    return schemas.CounsellorAvailabilityResponse(

        weekly_slots=weekly_slots,

        unavailable_dates=profile.unavailable_dates,

    )





@router.get("/{counsellor_id}/slots", response_model=schemas.CounsellorSlotsResponse)

def get_counsellor_slots(

    counsellor_id: int,

    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),

    _: User = Depends(require_student),

    db: Session = Depends(get_db),

):

    """Bookable slots for a specific date (audit §6.4). Past dates and dates in

    ``unavailable_dates`` return an empty list, as do weekdays with no enabled

    schedule."""

    profile = _get_active_profile_or_404(db, counsellor_id)



    try:

        target_date = date_from_iso(date)

    except ValueError:

        raise HTTPException(

            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,

            detail="date must be a valid YYYY-MM-DD calendar date",

        )



    if target_date < _today():

        return schemas.CounsellorSlotsResponse(slots=[])



    slots = get_bookable_slots_for_date(profile, target_date, today=_today())

    return schemas.CounsellorSlotsResponse(slots=slots)





def date_from_iso(value: str) -> date:

    return date.fromisoformat(value)





def _today() -> date:

    return date.today()

