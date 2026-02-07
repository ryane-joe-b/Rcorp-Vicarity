"""Add emergency contact and county fields

Revision ID: 001_add_emergency_contact_and_county
Revises:
Create Date: 2026-02-06

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '001_add_emergency_contact_and_county'
down_revision = None
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
