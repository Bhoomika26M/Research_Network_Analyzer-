"""Add reviews table

Revision ID: 0003_add_reviews
Revises: 0002_soft_delete
Create Date: 2026-11-01 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0003_add_reviews'
down_revision: Union[str, None] = '0002_soft_delete'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pub_id', sa.Integer(), nullable=False),
        sa.Column('pub_title', sa.Text(), nullable=False),
        sa.Column('pub_author', sa.String(length=255), nullable=False),
        sa.Column('pub_institution', sa.String(length=255), nullable=False),
        sa.Column('pub_abstract', sa.Text(), nullable=True),
        sa.Column('pub_keywords', sa.Text(), nullable=True),
        sa.Column('pub_venue', sa.String(length=255), nullable=True),
        sa.Column('pub_type', sa.String(length=50), nullable=True),
        sa.Column('submitted_date', sa.String(length=50), nullable=True),
        sa.Column('deadline', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('decision', sa.String(length=50), nullable=True),
        sa.Column('overall_score', sa.Integer(), nullable=True),
        sa.Column('method_score', sa.Integer(), nullable=True),
        sa.Column('novelty_score', sa.Integer(), nullable=True),
        sa.Column('clarity_score', sa.Integer(), nullable=True),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('reviewer_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    op.create_index(op.f('ix_reviews_pub_id'), 'reviews', ['pub_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_reviews_pub_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_id'), table_name='reviews')
    op.drop_table('reviews')
