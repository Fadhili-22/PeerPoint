"""Admin dashboard + reports analytics computed from live DB data."""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas
from app.models import (
    CounsellorProfile,
    CounsellorProfileStatus,
    Resource,
    ResourceStatus,
    SessionRequest,
    SessionRequestStatus,
    SessionTopic,
    User,
    UserRole,
    UserRoleAssignment,
)
from app.services.platform_activity import format_relative_time
from app.services.session_requests import count_completed_sessions_for_counsellor

# Session trend buckets completed rows by week of ``requested_at`` (not preferred_date).
TREND_WEEKS = 8


def _week_start(d) -> datetime:
    return d - timedelta(days=d.weekday())


def _build_session_trend(db: Session, *, now: datetime) -> schemas.SessionTrendResponse:
    current_week_start = _week_start(now.date())
    counts = [0] * TREND_WEEKS

    completed = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatus.completed)
        .all()
    )
    for req in completed:
        req_at = req.requested_at
        if req_at.tzinfo is None:
            req_at = req_at.replace(tzinfo=timezone.utc)
        req_week_start = _week_start(req_at.date())
        weeks_ago = (current_week_start - req_week_start).days // 7
        if 0 <= weeks_ago < TREND_WEEKS:
            idx = TREND_WEEKS - 1 - weeks_ago
            counts[idx] += 1

    max_count = max(counts) if counts else 0
    weeks = []
    for i, value in enumerate(counts):
        height = round(100 * value / max_count) if max_count else 0
        weeks.append(
            schemas.SessionTrendWeek(
                label=f"Wk {i + 1}",
                value=value,
                height=height,
            )
        )
    return schemas.SessionTrendResponse(weeks=weeks)


def _build_status_distribution(db: Session) -> schemas.StatusDistributionResponse:
    rows = (
        db.query(SessionRequest.status, func.count(SessionRequest.id))
        .filter(
            SessionRequest.status.in_(
                [
                    SessionRequestStatus.completed,
                    SessionRequestStatus.accepted,
                    SessionRequestStatus.rejected,
                ]
            )
        )
        .group_by(SessionRequest.status)
        .all()
    )
    counts = {status: count for status, count in rows}
    completed = counts.get(SessionRequestStatus.completed, 0)
    upcoming = counts.get(SessionRequestStatus.accepted, 0)
    cancelled = counts.get(SessionRequestStatus.rejected, 0)
    total = completed + upcoming + cancelled

    def pct(n: int) -> int:
        return round(100 * n / total) if total else 0

    segments = [
        schemas.StatusSegment(
            label="Completed", percent=pct(completed), color="text-primary"
        ),
        schemas.StatusSegment(
            label="Upcoming", percent=pct(upcoming), color="text-accent-gold"
        ),
        schemas.StatusSegment(
            label="Cancelled", percent=pct(cancelled), color="text-danger"
        ),
    ]
    return schemas.StatusDistributionResponse(total=total, segments=segments)


def _response_rate_proxy(
    *, rejected: int, completed: int, accepted: int
) -> int:
    denominator = max(1, rejected + completed + accepted)
    return 100 - round(100 * rejected / denominator)


def _response_meta(rate: int) -> tuple[str, str, str]:
    if rate >= 90:
        return "Excellent", "success", "success"
    if rate >= 75:
        return "Average", "warning", "warning"
    return "Needs attention", "danger", "danger"


def _build_counsellor_performance(
    db: Session, *, now: datetime
) -> list[schemas.CounsellorPerformanceItem]:
    rows = (
        db.query(CounsellorProfile, User)
        .join(User, CounsellorProfile.user_id == User.id)
        .join(
            UserRoleAssignment,
            (UserRoleAssignment.user_id == User.id)
            & (UserRoleAssignment.role == UserRole.counsellor)
            & (UserRoleAssignment.is_active.is_(True)),
        )
        .filter(CounsellorProfile.status == CounsellorProfileStatus.active)
        .order_by(User.full_name.asc())
        .all()
    )

    items: list[schemas.CounsellorPerformanceItem] = []
    for profile, user in rows:
        status_counts = (
            db.query(SessionRequest.status, func.count(SessionRequest.id))
            .filter(SessionRequest.counsellor_id == user.id)
            .filter(
                SessionRequest.status.in_(
                    [
                        SessionRequestStatus.rejected,
                        SessionRequestStatus.completed,
                        SessionRequestStatus.accepted,
                    ]
                )
            )
            .group_by(SessionRequest.status)
            .all()
        )
        by_status = {s: c for s, c in status_counts}
        rejected = by_status.get(SessionRequestStatus.rejected, 0)
        completed = by_status.get(SessionRequestStatus.completed, 0)
        accepted = by_status.get(SessionRequestStatus.accepted, 0)
        rate = _response_rate_proxy(
            rejected=rejected, completed=completed, accepted=accepted
        )
        label, variant, _ = _response_meta(rate)
        last_active = None
        if profile.last_active_at:
            last_active = format_relative_time(profile.last_active_at, now=now)

        items.append(
            schemas.CounsellorPerformanceItem(
                id=user.id,
                name=user.full_name,
                sessions_handled=count_completed_sessions_for_counsellor(db, user.id),
                response_rate=rate,
                response_label=label,
                response_variant=variant,
                last_active=last_active,
            )
        )
    return items


def _build_top_resources(db: Session) -> list[schemas.TopResourceItem]:
    rows = (
        db.query(Resource)
        .filter(Resource.status == ResourceStatus.published)
        .order_by(Resource.views.desc())
        .limit(3)
        .all()
    )
    return [
        schemas.TopResourceItem(
            id=row.id,
            title=row.title,
            category=row.category.value,
            views=row.views,
            saves=row.saves,
        )
        for row in rows
    ]


def _topic_label(req: SessionRequest) -> str:
    if req.topic == SessionTopic.other and req.other_topic:
        return req.other_topic.strip()
    return req.topic.value


def _build_top_categories(db: Session) -> list[schemas.TopCategoryItem]:
    completed = (
        db.query(SessionRequest)
        .filter(SessionRequest.status == SessionRequestStatus.completed)
        .all()
    )
    counter: Counter[str] = Counter()
    for req in completed:
        counter[_topic_label(req)] += 1

    total = sum(counter.values())
    top = counter.most_common(5)
    return [
        schemas.TopCategoryItem(
            label=label,
            sessions=count,
            percent=round(100 * count / total) if total else 0,
        )
        for label, count in top
    ]


def _month_start(now: datetime) -> datetime:
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _active_student_ids_subquery(db: Session):
    return (
        db.query(UserRoleAssignment.user_id)
        .filter(
            UserRoleAssignment.role == UserRole.student,
            UserRoleAssignment.is_active.is_(True),
        )
        .distinct()
        .subquery()
    )


def _build_growth_metrics(db: Session, *, now: datetime) -> list[schemas.AdminReportSummary]:
    month_start = _month_start(now)
    student_ids = _active_student_ids_subquery(db)

    total_students = (
        db.query(func.count())
        .select_from(student_ids)
        .scalar()
        or 0
    )
    new_students = (
        db.query(func.count(User.id))
        .filter(
            User.id.in_(db.query(student_ids.c.user_id)),
            User.created_at >= month_start,
        )
        .scalar()
        or 0
    )

    total_counsellors = (
        db.query(func.count(CounsellorProfile.id))
        .filter(CounsellorProfile.status == CounsellorProfileStatus.active)
        .scalar()
        or 0
    )
    new_counsellors = (
        db.query(func.count(CounsellorProfile.id))
        .filter(
            CounsellorProfile.status == CounsellorProfileStatus.active,
            CounsellorProfile.joined_at >= month_start,
        )
        .scalar()
        or 0
    )

    thirty_days_ago = now - timedelta(days=30)
    active_30d = (
        db.query(func.count(User.id))
        .filter(
            User.id.in_(db.query(student_ids.c.user_id)),
            User.last_active_at.isnot(None),
            User.last_active_at >= thirty_days_ago,
        )
        .scalar()
        or 0
    )
    retention_pct = round(100 * active_30d / total_students) if total_students else 0

    published = (
        db.query(func.count(Resource.id))
        .filter(Resource.status == ResourceStatus.published)
        .scalar()
        or 0
    )
    with_views = (
        db.query(func.count(Resource.id))
        .filter(
            Resource.status == ResourceStatus.published,
            Resource.views > 0,
        )
        .scalar()
        or 0
    )
    adoption_pct = round(100 * with_views / published) if published else 0

    def student_pct() -> int:
        if total_students == 0:
            return 0
        return min(100, round(100 * new_students / total_students))

    def counsellor_pct() -> int:
        if total_counsellors == 0:
            return 0
        return min(100, round(100 * new_counsellors / max(1, total_counsellors)))

    return [
        schemas.AdminReportSummary(
            label="Student Growth",
            value=f"+{new_students}",
            percent=student_pct(),
            tone="primary",
        ),
        schemas.AdminReportSummary(
            label="Counsellor Growth",
            value=f"+{new_counsellors}",
            percent=counsellor_pct(),
            tone="primary",
        ),
        schemas.AdminReportSummary(
            label="30-Day Retention",
            value=f"{retention_pct}%",
            percent=retention_pct,
            tone="warning",
        ),
        schemas.AdminReportSummary(
            label="Resource Adoption",
            value=f"{adoption_pct}%",
            percent=adoption_pct,
            tone="muted",
        ),
    ]


def _build_usage_breakdown(db: Session) -> list[schemas.AdminReportSummary]:
    booking_count = db.query(func.count(SessionRequest.id)).scalar() or 0
    resource_views = (
        db.query(func.coalesce(func.sum(Resource.views), 0))
        .filter(Resource.status == ResourceStatus.published)
        .scalar()
        or 0
    )
    active_counsellors = (
        db.query(func.count(CounsellorProfile.id))
        .filter(CounsellorProfile.status == CounsellorProfileStatus.active)
        .scalar()
        or 0
    )

    raw = [
        ("Counsellor Directory", active_counsellors, f"{active_counsellors:,} active"),
        ("Resource Hub", int(resource_views), f"{int(resource_views):,} views"),
        ("Session Booking", booking_count, f"{booking_count:,} requests"),
    ]
    max_val = max(v for _, v, _ in raw) or 1
    return [
        schemas.AdminReportSummary(
            label=label,
            value=display,
            percent=min(100, round(100 * val / max_val)),
            tone="primary",
        )
        for label, val, display in raw
    ]


def get_admin_analytics(db: Session) -> schemas.AdminAnalyticsResponse:
    now = datetime.now(timezone.utc)
    month_start = _month_start(now)
    student_ids = _active_student_ids_subquery(db)

    monthly_active = (
        db.query(func.count(User.id))
        .filter(
            User.last_active_at.isnot(None),
            User.last_active_at >= month_start,
        )
        .scalar()
        or 0
    )

    sessions_this_month = (
        db.query(func.count(SessionRequest.id))
        .filter(
            SessionRequest.status == SessionRequestStatus.completed,
            SessionRequest.requested_at >= month_start,
        )
        .scalar()
        or 0
    )

    return schemas.AdminAnalyticsResponse(
        session_trend=_build_session_trend(db, now=now),
        status_distribution=_build_status_distribution(db),
        counsellor_performance=_build_counsellor_performance(db, now=now),
        top_resources=_build_top_resources(db),
        top_categories=_build_top_categories(db),
        monthly_active_users=monthly_active,
        sessions_completed_this_month=sessions_this_month,
        avg_satisfaction=None,
        avg_response_hours=None,
        growth_metrics=_build_growth_metrics(db, now=now),
        usage_breakdown=_build_usage_breakdown(db),
    )
