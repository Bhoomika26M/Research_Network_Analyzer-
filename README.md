# Research_Network_Analyzer-

A focused full-stack slice of the Scientific Collaboration Platform. This copy of the
project contains **only three modules**:

1. **Login and Registration** — real JWT authentication against the FastAPI backend
2. **User Management** — system-admin management of platform accounts
3. **Collaborations** — collaboration network, research teams and partnership timeline

Built with React 19, TypeScript, Vite, Tailwind CSS v4 and Zustand on the frontend,
and FastAPI + async SQLAlchemy 2 + PostgreSQL on the backend.

---

## Modules & where they live

| Module | Frontend | Backend |
| :--- | :--- | :--- |
| Login / Registration | `src/pages/Auth.tsx` (Sign In / Register tabs) | `/api/v1/auth` — `register`, `login`, `refresh`, `me`, `change-password` |
| User Management | `src/pages/systemAdmin/Users.tsx` (System Admin shell) | `/api/v1/users` — list, get, role change, activate/deactivate, delete (system_admin only) |
| Collaborations | `src/pages/Collaborations.tsx` (Researcher shell) | `/api/v1/collaboration/*`, `/api/v1/institutional-collaborations`, `/api/v1/projects` |

Role handling: after sign-in the shell is chosen from the role returned by
`GET /auth/me`. Researchers get Collaborations, system admins get User Management,
and any other role sees an honest "no module assigned" view with a sign-out action.

> **Note on the Collaborations page data:** all three of its sections (network
> visualization, Research Teams, Partnership Timeline) currently render static
> demonstration data embedded in `src/pages/Collaborations.tsx`. The backend does
> expose a real co-authorship graph at `GET /api/v1/collaboration/graph` (plus
> institutional-collaborations and projects APIs) that can back it later.

---

## Quick start

### Prerequisites

- Node.js >= 18, npm >= 9
- Python 3.12 and PostgreSQL (backend)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                               # then edit DATABASE_URL / JWT_SECRET
uvicorn app.main:app --reload                      # http://localhost:8000/docs
```

The schema is created from the models on startup (`Base.metadata.create_all`);
existing tables and data are never dropped. Health check: `GET http://localhost:8000/health`.

Optional, against a fresh database:

```bash
python scripts/seed.py            # demo institutions/departments/researchers/publications/projects + logins
python scripts/create_admin.py    # create the first system_admin account
```

### 2. Frontend (React + Vite)

```bash
npm install
cp .env.example .env              # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                       # http://localhost:5173 (dev server may already be running)
```

Useful scripts: `npm run typecheck` (tsc --noEmit), `npm run build` (production build).

### Backend verification

With the API running and the seed applied:

```bash
cd backend && .venv/Scripts/python.exe scripts/smoke_check.py
```

It logs in as every seeded role, probes every parameterless GET route (a 500 fails
the run), and asserts the role guards: `/users` answers 403 for non-admins and 401
without a token, while the collaboration APIs stay reachable for researchers.

### Demo logins

The seed creates one user per role. All seeded passwords are **`Password123!`**
(demo data only — never hardcode production secrets).

| Role | Email | What you get in the app |
| :--- | :--- | :--- |
| Researcher | `ada.lovelace@example.edu` | Collaborations module |
| System Admin | `albert.einstein@example.edu` | User Management module |
| Institution Admin | `niels.bohr@example.edu` | "No module assigned" view |
| Reviewer | `marie.curie@example.edu` | "No module assigned" view |

Registration (the Register tab) always creates a **Researcher** account; the
backend only lets a signed-in system admin create users with other roles, which
is what User Management does. Password reset by email is **not implemented** in
this build — the Forgot Password tab says so explicitly.

---

## Environment variables

Frontend (root `.env`):

| Variable | Purpose |
| :--- | :--- |
| `VITE_API_URL` | Backend base URL (default `http://localhost:8000/api/v1`) |

Backend (`backend/.env`):

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Async DSN, e.g. `postgresql+asyncpg://user:pass@localhost:5432/scna` |
| `JWT_SECRET`, `JWT_ALGORITHM` | Token signing (HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` | Token lifetimes |
| `CORS_ORIGINS` | Comma-separated origins (defaults include `http://localhost:5173`) |
| `DEBUG`, `ENVIRONMENT`, `DB_ECHO` | Runtime flags |

---

## Backend endpoint overview (`/api/v1`)

- **auth** `POST /auth/register|login|refresh`, `GET /auth/me`, `POST /auth/change-password`
- **users** `GET /users`, `GET /users/{id}`, `PATCH /users/{id}/role`, `POST /users/{id}/activate|deactivate`, `DELETE /users/{id}` (system_admin only)
- **collaboration** `GET /collaboration/graph` (alias `/network`), `GET /collaboration/co-authors/{id}`, `GET|POST|PATCH|DELETE /institutional-collaborations`
- **projects** `GET|POST /projects`, `GET /projects/mine`, `GET|POST|DELETE /projects/{id}/members…`
- **notifications** `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/{id}/read`, `POST /notifications/read-all`

Security: bcrypt password hashing, JWT access (30 min) / refresh (7 days) tokens,
role guards via `require_roles(...)` on every admin route, and audit-log rows for
logins, failed logins, registrations, role changes, password changes and
activate/deactivate actions.

## Docker (optional)

```bash
docker compose up --build      # api + postgres (root docker-compose.yml)
```
