"""Platform-wide activity feed for admin notifications."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app import schemas
from app.models import ActivityVariant, PlatformActivity
from app.schemas.enums import ActivityVariant as ActivityVariantSchema


def format_relative_time(dt: datetime, *, now: datetime | None = None) -> str:
    """Human-readable relative timestamp, e.g. ``12 mins ago``."""
    now = now or datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    seconds = int((now - dt).total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        suffix = "mins" if minutes != 1 else "min"
        return f"{minutes} {suffix} ago"
    hours = minutes // 60
    if hours < 24:
        suffix = "hrs" if hours != 1 else "hr"
        return f"{hours} {suffix} ago"
    days = hours // 24
    if days < 7:
        suffix = "days" if days != 1 else "day"
        return f"{days} {suffix} ago"
    weeks = days // 7
    suffix = "weeks" if weeks != 1 else "week"
    return f"{weeks} {suffix} ago"


def _map_platform_activity(
    row: PlatformActivity, *, now: datetime | None = None
) -> schemas.PlatformActivityItem:
    return schemas.PlatformActivityItem(
        id=row.id,
        title=row.title,
        description=row.description,
        variant=ActivityVariantSchema(row.variant.value),
        entity_type=row.entity_type,
        entity_id=row.entity_id,
        created_at=row.created_at,
        relative_time=format_relative_time(row.created_at, now=now),
    )


def list_platform_activity(
    db: Session, *, limit: int = 20
) -> schemas.PlatformActivityListResponse:
    now = datetime.now(timezone.utc)
    rows = (
        db.query(PlatformActivity)
        .order_by(PlatformActivity.created_at.desc())
        .limit(limit)
        .all()
    )
    return schemas.PlatformActivityListResponse(
        activities=[_map_platform_activity(row, now=now) for row in rows]
    )


def record_platform_activity(
    db: Session,
    *,
    title: str,
    description: str,
    variant: ActivityVariantSchema,
    entity_type: str,
    entity_id: str,
) -> PlatformActivity:
    row = PlatformActivity(
        title=title,
        description=description,
        variant=ActivityVariant(variant.value),
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.add(row)
    return row
