"""Rename hourly_rate fields to include _pence suffix

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
    """Rename hourly_rate_min to hourly_rate_min_pence and hourly_rate_max to hourly_rate_max_pence."""
    op.alter_column('worker_profiles', 'hourly_rate_min', new_column_name='hourly_rate_min_pence')
    op.alter_column('worker_profiles', 'hourly_rate_max', new_column_name='hourly_rate_max_pence')


def downgrade():
    """Rename back to original names."""
    op.alter_column('worker_profiles', 'hourly_rate_min_pence', new_column_name='hourly_rate_min')
    op.alter_column('worker_profiles', 'hourly_rate_max_pence', new_column_name='hourly_rate_max')
