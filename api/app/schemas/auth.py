"""
Authentication request/response schemas.
"""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request to register a new user."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    user_type: str = Field(..., pattern="^(worker|care_home)$")


class RegisterResponse(BaseModel):
    """Response after successful registration."""
    user_id: UUID
    email: str
    message: str = "Verification email sent"


class LoginRequest(BaseModel):
    """Request to login."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Response after successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    user_type: str
    email_verified: bool
    profile_complete: Optional[bool] = None  # Only for workers
    

class VerifyEmailRequest(BaseModel):
    """Request to verify email."""
    token: str


class VerifyEmailResponse(BaseModel):
    """Response after email verification."""
    success: bool
    message: str
    redirect_to: str


class RefreshTokenRequest(BaseModel):
    """Request to refresh access token."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Response with new access token."""
    access_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    """Request to reset password."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Confirm password reset with token."""
    token: str
    new_password: str = Field(..., min_length=8)
