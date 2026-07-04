"""Drop counsellor_profiles.rating.

Revision ID: 008_drop_rating
Revises: 007_email_verified
Create Date: 2026-07-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "008_drop_rating"
down_revision: Union[str, None] = "007_email_verified"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("counsellor_profiles", "rating")


def downgrade() -> None:
    op.add_column(
        "counsellor_profiles",
        sa.Column(
            "rating",
            sa.Numeric(2, 1),
            server_default="0",
            nullable=False,
        ),
    )
