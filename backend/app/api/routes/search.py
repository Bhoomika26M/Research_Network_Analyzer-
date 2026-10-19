"""Cross-entity search: researchers, publications, projects and institutions."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.institution import Institution
from app.models.project import Project
from app.models.publication import Publication
from app.models.researcher import Researcher
from app.schemas.dashboard import SearchHit, SearchOut

router = APIRouter(
    prefix="/api/v1/search",
    tags=["search"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=SearchOut)
async def search(
    db: AsyncSession = Depends(get_db),
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(10, ge=1, le=50),
) -> SearchOut:
    pattern = f"%{q.strip()}%"

    researchers = (
        await db.execute(
            select(Researcher)
            .where(
                Researcher.deleted_at.is_(None),
                or_(
                    Researcher.first_name.ilike(pattern),
                    Researcher.last_name.ilike(pattern),
                    Researcher.title.ilike(pattern),
                ),
            )
            .limit(limit)
        )
    ).scalars().all()
    publications = (
        await db.execute(
            select(Publication)
            .where(
                Publication.deleted_at.is_(None),
                or_(
                    Publication.title.ilike(pattern),
                    Publication.venue.ilike(pattern),
                    Publication.doi.ilike(pattern),
                ),
            )
            .limit(limit)
        )
    ).scalars().all()
    projects = (
        await db.execute(
            select(Project)
            .where(
                Project.deleted_at.is_(None),
                or_(Project.title.ilike(pattern), Project.funding_agency.ilike(pattern)),
            )
            .limit(limit)
        )
    ).scalars().all()
    institutions = (
        await db.execute(
            select(Institution)
            .where(
                Institution.deleted_at.is_(None),
                or_(Institution.name.ilike(pattern), Institution.country.ilike(pattern)),
            )
            .limit(limit)
        )
    ).scalars().all()

    return SearchOut(
        q=q,
        researchers=[
            SearchHit(
                id=row.id,
                kind="researcher",
                title=f"{row.first_name} {row.last_name}",
                subtitle=row.title,
            )
            for row in researchers
        ],
        publications=[
            SearchHit(
                id=row.id,
                kind="publication",
                title=row.title,
                subtitle=row.venue or row.doi,
            )
            for row in publications
        ],
        projects=[
            SearchHit(
                id=row.id,
                kind="project",
                title=row.title,
                subtitle=row.funding_agency,
            )
            for row in projects
        ],
        institutions=[
            SearchHit(
                id=row.id,
                kind="institution",
                title=row.name,
                subtitle=row.country,
            )
            for row in institutions
        ],
    )
