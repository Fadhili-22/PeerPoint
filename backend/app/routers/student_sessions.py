from fastapi import APIRouter, Depends

from app import schemas
from app.dependencies import require_student
from app.models import User

router = APIRouter(prefix="/students/me/sessions", tags=["Student Sessions"])


@router.get("", response_model=schemas.StudentSessionListResponse)
def list_my_sessions(_: User = Depends(require_student)):
    # TODO: implement
    raise NotImplementedError


@router.get("/{session_id}", response_model=schemas.StudentSessionDetail)
def get_my_session(
    session_id: str,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError
