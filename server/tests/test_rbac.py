"""Role-based access control: 401s, the role x endpoint 403 matrix, and the
self-or-admin rule on PUT /researchers/{id}."""

import pytest

from tests.conftest import DEMO_ACCOUNTS, OTHER_USER_ID, auth_headers, login

API = "/api/v1"

# Every endpoint that requires authentication. Bodies for POSTs are valid so
# the assertion isolates the auth gate (401) rather than body validation.
PROTECTED_ENDPOINTS = [
    ("GET", f"{API}/researchers/", None),
    ("GET", f"{API}/researchers/{DEMO_ACCOUNTS['researcher']['id']}", None),
    ("PUT", f"{API}/researchers/{DEMO_ACCOUNTS['researcher']['id']}", {"name": "Dr. Sarah Chen"}),
    ("GET", f"{API}/publications/", None),
    ("GET", f"{API}/publications/1", None),
    ("POST", f"{API}/publications/", {"title": "T", "authors": ["A"], "abstract": "x", "journal": "J", "year": 2024}),
    ("GET", f"{API}/projects/", None),
    ("POST", f"{API}/projects/", {"title": "T", "description": "d", "pi": "P", "startDate": "2024-01-01"}),
    ("GET", f"{API}/citations/", None),
    ("POST", f"{API}/citations/", {"sourcePubId": 1, "targetPubId": 2, "year": 2024, "context": "c"}),
    ("GET", f"{API}/conferences/", None),
    ("POST", f"{API}/conferences/", {"name": "N", "shortName": "S", "location": "L", "startDate": "2024-01-01", "endDate": "2024-01-02", "website": "https://x"}),
    ("POST", f"{API}/dois/mint", {"publication_id": 1}),
    ("GET", f"{API}/audit-logs/", None),
    ("POST", f"{API}/audit-logs/", {"actor": "A", "action": "act", "target": "t", "timestamp": "2024-01-01T00:00:00"}),
    ("POST", f"{API}/reports/export", {}),
]

READ_ENDPOINTS = [
    f"{API}/researchers/",
    f"{API}/publications/",
    f"{API}/projects/",
    f"{API}/citations/",
    f"{API}/conferences/",
]


@pytest.mark.parametrize("method,path,body", PROTECTED_ENDPOINTS, ids=lambda v: str(v)[:40])
def test_protected_endpoint_requires_token(client, method, path, body):
    res = client.request(method, path, json=body)
    assert res.status_code == 401, f"{method} {path} -> {res.status_code}"


def test_reads_allowed_for_every_authenticated_role(client):
    for role, acct in DEMO_ACCOUNTS.items():
        headers = auth_headers(login(client, acct["email"])["access_token"])
        for path in READ_ENDPOINTS:
            res = client.get(path, headers=headers)
            assert res.status_code == 200, f"{role} GET {path} -> {res.status_code}"


# Guarded endpoints mapped to the expected status per role.
#   admin.manageUsers      -> editing someone else's profile
#   analytics.viewAuditLogs-> audit log list + create
#   dois.mint              -> DOI minting
#   publications.create    -> creating a publication
#   research.manageProjects-> creating a project
#   analytics.exportReports-> exporting reports
GUARDED_ENDPOINTS = [
    (
        "GET", f"{API}/audit-logs/", None,
        {"researcher": 403, "institution": 403, "reviewer": 403, "admin": 200},
    ),
    (
        "POST", f"{API}/audit-logs/",
        {"actor": "A", "action": "act", "target": "t", "timestamp": "2024-01-01T00:00:00"},
        {"researcher": 403, "institution": 403, "reviewer": 403, "admin": 200},
    ),
    (
        "POST", f"{API}/dois/mint", {"publication_id": 1},
        {"researcher": 403, "institution": 403, "reviewer": 403, "admin": 200},
    ),
    (
        "PUT", f"{API}/researchers/{OTHER_USER_ID}", {"name": "Dr. Emma Torres"},
        {"researcher": 403, "institution": 403, "reviewer": 403, "admin": 200},
    ),
    (
        "POST", f"{API}/publications/",
        {"title": "Matrix Pub", "authors": ["A"], "abstract": "x", "journal": "J", "year": 2024},
        {"researcher": 200, "institution": 200, "reviewer": 403, "admin": 200},
    ),
    (
        "POST", f"{API}/projects/",
        {"title": "Matrix Project", "description": "d", "pi": "P", "startDate": "2024-01-01"},
        {"researcher": 200, "institution": 200, "reviewer": 403, "admin": 200},
    ),
    (
        "POST", f"{API}/reports/export", {},
        {"researcher": 200, "institution": 200, "reviewer": 403, "admin": 200},
    ),
]


@pytest.mark.parametrize("method,path,body,expected", GUARDED_ENDPOINTS, ids=lambda v: str(v)[:40])
def test_role_permission_matrix(client, method, path, body, expected):
    for role, acct in DEMO_ACCOUNTS.items():
        headers = auth_headers(login(client, acct["email"])["access_token"])
        res = client.request(method, path, json=body, headers=headers)
        assert res.status_code == expected[role], (
            f"{role} {method} {path} -> {res.status_code}, expected {expected[role]}"
        )


def test_researcher_can_edit_own_profile(client):
    headers = auth_headers(login(client, DEMO_ACCOUNTS["researcher"]["email"])["access_token"])
    res = client.put(
        f"{API}/researchers/{DEMO_ACCOUNTS['researcher']['id']}",
        json={"name": "Dr. Sarah Chen"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["id"] == DEMO_ACCOUNTS["researcher"]["id"]


@pytest.mark.parametrize("role", ["researcher", "institution", "reviewer"])
def test_non_admin_cannot_edit_other_profiles(client, role):
    headers = auth_headers(login(client, DEMO_ACCOUNTS[role]["email"])["access_token"])
    res = client.put(
        f"{API}/researchers/{OTHER_USER_ID}",
        json={"name": "Dr. Emma Torres"},
        headers=headers,
    )
    assert res.status_code == 403, f"{role} editing user {OTHER_USER_ID} -> {res.status_code}"


def test_admin_can_edit_any_profile(client):
    headers = auth_headers(login(client, DEMO_ACCOUNTS["admin"]["email"])["access_token"])
    res = client.put(
        f"{API}/researchers/{OTHER_USER_ID}",
        json={"name": "Dr. Emma Torres"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["id"] == OTHER_USER_ID


def test_admin_editing_missing_user_returns_404(client):
    headers = auth_headers(login(client, DEMO_ACCOUNTS["admin"]["email"])["access_token"])
    res = client.put(f"{API}/researchers/999999", json={"name": "Ghost"}, headers=headers)
    assert res.status_code == 404
