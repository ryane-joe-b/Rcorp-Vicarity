"""
Job model - job postings by care homes.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Numeric, Integer, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class ShiftType(str, enum.Enum):
    DAY = "day"
    NIGHT = "night"
    LONG_DAY = "long_day"
    WAKING_NIGHT = "waking_night"


class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    care_home_id = Column(UUID(as_uuid=True), ForeignKey("care_home_profiles.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    shift_type = Column(Enum(ShiftType), nullable=False)
    location = Column(String(255), nullable=True)
    postcode = Column(String(20), nullable=True)
    hourly_rate_min = Column(Numeric(6, 2), nullable=True)
    hourly_rate_max = Column(Numeric(6, 2), nullable=True)
    hours_per_week = Column(Integer, nullable=True)
    required_qualifications = Column(JSONB, default=list, nullable=False)
    benefits = Column(JSONB, default=list, nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    care_home = relationship("CareHomeProfile", backref="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job {self.title}>"
