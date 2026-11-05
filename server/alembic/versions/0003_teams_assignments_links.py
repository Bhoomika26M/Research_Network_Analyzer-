"""Add teams, assignments and publication_links tables

Revision ID: 0003_teams_assignments_links
Revises: 0002_soft_delete
Create Date: 2026-09-01 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003_teams_assignments_links"
down_revision: Union[str, None] = "0002_soft_delete"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE SEQUENCE IF NOT EXISTS teams_id_seq')
    op.execute('CREATE SEQUENCE IF NOT EXISTS assignments_id_seq')
    op.execute('CREATE SEQUENCE IF NOT EXISTS publication_links_id_seq')

    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "project",
            sa.String(length=255),
            nullable=False,
            server_default=sa.text("'No project assigned'"),
        ),
        sa.Column(
            "members",
            sa.JSON(),
            nullable=True,
            server_default=sa.text("'[]'::json"),
        ),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.Index("ix_teams_id", "id"),
    )

    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("projectId", sa.Integer(), nullable=False),
        sa.Column("researcherId", sa.Integer(), nullable=False),
        sa.Column(
            "role",
            sa.String(length=100),
            nullable=True,
            server_default=sa.text("'Researcher'"),
        ),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.Index("ix_assignments_id", "id"),
        sa.Index("ix_assignments_projectId", "projectId"),
        sa.Index("ix_assignments_researcherId", "researcherId"),
    )

    op.create_table(
        "publication_links",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sourceTitle", sa.String(length=255), nullable=False),
        sa.Column("targetTitle", sa.String(length=255), nullable=False),
        sa.Column("targetAuthors", sa.String(length=255), nullable=False),
        sa.Column("targetYear", sa.String(length=20), nullable=False),
        sa.Column(
            "targetType",
            sa.String(length=50),
            nullable=True,
            server_default=sa.text("'Journal'"),
        ),
        sa.Column(
            "relation",
            sa.String(length=20),
            nullable=True,
            server_default=sa.text("'Cites'"),
        ),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.Index("ix_publication_links_id", "id"),
    )


def downgrade() -> None:
    op.drop_index("ix_publication_links_id", table_name="publication_links")
    op.drop_table("publication_links")

    op.drop_index("ix_assignments_researcherId", table_name="assignments")
    op.drop_index("ix_assignments_projectId", table_name="assignments")
    op.drop_index("ix_assignments_id", table_name="assignments")
    op.drop_table("assignments")

    op.drop_index("ix_teams_id", table_name="teams")
    op.drop_table("teams")

    op.execute(
        "DROP SEQUENCE IF EXISTS teams_id_seq, assignments_id_seq, publication_links_id_seq"
    )
