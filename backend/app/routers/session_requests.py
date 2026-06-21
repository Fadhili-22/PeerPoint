from fastapi import APIRouter, Depends

from app import schemas
from app.dependencies import require_student
from app.models import User

router = APIRouter(prefix="/session-requests", tags=["Session Requests"])


@router.post("", response_model=schemas.SessionRequestCreatedResponse, status_code=201)
def create_session_request(
    payload: schemas.SessionRequestCreate,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/mine", response_model=schemas.SessionRequestListResponse)
def list_my_session_requests(_: User = Depends(require_student)):
    # TODO: implement
    raise NotImplementedError
