"""Data-contract tests for the write endpoints added for full button wiring:
researcher create/delete, project update, and the teams/tasks/assignments/links
resources (each created entity returns, appears in list reads, and persists)."""

import asyncio

from sqlalchemy import select

from src.models.audit import AuditLog
from src.models.project import Project
from src.models.publication import Publication
from src.models.user import User
from tests.conftest import DEMO_ACCOUNTS, TestSessionLocal, auth_headers, login

API = "/api/v1"


def _db_row(model, **filters):
    """Read a row straight from the isolated test DB.

    The test engine uses NullPool, so each asyncio.run() loop opens its own
    connections and can see committed data from the TestClient's requests.
    """
    async def fetch():
        async with TestSessionLocal() as db:
            stmt = select(model)
            for key, value in filters.items():
                stmt = stmt.where(getattr(model, key) == value)
            result = await db.execute(stmt)
            return result.scalars().first()
    return asyncio.run(fetch())


def _admin(client):
    return auth_headers(login(client, DEMO_ACCOUNTS["admin"]["email"])["access_token"])


def _researcher(client):
    return auth_headers(login(client, DEMO_ACCOUNTS["researcher"]["email"])["access_token"])


def _reviewer(client):
    return auth_headers(login(client, DEMO_ACCOUNTS["reviewer"]["email"])["access_token"])


# ---------------------------------------------------------------------------
# Researchers: create + delete (invite / add-researcher / remove-user flows)
# ---------------------------------------------------------------------------


def test_create_researcher_persists(client):
    headers = _admin(client)
    payload = {
        "name": "Create Contract Tester",
        "email": "create.contract@test.edu",
        "role": "researcher",
        "institution": "Test Institute",
    }
    res = client.post(f"{API}/researchers/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["name"] == "Create Contract Tester"
    assert body["department"] == "General Department"  # schema default filled
    assert body["initials"] == "CC"  # derived from name

    # Appears in the list and survives a fresh login (new token + session).
    listed = client.get(f"{API}/researchers/", headers=_admin(client))
    assert any(u["email"] == "create.contract@test.edu" for u in listed.json())

    # Duplicate email rejected.
    dup = client.post(f"{API}/researchers/", json=payload, headers=headers)
    assert dup.status_code == 400


def test_delete_researcher(client):
    headers = _admin(client)
    created = client.post(
        f"{API}/researchers/",
        json={"name": "Delete Me", "email": "delete.me@test.edu", "role": "researcher"},
        headers=headers,
    ).json()
    res = client.delete(f"{API}/researchers/{created['id']}", headers=headers)
    assert res.status_code == 200
    gone = client.get(f"{API}/researchers/{created['id']}", headers=headers)
    assert gone.status_code == 404
    # Soft delete: the row survives flagged as deleted (recoverable + auditable).
    row = _db_row(User, email="delete.me@test.edu")
    assert row is not None and row.is_deleted and row.deleted_at is not None
    # An audit entry was recorded.
    logs = client.get(f"{API}/audit-logs/", headers=_admin(client)).json()
    assert any(l["action"] == "removed researcher" and l["target"] == "Delete Me" for l in logs)
    # The removed account can no longer sign in (invite password is scicollab-invite).
    attempt = client.post(
        f"{API}/auth/login",
        json={"email": "delete.me@test.edu", "password": "scicollab-invite"},
    )
    assert attempt.status_code == 401


def test_researcher_write_permissions(client):
    reviewer = _reviewer(client)
    payload = {"name": "Nope", "email": "nope@test.edu", "role": "researcher"}
    assert client.post(f"{API}/researchers/", json=payload, headers=reviewer).status_code == 403
    assert client.delete(f"{API}/researchers/2", headers=reviewer).status_code == 403


# ---------------------------------------------------------------------------
# Projects: update
# ---------------------------------------------------------------------------


def test_update_project_persists(client):
    headers = _researcher(client)  # researcher holds research.manageProjects
    res = client.put(f"{API}/projects/1", json={"status": "Paused"}, headers=headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "Paused"

    listed = client.get(f"{API}/projects/", headers=headers).json()
    assert next(p for p in listed if p["id"] == 1)["status"] == "Paused"

    # Missing project → 404.
    assert client.put(f"{API}/projects/9999", json={"status": "Active"}, headers=headers).status_code == 404


def test_delete_project_persists(client):
    headers = _researcher(client)  # researcher holds research.manageProjects
    # Create a throwaway project to delete.
    created = client.post(
        f"{API}/projects/",
        json={
            "title": "Temp Delete Me",
            "description": "Throwaway project for delete test",
            "status": "Active",
            "pi": "Dr. Tester",
            "startDate": "2026-01-01",
        },
        headers=headers,
    )
    assert created.status_code == 200, created.text
    pid = created.json()["id"]

    assert client.delete(f"{API}/projects/{pid}", headers=headers).status_code == 200
    listed = client.get(f"{API}/projects/", headers=headers).json()
    assert all(p["id"] != pid for p in listed)
    assert client.delete(f"{API}/projects/{pid}", headers=headers).status_code == 404
    # Soft delete: the row survives flagged as deleted.
    row = _db_row(Project, id=pid)
    assert row is not None and row.is_deleted and row.deleted_at is not None
    # An audit entry was recorded (the deleting actor is Dr. Sarah Chen).
    logs = client.get(f"{API}/audit-logs/", headers=_admin(client)).json()
    assert any(l["action"] == "deleted project" and l["target"] == "Temp Delete Me" for l in logs)

    # Reviewer lacks research.manageProjects → 403.
    reviewer = _reviewer(client)
    assert client.delete(f"{API}/projects/1", headers=reviewer).status_code == 403


# ---------------------------------------------------------------------------
# Teams
# ---------------------------------------------------------------------------


def test_team_crud_and_persistence(client):
    headers = _researcher(client)
    created = client.post(
        f"{API}/teams/",
        json={
            "name": "Contract Team",
            "project": "FedGraph",
            "members": [{"name": "Dr. Sarah Chen", "role": "Lead", "initials": "SC"}],
        },
        headers=headers,
    )
    assert created.status_code == 200, created.text
    team = created.json()
    assert team["id"] is not None

    listed = client.get(f"{API}/teams/", headers=headers).json()
    assert any(t["id"] == team["id"] and t["name"] == "Contract Team" for t in listed)

    # Add a member via PUT; persists across a fresh login.
    updated = client.put(
        f"{API}/teams/{team['id']}",
        json={"members": [*team["members"], {"name": "Dr. Emma Torres", "role": "Researcher", "initials": "ET"}]},
        headers=headers,
    )
    assert updated.status_code == 200
    assert len(updated.json()["members"]) == 2
    assert len(client.get(f"{API}/teams/", headers=_researcher(client)).json()[0]["members"]) == 2


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


def test_task_crud_and_status_toggle(client):
    headers = _researcher(client)
    created = client.post(
        f"{API}/tasks/",
        json={"projectId": 1, "title": "Contract Task", "assignee": "Dr. Sarah Chen", "dueDate": "2026-09-01", "priority": "High"},
        headers=headers,
    )
    assert created.status_code == 200, created.text
    task = created.json()
    assert task["status"] == "In Progress"  # default applied

    toggled = client.put(f"{API}/tasks/{task['id']}", json={"status": "Completed"}, headers=headers)
    assert toggled.status_code == 200
    assert toggled.json()["status"] == "Completed"
    assert client.get(f"{API}/tasks/", headers=headers).json()[0]["status"] == "Completed"


# ---------------------------------------------------------------------------
# Assignments (upsert matrix cells)
# ---------------------------------------------------------------------------


def test_assignment_upsert_and_delete(client):
    headers = _researcher(client)
    first = client.post(
        f"{API}/assignments/",
        json={"projectId": 1, "researcherId": 1, "role": "PI", "status": "In Progress"},
        headers=headers,
    )
    assert first.status_code == 200, first.text
    first_id = first.json()["id"]

    # Same (project, researcher) pair upserts instead of duplicating.
    second = client.post(
        f"{API}/assignments/",
        json={"projectId": 1, "researcherId": 1, "role": "PI", "status": "Complete"},
        headers=headers,
    )
    assert second.status_code == 200
    assert second.json()["id"] == first_id
    assert second.json()["status"] == "Complete"

    rows = client.get(f"{API}/assignments/", headers=headers).json()
    assert len([r for r in rows if r["projectId"] == 1 and r["researcherId"] == 1]) == 1

    assert client.delete(f"{API}/assignments/{first_id}", headers=headers).status_code == 200
    assert client.get(f"{API}/assignments/", headers=headers).json() == []


# ---------------------------------------------------------------------------
# Links (publication linking)
# ---------------------------------------------------------------------------


def test_link_crud_and_relation_cycle(client):
    headers = _researcher(client)  # researcher holds publications.create
    created = client.post(
        f"{API}/links/",
        json={
            "sourceTitle": "GNN Paper",
            "targetTitle": "Attention Is All You Need",
            "targetAuthors": "Vaswani et al.",
            "targetYear": "2017",
            "targetType": "Conference",
            "relation": "Cites",
        },
        headers=headers,
    )
    assert created.status_code == 200, created.text
    link = created.json()

    updated = client.put(f"{API}/links/{link['id']}", json={"relation": "Related"}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["relation"] == "Related"

    assert client.delete(f"{API}/links/{link['id']}", headers=headers).status_code == 200
    assert client.get(f"{API}/links/", headers=headers).json() == []


def test_link_write_requires_publications_create(client):
    reviewer = _reviewer(client)  # reviewer only has publications.review
    payload = {
        "sourceTitle": "S",
        "targetTitle": "T",
        "targetAuthors": "A",
        "targetYear": "2024",
        "relation": "Cites",
    }
    assert client.post(f"{API}/links/", json=payload, headers=reviewer).status_code == 403
    assert client.post(f"{API}/teams/", json={"name": "T", "members": []}, headers=reviewer).status_code == 403
    assert client.post(f"{API}/tasks/", json={"projectId": 1, "title": "t", "assignee": "a", "dueDate": "d"}, headers=reviewer).status_code == 403


# ---------------------------------------------------------------------------
# Publications: update + delete
# ---------------------------------------------------------------------------


def test_update_publication_persists(client):
    admin = _admin(client)
    res = client.put(f"{API}/publications/1", json={"status": "Under Review"}, headers=admin)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "Under Review"
    # Persists across a fresh session.
    listed = client.get(f"{API}/publications/", headers=admin).json()
    assert next(p for p in listed if p["id"] == 1)["status"] == "Under Review"
    # Revert for test isolation.
    client.put(f"{API}/publications/1", json={"status": "Published"}, headers=admin)
    assert client.put(f"{API}/publications/9999", json={"status": "X"}, headers=admin).status_code == 404


def test_delete_publication(client):
    admin = _admin(client)
    created = client.post(
        f"{API}/publications/",
        json={"title": "Delete Contract Pub", "authors": ["A"], "abstract": "x", "journal": "J", "year": 2024},
        headers=admin,
    ).json()
    res = client.delete(f"{API}/publications/{created['id']}", headers=admin)
    assert res.status_code == 200
    assert client.get(f"{API}/publications/{created['id']}", headers=admin).status_code == 404
    # Soft delete: the row survives flagged as deleted.
    row = _db_row(Publication, id=created["id"])
    assert row is not None and row.is_deleted and row.deleted_at is not None
    # An audit entry was recorded.
    logs = client.get(f"{API}/audit-logs/", headers=admin).json()
    assert any(l["action"] == "deleted publication" and l["target"] == "Delete Contract Pub" for l in logs)


def test_publication_write_permissions(client):
    # Researcher lacks publications.approve / publications.archive.
    researcher = _researcher(client)
    assert client.put(f"{API}/publications/1", json={"status": "X"}, headers=researcher).status_code == 403
    assert client.delete(f"{API}/publications/1", headers=researcher).status_code == 403


# ---------------------------------------------------------------------------
# Citations: update + delete
# ---------------------------------------------------------------------------


def test_update_citation_persists(client):
    headers = _researcher(client)
    res = client.put(
        f"{API}/citations/1",
        json={"context": "updated contract context"},
        headers=headers,
    )
    assert res.status_code == 200, res.text
    assert res.json()["context"] == "updated contract context"
    listed = client.get(f"{API}/citations/", headers=headers).json()
    assert next(c for c in listed if c["id"] == 1)["context"] == "updated contract context"
    # Revert.
    client.put(f"{API}/citations/1", json={"context": "original context"}, headers=headers)
    assert client.put(f"{API}/citations/9999", json={"context": "x"}, headers=headers).status_code == 404


def test_delete_citation(client):
    headers = _researcher(client)
    created = client.post(
        f"{API}/citations/",
        json={"sourcePubId": 1, "targetPubId": 2, "year": 2024, "context": "delete me"},
        headers=headers,
    ).json()
    assert client.delete(f"{API}/citations/{created['id']}", headers=headers).status_code == 200
    listed = client.get(f"{API}/citations/", headers=headers).json()
    assert all(c["id"] != created["id"] for c in listed)


# ---------------------------------------------------------------------------
# Conferences: update + delete
# ---------------------------------------------------------------------------


def test_update_conference_persists(client):
    headers = _researcher(client)
    res = client.put(f"{API}/conferences/1", json={"location": "Test City"}, headers=headers)
    assert res.status_code == 200, res.text
    assert res.json()["location"] == "Test City"
    listed = client.get(f"{API}/conferences/", headers=headers).json()
    assert next(c for c in listed if c["id"] == 1)["location"] == "Test City"
    # Revert.
    client.put(f"{API}/conferences/1", json={"location": "Vancouver"}, headers=headers)
    assert client.put(f"{API}/conferences/9999", json={"location": "X"}, headers=headers).status_code == 404


def test_delete_conference(client):
    headers = _researcher(client)
    created = client.post(
        f"{API}/conferences/",
        json={"name": "Delete Contract Conf", "shortName": "DCC", "location": "L", "startDate": "2024-01-01", "endDate": "2024-01-02", "website": "https://x"},
        headers=headers,
    ).json()
    assert client.delete(f"{API}/conferences/{created['id']}", headers=headers).status_code == 200
    listed = client.get(f"{API}/conferences/", headers=headers).json()
    assert all(c["id"] != created["id"] for c in listed)


# ---------------------------------------------------------------------------
# Audit trail: every create/update/delete mutation is recorded
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Reports: real export content
# ---------------------------------------------------------------------------


def test_report_export_returns_real_content(client):
    admin = _admin(client)

    # Default: publications CSV with the real seeded rows.
    res = client.post(f"{API}/reports/export", json={}, headers=admin)
    assert res.status_code == 200
    assert "publications-export" in res.headers["Content-Disposition"]
    body = res.content.decode("utf-8")
    assert "Title" in body
    assert "Graph Neural Networks for Protein Interaction Prediction at Scale" in body
    assert "10.1038/s41592-024-02234-7" in body

    # JSON researchers.
    res = client.post(
        f"{API}/reports/export",
        json={"format": "JSON", "data_type": "researchers"},
        headers=admin,
    )
    assert res.status_code == 200
    data = res.json()
    assert any(u["Email"] == "s.chen@mit.edu" for u in data)

    # PDF projects (real PDF bytes).
    res = client.post(
        f"{API}/reports/export",
        json={"format": "PDF", "data_type": "projects"},
        headers=admin,
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("application/pdf")
    assert res.content[:4] == b"%PDF"
    assert len(res.content) > 1000  # a real rendered document, not an empty stub

    # Every export is recorded in the audit log (Export category).
    logs = client.get(f"{API}/audit-logs/", headers=admin).json()
    assert any(l["action"] == "exported publications report" and l["category"] == "Export" for l in logs)

    # Unsupported data type / format → 400.
    assert client.post(f"{API}/reports/export", json={"data_type": "nope"}, headers=admin).status_code == 400
    assert client.post(f"{API}/reports/export", json={"format": "XML"}, headers=admin).status_code == 400


def test_audit_trail_covers_all_mutations(client):
    researcher = _researcher(client)
    admin = _admin(client)

    # Project create + update (researcher acts).
    project = client.post(
        f"{API}/projects/",
        json={
            "title": "Audit Trail Project",
            "description": "Audit coverage",
            "status": "Active",
            "pi": "Dr. Audit",
            "startDate": "2026-01-01",
        },
        headers=researcher,
    ).json()
    client.put(f"{API}/projects/{project['id']}", json={"status": "Paused"}, headers=researcher)

    # Publication create + update (admin holds publications.approve).
    pub = client.post(
        f"{API}/publications/",
        json={"title": "Audit Trail Pub", "authors": ["A"], "abstract": "x", "journal": "J", "year": 2024},
        headers=admin,
    ).json()
    client.put(f"{API}/publications/{pub['id']}", json={"status": "Under Review"}, headers=admin)

    # Researcher create + update (admin).
    user = client.post(
        f"{API}/researchers/",
        json={"name": "Audit Trail User", "email": "audit.trail@test.edu", "role": "researcher"},
        headers=admin,
    ).json()
    client.put(f"{API}/researchers/{user['id']}", json={"department": "QA"}, headers=admin)

    # Conference + citation create + update (researcher).
    conf = client.post(
        f"{API}/conferences/",
        json={"name": "Audit Conf", "shortName": "AC", "location": "L", "startDate": "2024-01-01", "endDate": "2024-01-02", "website": "https://x"},
        headers=researcher,
    ).json()
    client.put(f"{API}/conferences/{conf['id']}", json={"location": "X"}, headers=researcher)
    cit = client.post(
        f"{API}/citations/",
        json={"sourcePubId": 1, "targetPubId": 2, "year": 2024, "context": "audit"},
        headers=researcher,
    ).json()
    client.put(f"{API}/citations/{cit['id']}", json={"context": "audited"}, headers=researcher)

    logs = client.get(f"{API}/audit-logs/", headers=admin).json()

    def has(action: str, target: str) -> bool:
        return any(l["action"] == action and l["target"] == target for l in logs)

    assert has("created project", "Audit Trail Project")
    assert has("updated project", "Audit Trail Project")
    assert has("created publication", "Audit Trail Pub")
    assert has("updated publication", "Audit Trail Pub")
    assert has("created researcher", "Audit Trail User")
    assert has("updated researcher", "Audit Trail User")
    assert has("created conference", "Audit Conf")
    assert has("updated conference", "Audit Conf")
    assert has("created citation", "Publication 1 → 2")
    assert has("updated citation", f"Citation #{cit['id']}")

    # Only entries written by this test — correct actors and categories.
    test_entries = [l for l in logs if "Audit Trail" in l["target"] or l["action"].endswith("citation")]
    assert all(l["actor"] in {"Dr. Sarah Chen", "System Root"} for l in test_entries)
    assert all(l["category"] in {"Data", "Admin"} for l in test_entries)
