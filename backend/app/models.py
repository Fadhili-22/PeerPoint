from sqlalchemy import (
    Boolean,
    Column,
    Date,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP

from app.database import Base
import enum


def _enum_values(enum_class: type[enum.Enum]) -> list[str]:
    """Persist Python enum member values (not names) to Postgres native enums."""
    return [member.value for member in enum_class]


class UserRole(enum.Enum):
    student = "student"
    counsellor = "counsellor"
    admin = "admin"


class CounsellorProfileStatus(enum.Enum):
    active = "active"
    inactive = "inactive"


class SessionTopic(enum.Enum):
    academic_stress = "Academic Stress"
    anxiety = "Anxiety"
    relationships = "Relationships"
    career_guidance = "Career Guidance"
    time_management = "Time Management"
    other = "Other"


class SessionFormat(enum.Enum):
    in_person = "in-person"
    video = "video"
    phone = "phone"


class SessionRequestStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"


class BookingSessionStatus(enum.Enum):
    upcoming = "upcoming"
    completed = "completed"
    cancelled = "cancelled"


class SessionOutcome(enum.Enum):
    resolved = "Resolved"
    follow_up_booked = "Follow-up Booked"
    rescheduled = "Rescheduled"
    no_show = "No-show"
    pending = "Pending"


class ResourceStatus(enum.Enum):
    draft = "draft"
    pending_review = "pending_review"
    published = "published"
    rejected = "rejected"
    archived = "archived"


class ResourceCategory(enum.Enum):
    anxiety = "Anxiety"
    depression = "Depression"
    stress = "Stress"
    academic_focus = "Academic Focus"
    self_care = "Self-Care"
    relationships = "Relationships"


class TrainingStatus(enum.Enum):
    training_complete = "Training Complete"
    in_review = "In Review"


class AccountRequestType(enum.Enum):
    signup = "signup"
    promotion = "promotion"


class AccountRequestStatus(enum.Enum):
    pending_review = "Pending Review"
    verifying_id = "Verifying ID"


class ActivityVariant(enum.Enum):
    primary = "primary"
    warning = "warning"
    info = "info"
    success = "success"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    # Non-authoritative default/primary UI context hint only.
    # NEVER use this column for authorization checks — use active user_roles rows instead.
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    is_verified = Column(Boolean, server_default="FALSE", nullable=False)
    email_verified = Column(Boolean, server_default="FALSE", nullable=False)
    admission_number = Column(String, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )
    last_active_at = Column(TIMESTAMP(timezone=True), nullable=True)

    counsellor_profile = relationship(
        "CounsellorProfile", back_populates="user", uselist=False
    )
    session_requests_as_student = relationship(
        "SessionRequest",
        back_populates="student",
        foreign_keys="SessionRequest.student_id",
    )
    session_requests_as_counsellor = relationship(
        "SessionRequest",
        back_populates="counsellor",
        foreign_keys="SessionRequest.counsellor_id",
    )
    resource_saves = relationship("ResourceSave", back_populates="user")
    role_assignments = relationship(
        "UserRoleAssignment",
        back_populates="user",
        foreign_keys="UserRoleAssignment.user_id",
        cascade="all, delete-orphan",
    )
    roles_granted = relationship(
        "UserRoleAssignment",
        back_populates="granted_by_user",
        foreign_keys="UserRoleAssignment.granted_by",
    )


class UserRoleAssignment(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, nullable=False, server_default="TRUE")
    granted_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    granted_by = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    revoked_at = Column(TIMESTAMP(timezone=True), nullable=True)

    user = relationship(
        "User", back_populates="role_assignments", foreign_keys=[user_id]
    )
    granted_by_user = relationship(
        "User", back_populates="roles_granted", foreign_keys=[granted_by]
    )


class CounsellorProfile(Base):
    __tablename__ = "counsellor_profiles"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    short_name = Column(String, nullable=False)
    initials = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    program = Column(String, nullable=True)
    bio = Column(Text, nullable=False, server_default="")
    quote = Column(String, nullable=True)
    specialties = Column(ARRAY(String), nullable=False, server_default="{}")
    languages = Column(ARRAY(String), nullable=False, server_default="{}")
    photo_url = Column(String, nullable=True)
    sessions_count = Column(Integer, nullable=False, server_default="0")
    joined_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    availability_note = Column(String, nullable=False, server_default="")
    response_time = Column(String, nullable=False, server_default="")
    unavailable_dates = Column(ARRAY(String), nullable=False, server_default="{}")
    status = Column(
        Enum(CounsellorProfileStatus),
        nullable=False,
        server_default=CounsellorProfileStatus.active.value,
    )
    last_active_at = Column(TIMESTAMP(timezone=True), nullable=True)

    user = relationship("User", back_populates="counsellor_profile")
    availability_schedule = relationship(
        "CounsellorAvailabilitySchedule",
        back_populates="counsellor_profile",
        cascade="all, delete-orphan",
    )


class CounsellorAvailabilitySchedule(Base):
    __tablename__ = "counsellor_availability_schedule"
    __table_args__ = (
        UniqueConstraint("counsellor_id", "day_of_week", name="uq_counsellor_day"),
    )

    id = Column(Integer, primary_key=True, nullable=False)
    counsellor_id = Column(
        Integer,
        ForeignKey("counsellor_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    day_of_week = Column(Integer, nullable=False)
    enabled = Column(Boolean, nullable=False, server_default="TRUE")
    slots = Column(ARRAY(String), nullable=False, server_default="{}")

    counsellor_profile = relationship(
        "CounsellorProfile", back_populates="availability_schedule"
    )


class PromotionCandidate(Base):
    __tablename__ = "promotion_candidates"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    course = Column(String, nullable=False)
    year = Column(String, nullable=False)
    training_status = Column(
        Enum(TrainingStatus),
        nullable=False,
        server_default=TrainingStatus.in_review.value,
    )
    sessions_attended = Column(Integer, nullable=False, server_default="0")
    applied_on = Column(Date, nullable=False, server_default=text("CURRENT_DATE"))

    user = relationship("User")


class SessionRequest(Base):
    __tablename__ = "session_requests"

    id = Column(Integer, primary_key=True, nullable=False)
    student_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    counsellor_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    topic = Column(Enum(SessionTopic, values_callable=_enum_values), nullable=False)
    other_topic = Column(String, nullable=True)
    preferred_date = Column(Date, nullable=False)
    preferred_time = Column(String, nullable=False)
    format = Column(Enum(SessionFormat, values_callable=_enum_values), nullable=False)
    notes = Column(String(500), nullable=True)
    anonymous_until_accepted = Column(Boolean, nullable=False, server_default="FALSE")
    status = Column(
        Enum(SessionRequestStatus, values_callable=_enum_values),
        nullable=False,
        server_default=SessionRequestStatus.pending.value,
    )
    rejection_reason = Column(String, nullable=True)
    requested_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    student = relationship(
        "User",
        back_populates="session_requests_as_student",
        foreign_keys=[student_id],
    )
    counsellor = relationship(
        "User",
        back_populates="session_requests_as_counsellor",
        foreign_keys=[counsellor_id],
    )


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    category = Column(Enum(ResourceCategory, values_callable=_enum_values), nullable=False)
    description = Column(Text, nullable=False)
    read_time = Column(String, nullable=False)
    author = Column(String, nullable=False)
    author_role = Column(String, nullable=False)
    image = Column(String, nullable=False)
    image_alt = Column(String, nullable=False)
    body = Column(ARRAY(String), nullable=False, server_default="{}")
    status = Column(
        Enum(ResourceStatus, values_callable=_enum_values),
        nullable=False,
        server_default=ResourceStatus.draft.value,
    )
    featured = Column(Boolean, nullable=False, server_default="FALSE")
    featured_order = Column(Integer, nullable=True)
    published_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=text("now()"),
    )
    last_edited_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitted_at = Column(TIMESTAMP(timezone=True), nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    views = Column(Integer, nullable=False, server_default="0")
    saves = Column(Integer, nullable=False, server_default="0")

    last_edited_by = relationship("User", foreign_keys=[last_edited_by_id])
    submitted_by = relationship("User", foreign_keys=[submitted_by_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    resource_saves = relationship("ResourceSave", back_populates="resource")


class ResourceSave(Base):
    __tablename__ = "resource_saves"

    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    resource_id = Column(
        String, ForeignKey("resources.id", ondelete="CASCADE"), primary_key=True
    )
    saved_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    user = relationship("User", back_populates="resource_saves")
    resource = relationship("Resource", back_populates="resource_saves")


class PlatformActivity(Base):
    __tablename__ = "platform_activity"

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    variant = Column(Enum(ActivityVariant), nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )


class NewsletterSubscription(Base):
    __tablename__ = "newsletter_subscriptions"

    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    subscribed_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )
    active = Column(Boolean, nullable=False, server_default="TRUE")


class AccountApprovalRequest(Base):
    __tablename__ = "account_approval_requests"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(
        Enum(AccountRequestType, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    status = Column(
        Enum(AccountRequestStatus, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        server_default=AccountRequestStatus.pending_review.value,
    )
    note = Column(Text, nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, server_default=text("now()")
    )

    user = relationship("User")
