from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.enums import (
    AccountRequestStatus,
    AccountRequestType,
    ActivityVariant,
    UserRole,
)


class PublicStatsResponse(BaseModel):
    counsellor_count: int
    students_supported: int
    sessions_completed: int
    resources_published: int


class AdminDashboardResponse(BaseModel):
    total_students: int
    total_counsellors: int
    monthly_active_students: int
    active_sessions: int
    pending_requests: int
    overdue_requests: int
    published_resources: int
    pending_reviews: int
    newsletter_subscribers: int


class AccountRequestItem(BaseModel):
    id: int
    user_id: int
    type: AccountRequestType
    name: str
    email: EmailStr
    role: UserRole
    status: AccountRequestStatus
    date: datetime
    note: str | None


class AccountRequestListResponse(BaseModel):
    requests: list[AccountRequestItem]


class AccountRequestActionResponse(BaseModel):
    id: int
    status: str
    message: str


class AdminStudentItem(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    phone: str | None = None
    is_active: bool = True
    sessions: int
    last_active_at: datetime | None
    created_at: datetime


class AdminStudentListResponse(BaseModel):
    students: list[AdminStudentItem]


class AdminStudentDetail(AdminStudentItem):
    recent_activity: list[str]


class AdminStudentToggleActiveResponse(BaseModel):
    user_id: int
    is_active: bool
    message: str


class PlatformActivityItem(BaseModel):
    id: int
    title: str
    description: str
    variant: ActivityVariant
    entity_type: str
    entity_id: str
    created_at: datetime
    relative_time: str


class PlatformActivityListResponse(BaseModel):
    activities: list[PlatformActivityItem]


class AdminReportSummary(BaseModel):
    label: str
    value: int | float | str
    percent: int | None = None
    tone: str | None = None


class AdminReportsResponse(BaseModel):
    reports: list[AdminReportSummary]


class SessionTrendWeek(BaseModel):
    label: str
    value: int
    height: int


class SessionTrendResponse(BaseModel):
    weeks: list[SessionTrendWeek]


class StatusSegment(BaseModel):
    label: str
    percent: int
    color: str


class StatusDistributionResponse(BaseModel):
    total: int
    segments: list[StatusSegment]


class CounsellorPerformanceItem(BaseModel):
    id: int
    name: str
    sessions_handled: int
    response_rate: int
    response_label: str
    response_variant: str
    last_active: str | None


class TopResourceItem(BaseModel):
    id: str
    title: str
    category: str
    views: int
    saves: int


class TopCategoryItem(BaseModel):
    label: str
    sessions: int
    percent: int


class AdminAnalyticsResponse(BaseModel):
    session_trend: SessionTrendResponse
    status_distribution: StatusDistributionResponse
    counsellor_performance: list[CounsellorPerformanceItem]
    top_resources: list[TopResourceItem]
    top_categories: list[TopCategoryItem]
    monthly_active_users: int | None
    sessions_completed_this_month: int
    avg_satisfaction: float | None = None
    avg_response_hours: float | None = None
    growth_metrics: list[AdminReportSummary]
    usage_breakdown: list[AdminReportSummary]


class AdminRatingItem(BaseModel):
    id: int
    counsellor_name: str
    session_topic: str
    stars: int
    comment: str | None
    created_at: datetime


class AdminRatingListResponse(BaseModel):
    ratings: list[AdminRatingItem]
