"""Student-facing resource reads: queries, mappers, featured/recommended helpers."""

from __future__ import annotations

from sqlalchemy import String, cast, nulls_last, or_
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.models import Resource, ResourceCategory as ResourceCategoryModel
from app.models import ResourceStatus as ResourceStatusModel
from app.schemas.enums import ResourceCategory, ResourceStatus


def _load_options():
    return [
        joinedload(Resource.last_edited_by),
        joinedload(Resource.submitted_by),
        joinedload(Resource.reviewed_by),
    ]


def _published_query(db: Session):
    return db.query(Resource).options(*_load_options()).filter(
        Resource.status == ResourceStatusModel.published
    )


def _featured_order(query):
    return query.order_by(
        nulls_last(Resource.featured_order.asc()),
        Resource.published_at.desc(),
    )


def to_resource_response(resource: Resource) -> schemas.ResourceResponse:
    submitted_by = None
    if resource.submitted_by_id is not None and resource.submitted_by is not None:
        submitted_by = schemas.ResourceSubmittedBy(
            id=resource.submitted_by.id,
            full_name=resource.submitted_by.full_name,
            email=resource.submitted_by.email,
        )

    return schemas.ResourceResponse(
        id=resource.id,
        slug=resource.slug,
        title=resource.title,
        category=ResourceCategory(resource.category.value),
        description=resource.description,
        read_time=resource.read_time,
        author=resource.author,
        author_role=resource.author_role,
        image=resource.image,
        image_alt=resource.image_alt,
        body=list(resource.body or []),
        status=ResourceStatus(resource.status.value),
        featured=resource.featured,
        featured_order=resource.featured_order,
        published_at=resource.published_at,
        created_at=resource.created_at,
        updated_at=resource.updated_at,
        last_edited_by=(
            resource.last_edited_by.full_name if resource.last_edited_by else None
        ),
        submitted_by=submitted_by,
        submitted_at=resource.submitted_at,
        reviewed_by=(
            resource.reviewed_by.full_name if resource.reviewed_by else None
        ),
        reviewed_at=resource.reviewed_at,
        rejection_reason=resource.rejection_reason,
        views=resource.views,
        saves=resource.saves,
    )


def list_published_resources(
    db: Session,
    *,
    category: ResourceCategory | None = None,
    search: str | None = None,
) -> list[schemas.ResourceResponse]:
    query = _published_query(db)

    if category is not None:
        query = query.filter(
            Resource.category == ResourceCategoryModel(category.value)
        )

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Resource.title.ilike(term),
                Resource.description.ilike(term),
                cast(Resource.category, String).ilike(term),
            )
        )

    resources = query.order_by(Resource.published_at.desc()).all()
    return [to_resource_response(resource) for resource in resources]


def list_featured_resources(
    db: Session,
    *,
    limit: int = 2,
) -> list[schemas.ResourceResponse]:
    query = _published_query(db).filter(Resource.featured.is_(True))
    resources = _featured_order(query).limit(limit).all()
    return [to_resource_response(resource) for resource in resources]


def list_recommended_resources(db: Session) -> list[schemas.ResourceResponse]:
    limit = 2
    featured = list_featured_resources(db, limit=limit)
    if len(featured) >= limit:
        return featured

    selected_ids = {item.id for item in featured}
    query = _published_query(db).filter(Resource.featured.is_(False))
    if selected_ids:
        query = query.filter(~Resource.id.in_(selected_ids))

    remaining = limit - len(featured)
    backfill = query.order_by(Resource.published_at.desc()).limit(remaining).all()
    return featured + [to_resource_response(resource) for resource in backfill]


def get_published_resource(db: Session, resource_id: str) -> Resource | None:
    return (
        db.query(Resource)
        .options(*_load_options())
        .filter(
            Resource.id == resource_id,
            Resource.status == ResourceStatusModel.published,
        )
        .first()
    )


def get_related_resources(
    db: Session,
    resource_id: str,
    *,
    limit: int = 3,
) -> list[schemas.ResourceResponse]:
    base = get_published_resource(db, resource_id)
    if base is None:
        return []

    same_category = (
        _published_query(db)
        .filter(
            Resource.id != resource_id,
            Resource.category == base.category,
        )
        .order_by(Resource.published_at.desc())
        .limit(limit)
        .all()
    )

    results = list(same_category)
    if len(results) >= limit:
        return [to_resource_response(resource) for resource in results]

    exclude_ids = {resource_id, *(resource.id for resource in results)}
    other = (
        _published_query(db)
        .filter(
            ~Resource.id.in_(exclude_ids),
            Resource.category != base.category,
        )
        .order_by(Resource.published_at.desc())
        .limit(limit - len(results))
        .all()
    )

    combined = results + list(other)
    return [to_resource_response(resource) for resource in combined]


def increment_resource_views(db: Session, resource_id: str) -> tuple[str, int] | None:
    resource = (
        db.query(Resource)
        .filter(
            Resource.id == resource_id,
            Resource.status == ResourceStatusModel.published,
        )
        .with_for_update()
        .first()
    )
    if resource is None:
        return None

    resource.views += 1
    db.flush()
    return resource.id, resource.views
