from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.enums import (
    BookingSessionStatus,
    SessionFormat,
    SessionOutcome,
    SessionRequestStatus,
    SessionTopic,
)

# BookingSessionStatus / SessionOutcome remain for admin session-log stubs (later prompt).


class SessionRequestCreate(BaseModel):
    counsellor_id: int
    topic: SessionTopic
    other_topic: str | None = None
    preferred_date: date
    preferred_time: str
    format: SessionFormat
    notes: str | None = Field(default=None, max_length=500)
    anonymous_until_accepted: bool = False


class SessionRequestCreatedResponse(BaseModel):
    id: int
    status: SessionRequestStatus


class SessionRequestStudentView(BaseModel):
    id: int
    counsellor_id: int
    counsellor_name: str
    topic: SessionTopic
    preferred_date: date
    preferred_time: str
    format: SessionFormat
    status: SessionRequestStatus
    requested_at: datetime
    overdue: bool
    rejection_reason: str | None = None


class SessionRequestListResponse(BaseModel):
    requests: list[SessionRequestStudentView]


class SessionRequestCounsellorView(BaseModel):
    id: int
    student_display_name: str
    topic: SessionTopic
    other_topic: str | None
    preferred_date: date
    preferred_time: str
    format: SessionFormat
    notes: str | None
    status: SessionRequestStatus
    requested_at: datetime
    overdue: bool
    anonymous_until_accepted: bool


class SessionRequestCounsellorListResponse(BaseModel):
    requests: list[SessionRequestCounsellorView]


class SessionRequestDetail(SessionRequestCounsellorView):
    duration_minutes: int | None = None
    student_email: str | None = None


class SessionRequestReject(BaseModel):
    reason: str | None = None


class SessionRequestActionResponse(BaseModel):
    id: int
    status: SessionRequestStatus
    message: str


class StudentSessionItem(BaseModel):
    id: int
    counsellor_id: int
    counsellor_name: str
    scheduled_at: datetime
    topic: str
    format: str
    duration_minutes: int
    status: SessionRequestStatus


class StudentSessionListResponse(BaseModel):
    sessions: list[StudentSessionItem]


class StudentSessionDetail(StudentSessionItem):
    notes: str | None = None


class CounsellorUpcomingSession(BaseModel):
    id: int
    student_display_id: str
    scheduled_at: datetime
    topic: str
    format: str
    duration_minutes: int
    status: SessionRequestStatus


class CounsellorUpcomingSessionsResponse(BaseModel):
    sessions: list[CounsellorUpcomingSession]


class AdminSessionItem(BaseModel):
    id: str
    student_name: str
    counsellor_name: str
    scheduled_at: datetime
    topic: str
    format: str
    status: BookingSessionStatus
    outcome: SessionOutcome | None = None


class AdminSessionListResponse(BaseModel):
    sessions: list[AdminSessionItem]
