"""
Worker profile schemas.
"""

from typing import Optional, List, Dict, Any
from datetime import date
from uuid import UUID
from pydantic import BaseModel


class WorkerProfileUpdate(BaseModel):
    """Request to update worker profile (any step)."""
    # Step 1
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    profile_picture_url: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None

    # Emergency Contact (Optional)
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    
    # Step 2
    dbs_status: Optional[str] = None
    dbs_certificate_number: Optional[str] = None
    dbs_issue_date: Optional[date] = None
    dbs_expiry_date: Optional[date] = None
    dbs_document_url: Optional[str] = None
    right_to_work_status: Optional[str] = None
    qualifications: Optional[List[Dict[str, Any]]] = None
    
    # Step 3
    years_experience: Optional[str] = None
    specializations: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    bio: Optional[str] = None
    
    # Step 4
    available_days: Optional[List[str]] = None
    shift_types: Optional[List[str]] = None
    hours_per_week: Optional[int] = None
    travel_radius_miles: Optional[int] = None
    hourly_rate_min_pence: Optional[int] = None
    hourly_rate_max_pence: Optional[int] = None
    willing_to_travel: Optional[bool] = None
    has_own_transport: Optional[bool] = None
    available_start_date: Optional[date] = None
    
    # Wizard step tracking
    current_step: Optional[int] = None


class WorkerProfileResponse(BaseModel):
    """Worker profile response."""
    id: UUID
    user_id: UUID
    profile_completion_status: str
    profile_completion_percentage: int
    current_step: int
    
    # Personal
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    date_of_birth: Optional[date]
    profile_picture_url: Optional[str]
    address_line_1: Optional[str]
    address_line_2: Optional[str]
    city: Optional[str]
    county: Optional[str]
    postcode: Optional[str]

    # Emergency Contact
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    emergency_contact_relationship: Optional[str]

    # Qualifications
    dbs_status: Optional[str] = None
    dbs_expiry_date: Optional[date] = None
    right_to_work_status: Optional[str] = None
    qualifications: Optional[List[Dict[str, Any]]] = None

    # Skills
    years_experience: Optional[str] = None
    specializations: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    bio: Optional[str] = None

    # Availability
    available_days: Optional[List[str]] = None
    shift_types: Optional[List[str]] = None
    hours_per_week: Optional[int] = None
    travel_radius_miles: Optional[int] = None
    hourly_rate_min_pence: Optional[int] = None
    hourly_rate_max_pence: Optional[int] = None
    has_own_transport: Optional[bool] = None
    available_start_date: Optional[date] = None
    
    model_config = {"from_attributes": True}
