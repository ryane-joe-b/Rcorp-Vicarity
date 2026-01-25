"""
Basic tests for Vicarity API
"""

import pytest
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_root():
    """Test root endpoint returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Vicarity API - Care Worker Marketplace"}


def test_health_check():
    """Test health endpoint returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "timestamp" in data


def test_api_status():
    """Test API status endpoint."""
    response = client.get("/api/status")
    assert response.status_code == 200
    assert "message" in response.json()
