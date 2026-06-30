"""Counsellor submission and admin CMS write/query helpers."""

from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import String, cast, func, nulls_last, or_
from sqlalchemy.orm import Session

from app import schemas
from app.models import Resource, ResourceCategory as ResourceCategoryModel
from app.models import ResourceStatus as ResourceStatusModel
from app.models import User
from app.schemas.enums import ResourceCategory, ResourceStatus, ReviewDecision
from app.services.resources import _load_options, to_resource_response

COUNSELLOR_AUTHOR_ROLE = "Peer Counsellor, PeerPoint"


def slugify_title(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower().strip())
    return slug.strip("-")


def generate_unique_resource_id(db: Session, title: str) -> str:
    base_id = slugify_title(title) or "resource"
    candidate = base_id
    suffix = 1
    while (
        db.query(Resource.id).filter(Resource.id == candidate).first() is not None
    ):
        candidate = f"{base_id}-{suffix}"
        suffix += 1
    return candidate


def normalize_body(body: list[str]) -> list[str]:
    return [paragraph.strip() for paragraph in body if paragraph.strip()]


def estimate_read_time(body: list[str]) -> str:
    """~200 words/minute; minimum 1 minute; empty body defaults to 5 min read."""
    text = " ".join(normalize_body(body))
    words = len(text.split())
    if words == 0:
        return "5 min read"
    minutes = max(1, round(words / 200))
    return f"{minutes} min read"


def validate_resource_payload(payload: schemas.ResourceCreate | schemas.ResourceUpdate) -> None:
    if not payload.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title is required",
        )
    if not payload.description.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Description is required",
        )
    if not payload.image.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Image URL is required",
        )
    if not payload.image_alt.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Image alt text is required",
        )
    if not normalize_body(payload.body):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one content paragraph is required",
        )


def is_submittable(resource: Resource) -> bool:
    body = normalize_body(list(resource.body or []))
    return bool(
        resource.title.strip()
        and resource.category
        and resource.description.strip()
        and resource.image.strip()
        and resource.image_alt.strip()
        and body
    )


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _resource_query(db: Session):
    return db.query(Resource).options(*_load_options())


def _get_resource_or_404(db: Session, resource_id: str) -> Resource:
    resource = _resource_query(db).filter(Resource.id == resource_id).first()
    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    return resource


def _get_owned_counsellor_resource_or_404(
    db: Session, resource_id: str, user_id: int
) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    if resource.submitted_by_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    return resource


def _apply_content_fields(
    resource: Resource,
    payload: schemas.ResourceCreate | schemas.ResourceUpdate,
    *,
    editor_id: int,
) -> None:
    body = normalize_body(payload.body)
    resource.title = payload.title.strip()
    resource.category = ResourceCategoryModel(payload.category.value)
    resource.description = payload.description.strip()
    resource.read_time = payload.read_time.strip() or estimate_read_time(body)
    resource.image = payload.image.strip()
    resource.image_alt = payload.image_alt.strip()
    resource.body = body
    resource.last_edited_by_id = editor_id
    resource.updated_at = _utcnow()


def _next_featured_order(db: Session) -> int:
    current_max = (
        db.query(func.max(Resource.featured_order))
        .filter(
            Resource.status == ResourceStatusModel.published,
            Resource.featured.is_(True),
        )
        .scalar()
    )
    return (current_max or 0) + 1


# --- Counsellor ---


def list_counsellor_resources(
    db: Session,
    user_id: int,
    *,
    status_filter: ResourceStatus | None = None,
) -> list[schemas.ResourceResponse]:
    query = _resource_query(db).filter(Resource.submitted_by_id == user_id)
    if status_filter is not None:
        query = query.filter(
            Resource.status == ResourceStatusModel(status_filter.value)
        )
    resources = query.order_by(Resource.updated_at.desc()).all()
    return [to_resource_response(resource) for resource in resources]


def get_counsellor_resource(
    db: Session, resource_id: str, user_id: int
) -> schemas.ResourceResponse:
    resource = _get_owned_counsellor_resource_or_404(db, resource_id, user_id)
    return to_resource_response(resource)


def create_counsellor_resource(
    db: Session,
    user: User,
    payload: schemas.ResourceCreate,
) -> schemas.ResourceResponse:
    if payload.publish:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Counsellors cannot publish directly",
        )

    validate_resource_payload(payload)
    body = normalize_body(payload.body)
    resource_id = generate_unique_resource_id(db, payload.title)
    now = _utcnow()

    resource = Resource(
        id=resource_id,
        slug=resource_id,
        title=payload.title.strip(),
        category=ResourceCategoryModel(payload.category.value),
        description=payload.description.strip(),
        read_time=payload.read_time.strip() or estimate_read_time(body),
        author=user.full_name,
        author_role=COUNSELLOR_AUTHOR_ROLE,
        image=payload.image.strip(),
        image_alt=payload.image_alt.strip(),
        body=body,
        status=ResourceStatusModel.draft,
        featured=False,
        featured_order=None,
        published_at=None,
        created_at=now,
        updated_at=now,
        last_edited_by_id=user.id,
        submitted_by_id=user.id,
        submitted_at=None,
        reviewed_by_id=None,
        reviewed_at=None,
        rejection_reason=None,
        views=0,
        saves=0,
    )
    db.add(resource)
    db.flush()
    db.refresh(resource)
    return to_resource_response(resource)


def update_counsellor_resource(
    db: Session,
    resource_id: str,
    user: User,
    payload: schemas.ResourceUpdate,
) -> schemas.ResourceResponse:
    resource = _get_owned_counsellor_resource_or_404(db, resource_id, user.id)
    if resource.status not in (
        ResourceStatusModel.draft,
        ResourceStatusModel.rejected,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    validate_resource_payload(payload)
    _apply_content_fields(resource, payload, editor_id=user.id)
    resource.author = user.full_name
    resource.author_role = COUNSELLOR_AUTHOR_ROLE
    db.flush()
    db.refresh(resource)
    return to_resource_response(resource)


def submit_counsellor_resource(
    db: Session, resource_id: str, user_id: int
) -> Resource:
    resource = _get_owned_counsellor_resource_or_404(db, resource_id, user_id)
    if resource.status not in (
        ResourceStatusModel.draft,
        ResourceStatusModel.rejected,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    if not is_submittable(resource):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resource is incomplete and cannot be submitted",
        )

    now = _utcnow()
    resource.status = ResourceStatusModel.pending_review
    resource.submitted_at = now
    resource.rejection_reason = None
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


# --- Admin ---


def list_admin_resources(
    db: Session,
    *,
    status_filter: ResourceStatus | None = None,
    search: str | None = None,
) -> list[schemas.ResourceResponse]:
    query = _resource_query(db)

    if status_filter is not None:
        query = query.filter(
            Resource.status == ResourceStatusModel(status_filter.value)
        )

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Resource.title.ilike(term),
                Resource.description.ilike(term),
                Resource.author.ilike(term),
                cast(Resource.category, String).ilike(term),
            )
        )

    resources = query.order_by(Resource.updated_at.desc()).all()
    return [to_resource_response(resource) for resource in resources]


def get_admin_resource(db: Session, resource_id: str) -> schemas.ResourceResponse:
    resource = _get_resource_or_404(db, resource_id)
    return to_resource_response(resource)


def get_resource_stats(db: Session) -> schemas.ResourceStatsResponse:
    rows = db.query(Resource).all()
    active = [resource for resource in rows if resource.status != ResourceStatusModel.archived]
    return schemas.ResourceStatsResponse(
        total=len(active),
        published=sum(
            1 for resource in rows if resource.status == ResourceStatusModel.published
        ),
        drafts=sum(
            1 for resource in rows if resource.status == ResourceStatusModel.draft
        ),
        pending_review=sum(
            1
            for resource in rows
            if resource.status == ResourceStatusModel.pending_review
        ),
        featured=sum(
            1
            for resource in rows
            if resource.featured and resource.status == ResourceStatusModel.published
        ),
        archived=sum(
            1 for resource in rows if resource.status == ResourceStatusModel.archived
        ),
    )


def list_pending_review_resources(db: Session) -> list[schemas.ResourceResponse]:
    resources = (
        _resource_query(db)
        .filter(Resource.status == ResourceStatusModel.pending_review)
        .order_by(
            nulls_last(Resource.submitted_at.desc()),
            Resource.updated_at.desc(),
        )
        .all()
    )
    return [to_resource_response(resource) for resource in resources]


def create_admin_resource(
    db: Session,
    user: User,
    payload: schemas.ResourceCreate,
) -> schemas.ResourceResponse:
    validate_resource_payload(payload)
    body = normalize_body(payload.body)
    resource_id = generate_unique_resource_id(db, payload.title)
    now = _utcnow()
    publish = bool(payload.publish)

    resource = Resource(
        id=resource_id,
        slug=resource_id,
        title=payload.title.strip(),
        category=ResourceCategoryModel(payload.category.value),
        description=payload.description.strip(),
        read_time=payload.read_time.strip() or estimate_read_time(body),
        author=payload.author.strip(),
        author_role=payload.author_role.strip(),
        image=payload.image.strip(),
        image_alt=payload.image_alt.strip(),
        body=body,
        status=(
            ResourceStatusModel.published
            if publish
            else ResourceStatusModel.draft
        ),
        featured=False,
        featured_order=None,
        published_at=now if publish else None,
        created_at=now,
        updated_at=now,
        last_edited_by_id=user.id,
        submitted_by_id=None,
        submitted_at=None,
        reviewed_by_id=None,
        reviewed_at=None,
        rejection_reason=None,
        views=0,
        saves=0,
    )
    db.add(resource)
    db.flush()
    db.refresh(resource)
    return to_resource_response(resource)


def update_admin_resource(
    db: Session,
    resource_id: str,
    user: User,
    payload: schemas.ResourceUpdate,
) -> schemas.ResourceResponse:
    resource = _get_resource_or_404(db, resource_id)
    validate_resource_payload(payload)
    _apply_content_fields(resource, payload, editor_id=user.id)
    resource.author = payload.author.strip()
    resource.author_role = payload.author_role.strip()
    db.flush()
    db.refresh(resource)
    return to_resource_response(resource)


def publish_admin_resource(db: Session, resource_id: str, user_id: int) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    now = _utcnow()
    resource.status = ResourceStatusModel.published
    if resource.published_at is None:
        resource.published_at = now
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


def unpublish_admin_resource(db: Session, resource_id: str, user_id: int) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    now = _utcnow()
    resource.status = ResourceStatusModel.draft
    resource.published_at = None
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


def feature_admin_resource(
    db: Session,
    resource_id: str,
    user_id: int,
    payload: schemas.ResourceFeatureRequest,
) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    if resource.status != ResourceStatusModel.published:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only published resources can be featured",
        )

    now = _utcnow()
    resource.featured = payload.featured
    if payload.featured:
        resource.featured_order = payload.featured_order or _next_featured_order(db)
    else:
        resource.featured_order = None
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


def archive_admin_resource(db: Session, resource_id: str, user_id: int) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    now = _utcnow()
    resource.status = ResourceStatusModel.archived
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


def restore_admin_resource(db: Session, resource_id: str, user_id: int) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    now = _utcnow()
    resource.status = ResourceStatusModel.draft
    resource.updated_at = now
    resource.last_edited_by_id = user_id
    db.flush()
    return resource


def review_admin_resource(
    db: Session,
    resource_id: str,
    admin: User,
    payload: schemas.ResourceReviewRequest,
) -> Resource:
    resource = _get_resource_or_404(db, resource_id)
    if resource.status != ResourceStatusModel.pending_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )
    if resource.submitted_by_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    now = _utcnow()
    resource.reviewed_by_id = admin.id
    resource.reviewed_at = now
    resource.updated_at = now
    resource.last_edited_by_id = admin.id

    if payload.decision == ReviewDecision.approve_publish:
        resource.status = ResourceStatusModel.published
        if resource.published_at is None:
            resource.published_at = now
        resource.rejection_reason = None
    elif payload.decision == ReviewDecision.approve_draft:
        resource.status = ResourceStatusModel.draft
        resource.published_at = None
        resource.rejection_reason = None
    else:
        resource.status = ResourceStatusModel.rejected
        reason = (payload.rejection_reason or "").strip()
        resource.rejection_reason = reason or None

    db.flush()
    return resource
