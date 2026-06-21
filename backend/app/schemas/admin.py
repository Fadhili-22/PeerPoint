from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.enums import (
    AccountRequestStatus,
    AccountRequestType,
    ActivityVariant,
    EngagementLevel,
    StudentProfileStatus,
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
    course: str | None
    year: str | None
    sessions: int
    engagement: EngagementLevel | None
    status: StudentProfileStatus
    last_active_at: datetime | None


class AdminStudentListResponse(BaseModel):
    students: list[AdminStudentItem]


class AdminStudentDetail(AdminStudentItem):
    summary: str | None
    recent_activity: list[str]


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


class AdminReportsResponse(BaseModel):
    reports: list[AdminReportSummary]
