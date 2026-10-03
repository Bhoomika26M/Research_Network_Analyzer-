from fastapi import APIRouter
from src.api.v1.endpoints import (
    auth,
    researchers,
    publications,
    projects,
    citations,
    conferences,
    dois,
    audit_logs,
    reports,
    teams,
    tasks,
    assignments,
    links,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(researchers.router, prefix="/researchers", tags=["Researchers"])
api_router.include_router(publications.router, prefix="/publications", tags=["Publications"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(citations.router, prefix="/citations", tags=["Citations"])
api_router.include_router(conferences.router, prefix="/conferences", tags=["Conferences"])
api_router.include_router(dois.router, prefix="/dois", tags=["DOIs"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
api_router.include_router(links.router, prefix="/links", tags=["Links"])
