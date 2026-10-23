"""Pytest fixtures for the auth/RBAC test suite.

Tests run against an isolated PostgreSQL database (``scicollab_test`` by
default, override with ``TEST_DATABASE_URL``) that is created, migrated via
``Base.metadata.create_all``, and seeded with ``init_db`` once per session.
The FastAPI app's ``get_db`` dependency is overridden so every request hits
the test database; the real development database is never touched.
"""
import asyncio
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

import src.main as main_module
from src.core.config import settings
from src.db.base import Base  # noqa: F401  (imports every model)
from src.db.init_db import init_db
from src.db.session import get_db
from src.main import app

# Default: the same credentials as the dev database (from .env), but with the
# database name swapped for a dedicated test database.
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL") or (
    settings.DATABASE_URL.rsplit("/", 1)[0] + "/scicollab_test"
)

# NullPool: every connection is created (and closed) in the loop that uses it,
# so the same engine can be driven by asyncio.run() during setup and by
# TestClient's own event loop during the tests.
test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool, future=True)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Seeded demo accounts (see app/db/init_db.py). IDs are deterministic because
# the test schema is dropped and re-seeded for every session.
PASSWORD = "password123"

DEMO_ACCOUNTS = {
    "researcher": {"email": "s.chen@mit.edu", "id": 1},
    "reviewer": {"email": "j.okafor@cambridge.ac.uk", "id": 3},
    "institution": {"email": "admin@mit.edu", "id": 11},
    "admin": {"email": "sysadmin@scicollab.io", "id": 12},
}

# A seeded user that is nobody's own profile (used for self-vs-other checks).
OTHER_USER_ID = 2  # Dr. Emma Torres


def login(client: TestClient, email: str, password: str = PASSWORD) -> dict:
    """Log in and return the parsed JSON response body."""
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return res.json()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def _ensure_test_database() -> None:
    """Create the test database if it does not exist (via the postgres maintenance DB)."""
    base_url, _, db_name = TEST_DATABASE_URL.rpartition("/")
    admin_engine = create_async_engine(
        f"{base_url}/postgres",
        poolclass=NullPool,
        isolation_level="AUTOCOMMIT",
    )
    async with admin_engine.connect() as conn:
        exists = await conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": db_name}
        )
        if not exists.scalar():
            await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    await admin_engine.dispose()


async def _reset_schema() -> None:
    """Drop, recreate, and reseed the test schema."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with TestSessionLocal() as session:
        await init_db(session)


@pytest.fixture(scope="session")
def db_setup():
    """Create and seed the test database once per test session."""
    asyncio.run(_ensure_test_database())
    asyncio.run(_reset_schema())
    yield
    # Tear down: leave the test database clean for the next run.
    asyncio.run(_reset_schema())


@pytest.fixture(scope="session")
def client(db_setup):
    """TestClient with every DB access routed to the isolated test database."""
    async def override_get_db():
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    # Point the lifespan's seed call at the test DB too, so the real
    # development database is never touched by the test run.
    main_module.AsyncSessionLocal = TestSessionLocal
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
