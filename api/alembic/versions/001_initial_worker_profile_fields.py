"""Initial migration: Add all worker profile fields for complete onboarding

Revision ID: 001_initial_worker_profile_fields
Revises:
Create Date: 2026-02-06

This migration adds all fields needed for the complete worker onboarding process.
It is idempotent and safe to run on both fresh and existing databases.

Fields added:
- county (for UK addresses)
- emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- hours_per_week (availability)
- available_start_date (availability)

Fields renamed (if they exist with old names):
- hourly_rate_min -> hourly_rate_min_pence
- hourly_rate_max -> hourly_rate_max_pence
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '001_initial_worker_profile_fields'
down_revision = None
branch_labels = None
depends_on = None


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    try:
        bind = op.get_bind()
        inspector: Inspector = inspect(bind)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception as e:
        print(f"Error checking column existence: {e}")
        return False


def upgrade():
    """
    Add all worker profile fields needed for complete onboarding.
    Safe to run multiple times - checks if columns exist before modifying.
    """

    # 1. Add county field
    if not column_exists('worker_profiles', 'county'):
        op.add_column('worker_profiles', sa.Column('county', sa.String(length=100), nullable=True))
        print("✓ Added county field")
    else:
        print("✓ County field already exists")

    # 2. Add emergency contact fields
    if not column_exists('worker_profiles', 'emergency_contact_name'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_name', sa.String(length=200), nullable=True))
        print("✓ Added emergency_contact_name field")
    else:
        print("✓ emergency_contact_name field already exists")

    if not column_exists('worker_profiles', 'emergency_contact_phone'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_phone', sa.String(length=20), nullable=True))
        print("✓ Added emergency_contact_phone field")
    else:
        print("✓ emergency_contact_phone field already exists")

    if not column_exists('worker_profiles', 'emergency_contact_relationship'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_relationship', sa.String(length=50), nullable=True))
        print("✓ Added emergency_contact_relationship field")
    else:
        print("✓ emergency_contact_relationship field already exists")

    # 3. Add availability fields
    if not column_exists('worker_profiles', 'hours_per_week'):
        op.add_column('worker_profiles', sa.Column('hours_per_week', sa.Integer(), nullable=True))
        print("✓ Added hours_per_week field")
    else:
        print("✓ hours_per_week field already exists")

    if not column_exists('worker_profiles', 'available_start_date'):
        op.add_column('worker_profiles', sa.Column('available_start_date', sa.Date(), nullable=True))
        print("✓ Added available_start_date field")
    else:
        print("✓ available_start_date field already exists")

    # 4. Rename hourly rate fields to include _pence suffix
    has_old_min = column_exists('worker_profiles', 'hourly_rate_min')
    has_new_min = column_exists('worker_profiles', 'hourly_rate_min_pence')

    if has_old_min and not has_new_min:
        op.alter_column('worker_profiles', 'hourly_rate_min', new_column_name='hourly_rate_min_pence')
        print("✓ Renamed hourly_rate_min to hourly_rate_min_pence")
    elif not has_old_min and not has_new_min:
        # Neither exists, create the new one
        op.add_column('worker_profiles', sa.Column('hourly_rate_min_pence', sa.Integer(), nullable=True))
        print("✓ Added hourly_rate_min_pence field")
    else:
        print("✓ hourly_rate_min_pence field already exists")

    has_old_max = column_exists('worker_profiles', 'hourly_rate_max')
    has_new_max = column_exists('worker_profiles', 'hourly_rate_max_pence')

    if has_old_max and not has_new_max:
        op.alter_column('worker_profiles', 'hourly_rate_max', new_column_name='hourly_rate_max_pence')
        print("✓ Renamed hourly_rate_max to hourly_rate_max_pence")
    elif not has_old_max and not has_new_max:
        # Neither exists, create the new one
        op.add_column('worker_profiles', sa.Column('hourly_rate_max_pence', sa.Integer(), nullable=True))
        print("✓ Added hourly_rate_max_pence field")
    else:
        print("✓ hourly_rate_max_pence field already exists")

    print("✅ Migration completed successfully")


def downgrade():
    """
    Remove all worker profile fields added by this migration.
    Reverses the changes in reverse order.
    """

    # Reverse hourly rate renames
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

    # Remove availability fields
    if column_exists('worker_profiles', 'available_start_date'):
        op.drop_column('worker_profiles', 'available_start_date')

    if column_exists('worker_profiles', 'hours_per_week'):
        op.drop_column('worker_profiles', 'hours_per_week')

    # Remove emergency contact fields
    if column_exists('worker_profiles', 'emergency_contact_relationship'):
        op.drop_column('worker_profiles', 'emergency_contact_relationship')

    if column_exists('worker_profiles', 'emergency_contact_phone'):
        op.drop_column('worker_profiles', 'emergency_contact_phone')

    if column_exists('worker_profiles', 'emergency_contact_name'):
        op.drop_column('worker_profiles', 'emergency_contact_name')

    # Remove county field
    if column_exists('worker_profiles', 'county'):
        op.drop_column('worker_profiles', 'county')

    print("✅ Downgrade completed successfully")
