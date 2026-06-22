"""Drop unused sessions table.

Revision ID: 004_drop_sessions
Revises: 003_rating_decimal
Create Date: 2026-06-22

Session lifecycle is modeled entirely on ``session_requests``; the separate
``sessions`` table (with string S-1001-style IDs) was scaffolded but never
populated. Prompt 2 removes it from the schema.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "004_drop_sessions"
down_revision: Union[str, None] = "003_rating_decimal"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

booking_session_status_enum = postgresql.ENUM(
    "upcoming", "completed", "cancelled", name="bookingsessionstatus", create_type=False
)
session_outcome_enum = postgresql.ENUM(
    "Resolved", "Follow-up Booked", "Rescheduled", "No-show", "Pending",
    name="sessionoutcome", create_type=False,
)


def upgrade() -> None:
    op.drop_table("sessions")


def downgrade() -> None:
    bind = op.get_bind()
    booking_session_status_enum.create(bind, checkfirst=True)
    session_outcome_enum.create(bind, checkfirst=True)

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
        sa.Column(
            "status",
            booking_session_status_enum,
            server_default="upcoming",
            nullable=False,
        ),
        sa.Column(
            "outcome",
            session_outcome_enum,
            server_default="Pending",
            nullable=False,
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("student_display_id", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["counsellor_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["request_id"], ["session_requests.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("request_id"),
    )
