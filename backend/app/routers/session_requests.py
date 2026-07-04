from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_student
from app.models import User
from app.schemas.enums import SessionRequestStatus
from app.services import session_requests as session_request_service
from app.services.account_emails import notify_session_requested

router = APIRouter(prefix="/session-requests", tags=["Session Requests"])


@router.post("", response_model=schemas.SessionRequestCreatedResponse, status_code=201)
def create_session_request(
    payload: schemas.SessionRequestCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    request, counsellor = session_request_service.create_session_request(
        db, payload, current_user
    )
    if counsellor is not None:
        background_tasks.add_task(
            notify_session_requested,
            counsellor_email=counsellor.email,
            counsellor_name=counsellor.full_name,
            student_display_name=session_request_service.student_display_name(
                request, current_user
            ),
            topic=request.topic.value,
            scheduled_at=session_request_service.scheduled_at_label(request),
            session_format=request.format.value,
            notes=request.notes,
        )
    return schemas.SessionRequestCreatedResponse(
        id=request.id,
        status=SessionRequestStatus(request.status.value),
    )


@router.get("/mine", response_model=schemas.SessionRequestListResponse)
def list_my_session_requests(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    requests = session_request_service.list_student_requests(db, current_user.id)
    return schemas.SessionRequestListResponse(requests=requests)
