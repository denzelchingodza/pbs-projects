"""Shared pytest fixtures — e.g. a test DB session / FastAPI TestClient."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)
