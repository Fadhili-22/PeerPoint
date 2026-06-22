from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_active_counsellor
from app.models import (
    AvailabilityStatus as AvailabilityStatusModel,
    CounsellorProfile,
    User,
)
from app.schemas.enums import AvailabilityStatus, SessionRequestStatus
from app.services import session_requests as session_request_service

router = APIRouter(prefix="/counsellor", tags=["Counsellor Sessions"])


@router.get("/session-requests", response_model=schemas.SessionRequestCounsellorListResponse)
def list_counsellor_session_requests(
    status: SessionRequestStatus | None = None,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    requests = session_request_service.list_counsellor_requests(
        db, current_user.id, status_filter=status
    )
    return schemas.SessionRequestCounsellorListResponse(requests=requests)


@router.get("/session-requests/{request_id}", response_model=schemas.SessionRequestDetail)
def get_counsellor_session_request(
    request_id: int,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    request = session_request_service.get_counsellor_request_detail(
        db, request_id, current_user.id
    )
    return request


@router.post(
    "/session-requests/{request_id}/accept",
    response_model=schemas.SessionRequestActionResponse,
)
def accept_session_request(
    request_id: int,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    request = session_request_service.accept_request(
        db, request_id, current_user.id
    )
    return schemas.SessionRequestActionResponse(
        id=request.id,
        status=SessionRequestStatus(request.status.value),
        message="Session request accepted",
    )


@router.post(
    "/session-requests/{request_id}/reject",
    response_model=schemas.SessionRequestActionResponse,
)
def reject_session_request(
    request_id: int,
    payload: schemas.SessionRequestReject,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    request = session_request_service.reject_request(
        db, request_id, current_user.id, reason=payload.reason
    )
    return schemas.SessionRequestActionResponse(
        id=request.id,
        status=SessionRequestStatus(request.status.value),
        message="Session request rejected",
    )


@router.post(
    "/session-requests/{request_id}/complete",
    response_model=schemas.SessionRequestActionResponse,
)
def complete_session_request(
    request_id: int,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    request = session_request_service.complete_request(
        db, request_id, current_user.id
    )
    return schemas.SessionRequestActionResponse(
        id=request.id,
        status=SessionRequestStatus(request.status.value),
        message="Session marked as completed",
    )


@router.patch("/me/availability-status", response_model=schemas.AvailabilityStatusResponse)
def update_availability_status(
    payload: schemas.AvailabilityStatusUpdate,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    """Dashboard online/offline toggle (audit §5.3).

    Complete mapping: ``true`` → available + online, ``false`` → offline + not
    online. Deliberately never writes ``busy`` / ``busy_until`` — there is no
    product rule yet for when a counsellor becomes "busy".
    """
    profile = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.user_id == current_user.id)
        .first()
    )
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counsellor profile not found",
        )

    if payload.is_available:
        profile.availability_status = AvailabilityStatusModel.available
        profile.is_online = True
    else:
        profile.availability_status = AvailabilityStatusModel.offline
        profile.is_online = False

    db.commit()
    db.refresh(profile)
    return schemas.AvailabilityStatusResponse(
        availability_status=AvailabilityStatus(profile.availability_status.value),
        is_online=profile.is_online,
    )


@router.get("/me/sessions/upcoming", response_model=schemas.CounsellorUpcomingSessionsResponse)
def get_upcoming_sessions(
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    sessions = session_request_service.list_upcoming_counsellor_sessions(
        db, current_user.id
    )
    return schemas.CounsellorUpcomingSessionsResponse(sessions=sessions)
