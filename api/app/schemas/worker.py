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
    city: Optional[str] = None
    postcode: Optional[str] = None
    
    # Step 2
    dbs_status: Optional[str] = None
    dbs_certificate_number: Optional[str] = None
    dbs_issue_date: Optional[date] = None
    dbs_expiry_date: Optional[date] = None
    dbs_document_url: Optional[str] = None
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
    travel_radius_miles: Optional[int] = None
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None
    willing_to_travel: Optional[bool] = None
    has_own_transport: Optional[bool] = None
    
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
    
    # Qualifications
    dbs_status: str
    dbs_expiry_date: Optional[date]
    qualifications: List[Dict[str, Any]]
    
    # Skills
    years_experience: Optional[str]
    specializations: List[str]
    languages: List[str]
    bio: Optional[str]
    
    # Availability
    available_days: List[str]
    shift_types: List[str]
    travel_radius_miles: Optional[int]
    hourly_rate_min: Optional[int]
    hourly_rate_max: Optional[int]
    
    class Config:
        from_attributes = True
