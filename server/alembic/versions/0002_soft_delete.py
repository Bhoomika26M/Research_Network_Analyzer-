"""Soft-delete support: is_deleted / deleted_at on users, publications, projects

Revision ID: 0002_soft_delete
Revises: 0001_initial_schema
Create Date: 2026-08-16 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0002_soft_delete'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('users', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_users_is_deleted'), 'users', ['is_deleted'], unique=False)

    op.add_column('publications', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('publications', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_publications_is_deleted'), 'publications', ['is_deleted'], unique=False)

    op.add_column('projects', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('projects', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_projects_is_deleted'), 'projects', ['is_deleted'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_projects_is_deleted'), table_name='projects')
    op.drop_column('projects', 'deleted_at')
    op.drop_column('projects', 'is_deleted')

    op.drop_index(op.f('ix_publications_is_deleted'), table_name='publications')
    op.drop_column('publications', 'deleted_at')
    op.drop_column('publications', 'is_deleted')

    op.drop_index(op.f('ix_users_is_deleted'), table_name='users')
    op.drop_column('users', 'deleted_at')
    op.drop_column('users', 'is_deleted')
