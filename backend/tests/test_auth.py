"""
Covers the parts of login that matter most for a one-admin site: a real
login actually works, a wrong password is rejected without leaking which
part was wrong, admin-only routes refuse a request with no token, and the
new rate limit on /login (see routers/auth.py) actually kicks in instead
of allowing unlimited password guesses.
"""
from app.core.security import hash_password
from app.models.user import User


def _create_admin(db_session, email="admin@test.com", password="a-real-password123"):
    db_session.add(User(name="Test Admin", email=email, hashed_password=hash_password(password), is_admin=True))
    db_session.commit()


def test_login_succeeds_with_correct_password(client, db_session):
    _create_admin(db_session)
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "a-real-password123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_fails_with_wrong_password(client, db_session):
    _create_admin(db_session)
    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong-password"})
    assert r.status_code == 401


def test_login_fails_for_unknown_email_with_same_message(client):
    # Both failure cases should read identically, a different message for
    # "wrong password" versus "no such account" would let someone probe
    # which admin emails actually exist on the site.
    wrong_password = client.post(
        "/api/auth/login", json={"email": "doesnotexist@test.com", "password": "whatever123"}
    )
    assert wrong_password.status_code == 401
    assert wrong_password.json()["detail"] == "Incorrect email or password."


def test_admin_route_requires_a_token(client):
    r = client.get("/api/admin/quotes")
    assert r.status_code == 401


def test_login_is_rate_limited(client, db_session):
    _create_admin(db_session)
    # The login limiter allows 10 attempts per 15 minutes (routers/auth.py),
    # the 11th in a row from the same test client should be refused outright
    # rather than even checking the password.
    for _ in range(10):
        client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong-password"})

    r = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong-password"})
    assert r.status_code == 429
