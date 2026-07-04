from datetime import datetime



from pydantic import BaseModel, EmailStr



from app.schemas.enums import CounsellorProfileStatus, TrainingStatus





class CounsellorCard(BaseModel):

    id: int

    short_name: str

    initials: str

    photo_url: str | None

    specialties: list[str]

    bio: str

    availability_note: str





class FeaturedCounsellorsResponse(BaseModel):

    counsellors: list[CounsellorCard]





class CounsellorDirectoryItem(BaseModel):

    id: int

    user_id: int

    full_name: str

    short_name: str

    initials: str

    year: int

    program: str | None

    bio: str

    quote: str | None

    specialties: list[str]

    languages: list[str]

    photo_url: str | None

    sessions_count: int

    availability_note: str

    response_time: str





class CounsellorListResponse(BaseModel):

    counsellors: list[CounsellorDirectoryItem]





class CounsellorProfileDetail(CounsellorDirectoryItem):

    joined_at: datetime

    weekly_availability_summary: dict[str, int]





class CounsellorOwnProfile(BaseModel):

    """The calling counsellor's own profile. Includes system/admin-owned fields

    (read-only from the counsellor's side) so the dashboard can display them."""



    id: int  # users.id — see identity contract

    user_id: int

    full_name: str

    short_name: str

    initials: str

    year: int

    program: str | None

    bio: str

    quote: str | None

    specialties: list[str]

    languages: list[str]

    photo_url: str | None

    sessions_count: int

    joined_at: datetime

    availability_note: str

    response_time: str

    status: CounsellorProfileStatus

    last_active_at: datetime | None





class CounsellorProfileSelfUpdate(BaseModel):

    """Self-editable counsellor profile fields ONLY. Admin/system-owned fields

    (sessions_count, status, year) are intentionally absent and cannot be changed here."""



    short_name: str | None = None

    bio: str | None = None

    quote: str | None = None

    specialties: list[str] | None = None

    languages: list[str] | None = None

    photo_url: str | None = None

    program: str | None = None





class WeeklyAvailabilityDay(BaseModel):

    day_of_week: int

    enabled: bool

    slots: list[str]





class CounsellorAvailabilityResponse(BaseModel):

    weekly_slots: dict[int, list[str]]

    unavailable_dates: list[str]





class CounsellorSlotsResponse(BaseModel):

    slots: list[str]





class AvailabilityScheduleItem(BaseModel):

    day_of_week: int

    enabled: bool

    slots: list[str]





class CounsellorAvailabilityManageResponse(BaseModel):

    schedule: list[AvailabilityScheduleItem]





class CounsellorAvailabilityUpdate(BaseModel):

    schedule: list[AvailabilityScheduleItem]





class AdminCounsellorItem(BaseModel):

    id: int

    user_id: int

    full_name: str

    email: EmailStr

    year: int

    program: str | None

    specialties: list[str]

    sessions_count: int

    status: CounsellorProfileStatus

    last_active_at: datetime | None





class AdminCounsellorListResponse(BaseModel):

    counsellors: list[AdminCounsellorItem]





class PromotionCandidateItem(BaseModel):

    id: int

    user_id: int

    name: str

    email: EmailStr

    course: str

    year: str

    training_status: TrainingStatus

    sessions_attended: int

    applied_on: datetime





class PromotionCandidateListResponse(BaseModel):

    candidates: list[PromotionCandidateItem]





class PromoteCounsellorResponse(BaseModel):

    user_id: int

    roles: list[str]

    message: str

