"""Add user_roles table and migrate existing role data.

Revision ID: 002_user_roles
Revises: 001_scaffold_domain
Create Date: 2026-06-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002_user_roles"
down_revision: Union[str, None] = "001_scaffold_domain"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_role_enum = postgresql.ENUM(
    "student", "counsellor", "admin", name="userrole", create_type=False
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "user_roles" not in inspector.get_table_names():
        op.create_table(
            "user_roles",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("role", user_role_enum, nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default="TRUE", nullable=False),
            sa.Column(
                "granted_at",
                sa.TIMESTAMP(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column("granted_by", sa.Integer(), nullable=True),
            sa.Column("revoked_at", sa.TIMESTAMP(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["granted_by"], ["users.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_user_roles_user_id",
            "user_roles",
            ["user_id"],
        )
        op.create_index(
            "uq_user_roles_active",
            "user_roles",
            ["user_id", "role"],
            unique=True,
            postgresql_where=sa.text("is_active = true"),
        )

    op.execute(
        """
        INSERT INTO user_roles (user_id, role, is_active, granted_at, granted_by, revoked_at)
        SELECT u.id, u.role, true, u.created_at, NULL, NULL
        FROM users u
        WHERE NOT EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = u.id AND ur.role = u.role AND ur.is_active = true
        )
        """
    )


def downgrade() -> None:
    op.drop_index("uq_user_roles_active", table_name="user_roles")
    op.drop_index("ix_user_roles_user_id", table_name="user_roles")
    op.drop_table("user_roles")
