"""Dispatch newsletter broadcast emails."""

from __future__ import annotations

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Resource, ResourceStatus as ResourceStatusModel
from app.services.email import send_email_safe
from app.services.email_messages import resource_published
from app.services.newsletter import list_active_subscriber_emails


def notify_subscribers_resource_published(
    *,
    subscriber_emails: list[str],
    title: str,
    category: str,
    description: str,
    url: str,
) -> None:
    subject, body = resource_published(
        title=title,
        category=category,
        description=description,
        url=url,
    )
    for email in subscriber_emails:
        send_email_safe(to=email, subject=subject, body_text=body)


def schedule_resource_published_notifications(
    db: Session,
    background_tasks: BackgroundTasks,
    resource: Resource,
    *,
    previous_status: ResourceStatusModel,
) -> None:
    if previous_status == ResourceStatusModel.published:
        return
    if resource.status != ResourceStatusModel.published:
        return

    subscriber_emails = list_active_subscriber_emails(db)
    if not subscriber_emails:
        return

    url = f"{settings.FRONTEND_URL.rstrip('/')}/student/resources/{resource.id}"
    background_tasks.add_task(
        notify_subscribers_resource_published,
        subscriber_emails=subscriber_emails,
        title=resource.title,
        category=resource.category.value,
        description=resource.description,
        url=url,
    )
