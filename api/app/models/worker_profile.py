"""
Worker profile model - care worker specific data.
"""

import enum
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProfileCompletionStatus(str, enum.Enum):
    """Profile completion status."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"


class DBSStatus(str, enum.Enum):
    """DBS check status."""
    NOT_CHECKED = "not_checked"
    BASIC = "basic"
    STANDARD = "standard"
    ENHANCED = "enhanced"
    ENHANCED_BARRED = "enhanced_barred"
    PENDING = "pending"
    EXPIRED = "expired"


class WorkerProfile(Base):
    """
    Worker profile with all care worker specific information.
    
    Must be completed before accessing job board.
    Profile completion percentage determines access.
    """
    __tablename__ = "worker_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Profile completion tracking
    profile_completion_status = Column(
        Enum(ProfileCompletionStatus), 
        default=ProfileCompletionStatus.NOT_STARTED, 
        nullable=False
    )
    profile_completion_percentage = Column(Integer, default=0, nullable=False)
    current_step = Column(Integer, default=1, nullable=False)  # 1-4 for wizard steps
    
    # Personal Details (Step 1 - 20%)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postcode = Column(String(20), nullable=True)
    
    # Qualifications (Step 2 - 30%)
    dbs_status = Column(Enum(DBSStatus), default=DBSStatus.NOT_CHECKED, nullable=False)
    dbs_certificate_number = Column(String(50), nullable=True)
    dbs_issue_date = Column(Date, nullable=True)
    dbs_expiry_date = Column(Date, nullable=True)
    dbs_document_url = Column(String(500), nullable=True)
    
    # JSONB array of qualification objects
    # [{"code": "FIRST_AID_LVL3", "expiry_date": "2025-01-01", "document_url": "..."}]
    qualifications = Column(JSONB, default=list, nullable=False)
    
    # Skills & Experience (Step 3 - 25%)
    years_experience = Column(String(20), nullable=True)  # "0-1", "1-3", "3-5", "5+"
    specializations = Column(ARRAY(String), default=list, nullable=False)  # elderly, dementia, etc.
    languages = Column(ARRAY(String), default=list, nullable=False)
    soft_skills = Column(ARRAY(String), default=list, nullable=False)
    bio = Column(Text, nullable=True)
    
    # Availability & Preferences (Step 4 - 25%)
    available_days = Column(ARRAY(String), default=list, nullable=False)  # mon, tue, wed, etc.
    shift_types = Column(ARRAY(String), default=list, nullable=False)  # day, night, twilight, weekend
    travel_radius_miles = Column(Integer, nullable=True)
    hourly_rate_min = Column(Integer, nullable=True)  # in pence
    hourly_rate_max = Column(Integer, nullable=True)  # in pence
    willing_to_travel = Column(Boolean, default=True, nullable=False)
    has_own_transport = Column(Boolean, default=False, nullable=False)
    
    # Right to work
    right_to_work_status = Column(String(50), nullable=True)
    right_to_work_document_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="worker_profile")

    def __repr__(self):
        return f"<WorkerProfile {self.first_name} {self.last_name}>"
    
    def calculate_completion_percentage(self) -> int:
        """Calculate profile completion percentage based on filled fields."""
        total = 0
        
        # Step 1: Personal Details (20%)
        step1_fields = [self.first_name, self.last_name, self.phone, self.date_of_birth]
        step1_filled = sum(1 for f in step1_fields if f)
        total += int((step1_filled / len(step1_fields)) * 20)
        
        # Step 2: Qualifications (30%)
        step2_score = 0
        if self.dbs_status != DBSStatus.NOT_CHECKED:
            step2_score += 15
        if self.qualifications and len(self.qualifications) > 0:
            step2_score += 15
        total += step2_score
        
        # Step 3: Skills & Experience (25%)
        step3_fields = [self.years_experience, self.specializations, self.bio]
        step3_filled = sum(1 for f in step3_fields if f)
        total += int((step3_filled / len(step3_fields)) * 25)
        
        # Step 4: Availability (25%)
        step4_fields = [self.available_days, self.shift_types, self.travel_radius_miles]
        step4_filled = sum(1 for f in step4_fields if f)
        total += int((step4_filled / len(step4_fields)) * 25)
        
        return min(total, 100)
    
    def update_completion_status(self):
        """Update the completion status based on percentage."""
        self.profile_completion_percentage = self.calculate_completion_percentage()
        
        if self.profile_completion_percentage == 0:
            self.profile_completion_status = ProfileCompletionStatus.NOT_STARTED
        elif self.profile_completion_percentage < 100:
            self.profile_completion_status = ProfileCompletionStatus.IN_PROGRESS
        else:
            self.profile_completion_status = ProfileCompletionStatus.COMPLETE
    
    @property
    def is_complete(self) -> bool:
        return self.profile_completion_status == ProfileCompletionStatus.COMPLETE
