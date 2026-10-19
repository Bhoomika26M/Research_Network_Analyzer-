"""FastAPI application: auth, users, projects, collaborations, dashboards.

The collaboration module needs researcher / institution / department lookups
for its pickers, so those two routers are mounted **read-only** (GET only): the
management pages for those modules stay removed.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from sqlalchemy import text

import app.models  # noqa: F401  (registers all models on Base.metadata)
from app.api.routes.auth import router as auth_router
from app.api.routes.collaborations import router as collaborations_router
from app.api.routes.dashboards import router as dashboards_router
from app.api.routes.departments import router as departments_router
from app.api.routes.health import router as health_router
from app.api.routes.institutions import router as institutions_router
from app.api.routes.projects import router as projects_router
from app.api.routes.researchers import router as researchers_router
from app.api.routes.users import router as users_router
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.db.base import Base
from app.db.session import engine


def include_read_only(app: FastAPI, source: APIRouter) -> None:
    """Mount only the GET routes of ``source`` (list/detail lookups).

    The trimmed app still needs researcher, institution and department
    lookups; their create/update/delete endpoints stay unregistered.
    """
    readonly = APIRouter(dependencies=list(source.dependencies))
    for route in source.routes:
        if isinstance(route, APIRoute) and "GET" in route.methods:
            readonly.add_api_route(
                route.path,
                route.endpoint,
                response_model=route.response_model,
                status_code=route.status_code,
                dependencies=list(route.dependencies),
                tags=list(route.tags),
                name=route.name,
            )
    app.include_router(readonly)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # NOTE: Alembic migrations will be added in a later stage; for now the
    # schema is created directly from the SQLAlchemy models on startup.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Backfill new columns on pre-existing tables (create_all never alters
        # an already-created table), so the running database needs no recreate.
        await conn.execute(
            text("ALTER TABLE institutions ADD COLUMN IF NOT EXISTS type VARCHAR(100)")
        )
        await conn.execute(
            text(
                "ALTER TABLE institutions ADD COLUMN IF NOT EXISTS "
                "is_active BOOLEAN NOT NULL DEFAULT TRUE"
            )
        )
        await conn.execute(
            text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_name VARCHAR(255)")
        )
        await conn.execute(
            text("ALTER TABLE departments ADD COLUMN IF NOT EXISTS budget NUMERIC(14, 2)")
        )
        await conn.execute(
            text("ALTER TABLE conferences ADD COLUMN IF NOT EXISTS submission_deadline DATE")
        )
        await conn.execute(
            text("ALTER TABLE conferences ADD COLUMN IF NOT EXISTS topics TEXT")
        )
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        lifespan=lifespan,
    )

    register_error_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(projects_router)
    app.include_router(collaborations_router)
    app.include_router(dashboards_router)

    # Read-only lookups used by the collaboration module (no CRUD).
    include_read_only(app, researchers_router)
    include_read_only(app, institutions_router)
    include_read_only(app, departments_router)
    return app


app = create_app()

