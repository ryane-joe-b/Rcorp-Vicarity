"""Add emergency contact and county fields to worker_profile

Revision ID: 001_add_emergency_contact_and_county
Revises:
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '001_add_emergency_contact_and_county'
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
    # Add county field to worker_profiles (if not exists)
    if not column_exists('worker_profiles', 'county'):
        op.add_column('worker_profiles', sa.Column('county', sa.String(length=100), nullable=True))

    # Add emergency contact fields to worker_profiles (if not exists)
    if not column_exists('worker_profiles', 'emergency_contact_name'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_name', sa.String(length=200), nullable=True))

    if not column_exists('worker_profiles', 'emergency_contact_phone'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_phone', sa.String(length=20), nullable=True))

    if not column_exists('worker_profiles', 'emergency_contact_relationship'):
        op.add_column('worker_profiles', sa.Column('emergency_contact_relationship', sa.String(length=50), nullable=True))


def downgrade():
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
