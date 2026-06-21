from fastapi import APIRouter, Depends

from app import schemas
from app.dependencies import require_active_counsellor
from app.models import User

router = APIRouter(prefix="/counsellor/resources", tags=["Counsellor Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_my_resources(_: User = Depends(require_active_counsellor)):
    # TODO: implement
    raise NotImplementedError


@router.post("", response_model=schemas.ResourceResponse, status_code=201)
def create_resource(
    payload: schemas.ResourceCreate,
    _: User = Depends(require_active_counsellor),
):
    # TODO: implement
    raise NotImplementedError


@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(
    resource_id: str,
    payload: schemas.ResourceUpdate,
    _: User = Depends(require_active_counsellor),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/submit", response_model=schemas.ResourceActionResponse)
def submit_resource_for_review(
    resource_id: str,
    _: User = Depends(require_active_counsellor),
):
    # TODO: implement
    raise NotImplementedError
