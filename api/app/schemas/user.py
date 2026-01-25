"""
User response schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    role: str


class UserResponse(UserBase):
    """Full user response."""
    id: UUID
    email_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class CurrentUserResponse(BaseModel):
    """Response for /auth/me endpoint."""
    id: UUID
    email: str
    role: str
    email_verified: bool
    is_active: bool
    profile_complete: Optional[bool] = None
    profile_completion_percentage: Optional[int] = None
    worker_profile: Optional[dict] = None
    care_home_profile: Optional[dict] = None
    
    model_config = {"from_attributes": True}
