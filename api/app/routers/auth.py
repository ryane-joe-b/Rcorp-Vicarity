"""
Authentication router - registration, login, verification, password reset.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    create_refresh_token,
    create_email_verification_token,
    create_password_reset_token,
    verify_token,
    TokenType,
)
from app.core.email import (
    send_verification_email,
    send_worker_welcome_email,
    send_care_home_welcome_email,
    send_password_reset_email,
)
from app.models.user import User, UserRole
from app.models.worker_profile import WorkerProfile, ProfileCompletionStatus
from app.models.care_home_profile import CareHomeProfile, VerificationStatus
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.schemas.user import CurrentUserResponse


router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user (care worker or care home).
    
    Creates user account and associated profile.
    Sends verification email.
    """
    # Validate password strength
    is_valid, error_msg = validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Determine user role from user_type
    if request.user_type == "worker":
        role = UserRole.WORKER
    elif request.user_type == "care_home":
        role = UserRole.CARE_HOME_ADMIN
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user type. Must be 'worker' or 'care_home'",
        )
    
    # Create user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role=role,
        email_verified=False,
    )
    
    db.add(user)
    db.flush()  # Get user.id
    
    # Create associated profile
    if role == UserRole.WORKER:
        profile = WorkerProfile(
            user_id=user.id,
            profile_completion_status=ProfileCompletionStatus.NOT_STARTED,
            profile_completion_percentage=0,
            current_step=1,
        )
        db.add(profile)
    else:
        profile = CareHomeProfile(
            user_id=user.id,
            verification_status=VerificationStatus.PENDING,
            profile_completion_percentage="0",
        )
        db.add(profile)
    
    # Generate verification token
    verification_token = create_email_verification_token(user.id, user.email)
    user.email_verification_token = verification_token
    user.email_verification_sent_at = datetime.utcnow()
    
    db.commit()
    
    # Send verification email
    send_verification_email(user.email, verification_token)
    
    return RegisterResponse(
        user_id=user.id,
        email=user.email,
        message="Verification email sent. Please check your inbox.",
    )


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login user and return JWT tokens.
    
    Returns access token, refresh token, and user info for smart routing.
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)
    
    # Determine profile completion for workers
    profile_complete = None
    if user.role == UserRole.WORKER:
        if user.worker_profile:
            profile_complete = user.worker_profile.is_complete
        else:
            profile_complete = False
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        user_type=user.role.value,
        email_verified=user.email_verified,
        profile_complete=profile_complete,
    )


@router.post("/verify-email", response_model=VerifyEmailResponse)
def verify_email(request: VerifyEmailRequest, db: Session = Depends(get_db)):
    """
    Verify user's email address using verification token.
    
    Returns smart redirect based on user role:
    - Worker: /complete-profile (if not complete) or /dashboard/worker
    - Care Home: /dashboard/care-home
    """
    # Verify token
    payload = verify_token(request.token, TokenType.EMAIL_VERIFICATION)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    
    # Find user
    user = db.query(User).filter(User.id == user_id, User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.email_verified:
        # Already verified, just return redirect
        redirect_to = "/dashboard/worker" if user.is_worker else "/dashboard/care-home"
        return VerifyEmailResponse(
            success=True,
            message="Email already verified",
            redirect_to=redirect_to,
        )
    
    # Mark email as verified
    user.email_verified = True
    user.email_verification_token = None
    db.commit()
    
    # Send welcome email based on role
    if user.role == UserRole.WORKER:
        first_name = user.worker_profile.first_name if user.worker_profile and user.worker_profile.first_name else None
        send_worker_welcome_email(user.email, first_name or "there")
        redirect_to = "/complete-profile"
    else:
        contact_name = user.care_home_profile.contact_name if user.care_home_profile and user.care_home_profile.contact_name else "there"
        send_care_home_welcome_email(user.email, contact_name)
        redirect_to = "/dashboard/care-home"
    
    return VerifyEmailResponse(
        success=True,
        message="Email verified successfully!",
        redirect_to=redirect_to,
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Get a new access token using refresh token.
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, TokenType.REFRESH)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    
    user_id = payload.get("sub")
    
    # Find user
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new access token
    access_token = create_access_token(user.id, user.role.value)
    
    return RefreshTokenResponse(access_token=access_token)


@router.get("/me", response_model=CurrentUserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user's information.
    
    Includes profile data and completion status for smart routing.
    """
    # Build response
    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "email_verified": current_user.email_verified,
        "is_active": current_user.is_active,
    }
    
    # Add worker profile data
    if current_user.is_worker and current_user.worker_profile:
        profile = current_user.worker_profile
        response_data["profile_complete"] = profile.is_complete
        response_data["profile_completion_percentage"] = profile.profile_completion_percentage
        response_data["worker_profile"] = {
            "id": str(profile.id),
            "current_step": profile.current_step,
            "profile_completion_status": profile.profile_completion_status.value,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
        }
    
    # Add care home profile data
    elif current_user.is_care_home and current_user.care_home_profile:
        profile = current_user.care_home_profile
        response_data["profile_complete"] = True  # Care homes don't need 100% profile
        response_data["profile_completion_percentage"] = int(profile.profile_completion_percentage or 0)
        response_data["care_home_profile"] = {
            "id": str(profile.id),
            "business_name": profile.business_name,
            "verification_status": profile.verification_status.value,
        }
    
    return CurrentUserResponse(**response_data)


@router.post("/password-reset-request")
def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request a password reset email.
    
    Always returns success (don't leak if email exists).
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if user and user.is_active:
        # Generate reset token
        reset_token = create_password_reset_token(user.id, user.email)
        user.password_reset_token = reset_token
        user.password_reset_sent_at = datetime.utcnow()
        db.commit()
        
        # Send reset email
        send_password_reset_email(user.email, reset_token)
    
    # Always return success to prevent email enumeration
    return {
        "message": "If that email exists, a password reset link has been sent"
    }


@router.post("/password-reset-confirm")
def confirm_password_reset(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Confirm password reset with token and set new password.
    """
    # Validate new password strength
    is_valid, error_msg = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    
    # Verify reset token
    payload = verify_token(request.token, TokenType.PASSWORD_RESET)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    
    user_id = payload.get("sub")
    
    # Find user
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    user.password_reset_token = None
    user.password_reset_sent_at = None
    db.commit()
    
    return {"message": "Password reset successful. You can now login with your new password."}


@router.post("/resend-verification")
def resend_verification_email(email: str, db: Session = Depends(get_db)):
    """
    Resend verification email.
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Don't leak if email exists
        return {"message": "If that email exists and is not verified, a new verification email has been sent"}
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )
    
    # Generate new token
    verification_token = create_email_verification_token(user.id, user.email)
    user.email_verification_token = verification_token
    user.email_verification_sent_at = datetime.utcnow()
    db.commit()
    
    # Send email
    send_verification_email(user.email, verification_token)
    
    return {"message": "Verification email sent"}
