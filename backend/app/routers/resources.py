from fastapi import APIRouter, Depends, Query

from app import schemas
from app.dependencies import require_student
from app.models import User
from app.schemas.enums import ResourceCategory

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_resources(
    category: ResourceCategory | None = None,
    search: str | None = None,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/featured", response_model=schemas.ResourceListResponse)
def list_featured_resources(
    limit: int = Query(default=2, ge=1, le=10),
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/recommended", response_model=schemas.ResourceListResponse)
def list_recommended_resources(_: User = Depends(require_student)):
    # TODO: implement
    raise NotImplementedError


@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_resource(
    resource_id: str,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/{resource_id}/related", response_model=schemas.ResourceListResponse)
def get_related_resources(
    resource_id: str,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/view", response_model=schemas.ResourceViewResponse)
def record_resource_view(
    resource_id: str,
    _: User = Depends(require_student),
):
    # TODO: implement
    raise NotImplementedError
