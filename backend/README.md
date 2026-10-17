# Audit Logs & Settings Backend (FastAPI + PostgreSQL)

Robust, production-ready backend for the Audit Logs and Settings modules.

## Tech Stack
- **FastAPI**: Modern, high-performance async REST framework
- **PostgreSQL**: Relational database with async connection via `asyncpg` and SQLAlchemy 2.0
- **Pydantic v2**: High-speed schema validation and serialization
- **JWT & Passlib**: Secure BCrypt password hashing and token generation
- **CORS**: Preconfigured for React frontend at `http://localhost:5173`

---

## Quickstart

### 1. Requirements
Ensure Python 3.10+ and PostgreSQL are running.
Install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Update `.env` if your PostgreSQL username or password differs:
```env
DATABASE_URL=postgresql+asyncpg://postgres:1234@localhost:5432/auditsettings_db
SYNC_DATABASE_URL=postgresql://postgres:1234@localhost:5432/auditsettings_db
SECRET_KEY=supersecretjwtkeyforauditsettingsbackend2024
```

### 3. Seed Database
Run the seed script to create all tables and populate initial mock data:
```bash
python seed_data.py
```

### 4. Start Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## API Endpoints

### Audit Logs & Compliance (`/api`)
- `GET /api/audit-logs` - Query logs with filters (`tab`, `date_from`, `date_to`, `user`, `action`)
- `POST /api/audit-logs` - Add a new audit log entry
- `GET /api/audit-logs/export` - Export logs directly as CSV file
- `GET /api/compliance-reports` - List compliance reports
- `POST /api/compliance-reports/generate` - Generate compliance audit report from live database
- `GET /api/compliance-reports/{id}/download` - Download compliance report CSV

### Settings (`/api/settings`)
- `GET /api/settings/profile` - Current user profile
- `PUT /api/settings/profile` - Update profile info
- `GET /api/settings/notifications` - Get notification preferences
- `PUT /api/settings/notifications` - Update notification preferences
- `GET /api/settings/security` - Get 2FA status and active sessions
- `PUT /api/settings/security/2fa` - Toggle Two-Factor Authentication
- `POST /api/settings/security/password` - Change password (verifies current password)
- `DELETE /api/settings/security/sessions/{session_id}` - Revoke session
- `GET /api/settings/system` - System configuration (Admin only)
- `PUT /api/settings/system` - Save system configuration (Admin only)
- `GET /api/settings/appearance` - Accent color, density, dark mode
- `PUT /api/settings/appearance` - Update appearance
- `GET /api/settings/privacy` - Privacy toggles and data export status
- `PUT /api/settings/privacy` - Update privacy settings
- `POST /api/settings/privacy/export-data` - Request archive export
- `DELETE /api/settings/privacy/account` - Delete account

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate with email/password -> JWT
- `GET /api/auth/me` - Current authenticated user
- `POST /api/auth/switch-role` - Dev helper to switch role
