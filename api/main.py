"""
VICARITY API - Main Application Entry Point

This is a minimal FastAPI application with health checks.
Replace/extend this with your actual application code.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime

import redis
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Environment configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL", os.getenv("NEON_DATABASE_URL", ""))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


# Redis connection
redis_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    global redis_client
    
    # Startup
    print(f"Starting Vicarity API in {ENVIRONMENT} mode...")
    
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
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
    description="Care worker marketplace API",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: str
    database: str
    redis: str


class MessageResponse(BaseModel):
    message: str


# Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    Returns the status of all critical services.
    """
    # Check database
    db_status = "disconnected"
    if DATABASE_URL:
        try:
            # Simple connection test would go here
            # For now, just check if URL is configured
            db_status = "configured"
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
        environment=ENVIRONMENT,
        timestamp=datetime.utcnow().isoformat(),
        database=db_status,
        redis=redis_status,
    )


@app.get("/", response_model=MessageResponse)
async def root():
    """Root endpoint."""
    return MessageResponse(message="Vicarity API is running")


@app.get("/api/status", response_model=MessageResponse)
async def api_status():
    """API status check."""
    return MessageResponse(message=f"API running in {ENVIRONMENT} mode")


# Auth routes (placeholder - replace with your actual auth)
@app.post("/auth/login")
async def login():
    """Placeholder login endpoint."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


@app.post("/auth/register")
async def register():
    """Placeholder register endpoint."""
    raise HTTPException(status_code=501, detail="Not implemented yet")


# Include your routers here
# from routers import users, jobs, bookings
# app.include_router(users.router, prefix="/api/users", tags=["users"])
# app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
# app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
