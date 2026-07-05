"""Admin dashboard headline KPI counts."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    NewsletterSubscription,
    Resource,
    ResourceStatus,
    SessionRequest,
    SessionRequestStatus as SessionRequestStatusModel,
    User,
    UserRole,
    UserRoleAssignment,
)
from app.services.session_requests import is_overdue, scheduled_at_from_request


def get_admin_dashboard(db: Session) -> schemas.AdminDashboardResponse:
    now = datetime.now(timezone.utc)

    total_students = (
        db.query(UserRoleAssignment.user_id)
        .filter(
            UserRoleAssignment.role == UserRole.student,
            UserRoleAssignment.is_active.is_(True),
        )
        .distinct()
        .count()
    )

    total_counsellors = (
        db.query(CounsellorProfile)
        .filter(CounsellorProfile.status == CounsellorProfileStatus.active)
        .count()
    )

    accepted_requests = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatusModel.accepted)
        .all()
    )
    active_sessions = sum(
        1
        for request in accepted_requests
        if scheduled_at_from_request(request) >= now
    )

    pending_requests = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatusModel.pending)
        .count()
    )

    pending_rows = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatusModel.pending)
        .all()
    )
    overdue_requests = sum(1 for request in pending_rows if is_overdue(request, now=now))

    published_resources = (
        db.query(Resource)
        .filter(Resource.status == ResourceStatus.published)
        .count()
    )

    pending_reviews = (
        db.query(Resource)
        .filter(Resource.status == ResourceStatus.pending_review)
        .count()
    )

    newsletter_subscribers = (
        db.query(NewsletterSubscription)
        .filter(NewsletterSubscription.active.is_(True))
        .count()
    )

    thirty_days_ago = now - timedelta(days=30)
    monthly_active_students = (
        db.query(func.count(User.id))
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.student)
            & (UserRoleAssignment.is_active.is_(True)),
        )
        .filter(
            User.last_active_at.isnot(None),
            User.last_active_at >= thirty_days_ago,
        )
        .scalar()
        or 0
    )

    return schemas.AdminDashboardResponse(
        total_students=total_students,
        total_counsellors=total_counsellors,
        monthly_active_students=monthly_active_students,
        active_sessions=active_sessions,
        pending_requests=pending_requests,
        overdue_requests=overdue_requests,
        published_resources=published_resources,
        pending_reviews=pending_reviews,
        newsletter_subscribers=newsletter_subscribers,
    )
