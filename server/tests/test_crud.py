"""Data contracts of the write endpoints.

For each resource (publications, projects, citations, conferences):
  - POST returns the created entity with an id and echoed fields
  - the created row appears in the list read
  - it is fetchable individually
  - it persists across requests (separate DB sessions / fresh logins)
  - schema defaults are applied when omitted
  - invalid payloads are rejected with 422
"""

from uuid import uuid4

import pytest

from tests.conftest import DEMO_ACCOUNTS, auth_headers, login

API = "/api/v1"


def _unique(prefix: str) -> str:
    return f"{prefix} {uuid4().hex[:8]}"


def _researcher_headers(client):
    return auth_headers(login(client, DEMO_ACCOUNTS["researcher"]["email"])["access_token"])


def test_create_publication_returns_entity_and_persists(client):
    headers = _researcher_headers(client)
    title = _unique("Test Publication")
    payload = {
        "title": title,
        "authors": ["Chen, S.", "Torres, E."],
        "abstract": "Abstract of the created publication.",
        "journal": "Journal of Tests",
        "year": 2026,
        "type": "Journal",
        "status": "Draft",
        # doi, citations, pages, volume, issue intentionally omitted
    }

    res = client.post(f"{API}/publications/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    created = res.json()
    assert created["id"] > 0
    assert created["title"] == title
    assert created["authors"] == payload["authors"]
    assert created["abstract"] == payload["abstract"]
    assert created["journal"] == payload["journal"]
    assert created["year"] == 2026
    assert created["type"] == "Journal"
    assert created["status"] == "Draft"
    assert created["doi"] is None
    assert created["citations"] == 0  # schema default

    # Appears in the list read.
    listing = client.get(f"{API}/publications/", headers=headers).json()
    assert any(p["id"] == created["id"] and p["title"] == title for p in listing)

    # Fetchable individually.
    fetched = client.get(f"{API}/publications/{created['id']}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["title"] == title

    # Persists across requests (a fresh login hits a new DB session).
    fresh = client.get(f"{API}/publications/", headers=_researcher_headers(client)).json()
    assert any(p["id"] == created["id"] for p in fresh)


def test_create_project_returns_entity_and_persists(client):
    headers = _researcher_headers(client)
    title = _unique("Test Project")
    payload = {
        "title": title,
        "description": "Description of the created project.",
        "pi": "Dr. Sarah Chen",
        "members": [1, 2, 5],
        "startDate": "2025-01-01",
        "endDate": "2026-12-31",
        "tags": ["Test", "Persistence"],
        # status intentionally omitted
    }

    res = client.post(f"{API}/projects/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    created = res.json()
    assert created["id"] > 0
    assert created["title"] == title
    assert created["description"] == payload["description"]
    assert created["pi"] == "Dr. Sarah Chen"
    assert created["members"] == [1, 2, 5]
    assert created["startDate"] == "2025-01-01"
    assert created["endDate"] == "2026-12-31"
    assert created["tags"] == ["Test", "Persistence"]
    assert created["status"] == "Active"  # schema default

    listing = client.get(f"{API}/projects/", headers=headers).json()
    assert any(p["id"] == created["id"] and p["title"] == title for p in listing)

    fresh = client.get(f"{API}/projects/", headers=_researcher_headers(client)).json()
    assert any(p["id"] == created["id"] for p in fresh)


def test_create_citation_returns_entity_and_persists(client):
    headers = _researcher_headers(client)
    context = _unique("Context for the created citation")
    payload = {
        "sourcePubId": 1,
        "targetPubId": 5,
        "year": 2026,
        "context": context,
    }

    res = client.post(f"{API}/citations/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    created = res.json()
    assert created["id"] > 0
    assert created["sourcePubId"] == 1
    assert created["targetPubId"] == 5
    assert created["year"] == 2026
    assert created["context"] == context

    listing = client.get(f"{API}/citations/", headers=headers).json()
    assert any(c["id"] == created["id"] and c["context"] == context for c in listing)

    fresh = client.get(f"{API}/citations/", headers=_researcher_headers(client)).json()
    assert any(c["id"] == created["id"] for c in fresh)


def test_create_conference_returns_entity_and_persists(client):
    headers = _researcher_headers(client)
    name = _unique("Test Conference")
    payload = {
        "name": name,
        "shortName": "TST26",
        "location": "Testville",
        "startDate": "2026-06-01",
        "endDate": "2026-06-05",
        "website": "https://tests.example.com",
        # type and presentations intentionally omitted
    }

    res = client.post(f"{API}/conferences/", json=payload, headers=headers)
    assert res.status_code == 200, res.text
    created = res.json()
    assert created["id"] > 0
    assert created["name"] == name
    assert created["shortName"] == "TST26"
    assert created["location"] == "Testville"
    assert created["startDate"] == "2026-06-01"
    assert created["endDate"] == "2026-06-05"
    assert created["website"] == "https://tests.example.com"
    assert created["type"] == "International"  # schema default
    assert created["presentations"] == []      # schema default

    listing = client.get(f"{API}/conferences/", headers=headers).json()
    assert any(c["id"] == created["id"] and c["name"] == name for c in listing)

    fresh = client.get(f"{API}/conferences/", headers=_researcher_headers(client)).json()
    assert any(c["id"] == created["id"] for c in fresh)


@pytest.mark.parametrize(
    "method,path,payload",
    [
        # Missing required fields for each resource.
        ("POST", f"{API}/publications/", {"authors": ["A"]}),
        ("POST", f"{API}/projects/", {"title": "T"}),
        ("POST", f"{API}/citations/", {"year": 2024}),
        ("POST", f"{API}/conferences/", {"name": "N"}),
    ],
    ids=["publication", "project", "citation", "conference"],
)
def test_create_rejects_invalid_payloads(client, method, path, payload):
    res = client.request(method, path, json=payload, headers=_researcher_headers(client))
    assert res.status_code == 422
