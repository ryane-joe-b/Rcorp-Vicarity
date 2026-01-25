"""
FastAPI dependencies for authentication and authorization.
"""

from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token, TokenType
from app.models.user import User, UserRole


# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to get the current authenticated user.
    Validates JWT token and returns user from database.
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if payload.get("type") != TokenType.ACCESS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    return user


def get_current_verified_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure user has verified their email.
    """
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )
    
    return current_user


def get_current_worker(
    current_user: User = Depends(get_current_verified_user),
) -> User:
    """
    Dependency to ensure user is a care worker.
    """
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to care workers only",
        )
    
    return current_user


def get_current_care_home(
    current_user: User = Depends(get_current_verified_user),
) -> User:
    """
    Dependency to ensure user is a care home admin/staff.
    """
    if current_user.role not in [UserRole.CARE_HOME_ADMIN, UserRole.CARE_HOME_STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to care home users only",
        )
    
    return current_user


def get_current_worker_with_complete_profile(
    current_user: User = Depends(get_current_worker),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to ensure worker has completed their profile.
    Used for job board access, applications, etc.
    """
    if not current_user.worker_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please complete your profile first",
        )
    
    if not current_user.worker_profile.is_complete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Profile {current_user.worker_profile.profile_completion_percentage}% complete. Please finish your profile to access this feature.",
        )
    
    return current_user
