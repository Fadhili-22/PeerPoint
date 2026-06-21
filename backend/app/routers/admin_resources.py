from fastapi import APIRouter, Depends, Query

from app import schemas
from app.dependencies import require_admin
from app.models import User
from app.schemas.enums import ResourceStatus

router = APIRouter(prefix="/admin/resources", tags=["Admin Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_admin_resources(
    status: ResourceStatus | None = None,
    search: str | None = None,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.get("/stats", response_model=schemas.ResourceStatsResponse)
def get_resource_stats(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.get("/pending-review", response_model=schemas.ResourceListResponse)
def list_pending_review_resources(_: User = Depends(require_admin)):
    # TODO: implement
    raise NotImplementedError


@router.post("", response_model=schemas.ResourceResponse, status_code=201)
def create_admin_resource(
    payload: schemas.ResourceCreate,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_admin_resource(
    resource_id: str,
    payload: schemas.ResourceUpdate,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/publish", response_model=schemas.ResourceActionResponse)
def publish_resource(
    resource_id: str,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/unpublish", response_model=schemas.ResourceActionResponse)
def unpublish_resource(
    resource_id: str,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/feature", response_model=schemas.ResourceActionResponse)
def feature_resource(
    resource_id: str,
    payload: schemas.ResourceFeatureRequest,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/archive", response_model=schemas.ResourceActionResponse)
def archive_resource(
    resource_id: str,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/restore", response_model=schemas.ResourceActionResponse)
def restore_resource(
    resource_id: str,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError


@router.post("/{resource_id}/review", response_model=schemas.ResourceActionResponse)
def review_resource(
    resource_id: str,
    payload: schemas.ResourceReviewRequest,
    _: User = Depends(require_admin),
):
    # TODO: implement
    raise NotImplementedError
