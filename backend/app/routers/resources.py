from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import schemas
from app.database import get_db
from app.dependencies import require_student
from app.models import User
from app.schemas.enums import ResourceCategory
from app.services import resources as resources_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_resources(
    category: ResourceCategory | None = None,
    search: str | None = None,
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    items = resources_service.list_published_resources(
        db,
        category=category,
        search=search,
    )
    return schemas.ResourceListResponse(resources=items)


@router.get("/featured", response_model=schemas.ResourceListResponse)
def list_featured_resources(
    limit: int = Query(default=2, ge=1, le=10),
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    items = resources_service.list_featured_resources(db, limit=limit)
    return schemas.ResourceListResponse(resources=items)


@router.get("/recommended", response_model=schemas.ResourceListResponse)
def list_recommended_resources(
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    items = resources_service.list_recommended_resources(db)
    return schemas.ResourceListResponse(resources=items)


@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_resource(
    resource_id: str,
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    resource = resources_service.get_published_resource(db, resource_id)
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    return resources_service.to_resource_response(resource)


@router.get("/{resource_id}/related", response_model=schemas.ResourceListResponse)
def get_related_resources(
    resource_id: str,
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    base = resources_service.get_published_resource(db, resource_id)
    if base is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    items = resources_service.get_related_resources(db, resource_id)
    return schemas.ResourceListResponse(resources=items)


@router.post("/{resource_id}/view", response_model=schemas.ResourceViewResponse)
def record_resource_view(
    resource_id: str,
    _: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    result = resources_service.increment_resource_views(db, resource_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    resource_id, views = result
    db.commit()
    return schemas.ResourceViewResponse(id=resource_id, views=views)
