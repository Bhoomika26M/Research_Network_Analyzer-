"""Citation records, reference lists, counts and DOI helpers."""

import re
import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.errors import ApiException
from app.models.enums import AuditCategory
from app.models.publication import Citation, Publication, PublicationAuthor
from app.schemas.citation import (
    CitationCountOut,
    CitationCreate,
    CitationOut,
    CitedPublicationOut,
    DoiValidateOut,
    ReferenceListOut,
    ReferenceReplaceIn,
)
from app.schemas.common import Page
from app.schemas.publication import CoAuthorOut, PublicationOut
from app.schemas.user import MessageResponse
from app.services.audit import client_ip, write_audit_log

router = APIRouter(
    prefix="/api/v1",
    tags=["citations"],
    dependencies=[Depends(get_current_user)],
)

DOI_PATTERN = re.compile(r"^10\.\d{4,9}/\S+$", re.IGNORECASE)

_PUB_LOAD = (
    selectinload(Publication.author_links).selectinload(PublicationAuthor.researcher),
)
_CIT_LOAD = (
    selectinload(Citation.citing_publication)
    .selectinload(Publication.author_links)
    .selectinload(PublicationAuthor.researcher),
    selectinload(Citation.cited_publication),
)


def _publication_out(publication: Publication) -> PublicationOut:
    return PublicationOut(
        id=publication.id,
        title=publication.title,
        abstract=publication.abstract,
        type=publication.type,
        status=publication.status,
        year=publication.year,
        venue=publication.venue,
        doi=publication.doi,
        uploaded_by=publication.uploaded_by,
        has_file=bool(publication.file_path),
        created_at=publication.created_at,
        co_authors=[
            CoAuthorOut(
                researcher_id=link.researcher_id,
                author_order=link.author_order,
                is_corresponding=link.is_corresponding,
                full_name=link.researcher.full_name,
            )
            for link in publication.author_links
        ],
    )


async def _get_live_publication(db: AsyncSession, publication_id: uuid.UUID) -> Publication:
    result = await db.execute(
        select(Publication)
        .where(Publication.id == publication_id, Publication.deleted_at.is_(None))
        .options(*_PUB_LOAD)
        .execution_options(populate_existing=True)
    )
    publication = result.scalar_one_or_none()
    if publication is None:
        raise ApiException(404, "publication_not_found", "Publication not found")
    return publication


def _citation_out(row: Citation) -> CitationOut:
    citing = row.citing_publication
    cited = row.cited_publication
    return CitationOut(
        citing_publication_id=row.citing_publication_id,
        cited_publication_id=row.cited_publication_id,
        citing_title=citing.title if citing else "",
        cited_title=cited.title if cited else "",
        created_at=row.created_at,
        citing_venue=citing.venue if citing else None,
        citing_year=citing.year if citing else None,
        citing_doi=citing.doi if citing else None,
        citing_authors=(
            ", ".join(
                link.researcher.full_name
                for link in citing.author_links
                if link.researcher is not None
            )
            if citing
            else None
        ),
    )


@router.get("/citations", response_model=Page[CitationOut])
async def list_citations(
    db: AsyncSession = Depends(get_db),
    publication_id: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[CitationOut]:
    stmt = select(Citation)
    if publication_id is not None:
        stmt = stmt.where(
            (Citation.citing_publication_id == publication_id)
            | (Citation.cited_publication_id == publication_id)
        )
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_CIT_LOAD)
            .execution_options(populate_existing=True)
            .order_by(Citation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    return Page[CitationOut](
        items=[_citation_out(item) for item in items], total=total, skip=skip, limit=limit
    )


@router.post("/citations", response_model=CitationOut, status_code=201)
async def create_citation(
    payload: CitationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> CitationOut:
    if payload.citing_publication_id == payload.cited_publication_id:
        raise ApiException(400, "self_citation", "A publication cannot cite itself")
    await _get_live_publication(db, payload.citing_publication_id)
    await _get_live_publication(db, payload.cited_publication_id)
    existing = (
        await db.execute(
            select(Citation).where(
                Citation.citing_publication_id == payload.citing_publication_id,
                Citation.cited_publication_id == payload.cited_publication_id,
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise ApiException(409, "citation_exists", "This citation already exists")
    row = Citation(
        citing_publication_id=payload.citing_publication_id,
        cited_publication_id=payload.cited_publication_id,
    )
    db.add(row)
    await db.flush()
    await write_audit_log(
        db,
        action="citation_created",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="citation",
        entity_id=payload.citing_publication_id,
        details={
            "citing": str(payload.citing_publication_id),
            "cited": str(payload.cited_publication_id),
        },
        ip_address=client_ip(request),
    )
    loaded = (
        await db.execute(
            select(Citation)
            .where(
                Citation.citing_publication_id == row.citing_publication_id,
                Citation.cited_publication_id == row.cited_publication_id,
            )
            .options(*_CIT_LOAD)
            .execution_options(populate_existing=True)
        )
    ).scalar_one()
    return _citation_out(loaded)


@router.delete(
    "/citations/{citing_publication_id}/{cited_publication_id}",
    response_model=MessageResponse,
)
async def delete_citation(
    citing_publication_id: uuid.UUID,
    cited_publication_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    row = (
        await db.execute(
            select(Citation).where(
                Citation.citing_publication_id == citing_publication_id,
                Citation.cited_publication_id == cited_publication_id,
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise ApiException(404, "citation_not_found", "Citation not found")
    await db.delete(row)
    await db.flush()
    await write_audit_log(
        db,
        action="citation_deleted",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="citation",
        entity_id=citing_publication_id,
        details={
            "citing": str(citing_publication_id),
            "cited": str(cited_publication_id),
        },
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Citation deleted")


@router.get("/citations/doi/validate", response_model=DoiValidateOut)
async def validate_doi(doi: str = Query(..., min_length=3, max_length=255)) -> DoiValidateOut:
    cleaned = doi.strip()
    return DoiValidateOut(doi=cleaned, valid=bool(DOI_PATTERN.match(cleaned)))


@router.get("/citations/doi", response_model=PublicationOut)
async def lookup_doi(
    doi: str = Query(..., min_length=3, max_length=255),
    db: AsyncSession = Depends(get_db),
) -> PublicationOut:
    cleaned = doi.strip()
    if not DOI_PATTERN.match(cleaned):
        raise ApiException(400, "invalid_doi", "DOI must look like 10.xxxx/suffix")
    publication = (
        await db.execute(
            select(Publication)
            .where(
                func.lower(Publication.doi) == cleaned.lower(),
                Publication.deleted_at.is_(None),
            )
            .options(*_PUB_LOAD)
            .execution_options(populate_existing=True)
        )
    ).scalar_one_or_none()
    if publication is None:
        raise ApiException(404, "publication_not_found", "No publication with this DOI")
    return _publication_out(publication)


@router.get("/publications/{publication_id}/references", response_model=ReferenceListOut)
async def get_references(
    publication_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ReferenceListOut:
    await _get_live_publication(db, publication_id)
    items = (
        await db.execute(
            select(Citation)
            .where(Citation.citing_publication_id == publication_id)
            .options(*_CIT_LOAD)
            .execution_options(populate_existing=True)
        )
    ).scalars().all()
    return ReferenceListOut(
        publication_id=publication_id, items=[_citation_out(item) for item in items]
    )


@router.put("/publications/{publication_id}/references", response_model=ReferenceListOut)
async def replace_references(
    publication_id: uuid.UUID,
    payload: ReferenceReplaceIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> ReferenceListOut:
    await _get_live_publication(db, publication_id)
    ids = payload.cited_publication_ids
    if len(set(ids)) != len(ids):
        raise ApiException(400, "duplicate_reference", "The same publication is listed twice")
    if publication_id in ids:
        raise ApiException(400, "self_citation", "A publication cannot cite itself")
    for cited_id in ids:
        await _get_live_publication(db, cited_id)

    existing = (
        await db.execute(
            select(Citation).where(Citation.citing_publication_id == publication_id)
        )
    ).scalars().all()
    for row in existing:
        await db.delete(row)
    await db.flush()
    for cited_id in ids:
        db.add(
            Citation(citing_publication_id=publication_id, cited_publication_id=cited_id)
        )
    await db.flush()
    await write_audit_log(
        db,
        action="citation_references_replaced",
        category=AuditCategory.USER_ACTIVITY,
        user_id=user.id,
        entity_type="citation",
        entity_id=publication_id,
        details={"count": len(ids)},
        ip_address=client_ip(request),
    )
    return await get_references(publication_id, db)


@router.get("/publications/{publication_id}/citations", response_model=list[CitedPublicationOut])
async def incoming_citations(
    publication_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[CitedPublicationOut]:
    await _get_live_publication(db, publication_id)
    items = (
        await db.execute(
            select(Citation)
            .where(Citation.cited_publication_id == publication_id)
            .options(selectinload(Citation.citing_publication))
            .execution_options(populate_existing=True)
        )
    ).scalars().all()
    out: list[CitedPublicationOut] = []
    for row in items:
        pub = row.citing_publication
        if pub is None or pub.deleted_at is not None:
            continue
        out.append(
            CitedPublicationOut(
                id=pub.id,
                title=pub.title,
                year=pub.year,
                type=pub.type,
                status=pub.status,
                doi=pub.doi,
                venue=pub.venue,
            )
        )
    return out


@router.get("/publications/{publication_id}/citation-count", response_model=CitationCountOut)
async def citation_counts(
    publication_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CitationCountOut:
    await _get_live_publication(db, publication_id)
    incoming = (
        await db.execute(
            select(func.count()).where(Citation.cited_publication_id == publication_id)
        )
    ).scalar_one()
    outgoing = (
        await db.execute(
            select(func.count()).where(Citation.citing_publication_id == publication_id)
        )
    ).scalar_one()
    return CitationCountOut(
        publication_id=publication_id, incoming=int(incoming), outgoing=int(outgoing)
    )
