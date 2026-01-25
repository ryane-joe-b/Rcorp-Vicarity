"""
Care Home profile model - care home business specific data.
"""

import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class CareHomeType(str, enum.Enum):
    """Type of care home."""
    RESIDENTIAL = "residential"
    NURSING = "nursing"
    DEMENTIA = "dementia"
    LEARNING_DISABILITY = "learning_disability"
    MENTAL_HEALTH = "mental_health"
    PHYSICAL_DISABILITY = "physical_disability"
    CHILDRENS = "childrens"
    DOMICILIARY = "domiciliary"


class VerificationStatus(str, enum.Enum):
    """Business verification status."""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class CareHomeProfile(Base):
    """
    Care home profile with business information.
    
    Can post jobs immediately after email verification.
    Business verification is optional but provides trust badge.
    """
    __tablename__ = "care_home_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Business Information
    business_name = Column(String(255), nullable=True)
    business_registration_number = Column(String(50), nullable=True)
    cqc_provider_id = Column(String(50), nullable=True)  # CQC Provider ID for verification
    cqc_location_id = Column(String(50), nullable=True)  # CQC Location ID
    cqc_rating = Column(String(50), nullable=True)  # Outstanding, Good, Requires Improvement, Inadequate
    
    # Care Home Type
    care_home_type = Column(Enum(CareHomeType), nullable=True)
    
    # Contact Information
    contact_name = Column(String(200), nullable=True)
    contact_title = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Address
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    county = Column(String(100), nullable=True)
    postcode = Column(String(20), nullable=True)
    
    # Additional Info
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    number_of_beds = Column(String(20), nullable=True)  # Range like "20-50"
    
    # Verification
    verification_status = Column(
        Enum(VerificationStatus), 
        default=VerificationStatus.PENDING, 
        nullable=False
    )
    verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Profile Completion (optional but encouraged)
    profile_completion_percentage = Column(String(10), default="0", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="care_home_profile")

    def __repr__(self):
        return f"<CareHomeProfile {self.business_name}>"
    
    @property
    def is_verified(self) -> bool:
        return self.verification_status == VerificationStatus.VERIFIED
    
    def calculate_completion_percentage(self) -> int:
        """Calculate profile completion percentage."""
        fields = [
            self.business_name,
            self.contact_name,
            self.phone,
            self.address_line_1,
            self.city,
            self.postcode,
            self.care_home_type,
            self.description,
        ]
        filled = sum(1 for f in fields if f)
        return int((filled / len(fields)) * 100)
