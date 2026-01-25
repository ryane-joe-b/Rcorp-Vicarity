"""
Vicarity API - Main Application

Complete authentication system with smart routing based on user type.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime

import redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, worker, care_home


# Redis connection
redis_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    global redis_client
    
    # Startup
    print(f"Starting Vicarity API in {settings.ENVIRONMENT} mode...")
    
    # Create database tables (in production, use Alembic migrations)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        redis_client.ping()
        print("Redis connected")
    except Exception as e:
        print(f"Redis connection failed: {e}")
        redis_client = None
    
    yield
    
    # Shutdown
    print("Shutting down Vicarity API...")
    if redis_client:
        redis_client.close()


# Create FastAPI app
app = FastAPI(
    title="Vicarity API",
    description="Care worker marketplace API with role-based authentication",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(worker.router)
app.include_router(care_home.router)


# Response models
class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: str
    database: str
    redis: str


class MessageResponse(BaseModel):
    message: str


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    # Check database
    db_status = "connected"
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
    except Exception:
        db_status = "error"
    
    # Check Redis
    redis_status = "disconnected"
    if redis_client:
        try:
            redis_client.ping()
            redis_status = "connected"
        except Exception:
            redis_status = "error"
    
    return HealthResponse(
        status="healthy",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow().isoformat(),
        database=db_status,
        redis=redis_status,
    )


@app.get("/", response_model=MessageResponse)
async def root():
    """Root endpoint."""
    return MessageResponse(message="Vicarity API - Care Worker Marketplace")


@app.get("/api/status", response_model=MessageResponse)
async def api_status():
    """API status check."""
    return MessageResponse(message=f"API running in {settings.ENVIRONMENT} mode")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
