"""Session rating submission and admin listing."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.models import SessionRating, SessionRequest, SessionRequestStatus, User
from app.services.session_requests import _get_owned_request_or_404

SessionRequestStatusModel = SessionRequestStatus


def _rated_session_request_ids(db: Session, student_id: int) -> set[int]:
    rows = (
        db.query(SessionRating.session_request_id)
        .filter(SessionRating.student_id == student_id)
        .all()
    )
    return {row[0] for row in rows}


def submit_session_rating(
    db: Session,
    student_id: int,
    session_request_id: int,
    payload: schemas.SessionRatingCreate,
) -> schemas.SessionRatingSubmitResponse:
    request = _get_owned_request_or_404(
        db, session_request_id, student_id=student_id
    )
    if request.status != SessionRequestStatusModel.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed sessions can be rated",
        )

    existing = (
        db.query(SessionRating)
        .filter(SessionRating.session_request_id == session_request_id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This session has already been rated",
        )

    rating = SessionRating(
        session_request_id=session_request_id,
        student_id=student_id,
        counsellor_id=request.counsellor_id,
        stars=payload.stars,
        comment=payload.comment.strip() if payload.comment else None,
    )
    db.add(rating)
    db.commit()

    return schemas.SessionRatingSubmitResponse(
        message="Thank you for your feedback.",
    )


def list_admin_ratings(
    db: Session,
    *,
    counsellor_id: int | None = None,
) -> list[schemas.AdminRatingItem]:
    query = (
        db.query(SessionRating, User, SessionRequest)
        .join(User, SessionRating.counsellor_id == User.id)
        .join(SessionRequest, SessionRating.session_request_id == SessionRequest.id)
        .order_by(SessionRating.created_at.desc())
    )
    if counsellor_id is not None:
        query = query.filter(SessionRating.counsellor_id == counsellor_id)

    return [
        schemas.AdminRatingItem(
            id=rating.id,
            counsellor_name=counsellor.full_name,
            session_topic=request.topic.value,
            stars=rating.stars,
            comment=rating.comment,
            created_at=rating.created_at,
        )
        for rating, counsellor, request in query.all()
    ]
