"""Dispatch account lifecycle emails triggered by auth and admin flows."""

from __future__ import annotations

from app.models import AccountRequestType, User
from app.services.email import send_email_safe
from app.services.email_messages import (
    counsellor_promoted,
    email_verification,
    resource_approved,
    resource_rejected,
    session_accepted,
    session_requested,
    session_rejected,
)


def notify_email_verification(user: User, token: str) -> None:
    subject, body = email_verification(
        full_name=user.full_name,
        verification_token=token,
    )
    send_email_safe(to=user.email, subject=subject, body_text=body)


def notify_account_request_approved(
    user: User, *, request_type: AccountRequestType
) -> None:
    if request_type == AccountRequestType.promotion:
        subject, body = counsellor_promoted(full_name=user.full_name)
    else:
        return
    send_email_safe(to=user.email, subject=subject, body_text=body)


def notify_session_accepted(
    *,
    student_email: str,
    student_name: str,
    counsellor_name: str,
    scheduled_at: str,
    session_format: str,
) -> None:
    subject, body = session_accepted(
        student_name=student_name,
        counsellor_name=counsellor_name,
        scheduled_at=scheduled_at,
        session_format=session_format,
    )
    send_email_safe(to=student_email, subject=subject, body_text=body)


def notify_session_rejected(
    *,
    student_email: str,
    student_name: str,
    counsellor_name: str,
    scheduled_at: str,
    session_format: str,
    rejection_reason: str | None = None,
) -> None:
    subject, body = session_rejected(
        student_name=student_name,
        counsellor_name=counsellor_name,
        scheduled_at=scheduled_at,
        session_format=session_format,
        rejection_reason=rejection_reason,
    )
    send_email_safe(to=student_email, subject=subject, body_text=body)


def notify_session_requested(
    *,
    counsellor_email: str,
    counsellor_name: str,
    student_display_name: str,
    topic: str,
    scheduled_at: str,
    session_format: str,
    notes: str | None = None,
) -> None:
    subject, body = session_requested(
        counsellor_name=counsellor_name,
        student_display_name=student_display_name,
        topic=topic,
        scheduled_at=scheduled_at,
        session_format=session_format,
        notes=notes,
    )
    send_email_safe(to=counsellor_email, subject=subject, body_text=body)


def notify_resource_approved(
    *,
    counsellor_email: str,
    counsellor_name: str,
    title: str,
    url: str,
) -> None:
    subject, body = resource_approved(
        counsellor_name=counsellor_name,
        title=title,
        url=url,
    )
    send_email_safe(to=counsellor_email, subject=subject, body_text=body)


def notify_resource_rejected(
    *,
    counsellor_email: str,
    counsellor_name: str,
    title: str,
    rejection_reason: str | None = None,
) -> None:
    subject, body = resource_rejected(
        counsellor_name=counsellor_name,
        title=title,
        rejection_reason=rejection_reason,
    )
    send_email_safe(to=counsellor_email, subject=subject, body_text=body)
