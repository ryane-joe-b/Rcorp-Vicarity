"""
Care home profile schemas.
"""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class CareHomeProfileUpdate(BaseModel):
    """Request to update care home profile."""
    business_name: Optional[str] = None
    business_registration_number: Optional[str] = None
    cqc_provider_id: Optional[str] = None
    cqc_location_id: Optional[str] = None
    care_home_type: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    phone: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    number_of_beds: Optional[str] = None


class CareHomeProfileResponse(BaseModel):
    """Care home profile response."""
    id: UUID
    user_id: UUID
    business_name: Optional[str]
    cqc_provider_id: Optional[str]
    cqc_rating: Optional[str]
    care_home_type: Optional[str]
    contact_name: Optional[str]
    phone: Optional[str]
    address_line_1: Optional[str]
    city: Optional[str]
    postcode: Optional[str]
    website: Optional[str]
    description: Optional[str]
    verification_status: str
    profile_completion_percentage: str
    
    model_config = {"from_attributes": True}
