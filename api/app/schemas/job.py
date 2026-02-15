"""
Job schemas.
"""

from typing import Optional, List, Any
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    shift_type: str
    location: Optional[str] = None
    postcode: Optional[str] = None
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    hours_per_week: Optional[int] = None
    required_qualifications: Optional[List[Any]] = []
    benefits: Optional[List[Any]] = []


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    shift_type: Optional[str] = None
    location: Optional[str] = None
    postcode: Optional[str] = None
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    hours_per_week: Optional[int] = None
    required_qualifications: Optional[List[Any]] = None
    benefits: Optional[List[Any]] = None
    status: Optional[str] = None


class CareHomeInfo(BaseModel):
    id: UUID
    business_name: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    verification_status: Optional[str] = None

    model_config = {"from_attributes": True}


class JobResponse(BaseModel):
    id: UUID
    care_home_id: UUID
    care_home: Optional[CareHomeInfo] = None
    title: str
    description: Optional[str] = None
    shift_type: str
    location: Optional[str] = None
    postcode: Optional[str] = None
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    hours_per_week: Optional[int] = None
    required_qualifications: List[Any] = []
    benefits: List[Any] = []
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    per_page: int
