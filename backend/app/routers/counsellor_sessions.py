from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from sqlalchemy.orm import Session



from app import schemas

from app.database import get_db

from app.dependencies import require_active_counsellor

from app.models import User

from app.schemas.enums import SessionRequestStatus

from app.services import session_requests as session_request_service

from app.services.account_emails import notify_session_accepted, notify_session_rejected



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

    background_tasks: BackgroundTasks,

    current_user: User = Depends(require_active_counsellor),

    db: Session = Depends(get_db),

):

    request = session_request_service.accept_request(

        db, request_id, current_user.id

    )

    student = request.student

    background_tasks.add_task(

        notify_session_accepted,

        student_email=student.email,

        student_name=student.full_name,

        counsellor_name=current_user.full_name,

        scheduled_at=session_request_service.scheduled_at_label(request),

        session_format=request.format.value,

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

    background_tasks: BackgroundTasks,

    current_user: User = Depends(require_active_counsellor),

    db: Session = Depends(get_db),

):

    request = session_request_service.reject_request(

        db, request_id, current_user.id, reason=payload.reason

    )

    student = request.student

    background_tasks.add_task(

        notify_session_rejected,

        student_email=student.email,

        student_name=student.full_name,

        counsellor_name=current_user.full_name,

        scheduled_at=session_request_service.scheduled_at_label(request),

        session_format=request.format.value,

        rejection_reason=request.rejection_reason,

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





@router.get("/me/sessions/upcoming", response_model=schemas.CounsellorUpcomingSessionsResponse)

def get_upcoming_sessions(

    current_user: User = Depends(require_active_counsellor),

    db: Session = Depends(get_db),

):

    sessions = session_request_service.list_upcoming_counsellor_sessions(

        db, current_user.id

    )

    return schemas.CounsellorUpcomingSessionsResponse(sessions=sessions)

