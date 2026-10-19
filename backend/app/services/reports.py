"""Report builders shared by the JSON / XLSX / PDF report endpoints.

Every builder returns ``(columns, rows)`` where ``rows`` is a list of plain
dicts, so the same data can be rendered as JSON, an Excel sheet or a PDF table.
"""

import uuid
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collaboration import InstitutionalCollaboration
from app.models.enums import PublicationStatus, PublicationType
from app.models.institution import Department, Institution
from app.models.publication import Citation, Publication, PublicationAuthor
from app.models.researcher import Researcher

Column = tuple[str, str]  # (dict key, human header)


async def _researcher_ids_in_institution(
    db: AsyncSession, institution_id: uuid.UUID
) -> set[uuid.UUID]:
    via_dept = (
        await db.execute(
            select(Researcher.id)
            .join(Department, Department.id == Researcher.department_id)
            .where(
                Department.institution_id == institution_id,
                Department.deleted_at.is_(None),
                Researcher.deleted_at.is_(None),
            )
        )
    ).scalars()
    return set(via_dept)


async def publications_report(
    db: AsyncSession,
    *,
    year_from: int | None = None,
    year_to: int | None = None,
    type_: PublicationType | None = None,
    status: PublicationStatus | None = None,
    institution_id: uuid.UUID | None = None,
    limit: int = 500,
) -> tuple[list[Column], list[dict[str, Any]]]:
    stmt = (
        select(
            Publication.id,
            Publication.title,
            Publication.type,
            Publication.status,
            Publication.year,
            Publication.venue,
            Publication.doi,
            func.count(PublicationAuthor.researcher_id).label("authors"),
        )
        .outerjoin(PublicationAuthor, PublicationAuthor.publication_id == Publication.id)
        .where(Publication.deleted_at.is_(None))
        .group_by(Publication.id)
        .order_by(Publication.year.desc(), Publication.title)
    )
    if year_from is not None:
        stmt = stmt.where(Publication.year >= year_from)
    if year_to is not None:
        stmt = stmt.where(Publication.year <= year_to)
    if type_ is not None:
        stmt = stmt.where(Publication.type == type_)
    if status is not None:
        stmt = stmt.where(Publication.status == status)
    if institution_id is not None:
        researcher_ids = await _researcher_ids_in_institution(db, institution_id)
        stmt = stmt.where(
            PublicationAuthor.publication_id == Publication.id,
            PublicationAuthor.researcher_id.in_(researcher_ids),
        )

    rows = (await db.execute(stmt.limit(limit))).all()
    columns: list[Column] = [
        ("id", "ID"),
        ("title", "Title"),
        ("type", "Type"),
        ("status", "Status"),
        ("year", "Year"),
        ("venue", "Venue"),
        ("doi", "DOI"),
        ("authors", "Authors"),
    ]
    data = [
        {
            "id": str(row.id),
            "title": row.title,
            "type": str(row.type),
            "status": str(row.status),
            "year": int(row.year),
            "venue": row.venue or "",
            "doi": row.doi or "",
            "authors": int(row.authors),
        }
        for row in rows
    ]
    return columns, data


async def research_report(
    db: AsyncSession,
    *,
    institution_id: uuid.UUID | None = None,
    min_publications: int = 0,
    limit: int = 500,
) -> tuple[list[Column], list[dict[str, Any]]]:
    pub_sub = (
        select(
            PublicationAuthor.researcher_id.label("researcher_id"),
            func.count(func.distinct(PublicationAuthor.publication_id)).label("publications"),
        )
        .join(Publication, Publication.id == PublicationAuthor.publication_id)
        .where(Publication.deleted_at.is_(None))
        .group_by(PublicationAuthor.researcher_id)
        .subquery()
    )
    cite_sub = (
        select(
            PublicationAuthor.researcher_id.label("researcher_id"),
            func.count(func.distinct(Citation.citing_publication_id)).label("citations"),
        )
        .join(Citation, Citation.cited_publication_id == PublicationAuthor.publication_id)
        .group_by(PublicationAuthor.researcher_id)
        .subquery()
    )
    stmt = (
        select(
            Researcher.id,
            Researcher.first_name,
            Researcher.last_name,
            Researcher.title,
            Institution.name.label("institution"),
            func.coalesce(pub_sub.c.publications, 0).label("publications"),
            func.coalesce(cite_sub.c.citations, 0).label("citations"),
        )
        .outerjoin(Department, Department.id == Researcher.department_id)
        .outerjoin(Institution, Institution.id == Department.institution_id)
        .outerjoin(pub_sub, pub_sub.c.researcher_id == Researcher.id)
        .outerjoin(cite_sub, cite_sub.c.researcher_id == Researcher.id)
        .where(Researcher.deleted_at.is_(None))
        .order_by(func.coalesce(pub_sub.c.publications, 0).desc(), Researcher.last_name)
    )
    if institution_id is not None:
        stmt = stmt.where(Department.institution_id == institution_id)
    rows = (await db.execute(stmt.limit(limit))).all()
    columns: list[Column] = [
        ("researcher_id", "Researcher ID"),
        ("name", "Name"),
        ("title", "Title"),
        ("institution", "Institution"),
        ("publications", "Publications"),
        ("citations", "Citations"),
    ]
    data = [
        {
            "researcher_id": str(row.id),
            "name": f"{row.first_name} {row.last_name}",
            "title": row.title or "",
            "institution": row.institution or "",
            "publications": int(row.publications),
            "citations": int(row.citations),
        }
        for row in rows
        if int(row.publications) >= min_publications
    ]
    return columns, data


async def collaboration_report(
    db: AsyncSession,
    *,
    status: str | None = None,
    limit: int = 500,
) -> tuple[list[Column], list[dict[str, Any]]]:
    inst_a = Institution.__table__.alias("inst_a")
    inst_b = Institution.__table__.alias("inst_b")
    stmt = (
        select(
            InstitutionalCollaboration.id,
            inst_a.c.name.label("institution_a"),
            inst_b.c.name.label("institution_b"),
            InstitutionalCollaboration.type,
            InstitutionalCollaboration.status,
            InstitutionalCollaboration.start_date,
            InstitutionalCollaboration.end_date,
        )
        .join(inst_a, inst_a.c.id == InstitutionalCollaboration.institution_a_id)
        .join(inst_b, inst_b.c.id == InstitutionalCollaboration.institution_b_id)
        .where(InstitutionalCollaboration.deleted_at.is_(None))
        .order_by(InstitutionalCollaboration.start_date.desc())
    )
    if status:
        stmt = stmt.where(InstitutionalCollaboration.status == status)
    rows = (await db.execute(stmt.limit(limit))).all()
    columns: list[Column] = [
        ("institution_a", "Institution A"),
        ("institution_b", "Institution B"),
        ("type", "Type"),
        ("status", "Status"),
        ("start_date", "Start date"),
        ("end_date", "End date"),
    ]
    data = [
        {
            "institution_a": row.institution_a,
            "institution_b": row.institution_b,
            "type": row.type,
            "status": row.status,
            "start_date": row.start_date.isoformat() if row.start_date else "",
            "end_date": row.end_date.isoformat() if row.end_date else "",
        }
        for row in rows
    ]
    return columns, data


async def institutions_report(
    db: AsyncSession,
    *,
    country: str | None = None,
    limit: int = 500,
) -> tuple[list[Column], list[dict[str, Any]]]:
    dept_sub = (
        select(
            Department.institution_id.label("institution_id"),
            func.count().label("departments"),
        )
        .where(Department.deleted_at.is_(None))
        .group_by(Department.institution_id)
        .subquery()
    )
    res_sub = (
        select(
            Department.institution_id.label("institution_id"),
            func.count(Researcher.id).label("researchers"),
        )
        .join(Researcher, Researcher.department_id == Department.id)
        .where(Department.deleted_at.is_(None), Researcher.deleted_at.is_(None))
        .group_by(Department.institution_id)
        .subquery()
    )
    pub_sub = (
        select(
            Department.institution_id.label("institution_id"),
            func.count(func.distinct(PublicationAuthor.publication_id)).label("publications"),
        )
        .select_from(PublicationAuthor)
        .join(Researcher, Researcher.id == PublicationAuthor.researcher_id)
        .join(Department, Department.id == Researcher.department_id)
        .join(Publication, Publication.id == PublicationAuthor.publication_id)
        .where(
            Publication.deleted_at.is_(None),
            Researcher.deleted_at.is_(None),
            Department.deleted_at.is_(None),
        )
        .group_by(Department.institution_id)
        .subquery()
    )
    stmt = (
        select(
            Institution.id,
            Institution.name,
            Institution.country,
            Institution.city,
            func.coalesce(dept_sub.c.departments, 0).label("departments"),
            func.coalesce(res_sub.c.researchers, 0).label("researchers"),
            func.coalesce(pub_sub.c.publications, 0).label("publications"),
        )
        .outerjoin(dept_sub, dept_sub.c.institution_id == Institution.id)
        .outerjoin(res_sub, res_sub.c.institution_id == Institution.id)
        .outerjoin(pub_sub, pub_sub.c.institution_id == Institution.id)
        .where(Institution.deleted_at.is_(None))
        .order_by(Institution.name)
    )
    if country:
        stmt = stmt.where(Institution.country.ilike(f"%{country}%"))
    rows = (await db.execute(stmt.limit(limit))).all()
    columns: list[Column] = [
        ("institution_id", "Institution ID"),
        ("name", "Name"),
        ("country", "Country"),
        ("city", "City"),
        ("departments", "Departments"),
        ("researchers", "Researchers"),
        ("publications", "Publications"),
    ]
    data = [
        {
            "institution_id": str(row.id),
            "name": row.name,
            "country": row.country or "",
            "city": row.city or "",
            "departments": int(row.departments),
            "researchers": int(row.researchers),
            "publications": int(row.publications),
        }
        for row in rows
    ]
    return columns, data


BUILDERS = {
    "publications": publications_report,
    "research": research_report,
    "collaboration": collaboration_report,
    "institutions": institutions_report,
}
