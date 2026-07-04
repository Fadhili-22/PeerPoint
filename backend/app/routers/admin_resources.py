from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.config import settings
from app.database import get_db
from app.dependencies import require_admin
from app.models import User
from app.schemas.enums import ResourceStatus, ReviewDecision
from app.services.account_emails import (
    notify_resource_approved,
    notify_resource_rejected,
)
from app.services import resource_cms as resource_cms_service

router = APIRouter(prefix="/admin/resources", tags=["Admin Resources"])


@router.get("", response_model=schemas.ResourceListResponse)
def list_admin_resources(
    status: ResourceStatus | None = None,
    search: str | None = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    items = resource_cms_service.list_admin_resources(
        db,
        status_filter=status,
        search=search,
    )
    return schemas.ResourceListResponse(resources=items)


@router.get("/stats", response_model=schemas.ResourceStatsResponse)
def get_resource_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return resource_cms_service.get_resource_stats(db)


@router.get("/pending-review", response_model=schemas.ResourceListResponse)
def list_pending_review_resources(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    items = resource_cms_service.list_pending_review_resources(db)
    return schemas.ResourceListResponse(resources=items)


@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_admin_resource(
    resource_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return resource_cms_service.get_admin_resource(db, resource_id)


@router.post("", response_model=schemas.ResourceResponse, status_code=201)
def create_admin_resource(
    payload: schemas.ResourceCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.create_admin_resource(
        db, current_user, payload, background_tasks=background_tasks
    )
    db.commit()
    return resource


@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_admin_resource(
    resource_id: str,
    payload: schemas.ResourceUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.update_admin_resource(
        db, resource_id, current_user, payload
    )
    db.commit()
    return resource


@router.post("/{resource_id}/publish", response_model=schemas.ResourceActionResponse)
def publish_resource(
    resource_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.publish_admin_resource(
        db, resource_id, current_user.id, background_tasks=background_tasks
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Resource published",
    )


@router.post("/{resource_id}/unpublish", response_model=schemas.ResourceActionResponse)
def unpublish_resource(
    resource_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.unpublish_admin_resource(
        db, resource_id, current_user.id
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Resource unpublished",
    )


@router.post("/{resource_id}/feature", response_model=schemas.ResourceActionResponse)
def feature_resource(
    resource_id: str,
    payload: schemas.ResourceFeatureRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.feature_admin_resource(
        db, resource_id, current_user.id, payload
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Featured status updated",
    )


@router.post("/{resource_id}/archive", response_model=schemas.ResourceActionResponse)
def archive_resource(
    resource_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.archive_admin_resource(
        db, resource_id, current_user.id
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Resource archived",
    )


@router.post("/{resource_id}/restore", response_model=schemas.ResourceActionResponse)
def restore_resource(
    resource_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.restore_admin_resource(
        db, resource_id, current_user.id
    )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Resource restored to draft",
    )


@router.post("/{resource_id}/review", response_model=schemas.ResourceActionResponse)
def review_resource(
    resource_id: str,
    payload: schemas.ResourceReviewRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    resource = resource_cms_service.review_admin_resource(
        db, resource_id, current_user, payload, background_tasks=background_tasks
    )
    submitter = resource.submitted_by
    if submitter is not None and payload.decision in (
        ReviewDecision.approve_publish,
        ReviewDecision.reject,
    ):
        if payload.decision == ReviewDecision.approve_publish:
            background_tasks.add_task(
                notify_resource_approved,
                counsellor_email=submitter.email,
                counsellor_name=submitter.full_name,
                title=resource.title,
                url=f"{settings.FRONTEND_URL.rstrip('/')}/student/resources/{resource.id}",
            )
        else:
            background_tasks.add_task(
                notify_resource_rejected,
                counsellor_email=submitter.email,
                counsellor_name=submitter.full_name,
                title=resource.title,
                rejection_reason=resource.rejection_reason,
            )
    db.commit()
    return schemas.ResourceActionResponse(
        id=resource.id,
        status=ResourceStatus(resource.status.value),
        message="Review decision applied",
    )
