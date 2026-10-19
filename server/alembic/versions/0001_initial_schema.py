"""Initial database schema migration

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-15 21:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('initials', sa.String(length=10), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('institution', sa.String(length=255), nullable=False),
        sa.Column('department', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('interests', sa.JSON(), nullable=True),
        sa.Column('publications_ids', sa.JSON(), nullable=True),
        sa.Column('h_index', sa.Integer(), nullable=True),
        sa.Column('citations_total', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create publications table
    op.create_table(
        'publications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('abstract', sa.Text(), nullable=False),
        sa.Column('authors', sa.JSON(), nullable=True),
        sa.Column('journal', sa.String(length=255), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('doi', sa.String(length=255), nullable=True),
        sa.Column('citations', sa.Integer(), nullable=True),
        sa.Column('pages', sa.String(length=50), nullable=True),
        sa.Column('volume', sa.String(length=50), nullable=True),
        sa.Column('issue', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_publications_doi'), 'publications', ['doi'], unique=True)
    op.create_index(op.f('ix_publications_id'), 'publications', ['id'], unique=False)
    op.create_index(op.f('ix_publications_title'), 'publications', ['title'], unique=False)
    op.create_index(op.f('ix_publications_year'), 'publications', ['year'], unique=False)

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('pi', sa.String(length=255), nullable=False),
        sa.Column('members', sa.JSON(), nullable=True),
        sa.Column('startDate', sa.String(length=50), nullable=False),
        sa.Column('endDate', sa.String(length=50), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)

    # Create conferences table
    op.create_table(
        'conferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('shortName', sa.String(length=50), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('startDate', sa.String(length=50), nullable=False),
        sa.Column('endDate', sa.String(length=50), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=False),
        sa.Column('presentations', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conferences_id'), 'conferences', ['id'], unique=False)

    # Create citations table
    op.create_table(
        'citations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sourcePubId', sa.Integer(), nullable=False),
        sa.Column('targetPubId', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('context', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_citations_id'), 'citations', ['id'], unique=False)
    op.create_index(op.f('ix_citations_sourcePubId'), 'citations', ['sourcePubId'], unique=False)
    op.create_index(op.f('ix_citations_targetPubId'), 'citations', ['targetPubId'], unique=False)

    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('target', sa.String(length=255), nullable=False),
        sa.Column('timestamp', sa.String(length=100), nullable=True),
        sa.Column('ip', sa.String(length=50), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('citations')
    op.drop_table('conferences')
    op.drop_table('projects')
    op.drop_table('publications')
    op.drop_table('users')
