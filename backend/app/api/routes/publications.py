"""Publications: CRUD with co-authors, status workflow and file upload/download."""

import re
import uuid
from datetime import UTC, datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.errors import ApiException
from app.models.enums import AuditCategory, PublicationStatus, PublicationType, UserRole
from app.models.institution import Department
from app.models.publication import Citation, Publication, PublicationAuthor
from app.models.researcher import Researcher
from app.schemas import (
    CoAuthorIn,
    CoAuthorOut,
    MessageResponse,
    Page,
    PublicationCreate,
    PublicationOut,
    PublicationUpdate,
    StatusUpdateIn,
)
from app.services.audit import client_ip, write_audit_log
from app.services.notifications import create_notification
from app.services.permissions import publication_is_owner

router = APIRouter(
    prefix="/api/v1/publications",
    tags=["publications"],
    dependencies=[Depends(get_current_user)],
)

# DOI syntax: "10." + 4-9 digit registrant + "/" + suffix (Crossref convention).
DOI_PATTERN = re.compile(r"^10\.\d{4,9}/\S+$", re.IGNORECASE)

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB
# Only these extensions are accepted; the stored name is always a random uuid4 hex.
ALLOWED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# Allowed status transitions (anything else is rejected with 409).
ALLOWED_TRANSITIONS: dict[PublicationStatus, set[PublicationStatus]] = {
    PublicationStatus.DRAFT: {PublicationStatus.SUBMITTED},
    PublicationStatus.SUBMITTED: {PublicationStatus.PUBLISHED, PublicationStatus.DRAFT},
    PublicationStatus.PUBLISHED: {PublicationStatus.ARCHIVED},
    PublicationStatus.ARCHIVED: set(),
}

_LOAD_OPTIONS = (
    selectinload(Publication.author_links)
    .selectinload(PublicationAuthor.researcher)
    .selectinload(Researcher.department)
    .selectinload(Department.institution),
)


def _may_transition(user, *, is_owner: bool, target: PublicationStatus) -> bool:
    """Who may perform an allowed transition."""
    if user.role is UserRole.SYSTEM_ADMIN:
        return True
    if target in (PublicationStatus.PUBLISHED, PublicationStatus.ARCHIVED):
        return user.role in (UserRole.REVIEWER, UserRole.INSTITUTION_ADMIN)
    if target is PublicationStatus.SUBMITTED:
        return is_owner
    # target is DRAFT (withdraw own submission or send it back).
    return is_owner or user.role in (UserRole.REVIEWER, UserRole.INSTITUTION_ADMIN)


async def _get_publication_or_404(db: AsyncSession, publication_id: uuid.UUID) -> Publication:
    """Load a live publication with co-authors (and their researchers) eager-loaded.

    ``populate_existing`` refreshes an instance already in the identity map so
    ``_to_out`` never lazy-loads ``author_links`` after flush/commit (MissingGreenlet).
    """
    result = await db.execute(
        select(Publication)
        .where(Publication.id == publication_id, Publication.deleted_at.is_(None))
        .options(*_LOAD_OPTIONS)
        .execution_options(populate_existing=True)
    )
    publication = result.scalar_one_or_none()
    if publication is None:
        raise ApiException(404, "publication_not_found", "Publication not found")
    return publication


def _to_out(publication: Publication, citations_count: int = 0) -> PublicationOut:
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
        citations_count=citations_count,
        co_authors=[
            CoAuthorOut(
                researcher_id=link.researcher_id,
                author_order=link.author_order,
                is_corresponding=link.is_corresponding,
                full_name=link.researcher.full_name,
                institution_name=(
                    link.researcher.department.institution.name
                    if link.researcher
                    and link.researcher.department
                    and link.researcher.department.institution
                    else None
                ),
            )
            for link in publication.author_links
        ],
    )


async def _citation_counts(db: AsyncSession, ids: list[uuid.UUID]) -> dict[uuid.UUID, int]:
    """Incoming citation counts for a batch of publications (no N+1)."""
    if not ids:
        return {}
    rows = await db.execute(
        select(Citation.cited_publication_id, func.count())
        .where(Citation.cited_publication_id.in_(ids))
        .group_by(Citation.cited_publication_id)
    )
    return {publication_id: int(count) for publication_id, count in rows}


async def _to_out_full(db: AsyncSession, publication: Publication) -> PublicationOut:
    counts = await _citation_counts(db, [publication.id])
    return _to_out(publication, counts.get(publication.id, 0))


async def _require_owner_or_admin(db, user, publication: Publication) -> None:
    if user.role is UserRole.SYSTEM_ADMIN:
        return
    if not await publication_is_owner(db, user, publication):
        raise ApiException(
            403,
            "forbidden",
            "You can only edit your own publications",
        )


def _validate_doi(doi: str) -> str:
    doi = doi.strip()
    if not DOI_PATTERN.match(doi):
        raise ApiException(
            400,
            "invalid_doi",
            "DOI must look like 10.xxxx/suffix (e.g. 10.1000/xyz123)",
        )
    return doi


async def _ensure_doi_free(db: AsyncSession, doi: str, *, exclude_id: uuid.UUID | None) -> None:
    stmt = select(Publication.id).where(func.lower(Publication.doi) == doi.lower())
    if exclude_id is not None:
        stmt = stmt.where(Publication.id != exclude_id)
    taken = (await db.execute(stmt)).scalar_one_or_none()
    if taken is not None:
        raise ApiException(409, "doi_taken", "A publication with this DOI already exists")


async def _resolve_co_authors(
    db: AsyncSession, co_authors: list[CoAuthorIn]
) -> list[tuple[Researcher, int, bool]]:
    """Validate co-author input; return (researcher, order, corresponding) rows."""
    if not co_authors:
        return []
    ids = [entry.researcher_id for entry in co_authors]
    if len(set(ids)) != len(ids):
        raise ApiException(400, "duplicate_co_author", "The same researcher appears twice")
    if sum(1 for entry in co_authors if entry.is_corresponding) > 1:
        raise ApiException(
            400, "multiple_corresponding_authors", "Only one co-author may be corresponding"
        )
    found = (
        await db.execute(
            select(Researcher).where(Researcher.id.in_(ids), Researcher.deleted_at.is_(None))
        )
    ).scalars()
    by_id = {researcher.id: researcher for researcher in found}
    missing = set(ids) - set(by_id)
    if missing:
        raise ApiException(
            404,
            "researcher_not_found",
            f"Co-author researcher not found: {sorted(str(m) for m in missing)[0]}",
        )

    rows: list[tuple[Researcher, int, bool]] = []
    used_orders: set[int] = set()
    for position, entry in enumerate(co_authors, start=1):
        order = entry.author_order if entry.author_order is not None else position
        if order in used_orders:
            raise ApiException(
                400, "duplicate_author_order", "Two co-authors share the same author_order"
            )
        used_orders.add(order)
        rows.append((by_id[entry.researcher_id], order, entry.is_corresponding))
    rows.sort(key=lambda row: row[1])
    return rows


async def _replace_co_authors(
    db: AsyncSession, publication: Publication, rows: list[tuple[Researcher, int, bool]]
) -> None:
    publication.author_links.clear()
    await db.flush()
    for researcher, order, corresponding in rows:
        publication.author_links.append(
            PublicationAuthor(
                researcher=researcher,
                author_order=order,
                is_corresponding=corresponding,
            )
        )
    await db.flush()


# ---- CRUD -------------------------------------------------------------------


@router.get("", response_model=Page[PublicationOut])
async def list_publications(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None, max_length=200, description="Search title"),
    type: PublicationType | None = None,
    status: PublicationStatus | None = None,
    year: int | None = Query(default=None, ge=1, le=9999),
    researcher: uuid.UUID | None = None,
    institution: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Page[PublicationOut]:
    """Paginated publications with type/status/year/researcher/institution/title filters."""
    stmt = select(Publication).where(Publication.deleted_at.is_(None))
    if q:
        stmt = stmt.where(Publication.title.ilike(f"%{q}%"))
    if type is not None:
        stmt = stmt.where(Publication.type == type)
    if status is not None:
        stmt = stmt.where(Publication.status == status)
    if year is not None:
        stmt = stmt.where(Publication.year == year)
    if researcher is not None:
        authored = (
            select(PublicationAuthor.publication_id)
            .where(
                PublicationAuthor.publication_id == Publication.id,
                PublicationAuthor.researcher_id == researcher,
            )
            .exists()
        )
        stmt = stmt.where(authored)
    if institution is not None:
        authored_in_institution = (
            select(PublicationAuthor.publication_id)
            .join(Researcher, Researcher.id == PublicationAuthor.researcher_id)
            .join(Department, Department.id == Researcher.department_id)
            .where(
                PublicationAuthor.publication_id == Publication.id,
                Department.institution_id == institution,
                Department.deleted_at.is_(None),
                Researcher.deleted_at.is_(None),
            )
            .exists()
        )
        stmt = stmt.where(authored_in_institution)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (
        await db.execute(
            stmt.options(*_LOAD_OPTIONS)
            .execution_options(populate_existing=True)
            .order_by(Publication.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    ).scalars().all()
    counts = await _citation_counts(db, [item.id for item in items])
    return Page[PublicationOut](
        items=[_to_out(item, counts.get(item.id, 0)) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{publication_id}", response_model=PublicationOut)
async def get_publication(
    publication_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PublicationOut:
    """Fetch a single publication with its co-authors."""
    return await _to_out_full(db, await _get_publication_or_404(db, publication_id))


@router.post("", response_model=PublicationOut, status_code=201)
async def create_publication(
    payload: PublicationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> PublicationOut:
    """Create a publication (starts as draft) with optional co-authors (audited)."""
    doi = _validate_doi(payload.doi) if payload.doi else None
    if doi:
        await _ensure_doi_free(db, doi, exclude_id=None)

    rows = await _resolve_co_authors(db, payload.co_authors)
    title = payload.title.strip()
    if not title:
        raise ApiException(400, "invalid_request", "title must not be empty")
    publication = Publication(
        title=title,
        abstract=payload.abstract,
        type=payload.type,
        year=payload.year,
        venue=payload.venue,
        doi=doi,
        uploaded_by=user.id,
    )
    # Append co-authors while the object is still transient: reading an
    # untouched collection on a flushed object would lazy-load it (async error).
    for researcher, order, corresponding in rows:
        publication.author_links.append(
            PublicationAuthor(
                researcher=researcher,
                author_order=order,
                is_corresponding=corresponding,
            )
        )
    db.add(publication)
    await db.flush()
    await write_audit_log(
        db,
        action="publication_created",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={"title": publication.title},
        ip_address=client_ip(request),
    )
    return await _to_out_full(db, await _get_publication_or_404(db, publication.id))


@router.patch("/{publication_id}", response_model=PublicationOut)
async def update_publication(
    publication_id: uuid.UUID,
    payload: PublicationUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> PublicationOut:
    """Update publication fields/co-authors: owner or system_admin only (audited)."""
    publication = await _get_publication_or_404(db, publication_id)
    await _require_owner_or_admin(db, user, publication)

    changes = payload.model_dump(exclude_unset=True)
    co_authors = changes.pop("co_authors", None)

    if "title" in changes:
        title = (changes["title"] or "").strip()
        if not title:
            raise ApiException(400, "invalid_request", "title must not be empty")
        changes["title"] = title
    # Explicit nulls on NOT NULL columns mean "no change"; doi null clears the DOI.
    for key in ("type", "year"):
        if changes.get(key) is None and key in changes:
            changes.pop(key)
    if "doi" in changes:
        if changes["doi"]:
            changes["doi"] = _validate_doi(changes["doi"])
            await _ensure_doi_free(db, changes["doi"], exclude_id=publication.id)
        else:
            changes["doi"] = None

    if changes:
        for field, value in changes.items():
            setattr(publication, field, value)
        await db.flush()

    if co_authors is not None:
        rows = await _resolve_co_authors(db, co_authors)
        await _replace_co_authors(db, publication, rows)

    if changes or co_authors is not None:
        await write_audit_log(
            db,
            action="publication_updated",
            category=AuditCategory.PUBLICATION_HISTORY,
            user_id=user.id,
            entity_type="publication",
            entity_id=publication.id,
            details={"changed": sorted(changes)},
            ip_address=client_ip(request),
        )
    return await _to_out_full(db, await _get_publication_or_404(db, publication.id))


@router.delete("/{publication_id}", response_model=MessageResponse)
async def delete_publication(
    publication_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> MessageResponse:
    """Soft-delete a publication: owner or system_admin (audited)."""
    publication = await _get_publication_or_404(db, publication_id)
    await _require_owner_or_admin(db, user, publication)
    publication.deleted_at = datetime.now(UTC)
    await db.flush()
    await write_audit_log(
        db,
        action="publication_deleted",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={"title": publication.title},
        ip_address=client_ip(request),
    )
    return MessageResponse(message="Publication deleted")


# ---- Status workflow --------------------------------------------------------


@router.patch("/{publication_id}/status", response_model=PublicationOut)
async def change_status(
    publication_id: uuid.UUID,
    payload: StatusUpdateIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> PublicationOut:
    """Move a publication through draft → submitted → published → archived (audited)."""
    publication = await _get_publication_or_404(db, publication_id)

    if payload.status is publication.status:
        raise ApiException(
            409,
            "invalid_status_transition",
            f"Publication is already {publication.status.value}",
        )
    allowed = ALLOWED_TRANSITIONS[publication.status]
    if payload.status not in allowed:
        allowed_list = ", ".join(sorted(member.value for member in allowed)) or "nothing"
        raise ApiException(
            409,
            "invalid_status_transition",
            f"Cannot move from {publication.status.value} to {payload.status.value}; "
            f"allowed from {publication.status.value}: {allowed_list}",
        )

    is_owner = await publication_is_owner(db, user, publication)
    if not _may_transition(user, is_owner=is_owner, target=payload.status):
        raise ApiException(
            403,
            "forbidden",
            f"Your role cannot move a publication to {payload.status.value}",
        )

    old_status = publication.status
    publication.status = payload.status
    await db.flush()
    await write_audit_log(
        db,
        action="status_change",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={
            "title": publication.title,
            "old_status": str(old_status),
            "new_status": str(publication.status),
        },
        ip_address=client_ip(request),
    )
    updated = await _get_publication_or_404(db, publication.id)
    for link in updated.author_links:
        author = link.researcher
        if author is None or author.user_id is None or author.user_id == user.id:
            continue
        await create_notification(
            db,
            author.user_id,
            f'Publication "{updated.title}" moved to {updated.status.value}',
        )
    return await _to_out_full(db, updated)


# ---- File upload / download -------------------------------------------------


@router.post("/{publication_id}/file", response_model=PublicationOut)
async def upload_file(
    publication_id: uuid.UUID,
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
) -> PublicationOut:
    """Upload a PDF/DOC/DOCX (max 20 MB) for a publication: owner or system_admin."""
    publication = await _get_publication_or_404(db, publication_id)
    await _require_owner_or_admin(db, user, publication)

    # Only the whitelisted extension matters; the original name/path is never used.
    extension = Path(file.filename or "").suffix.lower()
    media_type = ALLOWED_EXTENSIONS.get(extension)
    if media_type is None:
        raise ApiException(
            415,
            "unsupported_file_type",
            "Only PDF, DOC and DOCX files are allowed",
        )

    upload_root = Path(settings.UPLOAD_DIR)
    upload_root.mkdir(parents=True, exist_ok=True)
    stored_name = uuid.uuid4().hex + extension
    destination = upload_root / stored_name

    size = 0
    try:
        with destination.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise ApiException(413, "file_too_large", "File exceeds the 20 MB limit")
                out.write(chunk)
    except ApiException:
        destination.unlink(missing_ok=True)
        raise

    if publication.file_path:
        # Remove the previous file (its name was generated by us, but be safe).
        (upload_root / Path(publication.file_path).name).unlink(missing_ok=True)
    publication.file_path = stored_name
    await db.flush()
    await write_audit_log(
        db,
        action="publication_file_uploaded",
        category=AuditCategory.PUBLICATION_HISTORY,
        user_id=user.id,
        entity_type="publication",
        entity_id=publication.id,
        details={"size_bytes": size, "extension": extension},
        ip_address=client_ip(request),
    )
    return await _to_out_full(db, await _get_publication_or_404(db, publication.id))


@router.get("/{publication_id}/file", response_class=FileResponse)
async def download_file(
    publication_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    """Download the uploaded file of a publication (any authenticated user)."""
    publication = await _get_publication_or_404(db, publication_id)
    if not publication.file_path:
        raise ApiException(404, "file_not_found", "No file has been uploaded for this publication")
    if Path(publication.file_path).name != publication.file_path:
        raise ApiException(400, "corrupt_file_path", "Stored file path is invalid")

    path = Path(settings.UPLOAD_DIR) / publication.file_path
    if not path.is_file():
        raise ApiException(404, "file_not_found", "The stored file is missing")

    media_type = ALLOWED_EXTENSIONS.get(path.suffix.lower(), "application/octet-stream")
    stem = re.sub(r"[^\w.-]+", "_", publication.title).strip("._")[:80] or "publication"
    return FileResponse(path, media_type=media_type, filename=stem + path.suffix)
