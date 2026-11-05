"""Add project_tasks table

Revision ID: 0004_project_tasks
Revises: 0003_teams_assignments_links
Create Date: 2026-09-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0004_project_tasks"
down_revision: Union[str, None] = "0003_teams_assignments_links"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Intentionally no-op: no model or endpoint in this codebase uses
    # project_tasks, so the database should not contain that table.
    pass


def downgrade() -> None:
    pass
