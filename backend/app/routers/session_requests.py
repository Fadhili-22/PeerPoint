from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_student
from app.models import User
from app.schemas.enums import SessionRequestStatus
from app.services import session_requests as session_request_service

router = APIRouter(prefix="/session-requests", tags=["Session Requests"])


@router.post("", response_model=schemas.SessionRequestCreatedResponse, status_code=201)
def create_session_request(
    payload: schemas.SessionRequestCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    request = session_request_service.create_session_request(
        db, payload, current_user
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
