"""Add jobs and applications tables

Revision ID: 004_add_jobs_and_applications
Revises: 003_rename_hourly_rate_fields
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_add_jobs_and_applications'
down_revision = '003_rename_hourly_rate_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('care_home_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('care_home_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('shift_type', sa.Enum('day', 'night', 'long_day', 'waking_night', name='shifttype'), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('postcode', sa.String(20), nullable=True),
        sa.Column('hourly_rate_min', sa.Numeric(6, 2), nullable=True),
        sa.Column('hourly_rate_max', sa.Numeric(6, 2), nullable=True),
        sa.Column('hours_per_week', sa.Integer, nullable=True),
        sa.Column('required_qualifications', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('benefits', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('status', sa.Enum('draft', 'active', 'closed', name='jobstatus'), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_jobs_care_home_id', 'jobs', ['care_home_id'])
    op.create_index('ix_jobs_status', 'jobs', ['status'])

    # Create applications table
    op.create_table(
        'applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('worker_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('worker_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'reviewed', 'shortlisted', 'rejected', 'withdrawn', name='applicationstatus'), nullable=False, server_default='pending'),
        sa.Column('cover_note', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('job_id', 'worker_id', name='uq_application_job_worker'),
    )
    op.create_index('ix_applications_worker_id', 'applications', ['worker_id'])
    op.create_index('ix_applications_job_id', 'applications', ['job_id'])


def downgrade():
    op.drop_table('applications')
    op.drop_table('jobs')
    op.execute("DROP TYPE IF EXISTS applicationstatus")
    op.execute("DROP TYPE IF EXISTS jobstatus")
    op.execute("DROP TYPE IF EXISTS shifttype")
