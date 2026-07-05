"""Add users.phone column.

Revision ID: 010_add_user_phone
Revises: 009_drop_availability_status
Create Date: 2026-07-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "010_add_user_phone"
down_revision: Union[str, None] = "009_drop_availability_status"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
