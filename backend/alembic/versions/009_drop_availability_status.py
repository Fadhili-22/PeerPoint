"""Drop online/offline availability columns and availabilitystatus enum.

Revision ID: 009_drop_availability_status
Revises: 008_drop_rating
Create Date: 2026-07-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "009_drop_availability_status"
down_revision: Union[str, None] = "008_drop_rating"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

availability_status_enum = postgresql.ENUM(
    "available",
    "busy",
    "offline",
    name="availabilitystatus",
    create_type=False,
)


def upgrade() -> None:
    op.drop_column("counsellor_profiles", "busy_until")
    op.drop_column("counsellor_profiles", "is_online")
    op.drop_column("counsellor_profiles", "availability_status")
    availability_status_enum.drop(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    availability_status_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "counsellor_profiles",
        sa.Column(
            "availability_status",
            availability_status_enum,
            server_default="offline",
            nullable=False,
        ),
    )
    op.add_column(
        "counsellor_profiles",
        sa.Column(
            "is_online",
            sa.Boolean(),
            server_default="FALSE",
            nullable=False,
        ),
    )
    op.add_column(
        "counsellor_profiles",
        sa.Column("busy_until", sa.String(), nullable=True),
    )
