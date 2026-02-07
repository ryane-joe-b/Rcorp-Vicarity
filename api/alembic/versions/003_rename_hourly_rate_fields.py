"""Rename hourly_rate fields to include _pence suffix

Revision ID: 003_rename_hourly_rate_fields
Revises: 002_add_availability_fields
Create Date: 2026-02-06

"""
from alembic import op
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '003_rename_hourly_rate_fields'
down_revision = '002_add_availability_fields'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade():
    """Rename hourly_rate_min to hourly_rate_min_pence and hourly_rate_max to hourly_rate_max_pence."""
    # Only rename if old column exists and new one doesn't
    if column_exists('worker_profiles', 'hourly_rate_min') and not column_exists('worker_profiles', 'hourly_rate_min_pence'):
        op.alter_column('worker_profiles', 'hourly_rate_min', new_column_name='hourly_rate_min_pence')

    if column_exists('worker_profiles', 'hourly_rate_max') and not column_exists('worker_profiles', 'hourly_rate_max_pence'):
        op.alter_column('worker_profiles', 'hourly_rate_max', new_column_name='hourly_rate_max_pence')


def downgrade():
    """Rename back to original names."""
    if column_exists('worker_profiles', 'hourly_rate_min_pence') and not column_exists('worker_profiles', 'hourly_rate_min'):
        op.alter_column('worker_profiles', 'hourly_rate_min_pence', new_column_name='hourly_rate_min')

    if column_exists('worker_profiles', 'hourly_rate_max_pence') and not column_exists('worker_profiles', 'hourly_rate_max'):
        op.alter_column('worker_profiles', 'hourly_rate_max_pence', new_column_name='hourly_rate_max')
