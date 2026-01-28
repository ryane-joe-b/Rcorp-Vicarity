"""
Care home profile router - profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_care_home
from app.models.user import User
from app.models.care_home_profile import CareHomeProfile
from app.schemas.care_home import CareHomeProfileUpdate, CareHomeProfileResponse


router = APIRouter(prefix="/care-home", tags=["care-home-profile"])


@router.get("/profile", response_model=CareHomeProfileResponse)
def get_care_home_profile(
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    Get current care home's profile.
    """
    if not current_user.care_home_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Care home profile not found",
        )
    
    return current_user.care_home_profile


@router.put("/profile", response_model=CareHomeProfileResponse)
def update_care_home_profile(
    update_data: CareHomeProfileUpdate,
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    Update care home profile.
    
    Automatically recalculates completion percentage.
    """
    profile = current_user.care_home_profile
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Care home profile not found",
        )
    
    # Update fields that were provided
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
    
    # Recalculate completion percentage
    profile.profile_completion_percentage = str(profile.calculate_completion_percentage())
    
    db.commit()
    db.refresh(profile)
    
    return profile
