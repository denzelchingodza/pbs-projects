"""Add media_type to projects (photo vs video gallery items)

Revision ID: aed0cb5089bc
Revises: 9759a1b9bc36
Create Date: 2026-07-20 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'aed0cb5089bc'
down_revision = '9759a1b9bc36'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # server_default here is deliberate: every existing gallery row was a
    # photo, so backfilling media_type='image' on upgrade means old rows
    # keep rendering correctly with zero manual data fixup.
    op.add_column(
        'projects',
        sa.Column('media_type', sa.String(), nullable=False, server_default='image'),
    )


def downgrade() -> None:
    op.drop_column('projects', 'media_type')
