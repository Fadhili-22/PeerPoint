from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_active_counsellor
from app.models import User
from app.schemas.enums import ResourceStatus
from app.services import resource_cms as resource_cms_service

router = APIRouter(prefix="/counsellor/resources", tags=["Counsellor Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_my_resources(
    status: ResourceStatus | None = None,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    items = resource_cms_service.list_counsellor_resources(
        db,
        current_user.id,
        status_filter=status,
    )
    return schemas.ResourceListResponse(resources=items)


@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_my_resource(
    resource_id: str,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    return resource_cms_service.get_counsellor_resource(
        db, resource_id, current_user.id
    )


@router.post("", response_model=schemas.ResourceResponse, status_code=201)
def create_resource(
    payload: schemas.ResourceCreate,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.create_counsellor_resource(
        db, current_user, payload
    )
    db.commit()
    return resource


@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(
    resource_id: str,
    payload: schemas.ResourceUpdate,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.update_counsellor_resource(
        db, resource_id, current_user, payload
    )
    db.commit()
    return resource


@router.post("/{resource_id}/submit", response_model=schemas.ResourceActionResponse)
def submit_resource_for_review(
    resource_id: str,
    current_user: User = Depends(require_active_counsellor),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.submit_counsellor_resource(
        db, resource_id, current_user.id
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Resource submitted for review",
    )
