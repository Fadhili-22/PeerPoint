from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_active_counsellor
from app.models import CounsellorAvailabilitySchedule, CounsellorProfile, User
from app.services.availability import (
    MAX_DAY_OF_WEEK,
    MIN_DAY_OF_WEEK,
    TIME_SLOT_OPTIONS,
    invalid_slots,
)

router = APIRouter(prefix="/counsellor/me", tags=["Counsellor Availability"])


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


def _manage_response(
    profile: CounsellorProfile,
) -> schemas.CounsellorAvailabilityManageResponse:
    rows = sorted(profile.availability_schedule, key=lambda r: r.day_of_week)
    return schemas.CounsellorAvailabilityManageResponse(
        schedule=[
            schemas.AvailabilityScheduleItem(
                day_of_week=row.day_of_week,
                enabled=row.enabled,
                slots=row.slots,
            )
            for row in rows
        ],
    )


@router.get(
    "/availability", response_model=schemas.CounsellorAvailabilityManageResponse
)
def get_my_availability(
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    profile = _load_own_profile(db, current_user)
    return _manage_response(profile)


@router.put(
    "/availability", response_model=schemas.CounsellorAvailabilityManageResponse
)
def update_my_availability(
    payload: schemas.CounsellorAvailabilityUpdate,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    """Upsert the counsellor's own weekday rows.

    Every submitted slot string is validated against the canonical
    ``TIME_SLOT_OPTIONS`` palette (audit §5.4); out-of-palette or duplicate
    weekday submissions are rejected with 422. Writes are scoped strictly to the
    caller's own ``profile.id`` via the UNIQUE (counsellor_id, day_of_week)
    constraint, so they can never affect another counsellor's schedule.
    """
    profile = _load_own_profile(db, current_user)

    seen_days: set[int] = set()
    for item in payload.schedule:
        if not (MIN_DAY_OF_WEEK <= item.day_of_week <= MAX_DAY_OF_WEEK):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"day_of_week must be between {MIN_DAY_OF_WEEK} and "
                    f"{MAX_DAY_OF_WEEK}"
                ),
            )
        if item.day_of_week in seen_days:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Duplicate day_of_week {item.day_of_week} in schedule",
            )
        seen_days.add(item.day_of_week)

        bad = invalid_slots(item.slots)
        if bad:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Slots must come from the fixed time palette",
                    "invalid_slots": bad,
                    "allowed_slots": list(TIME_SLOT_OPTIONS),
                },
            )

    existing_rows = {
        row.day_of_week: row for row in profile.availability_schedule
    }
    for item in payload.schedule:
        row = existing_rows.get(item.day_of_week)
        if row is None:
            db.add(
                CounsellorAvailabilitySchedule(
                    counsellor_id=profile.id,
                    day_of_week=item.day_of_week,
                    enabled=item.enabled,
                    slots=item.slots,
                )
            )
        else:
            row.enabled = item.enabled
            row.slots = item.slots

    db.commit()
    db.refresh(profile)
    return _manage_response(profile)
