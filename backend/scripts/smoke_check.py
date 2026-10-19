"""Live smoke test: login, probe every parameterless GET route, test exports.

Run while the API is up:  .venv/Scripts/python.exe scripts/smoke_check.py
Not a pytest suite - a quick end-to-end probe used during development.
"""

import json
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8000"


def request(method, path, token=None, data=None, form=False):
    url = BASE + path
    headers = {}
    body = None
    if token:
        headers["Authorization"] = "Bearer " + token
    if data is not None:
        if form:
            body = urllib.parse.urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read(), dict(resp.headers)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read(), dict(exc.headers)


def login(email):
    status, body, _ = request(
        "POST",
        "/api/v1/auth/login",
        data={"username": email, "password": "Password123!"},
        form=True,
    )
    if status != 200:
        raise RuntimeError(f"login failed for {email}: {status} {body[:200]!r}")
    return json.loads(body)["access_token"]


def main():
    failures = []

    token = login("ada.lovelace@example.edu")
    print("login (researcher): 200")

    status, body, _ = request("GET", "/openapi.json")
    spec = json.loads(body)

    probed = 0
    for path, item in sorted(spec["paths"].items()):
        get = item.get("get")
        if not get:
            continue
        params = get.get("parameters", [])
        required = [p for p in params if p.get("required") and p.get("in") == "query"]
        if required:
            continue  # needs query args; covered separately
        status, body, _ = request("GET", path, token=token)
        probed += 1
        # 404/403/405 are legitimate outcomes; 500 means a real bug.
        if status >= 500:
            failures.append((path, status, body[:200].decode(errors="replace")))
            print(f"  FAIL {status} {path}")
        else:
            print(f"  ok   {status} {path}")
    print(f"probed {probed} parameterless GET routes")

    # Report exports (xlsx / pdf) - the deps that were missing.
    for report in ("publications", "research", "collaboration", "institutions"):
        for fmt, magic in (("xlsx", b"PK"), ("pdf", b"%PDF")):
            path = f"/api/v1/reports/{report}?format={fmt}"
            status, body, _ = request("GET", path, token=token)
            ok = status == 200 and body.startswith(magic)
            flag = "ok  " if ok else "FAIL"
            print(f"  {flag} {status} reports/{report}?format={fmt} ({len(body)} bytes)")
            if not ok:
                failures.append((path, status, body[:200].decode(errors="replace")))

    # Role-protected endpoints need the matching role, else the 403 hides a 500.
    admin_token = login("albert.einstein@example.edu")
    inst_token = login("niels.bohr@example.edu")
    print("login (system_admin): 200")
    print("login (institution_admin): 200")

    role_checks = [
        (admin_token, "/api/v1/dashboard/admin"),
        (admin_token, "/api/v1/audit-logs"),
        (admin_token, "/api/v1/users"),
        (admin_token, "/api/v1/reviews"),
        (admin_token, "/api/v1/dashboard/institution"),
        (inst_token, "/api/v1/dashboard/institution"),
        (inst_token, "/api/v1/reports/institutions?format=json"),
        (inst_token, "/api/v1/dashboard/researcher"),
        (token, "/api/v1/projects/mine"),
        (token, "/api/v1/search?q=quantum"),
    ]
    for tok, path in role_checks:
        status, body, _ = request("GET", path, token=tok)
        ok = status < 500
        print(f"  {'ok  ' if ok else 'FAIL'} {status} {path}")
        if not ok:
            failures.append((path, status, body[:200].decode(errors="replace")))

    if failures:
        print("\nFAILURES:")
        for path, status, snippet in failures:
            print(f"  {status} {path}: {snippet}")
        return 1
    print("\nALL CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
