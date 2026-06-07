"""add branch variation note

Revision ID: 20260607_0002
Revises: 20260607_0001
Create Date: 2026-06-07
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260607_0002"
down_revision: Union[str, None] = "20260607_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("processes", sa.Column("branch_variation_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("processes", "branch_variation_note")
