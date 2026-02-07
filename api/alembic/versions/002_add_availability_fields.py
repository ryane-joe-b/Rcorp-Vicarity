"""Add hours_per_week and available_start_date fields

Revision ID: 002_add_availability_fields
Revises: 001_add_emergency_contact_and_county
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '002_add_availability_fields'
down_revision = '001_add_emergency_contact_and_county'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade():
    """Add hours_per_week and available_start_date fields to worker_profiles."""
    # Add hours_per_week field (nullable integer)
    if not column_exists('worker_profiles', 'hours_per_week'):
        op.add_column('worker_profiles', sa.Column('hours_per_week', sa.Integer(), nullable=True))

    # Add available_start_date field (nullable date)
    if not column_exists('worker_profiles', 'available_start_date'):
        op.add_column('worker_profiles', sa.Column('available_start_date', sa.Date(), nullable=True))


def downgrade():
    """Remove hours_per_week and available_start_date fields."""
    if column_exists('worker_profiles', 'available_start_date'):
        op.drop_column('worker_profiles', 'available_start_date')

    if column_exists('worker_profiles', 'hours_per_week'):
        op.drop_column('worker_profiles', 'hours_per_week')
