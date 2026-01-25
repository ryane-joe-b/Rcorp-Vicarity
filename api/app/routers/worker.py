"""
Worker profile router - profile completion and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_worker
from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.schemas.worker import WorkerProfileUpdate, WorkerProfileResponse


router = APIRouter(prefix="/api/worker", tags=["worker-profile"])


@router.get("/profile", response_model=WorkerProfileResponse)
def get_worker_profile(
    current_user: User = Depends(get_current_worker),
    db: Session = Depends(get_db)
):
    """
    Get current worker's profile.
    """
    if not current_user.worker_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found",
        )
    
    return current_user.worker_profile


@router.put("/profile", response_model=WorkerProfileResponse)
def update_worker_profile(
    update_data: WorkerProfileUpdate,
    current_user: User = Depends(get_current_worker),
    db: Session = Depends(get_db)
):
    """
    Update worker profile.
    
    Can update any fields. Automatically recalculates completion percentage.
    Used for profile wizard (step-by-step) and profile editing.
    """
    profile = current_user.worker_profile
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found",
        )
    
    # Update fields that were provided
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
    
    # Recalculate completion
    profile.update_completion_status()
    
    db.commit()
    db.refresh(profile)
    
    return profile
