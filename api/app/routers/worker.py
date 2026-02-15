"""
Worker profile router - profile completion and management.
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_worker, get_current_worker_with_complete_profile
from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.worker import WorkerProfileUpdate, WorkerProfileResponse
from app.schemas.job import JobResponse, JobListResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse


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
    if profile:
        applications_count = db.query(Application).filter(
            Application.worker_id == profile.id
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

    return {
        "profile_completion": profile_completion,
        "applications_count": applications_count,
        "active_jobs_count": active_jobs_count,
        "recent_applications": recent_applications,
        "worker_name": profile.first_name if profile else None,
    }


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
