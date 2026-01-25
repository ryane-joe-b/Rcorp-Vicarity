# Vicarity API Documentation

Complete reference for the Vicarity REST API.

**Base URL**: `https://vicarity.co.uk/api` (Production)  
**Base URL**: `http://localhost/api` (Local Development)

---

## Table of Contents

- [Authentication](#authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [Worker Endpoints](#worker-endpoints)
- [Care Home Endpoints](#care-home-endpoints)
- [Health Check](#health-check)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a JWT access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Types

| Token Type | Expiry | Usage |
|------------|--------|-------|
| Access Token | 30 minutes | API requests |
| Refresh Token | 7 days | Refresh access token |
| Email Verification | 24 hours | Verify email address |
| Password Reset | 24 hours | Reset password |

### Token Refresh Flow

When an access token expires (401 response), use the refresh token to get a new access token:

```javascript
// Example refresh flow
if (response.status === 401) {
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: storedRefreshToken })
  });
  const { access_token } = await refreshResponse.json();
  // Retry original request with new token
}
```

---

## Authentication Endpoints

### Register User

Create a new user account (care worker or care home).

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "user_type": "worker"  // or "care_home"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Success Response** (201 Created):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "message": "Verification email sent. Please check your inbox."
}
```

**Error Responses**:
- `400 Bad Request`: Email already registered or weak password
- `422 Unprocessable Entity`: Invalid email format

---

### Login

Authenticate user and receive JWT tokens.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_type": "worker",
  "email_verified": true,
  "profile_complete": false
}
```

**Response Fields**:
- `profile_complete`: Only present for workers (null for care homes)
- `email_verified`: Used for smart routing to email verification page

**Error Responses**:
- `401 Unauthorized`: Incorrect email or password
- `403 Forbidden`: Account is inactive

---

### Verify Email

Verify user's email address using the token sent via email.

**Endpoint**: `POST /api/auth/verify-email`

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "redirect_to": "/complete-profile"  // or "/dashboard/care-home"
}
```

**Smart Redirect Logic**:
- Worker (profile incomplete): `/complete-profile`
- Worker (profile complete): `/dashboard/worker`
- Care Home: `/dashboard/care-home`

**Error Responses**:
- `400 Bad Request`: Invalid or expired token
- `404 Not Found`: User not found

---

### Refresh Access Token

Get a new access token using a refresh token.

**Endpoint**: `POST /api/auth/refresh`

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

### Get Current User

Get authenticated user's profile information.

**Endpoint**: `GET /api/auth/me`

**Headers**: Requires `Authorization: Bearer <access_token>`

**Success Response** (200 OK) - Worker:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "worker@example.com",
  "role": "worker",
  "email_verified": true,
  "is_active": true,
  "profile_complete": false,
  "profile_completion_percentage": 45,
  "worker_profile": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "current_step": 2,
    "profile_completion_status": "in_progress",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Success Response** (200 OK) - Care Home:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "home@example.com",
  "role": "care_home_admin",
  "email_verified": true,
  "is_active": true,
  "profile_complete": true,
  "profile_completion_percentage": 80,
  "care_home_profile": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "business_name": "Sunnydale Care Home",
    "verification_status": "pending"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token

---

### Request Password Reset

Request a password reset email.

**Endpoint**: `POST /api/auth/password-reset-request`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "If that email exists, a password reset link has been sent"
}
```

**Note**: Always returns success to prevent email enumeration attacks.

---

### Confirm Password Reset

Reset password using the token from email.

**Endpoint**: `POST /api/auth/password-reset-confirm`

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Responses**:
- `400 Bad Request`: Invalid token or weak password
- `404 Not Found`: User not found

---

### Resend Verification Email

Resend email verification link.

**Endpoint**: `POST /api/auth/resend-verification`

**Query Parameters**:
- `email` (string): User's email address

**Example**: `POST /api/auth/resend-verification?email=user@example.com`

**Success Response** (200 OK):
```json
{
  "message": "Verification email sent"
}
```

**Error Responses**:
- `400 Bad Request`: Email already verified

---

## Worker Endpoints

### Get Worker Profile

Get the authenticated worker's profile.

**Endpoint**: `GET /api/worker/profile`

**Headers**: Requires `Authorization: Bearer <access_token>`

**Success Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "profile_completion_status": "in_progress",
  "profile_completion_percentage": 65,
  "current_step": 3,
  
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+44 7700 900123",
  "date_of_birth": "1990-05-15",
  "profile_picture_url": null,
  
  "dbs_status": "enhanced",
  "dbs_expiry_date": "2025-12-31",
  "qualifications": [
    {
      "code": "NVQ_LEVEL_2",
      "name": "NVQ Level 2 in Health & Social Care",
      "expiry_date": "2026-01-15",
      "document_url": "https://..."
    }
  ],
  
  "years_experience": "3-5",
  "specializations": ["elderly_care", "dementia"],
  "languages": ["English", "Polish"],
  "bio": "Experienced care worker with passion for elderly care...",
  
  "available_days": ["monday", "tuesday", "wednesday"],
  "shift_types": ["day", "night"],
  "travel_radius_miles": 15,
  "hourly_rate_min": 1200,
  "hourly_rate_max": 1500
}
```

**Field Notes**:
- `hourly_rate_min/max`: In pence (1200 = £12.00)
- `dbs_status`: `not_checked`, `basic`, `standard`, `enhanced`, `enhanced_barred`, `pending`, `expired`
- `profile_completion_status`: `not_started`, `in_progress`, `complete`

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Profile not found

---

### Update Worker Profile

Update worker profile (any step of the wizard).

**Endpoint**: `PUT /api/worker/profile`

**Headers**: Requires `Authorization: Bearer <access_token>`

**Request Body** (all fields optional):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+44 7700 900123",
  "date_of_birth": "1990-05-15",
  "address_line_1": "123 Main St",
  "city": "London",
  "postcode": "SW1A 1AA",
  
  "dbs_status": "enhanced",
  "dbs_certificate_number": "001234567890",
  "dbs_issue_date": "2023-01-15",
  "dbs_expiry_date": "2025-12-31",
  "qualifications": [
    {
      "code": "NVQ_LEVEL_2",
      "expiry_date": "2026-01-15",
      "document_url": "https://..."
    }
  ],
  
  "years_experience": "3-5",
  "specializations": ["elderly_care", "dementia"],
  "languages": ["English", "Polish"],
  "soft_skills": ["patient", "compassionate"],
  "bio": "Experienced care worker...",
  
  "available_days": ["monday", "tuesday", "wednesday"],
  "shift_types": ["day", "night"],
  "travel_radius_miles": 15,
  "hourly_rate_min": 1200,
  "hourly_rate_max": 1500,
  "willing_to_travel": true,
  "has_own_transport": true,
  
  "current_step": 3
}
```

**Success Response** (200 OK):
Returns the updated profile (same structure as GET profile).

**Automatic Calculation**:
- Profile completion percentage is automatically calculated
- Completion status is updated based on percentage
- Access to job board is granted at 100% completion

**Profile Completion Weights**:
- Step 1 (Personal Details): 20%
- Step 2 (Qualifications): 30%
- Step 3 (Skills & Experience): 25%
- Step 4 (Availability): 25%

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Profile not found

---

## Care Home Endpoints

### Get Care Home Profile

Get the authenticated care home's profile.

**Endpoint**: `GET /api/care-home/profile`

**Headers**: Requires `Authorization: Bearer <access_token>`

**Success Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "business_name": "Sunnydale Care Home",
  "cqc_provider_id": "1-123456789",
  "cqc_rating": "good",
  "care_home_type": "residential",
  "contact_name": "Jane Smith",
  "phone": "+44 20 7946 0958",
  "address_line_1": "456 High Street",
  "city": "Manchester",
  "postcode": "M1 1AA",
  "website": "https://sunnydale.example.com",
  "description": "A friendly care home specializing in...",
  "verification_status": "verified",
  "profile_completion_percentage": "85"
}
```

**Field Notes**:
- `cqc_rating`: `outstanding`, `good`, `requires_improvement`, `inadequate`
- `verification_status`: `pending`, `verified`, `rejected`
- `care_home_type`: `residential`, `nursing`, `dementia`, `learning_disabilities`

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Profile not found

---

### Update Care Home Profile

Update care home profile.

**Endpoint**: `PUT /api/care-home/profile`

**Headers**: Requires `Authorization: Bearer <access_token>`

**Request Body** (all fields optional):
```json
{
  "business_name": "Sunnydale Care Home",
  "business_registration_number": "12345678",
  "cqc_provider_id": "1-123456789",
  "cqc_location_id": "1-987654321",
  "care_home_type": "residential",
  "contact_name": "Jane Smith",
  "contact_title": "Manager",
  "phone": "+44 20 7946 0958",
  "address_line_1": "456 High Street",
  "address_line_2": "Floor 2",
  "city": "Manchester",
  "county": "Greater Manchester",
  "postcode": "M1 1AA",
  "website": "https://sunnydale.example.com",
  "description": "A friendly care home...",
  "logo_url": "https://...",
  "number_of_beds": "50"
}
```

**Success Response** (200 OK):
Returns the updated profile (same structure as GET profile).

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Profile not found

---

## Health Check

### API Health Check

Check API, database, and Redis health status.

**Endpoint**: `GET /api/health`

**Authentication**: None required

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "environment": "production",
  "timestamp": "2026-01-25T12:34:56.789012",
  "database": "connected",
  "redis": "connected"
}
```

**Possible Status Values**:
- `database`: `connected`, `error`
- `redis`: `connected`, `disconnected`, `error`

---

### Nginx Health Check

Simple health check for load balancers.

**Endpoint**: `GET /health`

**Authentication**: None required

**Success Response** (200 OK):
```
OK
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 OK | Success | Request completed successfully |
| 201 Created | Created | New resource created (registration) |
| 400 Bad Request | Client Error | Invalid input, validation failure |
| 401 Unauthorized | Auth Failed | Missing or invalid token |
| 403 Forbidden | Forbidden | Account inactive or insufficient permissions |
| 404 Not Found | Not Found | Resource doesn't exist |
| 422 Unprocessable Entity | Validation Error | Invalid data format (email, etc.) |
| 429 Too Many Requests | Rate Limited | Too many requests from IP |
| 500 Internal Server Error | Server Error | Unexpected server error |

### Common Error Examples

**Invalid Token**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Email Already Registered**:
```json
{
  "detail": "Email already registered"
}
```

**Weak Password**:
```json
{
  "detail": "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
}
```

**Profile Not Complete**:
```json
{
  "detail": "Profile must be 100% complete to access this feature"
}
```

---

## Rate Limiting

Rate limits are enforced by Nginx to protect against abuse:

### General Endpoints
- **Limit**: 10 requests per second per IP
- **Burst**: 20 requests
- **Response**: `429 Too Many Requests`

### Authentication Endpoints
- **Limit**: 5 requests per minute per IP
- **Burst**: 10 requests
- **Applies to**: `/api/auth/login`, `/api/auth/register`, `/api/auth/password-reset-*`

### Rate Limit Response

When rate limited:
```json
{
  "detail": "Too many requests. Please try again later."
}
```

**Headers** (included in rate-limited responses):
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
Retry-After: 60
```

---

## CORS

The API allows cross-origin requests from these origins:

**Production**:
- `https://vicarity.co.uk`
- `https://www.vicarity.co.uk`

**Development**:
- `http://localhost:3000`
- `http://localhost:8000`

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers**: Authorization, Content-Type, X-Requested-With  
**Credentials**: Allowed (cookies, authorization headers)

---

## Pagination (Future)

When pagination is implemented for list endpoints:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 20, max: 100)

---

## Examples

### Complete Registration Flow

```javascript
// 1. Register
const registerRes = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'worker@example.com',
    password: 'SecurePass123!',
    user_type: 'worker'
  })
});
const { user_id } = await registerRes.json();

// 2. User checks email and clicks verification link
// Link contains: https://vicarity.co.uk/verify-email?token=...

// 3. Frontend verifies email
const verifyRes = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: tokenFromUrl })
});
const { redirect_to } = await verifyRes.json();

// 4. Login after verification
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'worker@example.com',
    password: 'SecurePass123!'
  })
});
const { access_token, refresh_token, profile_complete } = await loginRes.json();

// 5. Complete profile if needed
if (!profile_complete) {
  const profileRes = await fetch('/api/worker/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_name: 'John',
      last_name: 'Doe',
      // ... other fields
    })
  });
}
```

### Token Refresh Example

```javascript
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (refreshRes.ok) {
      const { access_token } = await refreshRes.json();
      accessToken = access_token;
      
      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }
  
  return response;
}
```

---

## Testing

### Interactive API Documentation

FastAPI provides automatic interactive documentation:

**Swagger UI**: `https://vicarity.co.uk/api/docs`  
**ReDoc**: `https://vicarity.co.uk/api/redoc`

These interfaces allow you to test all endpoints directly in the browser.

### cURL Examples

**Register**:
```bash
curl -X POST https://vicarity.co.uk/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "user_type": "worker"
  }'
```

**Login**:
```bash
curl -X POST https://vicarity.co.uk/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile** (with auth):
```bash
curl -X GET https://vicarity.co.uk/api/worker/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-25 | Initial API release |

---

**Need help?** Check the [Development Guide](./DEVELOPMENT.md) or [Architecture Documentation](./ARCHITECTURE.md).
