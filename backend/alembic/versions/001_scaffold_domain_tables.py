"""Scaffold domain tables and extend users profile columns.

Revision ID: 001_scaffold_domain
Revises:
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_scaffold_domain"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_role_enum = postgresql.ENUM("student", "counsellor", "admin", name="userrole", create_type=False)
availability_status_enum = postgresql.ENUM("available", "busy", "offline", name="availabilitystatus", create_type=False)
counsellor_profile_status_enum = postgresql.ENUM("active", "inactive", name="counsellorprofilestatus", create_type=False)
session_topic_enum = postgresql.ENUM(
    "Academic Stress", "Anxiety", "Relationships", "Career Guidance", "Time Management", "Other",
    name="sessiontopic", create_type=False,
)
session_format_enum = postgresql.ENUM("in-person", "video", "phone", name="sessionformat", create_type=False)
session_request_status_enum = postgresql.ENUM(
    "pending", "accepted", "rejected", "completed", name="sessionrequeststatus", create_type=False
)
booking_session_status_enum = postgresql.ENUM(
    "upcoming", "completed", "cancelled", name="bookingsessionstatus", create_type=False
)
session_outcome_enum = postgresql.ENUM(
    "Resolved", "Follow-up Booked", "Rescheduled", "No-show", "Pending", name="sessionoutcome", create_type=False
)
resource_status_enum = postgresql.ENUM(
    "draft", "pending_review", "published", "rejected", "archived", name="resourcestatus", create_type=False
)
resource_category_enum = postgresql.ENUM(
    "Anxiety", "Depression", "Stress", "Academic Focus", "Self-Care", "Relationships",
    name="resourcecategory", create_type=False,
)
engagement_level_enum = postgresql.ENUM("High", "Medium", "Low", name="engagementlevel", create_type=False)
student_profile_status_enum = postgresql.ENUM(
    "active", "inactive", "at-risk", name="studentprofilestatus", create_type=False
)
training_status_enum = postgresql.ENUM("Training Complete", "In Review", name="trainingstatus", create_type=False)
account_request_type_enum = postgresql.ENUM("signup", "promotion", name="accountrequesttype", create_type=False)
account_request_status_enum = postgresql.ENUM(
    "Pending Review", "Verifying ID", name="accountrequeststatus", create_type=False
)
activity_variant_enum = postgresql.ENUM(
    "primary", "warning", "info", "success", name="activityvariant", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    user_role_enum.create(bind, checkfirst=True)
    availability_status_enum.create(bind, checkfirst=True)
    counsellor_profile_status_enum.create(bind, checkfirst=True)
    session_topic_enum.create(bind, checkfirst=True)
    session_format_enum.create(bind, checkfirst=True)
    session_request_status_enum.create(bind, checkfirst=True)
    booking_session_status_enum.create(bind, checkfirst=True)
    session_outcome_enum.create(bind, checkfirst=True)
    resource_status_enum.create(bind, checkfirst=True)
    resource_category_enum.create(bind, checkfirst=True)
    engagement_level_enum.create(bind, checkfirst=True)
    student_profile_status_enum.create(bind, checkfirst=True)
    training_status_enum.create(bind, checkfirst=True)
    account_request_type_enum.create(bind, checkfirst=True)
    account_request_status_enum.create(bind, checkfirst=True)
    activity_variant_enum.create(bind, checkfirst=True)

    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("password", sa.String(), nullable=False),
            sa.Column("full_name", sa.String(), nullable=False),
            sa.Column("role", user_role_enum, nullable=False, server_default="student"),
            sa.Column("is_verified", sa.Boolean(), server_default="FALSE", nullable=False),
            sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )

    existing_user_columns = {
        column["name"] for column in sa.inspect(bind).get_columns("users")
    }
    if "student_id" not in existing_user_columns:
        op.add_column("users", sa.Column("student_id", sa.String(), nullable=True))
    if "updated_at" not in existing_user_columns:
        op.add_column(
            "users",
            sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        )
    if "last_active_at" not in existing_user_columns:
        op.add_column("users", sa.Column("last_active_at", sa.TIMESTAMP(timezone=True), nullable=True))

    if "counsellor_profiles" in existing_tables:
        return

    op.create_table(
        "counsellor_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("short_name", sa.String(), nullable=False),
        sa.Column("initials", sa.String(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("program", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), server_default="", nullable=False),
        sa.Column("quote", sa.String(), nullable=True),
        sa.Column("specialties", postgresql.ARRAY(sa.String()), server_default="{}", nullable=False),
        sa.Column("languages", postgresql.ARRAY(sa.String()), server_default="{}", nullable=False),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("rating", sa.Integer(), server_default="0", nullable=False),
        sa.Column("sessions_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("joined_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("availability_status", availability_status_enum, server_default="offline", nullable=False),
        sa.Column("is_online", sa.Boolean(), server_default="FALSE", nullable=False),
        sa.Column("busy_until", sa.String(), nullable=True),
        sa.Column("availability_note", sa.String(), server_default="", nullable=False),
        sa.Column("response_time", sa.String(), server_default="", nullable=False),
        sa.Column("unavailable_dates", postgresql.ARRAY(sa.String()), server_default="{}", nullable=False),
        sa.Column("status", counsellor_profile_status_enum, server_default="active", nullable=False),
        sa.Column("last_active_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "counsellor_availability_schedule",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("counsellor_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), server_default="TRUE", nullable=False),
        sa.Column("slots", postgresql.ARRAY(sa.String()), server_default="{}", nullable=False),
        sa.ForeignKeyConstraint(["counsellor_id"], ["counsellor_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("counsellor_id", "day_of_week", name="uq_counsellor_day"),
    )

    op.create_table(
        "promotion_candidates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("course", sa.String(), nullable=False),
        sa.Column("year", sa.String(), nullable=False),
        sa.Column("training_status", training_status_enum, server_default="In Review", nullable=False),
        sa.Column("sessions_attended", sa.Integer(), server_default="0", nullable=False),
        sa.Column("applied_on", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "session_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("counsellor_id", sa.Integer(), nullable=False),
        sa.Column("topic", session_topic_enum, nullable=False),
        sa.Column("other_topic", sa.String(), nullable=True),
        sa.Column("preferred_date", sa.Date(), nullable=False),
        sa.Column("preferred_time", sa.String(), nullable=False),
        sa.Column("format", session_format_enum, nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("anonymous_until_accepted", sa.Boolean(), server_default="FALSE", nullable=False),
        sa.Column("status", session_request_status_enum, server_default="pending", nullable=False),
        sa.Column("rejection_reason", sa.String(), nullable=True),
        sa.Column("requested_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["counsellor_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("counsellor_id", sa.Integer(), nullable=False),
        sa.Column("scheduled_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("format", sa.String(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="45", nullable=False),
        sa.Column("status", booking_session_status_enum, server_default="upcoming", nullable=False),
        sa.Column("outcome", session_outcome_enum, server_default="Pending", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("student_display_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["counsellor_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["request_id"], ["session_requests.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("request_id"),
    )

    op.create_table(
        "resources",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("category", resource_category_enum, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("read_time", sa.String(), nullable=False),
        sa.Column("author", sa.String(), nullable=False),
        sa.Column("author_role", sa.String(), nullable=False),
        sa.Column("image", sa.String(), nullable=False),
        sa.Column("image_alt", sa.String(), nullable=False),
        sa.Column("body", postgresql.ARRAY(sa.String()), server_default="{}", nullable=False),
        sa.Column("status", resource_status_enum, server_default="draft", nullable=False),
        sa.Column("featured", sa.Boolean(), server_default="FALSE", nullable=False),
        sa.Column("featured_order", sa.Integer(), nullable=True),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_edited_by_id", sa.Integer(), nullable=True),
        sa.Column("submitted_by_id", sa.Integer(), nullable=True),
        sa.Column("submitted_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("views", sa.Integer(), server_default="0", nullable=False),
        sa.Column("saves", sa.Integer(), server_default="0", nullable=False),
        sa.ForeignKeyConstraint(["last_edited_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["submitted_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "student_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("course", sa.String(), nullable=True),
        sa.Column("year", sa.String(), nullable=True),
        sa.Column("sessions_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("engagement", engagement_level_enum, nullable=True),
        sa.Column("status", student_profile_status_enum, server_default="active", nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "platform_activity",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("variant", activity_variant_enum, nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "newsletter_subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("subscribed_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("active", sa.Boolean(), server_default="TRUE", nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "account_approval_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", account_request_type_enum, nullable=False),
        sa.Column("status", account_request_status_enum, server_default="Pending Review", nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "resource_saves",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.String(), nullable=False),
        sa.Column("saved_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["resource_id"], ["resources.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "resource_id"),
    )


def downgrade() -> None:
    op.drop_table("resource_saves")
    op.drop_table("account_approval_requests")
    op.drop_table("newsletter_subscriptions")
    op.drop_table("platform_activity")
    op.drop_table("student_profiles")
    op.drop_table("resources")
    op.drop_table("sessions")
    op.drop_table("session_requests")
    op.drop_table("promotion_candidates")
    op.drop_table("counsellor_availability_schedule")
    op.drop_table("counsellor_profiles")
    op.drop_column("users", "last_active_at")
    op.drop_column("users", "updated_at")
    op.drop_column("users", "student_id")

    bind = op.get_bind()
    activity_variant_enum.drop(bind, checkfirst=True)
    account_request_status_enum.drop(bind, checkfirst=True)
    account_request_type_enum.drop(bind, checkfirst=True)
    training_status_enum.drop(bind, checkfirst=True)
    student_profile_status_enum.drop(bind, checkfirst=True)
    engagement_level_enum.drop(bind, checkfirst=True)
    resource_category_enum.drop(bind, checkfirst=True)
    resource_status_enum.drop(bind, checkfirst=True)
    session_outcome_enum.drop(bind, checkfirst=True)
    booking_session_status_enum.drop(bind, checkfirst=True)
    session_request_status_enum.drop(bind, checkfirst=True)
    session_format_enum.drop(bind, checkfirst=True)
    session_topic_enum.drop(bind, checkfirst=True)
    counsellor_profile_status_enum.drop(bind, checkfirst=True)
    availability_status_enum.drop(bind, checkfirst=True)
