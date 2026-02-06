"""Add worker profile fields for onboarding

Revision ID: 001_add_worker_profile_fields
Revises:
Create Date: 2026-02-06

Adds all missing fields for complete worker onboarding:
- Emergency contact fields (name, phone, relationship)
- County field for address
- Availability fields (hours_per_week, available_start_date)
- Renames hourly_rate fields to include _pence suffix
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '001_add_worker_profile_fields'
down_revision = None
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade():
    """Add all worker profile fields needed for onboarding."""

    # Add county field if it doesn't exist
    if not column_exists('worker_profiles', 'county'):
        op.add_column('worker_profiles', sa.Column('county', sa.String(length=100), nullable=True))

    # Add emergency contact fields if they don't exist
    if not column_exists('worker_profiles', 'emergency_contact_name'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_name', sa.String(length=200), nullable=True))

    if not column_exists('worker_profiles', 'emergency_contact_phone'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_phone', sa.String(length=20), nullable=True))

    if not column_exists('worker_profiles', 'emergency_contact_relationship'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_relationship', sa.String(length=50), nullable=True))

    # Add availability fields if they don't exist
    if not column_exists('worker_profiles', 'hours_per_week'):
        op.add_column('worker_profiles', sa.Column('hours_per_week', sa.Integer(), nullable=True))

    if not column_exists('worker_profiles', 'available_start_date'):
        op.add_column('worker_profiles', sa.Column('available_start_date', sa.Date(), nullable=True))

    # Rename hourly_rate_min to hourly_rate_min_pence if old column exists
    if column_exists('worker_profiles', 'hourly_rate_min') and not column_exists('worker_profiles', 'hourly_rate_min_pence'):
        op.alter_column('worker_profiles', 'hourly_rate_min', new_column_name='hourly_rate_min_pence')
    elif not column_exists('worker_profiles', 'hourly_rate_min_pence'):
        # If neither exists, create the new one
        op.add_column('worker_profiles', sa.Column('hourly_rate_min_pence', sa.Integer(), nullable=True))

    # Rename hourly_rate_max to hourly_rate_max_pence if old column exists
    if column_exists('worker_profiles', 'hourly_rate_max') and not column_exists('worker_profiles', 'hourly_rate_max_pence'):
        op.alter_column('worker_profiles', 'hourly_rate_max', new_column_name='hourly_rate_max_pence')
    elif not column_exists('worker_profiles', 'hourly_rate_max_pence'):
        # If neither exists, create the new one
        op.add_column('worker_profiles', sa.Column('hourly_rate_max_pence', sa.Integer(), nullable=True))


def downgrade():
    """Remove all worker profile fields."""

    # Remove in reverse order
    if column_exists('worker_profiles', 'hourly_rate_max_pence'):
        if not column_exists('worker_profiles', 'hourly_rate_max'):
            op.alter_column('worker_profiles', 'hourly_rate_max_pence', new_column_name='hourly_rate_max')
        else:
            op.drop_column('worker_profiles', 'hourly_rate_max_pence')

    if column_exists('worker_profiles', 'hourly_rate_min_pence'):
        if not column_exists('worker_profiles', 'hourly_rate_min'):
            op.alter_column('worker_profiles', 'hourly_rate_min_pence', new_column_name='hourly_rate_min')
        else:
            op.drop_column('worker_profiles', 'hourly_rate_min_pence')

    if column_exists('worker_profiles', 'available_start_date'):
        op.drop_column('worker_profiles', 'available_start_date')

    if column_exists('worker_profiles', 'hours_per_week'):
        op.drop_column('worker_profiles', 'hours_per_week')

    if column_exists('worker_profiles', 'emergency_contact_relationship'):
        op.drop_column('worker_profiles', 'emergency_contact_relationship')

    if column_exists('worker_profiles', 'emergency_contact_phone'):
        op.drop_column('worker_profiles', 'emergency_contact_phone')

    if column_exists('worker_profiles', 'emergency_contact_name'):
        op.drop_column('worker_profiles', 'emergency_contact_name')

    if column_exists('worker_profiles', 'county'):
        op.drop_column('worker_profiles', 'county')
