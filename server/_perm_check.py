"""Temporary permission matrix check. Restores every mutated record on exit."""
import asyncio
import json
import sys
import urllib.error
import urllib.request

sys.path.insert(0, ".")
import asyncpg  # noqa: E402
from src.core.config import settings  # noqa: E402

API = "http://127.0.0.1:8000/api/v1"
USERS = {
    "researcher": "s.chen@mit.edu",
    "reviewer": "j.okafor@cambridge.ac.uk",
    "institution": "admin@mit.edu",
    "admin": "sysadmin@scicollab.io",
}
TAG = "PERMTEST"


def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


def login(email):
    s, b = call("POST", "/auth/login", body={"email": email, "password": "password123"})
    assert s == 200, (email, s, b)
    return b["access_token"], b["user"]


async def snapshot(conn):
    pubs = await conn.fetch(
        "select id, status, doi from publications where id = any($1::int[]) order by id",
        [4, 5, 6, 7, 8, 12],
    )
    max_audit = await conn.fetchval("select coalesce(max(id),0) from audit_logs")
    return {r["id"]: (r["status"], r["doi"]) for r in pubs}, max_audit


async def restore(conn, pub_state, max_audit):
    for pub_id, (status, doi) in pub_state.items():
        await conn.execute(
            "update publications set status=$1, doi=$2 where id=$3", status, doi, pub_id
        )
    await conn.execute("delete from publication_links where \"sourceTitle\" like $1", f"{TAG}%")
    await conn.execute("delete from conferences where name like $1", f"{TAG}%")
    await conn.execute("delete from teams where name like $1", f"{TAG}%")
    await conn.execute("delete from users where email = $1", "permtest.admin@example.com")
    await conn.execute("delete from audit_logs where id > $1", max_audit)


async def main():
    conn = await asyncpg.connect(settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql"))
    pub_state, max_audit = await snapshot(conn)
    rows = []
    try:
        tok = {}
        usr = {}
        for role, email in USERS.items():
            tok[role], usr[role] = login(email)
        print("publications before:", pub_state)

        # 1. Review decisions on Submitted publications
        for pub_id, decision in ((4, "approve"), (12, "reject")):
            s, b = call("POST", f"/publications/{pub_id}/decision", tok["reviewer"],
                        {"decision": decision})
            rows.append((f"reviewer {decision} Submitted pub {pub_id}", s))

        # 2. Mint DOI
        doi_targets = {"researcher": 5, "institution": 5, "admin": 8}
        for role, pub_id in doi_targets.items():
            s, b = call("POST", "/dois/mint", tok[role], {"publication_id": pub_id})
            rows.append((f"{role} mint DOI on pub {pub_id}", s))
        s, b = call("POST", "/dois/mint", tok["institution"], {"publication_id": 7})
        rows.append(("institution mint DOI on Oxford pub 7 (deny)", s))
        s, b = call("POST", "/dois/mint", tok["reviewer"], {"publication_id": 5})
        rows.append(("reviewer mint DOI (deny)", s))
        s, b = call("POST", "/dois/mint", tok["researcher"], {"publication_id": 6})
        rows.append(("researcher mint DOI on own Draft pub 6 (deny)", s))

        # 3. Link publication
        link_targets = {
            "researcher": "Privacy-Preserving Graph Analytics: A Comprehensive Survey",
            "institution": "Graph Neural Networks for Protein Interaction Prediction at Scale",
            "admin": "Zero-Knowledge Proofs for Verifiable Federated Learning",
        }
        for role, source in link_targets.items():
            s, b = call("POST", "/links/", tok[role], {
                "sourceTitle": source,
                "targetTitle": f"{TAG} target",
                "targetAuthors": "Test, A.",
                "targetYear": "2024",
            })
            rows.append((f"{role} link publication", s))
        s, b = call("POST", "/links/", tok["reviewer"], {
            "sourceTitle": "Distributed Machine Learning at Petascale",
            "targetTitle": f"{TAG} target",
            "targetAuthors": "Test, A.",
            "targetYear": "2024",
        })
        rows.append(("reviewer link publication (deny)", s))

        # 4. Add conference event
        conf_targets = {"researcher": [5], "institution": [5], "admin": [8]}
        for role, pres in conf_targets.items():
            s, b = call("POST", "/conferences/", tok[role], {
                "name": f"{TAG} event {role}",
                "shortName": f"{TAG}{role[:3]}",
                "location": "Testville",
                "startDate": "2026-01-01",
                "endDate": "2026-01-02",
                "website": "https://example.com",
                "presentations": pres,
            })
            rows.append((f"{role} add conference event", s))
        s, b = call("POST", "/conferences/", tok["reviewer"], {
            "name": f"{TAG} event reviewer",
            "shortName": f"{TAG}rev",
            "location": "Testville",
            "startDate": "2026-01-01",
            "endDate": "2026-01-02",
            "website": "https://example.com",
            "presentations": [9],
        })
        rows.append(("reviewer add conference event (deny)", s))

        # 5. Negative tests
        s, b = call("POST", "/teams/", tok["reviewer"],
                    {"name": f"{TAG} reviewer team", "members": []})
        rows.append(("reviewer create team (deny)", s))
        s, b = call("POST", "/teams/", tok["researcher"],
                    {"name": f"{TAG} researcher team", "members": []})
        rows.append(("researcher create own team (allow)", s))
        s, b = call("POST", "/publications/4/decision", tok["researcher"], {"decision": "approve"})
        rows.append(("researcher approve review (deny)", s))
        for path in ("/audit-logs/", "/researchers/2"):
            s, b = call("PUT" if path.startswith("/researchers") else "GET", path,
                        tok["researcher"], {"role": "admin"} if path.startswith("/researchers") else None)
            rows.append((f"researcher access {path} (deny)", s))
        s, b = call("GET", "/audit-logs/", tok["admin"])
        rows.append(("admin access /audit-logs/ (allow)", s))
        s, b = call("POST", "/auth/register", body={
            "name": "Perm Test Admin",
            "email": "permtest.admin@example.com",
            "password": "password123",
            "role": "admin",
        })
        rows.append(("register with role=admin (deny 400)", s))
        s, b = call("POST", "/auth/register", body={
            "name": "Perm Test Admin",
            "email": "permtest.admin@example.com",
            "password": "password123",
            "role": "ADMIN",
        })
        rows.append(("register with role=ADMIN (deny 400)", s))
    finally:
        await restore(conn, pub_state, max_audit)
        after = await snapshot(conn)
        print("publications restored:", after[0])
        await conn.close()

    print("\n=== RESULTS ===")
    for label, status in rows:
        print(f"{status}  {label}")


asyncio.run(main())
