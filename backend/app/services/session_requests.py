"""Session request validation, anonymity, and lifecycle transitions."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    SessionFormat as SessionFormatModel,
    SessionRequest,
    SessionRequestStatus as SessionRequestStatusModel,
    SessionTopic as SessionTopicModel,
    User,
)
from app.schemas.enums import SessionFormat, SessionRequestStatus, SessionTopic
from app.services.availability import get_bookable_slots_for_date

DEFAULT_SESSION_DURATION_MINUTES = 45
OVERDUE_PENDING_HOURS = 24


def count_completed_sessions_for_counsellor(db: Session, counsellor_user_id: int) -> int:
    """Completed session count for counsellor reads (Prompt 9).

    Computed at read time — do not rely on ``counsellor_profiles.sessions_count``.
    """
    return (
        db.query(func.count(SessionRequest.id))
        .filter(
            SessionRequest.counsellor_id == counsellor_user_id,
            SessionRequest.status == SessionRequestStatusModel.completed,
        )
        .scalar()
        or 0
    )


def count_completed_sessions_for_student(db: Session, student_user_id: int) -> int:
    """Completed session count for admin student directory (Prompt 10)."""
    return (
        db.query(func.count(SessionRequest.id))
        .filter(
            SessionRequest.student_id == student_user_id,
            SessionRequest.status == SessionRequestStatusModel.completed,
        )
        .scalar()
        or 0
    )


def field_validation_error(field: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=[{"loc": ["body", field], "msg": message, "type": "value_error"}],
    )


def is_overdue(request: SessionRequest, *, now: datetime | None = None) -> bool:
    now = now or datetime.now(timezone.utc)
    if request.status != SessionRequestStatusModel.pending:
        return False
    requested_at = request.requested_at
    if requested_at.tzinfo is None:
        requested_at = requested_at.replace(tzinfo=timezone.utc)
    return requested_at < now - timedelta(hours=OVERDUE_PENDING_HOURS)


def student_display_name(request: SessionRequest, student: User) -> str:
    if request.status in (
        SessionRequestStatusModel.accepted,
        SessionRequestStatusModel.completed,
    ):
        return student.full_name
    if request.anonymous_until_accepted and request.status == SessionRequestStatusModel.pending:
        last_name = student.full_name.split()[-1]
        return f"Anonymous {last_name[0]}."
    return student.full_name


def scheduled_at_from_request(request: SessionRequest) -> datetime:
    parsed = datetime.strptime(request.preferred_time.strip(), "%I:%M %p")
    return datetime(
        request.preferred_date.year,
        request.preferred_date.month,
        request.preferred_date.day,
        parsed.hour,
        parsed.minute,
        tzinfo=timezone.utc,
    )


def _load_active_counsellor_profile(
    db: Session, counsellor_user_id: int
) -> CounsellorProfile | None:
    return (
        db.query(CounsellorProfile)
        .options(joinedload(CounsellorProfile.availability_schedule))
        .filter(
            CounsellorProfile.user_id == counsellor_user_id,
            CounsellorProfile.status == CounsellorProfileStatus.active,
        )
        .first()
    )


def validate_create_payload(
    db: Session,
    payload: schemas.SessionRequestCreate,
    student: User,
    *,
    today: date | None = None,
) -> CounsellorProfile:
    today = today if today is not None else date.today()
    errors: list[dict] = []

    if payload.counsellor_id == student.id:
        errors.append(
            {
                "loc": ["body", "counsellor_id"],
                "msg": "You cannot request a session with yourself",
                "type": "value_error",
            }
        )

    if payload.topic == SessionTopic.other and not (
        payload.other_topic and payload.other_topic.strip()
    ):
        errors.append(
            {
                "loc": ["body", "other_topic"],
                "msg": "other_topic is required when topic is Other",
                "type": "value_error",
            }
        )

    if payload.preferred_date < today:
        errors.append(
            {
                "loc": ["body", "preferred_date"],
                "msg": "preferred_date must be today or later",
                "type": "value_error",
            }
        )

    profile = _load_active_counsellor_profile(db, payload.counsellor_id)
    if profile is None:
        errors.append(
            {
                "loc": ["body", "counsellor_id"],
                "msg": "Counsellor not found or inactive",
                "type": "value_error",
            }
        )
    elif payload.preferred_date >= today:
        date_iso = payload.preferred_date.isoformat()
        if date_iso in profile.unavailable_dates:
            errors.append(
                {
                    "loc": ["body", "preferred_date"],
                    "msg": "Counsellor is unavailable on this date",
                    "type": "value_error",
                }
            )
        else:
            slots = get_bookable_slots_for_date(
                profile, payload.preferred_date, today=today
            )
            if not slots:
                errors.append(
                    {
                        "loc": ["body", "preferred_date"],
                        "msg": "No availability on this date",
                        "type": "value_error",
                    }
                )
            elif payload.preferred_time not in slots:
                errors.append(
                    {
                        "loc": ["body", "preferred_time"],
                        "msg": "Time is not in the counsellor's available slots for this date",
                        "type": "value_error",
                    }
                )

    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=errors,
        )

    assert profile is not None
    return profile


def create_session_request(
    db: Session,
    payload: schemas.SessionRequestCreate,
    student: User,
    *,
    today: date | None = None,
) -> SessionRequest:
    validate_create_payload(db, payload, student, today=today)

    request = SessionRequest(
        student_id=student.id,
        counsellor_id=payload.counsellor_id,
        topic=SessionTopicModel[payload.topic.name],
        other_topic=(
            payload.other_topic.strip()
            if payload.topic == SessionTopic.other and payload.other_topic
            else None
        ),
        preferred_date=payload.preferred_date,
        preferred_time=payload.preferred_time,
        format=SessionFormatModel[payload.format.name],
        notes=payload.notes,
        anonymous_until_accepted=payload.anonymous_until_accepted,
        status=SessionRequestStatusModel.pending,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def list_student_requests(
    db: Session, student_id: int
) -> list[schemas.SessionRequestStudentView]:
    rows = (
        db.query(SessionRequest, User, CounsellorProfile)
        .join(User, SessionRequest.counsellor_id == User.id)
        .join(CounsellorProfile, CounsellorProfile.user_id == User.id)
        .filter(SessionRequest.student_id == student_id)
        .order_by(SessionRequest.requested_at.desc())
        .all()
    )
    return [
        schemas.SessionRequestStudentView(
            id=req.id,
            counsellor_id=req.counsellor_id,
            counsellor_name=counsellor_user.full_name,
            topic=SessionTopic(req.topic.value),
            preferred_date=req.preferred_date,
            preferred_time=req.preferred_time,
            format=SessionFormat(req.format.value),
            status=SessionRequestStatus(req.status.value),
            requested_at=req.requested_at,
            overdue=is_overdue(req),
            rejection_reason=req.rejection_reason,
        )
        for req, counsellor_user, _profile in rows
    ]


def _get_owned_request_or_404(
    db: Session,
    request_id: int,
    *,
    counsellor_id: int | None = None,
    student_id: int | None = None,
) -> SessionRequest:
    query = db.query(SessionRequest).options(joinedload(SessionRequest.student))
    if counsellor_id is not None:
        query = query.filter(
            SessionRequest.id == request_id,
            SessionRequest.counsellor_id == counsellor_id,
        )
    elif student_id is not None:
        query = query.filter(
            SessionRequest.id == request_id,
            SessionRequest.student_id == student_id,
        )
    else:
        raise ValueError("counsellor_id or student_id required")

    request = query.first()
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session request not found",
        )
    return request


def to_counsellor_view(request: SessionRequest) -> schemas.SessionRequestCounsellorView:
    student = request.student
    return schemas.SessionRequestCounsellorView(
        id=request.id,
        student_display_name=student_display_name(request, student),
        topic=SessionTopic(request.topic.value),
        other_topic=request.other_topic,
        preferred_date=request.preferred_date,
        preferred_time=request.preferred_time,
        format=SessionFormat(request.format.value),
        notes=request.notes,
        status=SessionRequestStatus(request.status.value),
        requested_at=request.requested_at,
        overdue=is_overdue(request),
        anonymous_until_accepted=request.anonymous_until_accepted,
    )


def to_counsellor_detail(request: SessionRequest) -> schemas.SessionRequestDetail:
    base = to_counsellor_view(request)
    student_email = None
    if request.status in (
        SessionRequestStatusModel.accepted,
        SessionRequestStatusModel.completed,
    ):
        student_email = request.student.email
    return schemas.SessionRequestDetail(
        **base.model_dump(),
        duration_minutes=DEFAULT_SESSION_DURATION_MINUTES,
        student_email=student_email,
    )


def get_counsellor_request_detail(
    db: Session, request_id: int, counsellor_id: int
) -> schemas.SessionRequestDetail:
    request = _get_owned_request_or_404(
        db, request_id, counsellor_id=counsellor_id
    )
    return to_counsellor_detail(request)


def list_counsellor_requests(
    db: Session,
    counsellor_id: int,
    status_filter: SessionRequestStatus | None = None,
) -> list[schemas.SessionRequestCounsellorView]:
    query = (
        db.query(SessionRequest)
        .options(joinedload(SessionRequest.student))
        .filter(SessionRequest.counsellor_id == counsellor_id)
        .order_by(SessionRequest.requested_at.desc())
    )
    if status_filter is not None:
        query = query.filter(
            SessionRequest.status == SessionRequestStatusModel(status_filter.value)
        )
    return [to_counsellor_view(req) for req in query.all()]


def accept_request(db: Session, request_id: int, counsellor_id: int) -> SessionRequest:
    request = _get_owned_request_or_404(
        db, request_id, counsellor_id=counsellor_id
    )
    if request.status != SessionRequestStatusModel.pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session request not found",
        )
    request.status = SessionRequestStatusModel.accepted
    db.commit()
    db.refresh(request)
    return request


def reject_request(
    db: Session,
    request_id: int,
    counsellor_id: int,
    reason: str | None = None,
) -> SessionRequest:
    request = _get_owned_request_or_404(
        db, request_id, counsellor_id=counsellor_id
    )
    if request.status != SessionRequestStatusModel.pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session request not found",
        )
    request.status = SessionRequestStatusModel.rejected
    request.rejection_reason = reason.strip() if reason and reason.strip() else None
    db.commit()
    db.refresh(request)
    return request


def complete_request(
    db: Session, request_id: int, counsellor_id: int
) -> SessionRequest:
    request = _get_owned_request_or_404(
        db, request_id, counsellor_id=counsellor_id
    )
    if request.status != SessionRequestStatusModel.accepted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session request not found",
        )
    request.status = SessionRequestStatusModel.completed
    db.commit()
    db.refresh(request)
    return request


def list_student_sessions(
    db: Session, student_id: int
) -> list[schemas.StudentSessionItem]:
    rows = (
        db.query(SessionRequest, User)
        .join(User, SessionRequest.counsellor_id == User.id)
        .filter(
            SessionRequest.student_id == student_id,
            SessionRequest.status.in_(
                [
                    SessionRequestStatusModel.accepted,
                    SessionRequestStatusModel.completed,
                ]
            ),
        )
        .order_by(SessionRequest.preferred_date, SessionRequest.preferred_time)
        .all()
    )
    return [_to_student_session_item(req, counsellor) for req, counsellor in rows]


def get_student_session_detail(
    db: Session, student_id: int, session_id: int
) -> schemas.StudentSessionDetail:
    request = _get_owned_request_or_404(db, session_id, student_id=student_id)
    if request.status not in (
        SessionRequestStatusModel.accepted,
        SessionRequestStatusModel.completed,
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    counsellor = (
        db.query(User).filter(User.id == request.counsellor_id).one()
    )
    item = _to_student_session_item(request, counsellor)
    return schemas.StudentSessionDetail(**item.model_dump(), notes=request.notes)


def _to_student_session_item(
    request: SessionRequest, counsellor: User
) -> schemas.StudentSessionItem:
    return schemas.StudentSessionItem(
        id=request.id,
        counsellor_id=request.counsellor_id,
        counsellor_name=counsellor.full_name,
        scheduled_at=scheduled_at_from_request(request),
        topic=request.topic.value,
        format=request.format.value,
        duration_minutes=DEFAULT_SESSION_DURATION_MINUTES,
        status=SessionRequestStatus(request.status.value),
    )


def list_upcoming_counsellor_sessions(
    db: Session,
    counsellor_id: int,
    *,
    today: date | None = None,
) -> list[schemas.CounsellorUpcomingSession]:
    today = today if today is not None else date.today()
    rows = (
        db.query(SessionRequest)
        .options(joinedload(SessionRequest.student))
        .filter(
            SessionRequest.counsellor_id == counsellor_id,
            SessionRequest.status == SessionRequestStatusModel.accepted,
            SessionRequest.preferred_date >= today,
        )
        .all()
    )
    rows.sort(key=lambda r: scheduled_at_from_request(r))
    return [
        schemas.CounsellorUpcomingSession(
            id=req.id,
            student_display_id=student_display_name(req, req.student),
            scheduled_at=scheduled_at_from_request(req),
            topic=req.topic.value,
            format=req.format.value,
            duration_minutes=DEFAULT_SESSION_DURATION_MINUTES,
            status=SessionRequestStatus(req.status.value),
        )
        for req in rows
    ]
