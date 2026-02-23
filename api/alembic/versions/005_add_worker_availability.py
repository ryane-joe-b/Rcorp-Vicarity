"""Add is_available to worker_profiles

Revision ID: 005_add_worker_availability
Revises: 004_add_jobs_and_applications
Create Date: 2026-02-23

"""
from alembic import op
import sqlalchemy as sa

revision = '005_add_worker_availability'
down_revision = '004_add_jobs_and_applications'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns('worker_profiles')]
    if 'is_available' not in cols:
        op.add_column('worker_profiles',
            sa.Column('is_available', sa.Boolean(), nullable=False, server_default='false'))


def downgrade():
    op.drop_column('worker_profiles', 'is_available')
