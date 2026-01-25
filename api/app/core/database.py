"""
Database connection and session management.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", os.getenv("NEON_DATABASE_URL", ""))

# Handle Neon's postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
    echo=os.getenv("ENVIRONMENT") == "development",
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Ensures session is closed after request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
