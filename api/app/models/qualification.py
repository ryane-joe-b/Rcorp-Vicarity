"""
Qualification model - master list of care qualifications.
"""

import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class QualificationCategory(str, enum.Enum):
    """Qualification category."""
    MANDATORY = "mandatory"       # Required for all care workers
    CLINICAL = "clinical"         # Clinical/medical qualifications
    SPECIALIZED = "specialized"   # Specialization certifications
    TRAINING = "training"         # Training courses
    PROFESSIONAL = "professional" # Professional qualifications (NVQ, etc.)


class Qualification(Base):
    """
    Master list of qualifications that care workers can have.
    
    Seeded with standard UK care qualifications.
    Can be expanded by admins.
    """
    __tablename__ = "qualifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Qualification Details
    code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "DBS_ENHANCED"
    name = Column(String(255), nullable=False)  # e.g., "Enhanced DBS Check"
    description = Column(Text, nullable=True)
    
    # Category and Requirements
    category = Column(Enum(QualificationCategory), nullable=False)
    is_mandatory = Column(Boolean, default=False, nullable=False)
    
    # Expiry
    typical_expiry_months = Column(Integer, nullable=True)  # None = never expires
    requires_document = Column(Boolean, default=True, nullable=False)
    
    # Display
    display_order = Column(Integer, default=100, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Qualification {self.code}: {self.name}>"


# Seed data for qualifications
SEED_QUALIFICATIONS = [
    # Mandatory
    {
        "code": "DBS_ENHANCED",
        "name": "Enhanced DBS Check",
        "description": "Enhanced Disclosure and Barring Service check with barred list check",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 36,
        "display_order": 1,
    },
    {
        "code": "SAFEGUARDING_ADULTS",
        "name": "Safeguarding Adults",
        "description": "Safeguarding adults training (Level 2 or above)",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 12,
        "display_order": 2,
    },
    {
        "code": "MOVING_HANDLING",
        "name": "Moving & Handling",
        "description": "Manual handling and moving of people",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 12,
        "display_order": 3,
    },
    {
        "code": "BASIC_LIFE_SUPPORT",
        "name": "Basic Life Support",
        "description": "BLS and CPR training",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 12,
        "display_order": 4,
    },
    {
        "code": "INFECTION_CONTROL",
        "name": "Infection Control",
        "description": "Infection prevention and control training",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 12,
        "display_order": 5,
    },
    {
        "code": "FIRE_SAFETY",
        "name": "Fire Safety",
        "description": "Fire safety awareness training",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 12,
        "display_order": 6,
    },
    {
        "code": "HEALTH_SAFETY",
        "name": "Health & Safety",
        "description": "Health and safety at work",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": True,
        "typical_expiry_months": 36,
        "display_order": 7,
    },
    {
        "code": "FOOD_HYGIENE",
        "name": "Food Hygiene Level 2",
        "description": "Food safety and hygiene certification",
        "category": QualificationCategory.MANDATORY,
        "is_mandatory": False,
        "typical_expiry_months": 36,
        "display_order": 8,
    },
    
    # Clinical
    {
        "code": "MEDICATION_ADMIN",
        "name": "Medication Administration",
        "description": "Safe administration of medication",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 12,
        "display_order": 20,
    },
    {
        "code": "FIRST_AID_LVL3",
        "name": "First Aid at Work (Level 3)",
        "description": "First aid at work qualification",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 36,
        "display_order": 21,
    },
    {
        "code": "DIABETES_CARE",
        "name": "Diabetes Awareness",
        "description": "Diabetes care and management",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 22,
    },
    {
        "code": "CATHETER_CARE",
        "name": "Catheter Care",
        "description": "Catheter care and management",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 23,
    },
    {
        "code": "PEG_FEEDING",
        "name": "PEG Feeding",
        "description": "Percutaneous endoscopic gastrostomy feeding",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 24,
    },
    {
        "code": "STOMA_CARE",
        "name": "Stoma Care",
        "description": "Stoma care and management",
        "category": QualificationCategory.CLINICAL,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 25,
    },
    
    # Specialized
    {
        "code": "DEMENTIA_AWARENESS",
        "name": "Dementia Awareness",
        "description": "Understanding and caring for people with dementia",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 40,
    },
    {
        "code": "END_OF_LIFE",
        "name": "End of Life Care",
        "description": "Palliative and end of life care",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 41,
    },
    {
        "code": "MENTAL_HEALTH",
        "name": "Mental Health Awareness",
        "description": "Mental health awareness and support",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 42,
    },
    {
        "code": "LEARNING_DISABILITY",
        "name": "Learning Disabilities",
        "description": "Supporting people with learning disabilities",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 43,
    },
    {
        "code": "AUTISM_AWARENESS",
        "name": "Autism Awareness",
        "description": "Understanding and supporting autistic individuals",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 44,
    },
    {
        "code": "CHALLENGING_BEHAVIOUR",
        "name": "Positive Behaviour Support",
        "description": "Managing challenging behaviour",
        "category": QualificationCategory.SPECIALIZED,
        "is_mandatory": False,
        "typical_expiry_months": 24,
        "display_order": 45,
    },
    
    # Professional Qualifications
    {
        "code": "NVQ_LVL2",
        "name": "NVQ Level 2 Health & Social Care",
        "description": "National Vocational Qualification in Health and Social Care",
        "category": QualificationCategory.PROFESSIONAL,
        "is_mandatory": False,
        "typical_expiry_months": None,  # Never expires
        "display_order": 60,
    },
    {
        "code": "NVQ_LVL3",
        "name": "NVQ Level 3 Health & Social Care",
        "description": "National Vocational Qualification in Health and Social Care",
        "category": QualificationCategory.PROFESSIONAL,
        "is_mandatory": False,
        "typical_expiry_months": None,
        "display_order": 61,
    },
    {
        "code": "CARE_CERTIFICATE",
        "name": "Care Certificate",
        "description": "Care Certificate completion",
        "category": QualificationCategory.PROFESSIONAL,
        "is_mandatory": False,
        "typical_expiry_months": None,
        "display_order": 62,
    },
    {
        "code": "NURSING_DEGREE",
        "name": "Nursing Degree",
        "description": "Registered Nurse qualification",
        "category": QualificationCategory.PROFESSIONAL,
        "is_mandatory": False,
        "typical_expiry_months": None,
        "display_order": 63,
    },
]


def seed_qualifications(db):
    """
    Seed the qualifications table with standard UK care qualifications.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        Number of qualifications seeded
    """
    count = 0
    
    for qual_data in SEED_QUALIFICATIONS:
        # Check if qualification already exists
        existing = db.query(Qualification).filter(
            Qualification.code == qual_data["code"]
        ).first()
        
        if not existing:
            qualification = Qualification(**qual_data)
            db.add(qualification)
            count += 1
    
    db.commit()
    return count
