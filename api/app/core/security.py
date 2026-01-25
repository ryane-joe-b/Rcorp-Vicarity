"""
Security utilities - JWT tokens, password hashing, email verification.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Token types
class TokenType:
    ACCESS = "access"
    REFRESH = "refresh"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Hash a password for storage."""
    return pwd_context.hash(password)


def create_token(
    subject: str,
    token_type: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a JWT token.
    
    Args:
        subject: The subject of the token (usually user ID)
        token_type: Type of token (access, refresh, email_verification, password_reset)
        expires_delta: How long until token expires
        extra_claims: Additional claims to include in the token
    
    Returns:
        Encoded JWT token string
    """
    if expires_delta is None:
        if token_type == TokenType.ACCESS:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        elif token_type == TokenType.REFRESH:
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        elif token_type == TokenType.EMAIL_VERIFICATION:
            expires_delta = timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS)
        elif token_type == TokenType.PASSWORD_RESET:
            expires_delta = timedelta(hours=settings.PASSWORD_RESET_EXPIRE_HOURS)
        else:
            expires_delta = timedelta(minutes=15)
    
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": str(subject),
        "type": token_type,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    
    if extra_claims:
        to_encode.update(extra_claims)
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: The JWT token string
    
    Returns:
        Token payload dict if valid, None if invalid
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def create_access_token(user_id: UUID, role: str) -> str:
    """Create an access token for a user."""
    return create_token(
        subject=str(user_id),
        token_type=TokenType.ACCESS,
        extra_claims={"role": role},
    )


def create_refresh_token(user_id: UUID) -> str:
    """Create a refresh token for a user."""
    return create_token(
        subject=str(user_id),
        token_type=TokenType.REFRESH,
    )


def create_email_verification_token(user_id: UUID, email: str) -> str:
    """Create an email verification token."""
    return create_token(
        subject=str(user_id),
        token_type=TokenType.EMAIL_VERIFICATION,
        extra_claims={"email": email},
    )


def create_password_reset_token(user_id: UUID, email: str) -> str:
    """Create a password reset token."""
    return create_token(
        subject=str(user_id),
        token_type=TokenType.PASSWORD_RESET,
        extra_claims={"email": email},
    )


def verify_token(token: str, expected_type: str) -> Optional[Dict[str, Any]]:
    """
    Verify a token and check its type.
    
    Args:
        token: The JWT token string
        expected_type: The expected token type
    
    Returns:
        Token payload if valid and correct type, None otherwise
    """
    payload = decode_token(token)
    
    if payload is None:
        return None
    
    if payload.get("type") != expected_type:
        return None
    
    return payload


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password meets security requirements.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, ""
