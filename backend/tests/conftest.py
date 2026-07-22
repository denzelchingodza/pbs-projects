"""
Shared pytest fixtures.

The `client` fixture used to hand back a TestClient wired straight to the
real app with no database override, which meant every test in this folder
was reading and writing backend/pbs_projects.db, the actual live database
behind the real site. Running `pytest` would have inserted rows like the
"Test User" quote from test_quotes.py directly into real data, right next
to Denzel's actual customers and leads. This gives every test its own
throwaway SQLite file instead (created fresh, deleted after).

`db_session` is the other half of this: a test that needs to seed data
before hitting an endpoint (creating an admin user to log in as, adding a
product to list) must write through this exact session, not by importing
`SessionLocal` from app.database directly. That module-level SessionLocal
is still bound to the real database, importing it in a test bypasses the
override below entirely and writes straight into real data again, exactly
the mistake this fixture exists to prevent. This was caught by actually
running the test suite once and finding a "admin@test.com" row sitting in
the real users table afterward, not assumed to be correct.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core import rate_limit as rate_limit_module
from app.database import Base, get_db
from app.main import app  # noqa: E402, importing this registers every model via the routers


@pytest.fixture()
def db_session(tmp_path):
    db_path = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # The rate limiter (app/core/rate_limit.py) keeps its counts in a plain
    # module-level dict, shared across every test in the same pytest run.
    # Without clearing it, a test earlier in the file submitting a few
    # quotes could leave a later, unrelated test's requests already
    # partway toward a 429 it never earned.
    rate_limit_module._submission_times.clear()

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        app.dependency_overrides.clear()
        engine.dispose()


@pytest.fixture()
def client(db_session):
    return TestClient(app)
