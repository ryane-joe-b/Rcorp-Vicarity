"""
Worker profile router - profile completion and management.
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_worker, get_current_worker_with_complete_profile
from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.models.job import Job, JobStatus, ShiftType
from app.models.application import Application, ApplicationStatus
from app.schemas.worker import WorkerProfileUpdate, WorkerProfileResponse
from app.schemas.job import JobResponse, JobListResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse


# In-demand qualifications used for skill gap analysis
DEMAND_QUALS = [
    {"code": "FIRST_AID_LVL3", "name": "First Aid Level 3", "jobs_unlocked": 18},
    {"code": "MANUAL_HANDLING", "name": "Manual Handling", "jobs_unlocked": 24},
    {"code": "MEDICATION_ADMIN", "name": "Medication Administration", "jobs_unlocked": 21},
    {"code": "DEMENTIA_CARE", "name": "Dementia Care", "jobs_unlocked": 15},
    {"code": "FIRE_SAFETY", "name": "Fire Safety", "jobs_unlocked": 12},
]


router = APIRouter(prefix="/worker", tags=["worker-profile"])


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


@router.get("/dashboard")
def get_worker_dashboard(
    current_user: User = Depends(get_current_worker),
    db: Session = Depends(get_db)
):
    """
    Get worker dashboard stats.
    Does NOT require complete profile.
    """
    profile = current_user.worker_profile
    profile_completion = profile.profile_completion_percentage if profile else 0

    applications_count = 0
    recent_applications = []
    shortlisted_count = 0

    if profile:
        applications_count = db.query(Application).filter(
            Application.worker_id == profile.id
        ).count()

        shortlisted_count = db.query(Application).filter(
            Application.worker_id == profile.id,
            Application.status == ApplicationStatus.SHORTLISTED,
        ).count()

        recent_apps = (
            db.query(Application)
            .filter(Application.worker_id == profile.id)
            .order_by(Application.created_at.desc())
            .limit(5)
            .all()
        )
        for app in recent_apps:
            job = app.job
            recent_applications.append({
                "id": str(app.id),
                "status": app.status.value,
                "created_at": app.created_at.isoformat(),
                "job": {
                    "id": str(job.id),
                    "title": job.title,
                    "location": job.location,
                    "shift_type": job.shift_type.value,
                    "care_home_name": job.care_home.business_name if job.care_home else None,
                } if job else None,
            })

    active_jobs_count = db.query(Job).filter(Job.status == JobStatus.ACTIVE).count()

    # --- Profile boost tips ---
    profile_boost_tips = []
    if profile:
        if not profile.profile_picture_url:
            profile_boost_tips.append({"message": "Add a profile photo", "points": 5})
        if not profile.bio or len(profile.bio) < 50:
            profile_boost_tips.append({"message": "Write a short bio (50+ chars)", "points": 10})
        if not profile.qualifications or len(profile.qualifications) < 2:
            profile_boost_tips.append({"message": "Add 2+ qualifications", "points": 15})
        if not profile.is_available:
            profile_boost_tips.append({"message": "Set yourself as available", "points": 5})

    # --- Badges ---
    badges = []
    if profile:
        badges = [
            {
                "id": "profile_star",
                "name": "Profile Star",
                "description": "Reach 80%+ profile completion",
                "earned": profile_completion >= 80,
                "icon_key": "star",
            },
            {
                "id": "early_bird",
                "name": "Early Bird",
                "description": "Set an available start date",
                "earned": bool(profile.available_start_date),
                "icon_key": "bird",
            },
            {
                "id": "job_hunter",
                "name": "Job Hunter",
                "description": "Apply to 5 or more jobs",
                "earned": applications_count >= 5,
                "icon_key": "search",
            },
            {
                "id": "well_qualified",
                "name": "Well Qualified",
                "description": "Add 3 or more qualifications",
                "earned": bool(profile.qualifications and len(profile.qualifications) >= 3),
                "icon_key": "certificate",
            },
            {
                "id": "available_now",
                "name": "Available Now",
                "description": "Mark yourself as available to employers",
                "earned": profile.is_available,
                "icon_key": "check_circle",
            },
        ]

    # --- Skill gaps ---
    skill_gaps = []
    if profile:
        worker_codes = {q["code"] for q in (profile.qualifications or []) if isinstance(q, dict) and "code" in q}
        for qual in DEMAND_QUALS:
            if qual["code"] not in worker_codes:
                skill_gaps.append(qual)
            if len(skill_gaps) == 3:
                break

    # --- Recommended jobs ---
    # Filter to valid ShiftType values only — profile.shift_types may contain stale/mixed-case strings
    valid_shift_types = {st.value for st in ShiftType}
    recommended_jobs = []
    if profile and profile.shift_types:
        clean_shift_types = [st for st in profile.shift_types if st in valid_shift_types]
        if clean_shift_types:
            matched = (
                db.query(Job)
                .filter(Job.status == JobStatus.ACTIVE, Job.shift_type.in_(clean_shift_types))
                .order_by(Job.created_at.desc())
                .limit(5)
                .all()
            )
            recommended_jobs = matched

    if not recommended_jobs:
        recommended_jobs = (
            db.query(Job)
            .filter(Job.status == JobStatus.ACTIVE)
            .order_by(Job.created_at.desc())
            .limit(5)
            .all()
        )

    recommended_jobs_data = [
        {
            "id": str(j.id),
            "title": j.title,
            "care_home_name": j.care_home.business_name if j.care_home else None,
            "location": j.location,
            "shift_type": j.shift_type.value,
            "hourly_rate_min": float(j.hourly_rate_min) if j.hourly_rate_min is not None else None,
            "hourly_rate_max": float(j.hourly_rate_max) if j.hourly_rate_max is not None else None,
        }
        for j in recommended_jobs
    ]

    return {
        "profile_completion": profile_completion,
        "applications_count": applications_count,
        "shortlisted_count": shortlisted_count,
        "active_jobs_count": active_jobs_count,
        "recent_applications": recent_applications,
        "worker_name": profile.first_name if profile else None,
        "is_available": profile.is_available if profile else False,
        "profile_boost_tips": profile_boost_tips,
        "badges": badges,
        "skill_gaps": skill_gaps,
        "recommended_jobs": recommended_jobs_data,
    }


class AvailabilityUpdate(BaseModel):
    is_available: bool


@router.patch("/availability")
def update_availability(
    body: AvailabilityUpdate,
    current_user: User = Depends(get_current_worker),
    db: Session = Depends(get_db)
):
    """Toggle worker availability — no complete profile required."""
    profile = current_user.worker_profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found")
    profile.is_available = body.is_available
    db.commit()
    return {"is_available": profile.is_available}


@router.get("/jobs", response_model=JobListResponse)
def list_jobs(
    shift_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_rate: Optional[float] = Query(None),
    max_rate: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_worker_with_complete_profile),
    db: Session = Depends(get_db)
):
    """
    List active jobs with optional filters.
    """
    query = db.query(Job).filter(Job.status == JobStatus.ACTIVE)

    if shift_type:
        query = query.filter(Job.shift_type == shift_type)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if min_rate is not None:
        query = query.filter(Job.hourly_rate_max >= min_rate)
    if max_rate is not None:
        query = query.filter(Job.hourly_rate_min <= max_rate)

    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return JobListResponse(jobs=jobs, total=total, page=page, per_page=per_page)


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_worker_with_complete_profile),
    db: Session = Depends(get_db)
):
    """
    Get a single job by ID.
    """
    job = db.query(Job).filter(Job.id == job_id, Job.status == JobStatus.ACTIVE).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_worker_with_complete_profile),
    db: Session = Depends(get_db)
):
    """
    Apply to a job.
    """
    profile = current_user.worker_profile

    job = db.query(Job).filter(Job.id == data.job_id, Job.status == JobStatus.ACTIVE).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or no longer active")

    existing = db.query(Application).filter(
        Application.job_id == data.job_id,
        Application.worker_id == profile.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already applied to this job")

    application = Application(
        job_id=data.job_id,
        worker_id=profile.id,
        cover_note=data.cover_note,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/applications", response_model=list[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_worker_with_complete_profile),
    db: Session = Depends(get_db)
):
    """
    Get all applications for the current worker.
    """
    profile = current_user.worker_profile
    applications = (
        db.query(Application)
        .filter(Application.worker_id == profile.id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return applications


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def withdraw_application(
    application_id: UUID,
    current_user: User = Depends(get_current_worker_with_complete_profile),
    db: Session = Depends(get_db)
):
    """
    Withdraw an application.
    """
    profile = current_user.worker_profile
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.worker_id == profile.id
    ).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.status == ApplicationStatus.WITHDRAWN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application already withdrawn")

    application.status = ApplicationStatus.WITHDRAWN
    db.commit()
