from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_student
from app.models import User
from app.services import session_requests as session_request_service

router = APIRouter(prefix="/students/me/sessions", tags=["Student Sessions"])


@router.get("", response_model=schemas.StudentSessionListResponse)
def list_my_sessions(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    sessions = session_request_service.list_student_sessions(db, current_user.id)
    return schemas.StudentSessionListResponse(sessions=sessions)


@router.get("/{session_id}", response_model=schemas.StudentSessionDetail)
def get_my_session(
    session_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    detail = session_request_service.get_student_session_detail(
        db, current_user.id, session_id
    )
    return detail
