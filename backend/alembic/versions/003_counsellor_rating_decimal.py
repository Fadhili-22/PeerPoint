"""Change counsellor_profiles.rating from Integer to Numeric(2,1).

Revision ID: 003_rating_decimal
Revises: 002_user_roles
Create Date: 2026-06-21

The frontend renders counsellor ratings with one decimal place (e.g. "4.9"),
so an integer column cannot represent the real product domain. This is done
now, before any counsellor profile data exists, so the cast is trivial.
Numeric(2,1) holds 0.0–9.9 which covers the 0.0–5.0 rating range.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003_rating_decimal"
down_revision: Union[str, None] = "002_user_roles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "counsellor_profiles",
        "rating",
        existing_type=sa.Integer(),
        type_=sa.Numeric(2, 1),
        existing_nullable=False,
        existing_server_default="0",
        postgresql_using="rating::numeric(2,1)",
    )


def downgrade() -> None:
    op.alter_column(
        "counsellor_profiles",
        "rating",
        existing_type=sa.Numeric(2, 1),
        type_=sa.Integer(),
        existing_nullable=False,
        existing_server_default="0",
        postgresql_using="round(rating)::integer",
    )
