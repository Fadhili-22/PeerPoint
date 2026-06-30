"""Admin session log — accepted, completed, and rejected session_requests."""

from __future__ import annotations


from sqlalchemy import String, cast, or_
from sqlalchemy.orm import Session, aliased

from app import schemas
from app.models import (
    SessionRequest,
    SessionRequestStatus as SessionRequestStatusModel,
    SessionTopic as SessionTopicModel,
    User,
)
from app.schemas.enums import BookingSessionStatus, SessionOutcome
from app.services.session_requests import scheduled_at_from_request

# Admin log includes accepted + completed + rejected (rejected → cancelled).
_ADMIN_LOG_STATUSES = (
    SessionRequestStatusModel.accepted,
    SessionRequestStatusModel.completed,
    SessionRequestStatusModel.rejected,
)


def _topic_label(request: SessionRequest) -> str:
    if request.topic == SessionTopicModel.other and request.other_topic:
        return request.other_topic.strip()
    return request.topic.value


def _admin_booking_status(request: SessionRequest) -> BookingSessionStatus:
    if request.status == SessionRequestStatusModel.completed:
        return BookingSessionStatus.completed
    if request.status == SessionRequestStatusModel.rejected:
        return BookingSessionStatus.cancelled
    return BookingSessionStatus.upcoming


def _outcome_for_request(request: SessionRequest) -> SessionOutcome | None:
    if request.status == SessionRequestStatusModel.completed:
        return None
    return SessionOutcome.pending


def list_admin_sessions(
    db: Session,
    *,
    status_filter: BookingSessionStatus | None = None,
    search: str | None = None,
) -> list[schemas.AdminSessionItem]:
    student_user = aliased(User)
    counsellor_user = aliased(User)

    query = (
        db.query(SessionRequest, student_user, counsellor_user)
        .join(student_user, SessionRequest.student_id == student_user.id)
        .join(counsellor_user, SessionRequest.counsellor_id == counsellor_user.id)
        .filter(SessionRequest.status.in_(_ADMIN_LOG_STATUSES))
    )

    if status_filter == BookingSessionStatus.upcoming:
        query = query.filter(
            SessionRequest.status == SessionRequestStatusModel.accepted
        )
    elif status_filter == BookingSessionStatus.completed:
        query = query.filter(
            SessionRequest.status == SessionRequestStatusModel.completed
        )
    elif status_filter == BookingSessionStatus.cancelled:
        query = query.filter(
            SessionRequest.status == SessionRequestStatusModel.rejected
        )

    if search and search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                student_user.full_name.ilike(pattern),
                counsellor_user.full_name.ilike(pattern),
                SessionRequest.other_topic.ilike(pattern),
                cast(SessionRequest.topic, String).ilike(pattern),
            )
        )

    rows = query.all()
    rows.sort(
        key=lambda row: scheduled_at_from_request(row[0]),
        reverse=True,
    )

    return [
        schemas.AdminSessionItem(
            id=str(request.id),
            student_name=student.full_name,
            counsellor_name=counsellor.full_name,
            scheduled_at=scheduled_at_from_request(request),
            topic=_topic_label(request),
            format=request.format.value,
            status=_admin_booking_status(request),
            outcome=_outcome_for_request(request),
        )
        for request, student, counsellor in rows
    ]
