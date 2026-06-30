"""Drop student_profiles table and related enum types.

Revision ID: 006_drop_student_profiles
Revises: 005_admission_number
Create Date: 2026-06-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "006_drop_student_profiles"
down_revision: Union[str, None] = "005_admission_number"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

engagement_level_enum = postgresql.ENUM(
    "High", "Medium", "Low", name="engagementlevel", create_type=False
)
student_profile_status_enum = postgresql.ENUM(
    "active", "inactive", "at-risk", name="studentprofilestatus", create_type=False
)


def upgrade() -> None:
    op.drop_table("student_profiles")
    bind = op.get_bind()
    student_profile_status_enum.drop(bind, checkfirst=True)
    engagement_level_enum.drop(bind, checkfirst=True)


def downgrade() -> None:
    bind = op.get_bind()
    engagement_level_enum.create(bind, checkfirst=True)
    student_profile_status_enum.create(bind, checkfirst=True)
    op.create_table(
        "student_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("course", sa.String(), nullable=True),
        sa.Column("year", sa.String(), nullable=True),
        sa.Column("sessions_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("engagement", engagement_level_enum, nullable=True),
        sa.Column(
            "status",
            student_profile_status_enum,
            server_default="active",
            nullable=False,
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
