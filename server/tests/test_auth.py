"""Authentication behaviour: login, register, /auth/me, and permissions."""

from uuid import uuid4

from src.core.permissions import ROLE_PERMISSIONS

from tests.conftest import DEMO_ACCOUNTS, PASSWORD, auth_headers, login


def test_login_succeeds_for_every_demo_role_and_exposes_permissions(client):
    for role, acct in DEMO_ACCOUNTS.items():
        body = login(client, acct["email"])
        assert body["access_token"], f"{role}: expected a JWT"
        assert body["token_type"] == "bearer"
        assert body["user"]["role"] == role
        assert set(body["user"]["permissions"]) == ROLE_PERMISSIONS[role]


def test_login_is_public_no_token_needed(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": DEMO_ACCOUNTS["researcher"]["email"], "password": PASSWORD},
    )
    assert res.status_code == 200


def test_login_rejects_wrong_password(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": DEMO_ACCOUNTS["researcher"]["email"], "password": "not-the-password"},
    )
    assert res.status_code == 401


def test_login_rejects_unknown_email(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": PASSWORD},
    )
    assert res.status_code == 401


def test_me_returns_authenticated_user_with_permissions(client):
    for role, acct in DEMO_ACCOUNTS.items():
        token = login(client, acct["email"])["access_token"]
        res = client.get("/api/v1/auth/me", headers=auth_headers(token))
        assert res.status_code == 200, f"{role}: {res.text}"
        body = res.json()
        assert body["email"] == acct["email"]
        assert body["role"] == role
        assert set(body["permissions"]) == ROLE_PERMISSIONS[role]


def test_me_requires_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_rejects_garbage_token(client):
    res = client.get("/api/v1/auth/me", headers=auth_headers("not.a.jwt"))
    assert res.status_code == 401


def test_me_rejects_token_for_deleted_user(client):
    # A token whose subject no longer exists must be rejected.
    import jwt as pyjwt

    from src.core.config import settings

    ghost = pyjwt.encode(
        {"sub": "999999", "role": "researcher", "exp": 4_000_000_000},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    res = client.get("/api/v1/auth/me", headers=auth_headers(ghost))
    assert res.status_code == 401


def test_register_then_login_and_me(client):
    email = f"new.researcher.{uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New Researcher",
            "email": email,
            "password": PASSWORD,
            "role": "researcher",
            "institution": "Test University",
            "department": "Computer Science",
        },
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == email
    assert body["user"]["role"] == "researcher"
    # Default researcher permissions, not admin ones.
    assert set(body["user"]["permissions"]) == ROLE_PERMISSIONS["researcher"]

    # The new account can log in and /auth/me resolves it.
    logged_in = login(client, email)
    assert logged_in["user"]["email"] == email
    me = client.get("/api/v1/auth/me", headers=auth_headers(logged_in["access_token"]))
    assert me.status_code == 200
    assert me.json()["email"] == email

    # Registration is recorded in the audit log (Auth category).
    admin = auth_headers(login(client, DEMO_ACCOUNTS["admin"]["email"])["access_token"])
    logs = client.get("/api/v1/audit-logs/", headers=admin).json()
    assert any(
        l["action"] == "registered account"
        and l["target"] == email
        and l["category"] == "Auth"
        for l in logs
    )


def test_register_rejects_duplicate_email(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate",
            "email": DEMO_ACCOUNTS["researcher"]["email"],
            "password": PASSWORD,
        },
    )
    assert res.status_code == 400
