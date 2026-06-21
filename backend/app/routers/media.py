from fastapi import APIRouter, Depends, File, UploadFile, status

from app import schemas
from app.dependencies import require_role
from app.models import User, UserRole

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/upload", response_model=schemas.MediaUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    _: User = Depends(require_role(UserRole.admin, UserRole.counsellor)),
):
    # TODO: implement
    raise NotImplementedError
