"""
Care home profile router - profile management and job postings.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_care_home
from app.models.user import User
from app.models.care_home_profile import CareHomeProfile
from app.models.job import Job, JobStatus
from app.models.application import Application
from app.schemas.care_home import CareHomeProfileUpdate, CareHomeProfileResponse
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.application import ApplicationResponse


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


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobCreate,
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    Create a new job posting.
    """
    profile = current_user.care_home_profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care home profile not found")

    job = Job(
        care_home_id=profile.id,
        **data.model_dump(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/jobs", response_model=list[JobResponse])
def list_own_jobs(
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    List all jobs posted by this care home.
    """
    profile = current_user.care_home_profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care home profile not found")

    jobs = db.query(Job).filter(Job.care_home_id == profile.id).order_by(Job.created_at.desc()).all()
    return jobs


@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    data: JobUpdate,
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    Update a job posting.
    """
    profile = current_user.care_home_profile
    job = db.query(Job).filter(Job.id == job_id, Job.care_home_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    Close/delete a job posting.
    """
    profile = current_user.care_home_profile
    job = db.query(Job).filter(Job.id == job_id, Job.care_home_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    job.status = JobStatus.CLOSED
    db.commit()


@router.get("/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
def get_job_applications(
    job_id: UUID,
    current_user: User = Depends(get_current_care_home),
    db: Session = Depends(get_db)
):
    """
    View applicants for a specific job.
    """
    profile = current_user.care_home_profile
    job = db.query(Job).filter(Job.id == job_id, Job.care_home_id == profile.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .order_by(Application.created_at.desc())
        .all()
    )
    return applications
