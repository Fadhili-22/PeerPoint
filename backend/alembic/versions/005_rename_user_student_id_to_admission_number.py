"""Rename users.student_id to users.admission_number.

Revision ID: 005_admission_number
Revises: 004_drop_sessions
Create Date: 2026-06-29
"""
from typing import Sequence, Union

from alembic import op

revision: str = "005_admission_number"
down_revision: Union[str, None] = "004_drop_sessions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "student_id", new_column_name="admission_number")


def downgrade() -> None:
    op.alter_column("users", "admission_number", new_column_name="student_id")
