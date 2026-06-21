from enum import Enum


class UserRole(str, Enum):
    student = "student"
    counsellor = "counsellor"
    admin = "admin"


class AvailabilityStatus(str, Enum):
    available = "available"
    busy = "busy"
    offline = "offline"


class CounsellorProfileStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class SessionTopic(str, Enum):
    academic_stress = "Academic Stress"
    anxiety = "Anxiety"
    relationships = "Relationships"
    career_guidance = "Career Guidance"
    time_management = "Time Management"
    other = "Other"


class SessionFormat(str, Enum):
    in_person = "in-person"
    video = "video"
    phone = "phone"


class SessionRequestStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"


class BookingSessionStatus(str, Enum):
    upcoming = "upcoming"
    completed = "completed"
    cancelled = "cancelled"


class SessionOutcome(str, Enum):
    resolved = "Resolved"
    follow_up_booked = "Follow-up Booked"
    rescheduled = "Rescheduled"
    no_show = "No-show"
    pending = "Pending"


class ResourceStatus(str, Enum):
    draft = "draft"
    pending_review = "pending_review"
    published = "published"
    rejected = "rejected"
    archived = "archived"


class ResourceCategory(str, Enum):
    anxiety = "Anxiety"
    depression = "Depression"
    stress = "Stress"
    academic_focus = "Academic Focus"
    self_care = "Self-Care"
    relationships = "Relationships"


class EngagementLevel(str, Enum):
    high = "High"
    medium = "Medium"
    low = "Low"


class StudentProfileStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    at_risk = "at-risk"


class TrainingStatus(str, Enum):
    training_complete = "Training Complete"
    in_review = "In Review"


class AccountRequestType(str, Enum):
    signup = "signup"
    promotion = "promotion"


class AccountRequestStatus(str, Enum):
    pending_review = "Pending Review"
    verifying_id = "Verifying ID"


class ActivityVariant(str, Enum):
    primary = "primary"
    warning = "warning"
    info = "info"
    success = "success"


class ReviewDecision(str, Enum):
    approve_publish = "approve_publish"
    approve_draft = "approve_draft"
    reject = "reject"
