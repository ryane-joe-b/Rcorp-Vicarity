"""
Public API endpoints - No authentication required
Used for landing page stats, public information, etc.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile
from app.models.care_home_profile import CareHomeProfile

router = APIRouter()


@router.get("/stats")
async def get_public_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get public statistics for landing page.
    Returns real-time counts from database.
    Cached for 5 minutes to reduce load.
    """
    
    # Count active workers (registered users with worker role)
    worker_count = db.query(User).filter(
        User.role == UserRole.WORKER,
        User.is_active == True
    ).count()
    
    # Count care homes (registered users with care_home_admin role)
    care_home_count = db.query(User).filter(
        User.role == UserRole.CARE_HOME_ADMIN,
        User.is_active == True
    ).count()
    
    # Count completed worker profiles (profile completion = 100%)
    completed_profiles = db.query(WorkerProfile).filter(
        WorkerProfile.profile_completion_percentage == 100
    ).count()
    
    # Count verified care homes
    verified_care_homes = db.query(CareHomeProfile).filter(
        CareHomeProfile.verification_status == "verified"
    ).count()
    
    # Calculate average worker profile completion
    avg_completion = db.query(
        func.avg(WorkerProfile.profile_completion_percentage)
    ).scalar() or 0
    
    # Get recent user registrations (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_workers = db.query(User).filter(
        User.role == UserRole.WORKER,
        User.created_at >= week_ago
    ).count()
    
    return {
        "total_workers": worker_count,
        "total_care_homes": care_home_count,
        "completed_profiles": completed_profiles,
        "verified_care_homes": verified_care_homes,
        "avg_profile_completion": round(avg_completion, 1),
        "recent_signups_7d": recent_workers,
        "updated_at": datetime.utcnow().isoformat(),
        
        # Display-friendly formatted versions
        "display": {
            "workers": f"{worker_count:,}+",
            "care_homes": f"{care_home_count:,}+",
            "completed": f"{completed_profiles:,}",
            "verified": f"{verified_care_homes:,}",
        }
    }


@router.get("/health")
async def public_health_check():
    """
    Public health check endpoint
    """
    return {
        "status": "healthy",
        "service": "public_api",
        "timestamp": datetime.utcnow().isoformat()
    }
