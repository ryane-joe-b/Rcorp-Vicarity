"""
Application schemas.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.schemas.job import JobResponse


class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_note: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    worker_id: UUID
    status: str
    cover_note: Optional[str] = None
    job: Optional[JobResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
