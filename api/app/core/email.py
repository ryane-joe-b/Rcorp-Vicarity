"""
Email service using Resend.
"""

import os
from typing import Optional
import resend

from app.core.config import settings


# Initialize Resend with API key
resend.api_key = settings.RESEND_API_KEY


def send_verification_email(to_email: str, verification_token: str, first_name: Optional[str] = None) -> bool:
    """
    Send email verification email.
    
    Args:
        to_email: Recipient email address
        verification_token: JWT verification token
        first_name: User's first name (if available)
    
    Returns:
        True if sent successfully, False otherwise
    """
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    
    name = first_name if first_name else "there"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #86a890 0%, #86a890 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #86a890; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
            .button:hover {{ background: #6f8a77; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
            .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Vicarity!</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>Thank you for registering with Vicarity. We're excited to have you join our care community.</p>
                <p>Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </p>
                <div class="warning">
                    <strong>⏰ This link expires in 24 hours</strong>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{verification_link}</p>
                <p>If you didn't create an account with Vicarity, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p>Vicarity - Connecting Care Workers with Care Homes</p>
                <p>Need help? Contact us at support@vicarity.co.uk</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Verify your Vicarity account",
            "html": html_content,
        }
        
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False


def send_worker_welcome_email(to_email: str, first_name: str) -> bool:
    """Send welcome email to care worker after verification."""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #86a890 0%, #86a890 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #86a890; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
            .steps {{ background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }}
            .step {{ margin: 15px 0; padding-left: 30px; position: relative; }}
            .step:before {{ content: "✓"; position: absolute; left: 0; color: #86a890; font-weight: bold; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Vicarity, {first_name}!</h1>
            </div>
            <div class="content">
                <p>Your email has been verified successfully!</p>
                <p>Now let's complete your profile so you can start finding flexible care work.</p>
                
                <div class="steps">
                    <h3>Complete Your Profile in 4 Easy Steps:</h3>
                    <div class="step"><strong>Personal Details</strong> - Your name, contact info, and photo</div>
                    <div class="step"><strong>Qualifications</strong> - DBS, certifications, and training</div>
                    <div class="step"><strong>Skills & Experience</strong> - Your specializations and background</div>
                    <div class="step"><strong>Availability</strong> - When you're available and your preferences</div>
                </div>
                
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/complete-profile" class="button">Complete Your Profile</a>
                </p>
                
                <p><strong>Timeline:</strong> Most care workers complete their profile in 10-15 minutes and start receiving shift offers within 24 hours!</p>
            </div>
            <div class="footer">
                <p>Questions? We're here to help at support@vicarity.co.uk</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"Welcome to Vicarity, {first_name}! Complete your profile to start finding work",
            "html": html_content,
        }
        
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending worker welcome email: {e}")
        return False


def send_care_home_welcome_email(to_email: str, contact_name: str) -> bool:
    """Send welcome email to care home after verification."""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #c96228 0%, #c96228 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background: #c96228; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
            .feature {{ background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 Welcome to Vicarity!</h1>
            </div>
            <div class="content">
                <p>Hi {contact_name},</p>
                <p>Your care home account is now active! You can start posting shifts and connecting with qualified care workers immediately.</p>
                
                <h3>Get Started:</h3>
                <div class="feature">
                    <strong>📝 Post Your First Shift</strong><br>
                    Create a shift in minutes and start receiving applications
                </div>
                <div class="feature">
                    <strong>✓ Complete Business Verification</strong><br>
                    Add your CQC details to get a verified badge and attract more workers
                </div>
                <div class="feature">
                    <strong>👥 Browse Care Workers</strong><br>
                    Search our database of DBS-checked, qualified care professionals
                </div>
                
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                </p>
                
                <p><strong>Need help getting started?</strong> Our team is here to support you every step of the way.</p>
            </div>
            <div class="footer">
                <p>Contact your dedicated account manager at support@vicarity.co.uk</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Welcome to Vicarity - Start hiring qualified care staff today",
            "html": html_content,
        }
        
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending care home welcome email: {e}")
        return False


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """Send password reset email."""
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .content {{ background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-radius: 8px; }}
            .button {{ display: inline-block; background: #86a890; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }}
            .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your Vicarity password.</p>
                <p>Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <div class="warning">
                    <strong>⏰ This link expires in 1 hour</strong>
                </div>
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>Vicarity Security Team</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Reset your Vicarity password",
            "html": html_content,
        }
        
        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
