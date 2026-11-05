"""Ownership and institution-scope helpers for permission-guarded mutations.

The schema has no explicit owner/institution columns, so scope is derived from
data that already exists on the models:

  * ``users.publications_ids``  -> publications a user owns
  * ``teams.members[].name``    -> team membership
  * ``projects.pi`` / ``members`` -> project ownership
  * ``conferences.presentations`` -> publications presented at an event

Admins bypass every scope check. Requests outside the caller's scope are
rejected with 403 by the endpoint modules, never only in the frontend.
"""

from typing import Any, Iterable, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.core.permissions import _normalize_role
from src.models.publication import Publication
from src.models.project import Project
from src.models.team import Team
from src.models.user import User

# Statuses that represent a publication awaiting a review decision.
SUBMITTED_STATUSES = {"Submitted", "Under Review"}


def role_key(user: User) -> str:
    return _normalize_role(user.role or "")


def is_admin(user: User) -> bool:
    return role_key(user) == "admin"


def is_researcher(user: User) -> bool:
    return role_key(user) == "researcher"


def is_institution(user: User) -> bool:
    return role_key(user) == "institution"


async def scope_users(db: AsyncSession, user: User) -> list[User]:
    """Users whose data counts towards the caller's scope."""
    if is_admin(user):
        result = await db.execute(select(User).where(User.is_deleted == False))  # noqa: E712
        return list(result.scalars().all())
    if is_institution(user):
        result = await db.execute(
            select(User).where(
                User.institution == user.institution,
                User.is_deleted == False,  # noqa: E712
            )
        )
        return list(result.scalars().all())
    return [user]


async def scoped_publication_ids(db: AsyncSession, user: User) -> set[int]:
    """Publication ids the caller may manage (own, own institution, or all)."""
    ids: set[int] = set()
    for owner in await scope_users(db, user):
        for pub_id in owner.publications_ids or []:
            try:
                ids.add(int(pub_id))
            except (TypeError, ValueError):
                continue
    return ids


async def can_manage_publication_id(
    db: AsyncSession, user: User, pub_id: Optional[int]
) -> bool:
    if is_admin(user):
        return True
    if pub_id is None or role_key(user) not in {"researcher", "institution"}:
        return False
    return int(pub_id) in await scoped_publication_ids(db, user)


async def can_manage_publication(db: AsyncSession, user: User, pub: Publication) -> bool:
    return await can_manage_publication_id(db, user, getattr(pub, "id", None))


async def publication_id_by_title(db: AsyncSession, title: str) -> Optional[int]:
    if not title:
        return None
    result = await db.execute(
        select(Publication).where(
            Publication.title == title,
            Publication.is_deleted == False,  # noqa: E712
        )
    )
    pub = result.scalars().first()
    return pub.id if pub else None


def _member_names(members: Iterable[Any]) -> set[str]:
    names: set[str] = set()
    for member in members or []:
        if isinstance(member, dict) and member.get("name"):
            names.add(str(member["name"]))
    return names


async def can_manage_team(db: AsyncSession, user: User, team: Team) -> bool:
    if is_admin(user):
        return True
    if role_key(user) not in {"researcher", "institution"}:
        return False
    names = _member_names(team.members or [])
    if is_researcher(user):
        return user.name in names
    return bool(names & {u.name for u in await scope_users(db, user)})


async def can_manage_project(db: AsyncSession, user: User, project: Project) -> bool:
    if is_admin(user):
        return True
    if role_key(user) not in {"researcher", "institution"}:
        return False
    members = {int(m) for m in (project.members or []) if str(m).isdigit()}
    if is_researcher(user):
        return project.pi == user.name or user.id in members
    scoped = await scope_users(db, user)
    return project.pi in {u.name for u in scoped} or bool(members & {u.id for u in scoped})


async def can_manage_conference(
    db: AsyncSession,
    user: User,
    conf: Optional[Any] = None,
    presentation_ids: Optional[Iterable[Any]] = None,
) -> bool:
    """True when every presentation of the event belongs to the caller's scope.

    ``conf`` may be an existing Conference (edit/delete) or None (create), in
    which case ``presentation_ids`` carries the publications being scheduled.
    """
    if is_admin(user):
        return True
    if role_key(user) not in {"researcher", "institution"}:
        return False

    ids: set[int] = set()
    for raw in list(getattr(conf, "presentations", None) or []) + list(presentation_ids or []):
        try:
            ids.add(int(raw))
        except (TypeError, ValueError):
            continue
    if not ids:
        return False
    return ids <= await scoped_publication_ids(db, user)
