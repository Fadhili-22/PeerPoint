"""Add users.email_verified and purge legacy signup approval queue rows.

Revision ID: 007_email_verified
Revises: 006_drop_student_profiles
Create Date: 2026-06-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007_email_verified"
down_revision: Union[str, None] = "006_drop_student_profiles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("FALSE"),
        ),
    )
    op.execute(sa.text("UPDATE users SET email_verified = TRUE"))
    op.execute(
        sa.text(
            "DELETE FROM account_approval_requests WHERE type = 'signup'"
        )
    )


def downgrade() -> None:
    op.drop_column("users", "email_verified")
