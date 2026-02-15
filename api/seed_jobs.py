"""
Seed script: creates sample jobs tied to a seeded care home for local testing.

Usage:
    cd api && python seed_jobs.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.care_home_profile import CareHomeProfile, VerificationStatus
from app.models.job import Job, ShiftType, JobStatus
from app.core.security import hash_password

CARE_HOME_EMAIL = "seedhome@vicarity.test"
CARE_HOME_PASSWORD = "Seedhome123!"

SAMPLE_JOBS = [
    {
        "title": "Senior Care Assistant – Days",
        "description": "We are looking for an experienced Senior Care Assistant to join our team at Sunrise Lodge. You will support residents with personal care, medication administration, and daily activities.",
        "shift_type": ShiftType.DAY,
        "location": "Brighton",
        "postcode": "BN1 3AA",
        "hourly_rate_min": 12.50,
        "hourly_rate_max": 14.00,
        "hours_per_week": 37,
        "required_qualifications": ["NVQ_LVL3", "MEDICATION_ADMIN", "DBS_ENHANCED"],
        "benefits": ["Paid breaks", "Company pension", "Free uniform", "Ongoing training"],
    },
    {
        "title": "Care Assistant – Night Shifts",
        "description": "Night care assistant role supporting elderly residents through waking nights. Previous care experience required.",
        "shift_type": ShiftType.NIGHT,
        "location": "Hove",
        "postcode": "BN3 2DE",
        "hourly_rate_min": 13.00,
        "hourly_rate_max": 15.00,
        "hours_per_week": 36,
        "required_qualifications": ["DBS_ENHANCED", "MOVING_HANDLING"],
        "benefits": ["Night enhancement pay", "Pension scheme", "Meals on shift"],
    },
    {
        "title": "Dementia Care Specialist",
        "description": "Specialist role working with residents living with dementia. You will deliver person-centred care and support in a dedicated dementia unit.",
        "shift_type": ShiftType.DAY,
        "location": "Worthing",
        "postcode": "BN11 1AA",
        "hourly_rate_min": 13.50,
        "hourly_rate_max": 15.50,
        "hours_per_week": 30,
        "required_qualifications": ["DEMENTIA_AWARENESS", "NVQ_LVL2", "DBS_ENHANCED"],
        "benefits": ["Specialist training", "Enhanced pay", "Flexible rota", "Wellbeing support"],
    },
    {
        "title": "Healthcare Assistant – Long Days",
        "description": "12-hour day shifts in a nursing home setting. You will work alongside qualified nurses to provide outstanding care to residents.",
        "shift_type": ShiftType.LONG_DAY,
        "location": "Eastbourne",
        "postcode": "BN21 3AG",
        "hourly_rate_min": 12.00,
        "hourly_rate_max": 13.50,
        "hours_per_week": 36,
        "required_qualifications": ["DBS_ENHANCED", "BASIC_LIFE_SUPPORT", "MOVING_HANDLING"],
        "benefits": ["Uniform provided", "Free parking", "Pension", "Career development"],
    },
    {
        "title": "Waking Night Care Worker",
        "description": "Waking night role providing support and companionship to residents throughout the night. Calm and caring approach essential.",
        "shift_type": ShiftType.WAKING_NIGHT,
        "location": "Lewes",
        "postcode": "BN7 1XP",
        "hourly_rate_min": 13.00,
        "hourly_rate_max": 14.50,
        "hours_per_week": 35,
        "required_qualifications": ["DBS_ENHANCED", "SAFEGUARDING_ADULTS"],
        "benefits": ["Night rate supplement", "Pension", "Training budget"],
    },
    {
        "title": "Support Worker – Learning Disabilities",
        "description": "Support individuals with learning disabilities to live fulfilling and independent lives. Community and residential support.",
        "shift_type": ShiftType.DAY,
        "location": "Brighton",
        "postcode": "BN2 0QA",
        "hourly_rate_min": 12.50,
        "hourly_rate_max": 14.00,
        "hours_per_week": 25,
        "required_qualifications": ["LEARNING_DISABILITY", "DBS_ENHANCED"],
        "benefits": ["Mileage allowance", "Flexible hours", "Training provided"],
    },
    {
        "title": "Care Assistant – Part Time Days",
        "description": "Part-time care assistant role ideal for someone returning to care work or looking for work-life balance.",
        "shift_type": ShiftType.DAY,
        "location": "Shoreham-by-Sea",
        "postcode": "BN43 5PF",
        "hourly_rate_min": 11.50,
        "hourly_rate_max": 12.50,
        "hours_per_week": 20,
        "required_qualifications": ["DBS_ENHANCED"],
        "benefits": ["Flexible scheduling", "Pension", "Supportive team"],
    },
]


def run():
    db = SessionLocal()
    try:
        # Get or create care home user
        user = db.query(User).filter(User.email == CARE_HOME_EMAIL).first()
        if not user:
            user = User(
                email=CARE_HOME_EMAIL,
                password_hash=hash_password(CARE_HOME_PASSWORD),
                role=UserRole.CARE_HOME_ADMIN,
                email_verified=True,
                is_active=True,
            )
            db.add(user)
            db.flush()
            print(f"Created care home user: {CARE_HOME_EMAIL}")
        else:
            print(f"Using existing care home user: {CARE_HOME_EMAIL}")

        # Get or create care home profile
        profile = db.query(CareHomeProfile).filter(CareHomeProfile.user_id == user.id).first()
        if not profile:
            profile = CareHomeProfile(
                user_id=user.id,
                business_name="Sunrise Care Group",
                contact_name="Jane Smith",
                phone="01273 000000",
                address_line_1="1 Marine Parade",
                city="Brighton",
                county="East Sussex",
                postcode="BN2 1TL",
                verification_status=VerificationStatus.VERIFIED,
                profile_completion_percentage="100",
                description="A family-run group of care homes across East and West Sussex, dedicated to providing outstanding residential and nursing care.",
            )
            db.add(profile)
            db.flush()
            print(f"Created care home profile: Sunrise Care Group")
        else:
            print(f"Using existing care home profile: {profile.business_name}")

        # Create jobs
        created = 0
        for job_data in SAMPLE_JOBS:
            existing = db.query(Job).filter(
                Job.care_home_id == profile.id,
                Job.title == job_data["title"]
            ).first()
            if not existing:
                job = Job(
                    care_home_id=profile.id,
                    status=JobStatus.ACTIVE,
                    **job_data,
                )
                db.add(job)
                created += 1

        db.commit()
        print(f"\nSeeded {created} new jobs (skipped {len(SAMPLE_JOBS) - created} duplicates)")
        print("Done!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
