"""Rename hourly rate fields

Revision ID: 003_rename_hourly_rate_fields
Revises: 002_add_availability_fields
Create Date: 2026-02-06

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '003_rename_hourly_rate_fields'
down_revision = '002_add_availability_fields'
branch_labels = None
depends_on = None


def upgrade():
    """
    No-op migration.
    Fields already exist in the model with correct names.
    This migration exists only to maintain Alembic version history.
    """
    pass


def downgrade():
    """No-op downgrade."""
    pass
