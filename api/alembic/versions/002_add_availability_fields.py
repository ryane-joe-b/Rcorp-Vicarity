"""Add availability fields

Revision ID: 002_add_availability_fields
Revises: 001_add_emergency_contact_and_county
Create Date: 2026-02-06

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '002_add_availability_fields'
down_revision = '001_add_emergency_contact_and_county'
branch_labels = None
depends_on = None


def upgrade():
    """
    No-op migration.
    Fields already exist in the model and were created by SQLAlchemy.
    This migration exists only to maintain Alembic version history.
    """
    pass


def downgrade():
    """No-op downgrade."""
    pass
