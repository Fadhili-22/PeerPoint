from fastapi import APIRouter, Depends, File, UploadFile, status

from app import schemas
from app.dependencies import require_role
from app.models import User, UserRole
from app.services.media_storage import validate_and_save_upload

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/upload", response_model=schemas.MediaUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    _: User = Depends(require_role(UserRole.admin, UserRole.counsellor)),
):
    url, key = validate_and_save_upload(file)
    return schemas.MediaUploadResponse(url=url, key=key)
