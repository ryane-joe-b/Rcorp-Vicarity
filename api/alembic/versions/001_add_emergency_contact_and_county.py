"""Add emergency contact and county fields to worker_profile

Revision ID: 001
Revises:
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add county field to worker_profiles
    op.add_column('worker_profiles', sa.Column('county', sa.String(length=100), nullable=True))

    # Add emergency contact fields to worker_profiles
    op.add_column('worker_profiles', sa.Column('emergency_contact_name', sa.String(length=200), nullable=True))
    op.add_column('worker_profiles', sa.Column('emergency_contact_phone', sa.String(length=20), nullable=True))
    op.add_column('worker_profiles', sa.Column('emergency_contact_relationship', sa.String(length=50), nullable=True))


def downgrade():
    # Remove emergency contact fields
    op.drop_column('worker_profiles', 'emergency_contact_relationship')
    op.drop_column('worker_profiles', 'emergency_contact_phone')
    op.drop_column('worker_profiles', 'emergency_contact_name')

    # Remove county field
    op.drop_column('worker_profiles', 'county')
