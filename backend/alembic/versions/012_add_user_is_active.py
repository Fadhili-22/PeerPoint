"""Add users.is_active column.

Revision ID: 012_add_user_is_active
Revises: 011_add_session_ratings
Create Date: 2026-07-05
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "012_add_user_is_active"
down_revision: Union[str, None] = "011_add_session_ratings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("TRUE"),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "is_active")
