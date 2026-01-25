"""
User model - core authentication entity.
"""

import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    WORKER = "worker"
    CARE_HOME_ADMIN = "care_home_admin"
    CARE_HOME_STAFF = "care_home_staff"
    ADMIN = "admin"


class User(Base):
    """
    User model for authentication.
    
    All users (workers and care home staff) have a record here.
    Role determines which profile table to reference.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.WORKER)
    
    # Email verification
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_token = Column(String(500), nullable=True)
    email_verification_sent_at = Column(DateTime, nullable=True)
    
    # Password reset
    password_reset_token = Column(String(500), nullable=True)
    password_reset_sent_at = Column(DateTime, nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    worker_profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    care_home_profile = relationship("CareHomeProfile", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"
    
    @property
    def is_worker(self) -> bool:
        return self.role == UserRole.WORKER
    
    @property
    def is_care_home(self) -> bool:
        return self.role in [UserRole.CARE_HOME_ADMIN, UserRole.CARE_HOME_STAFF]
