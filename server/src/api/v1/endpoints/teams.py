from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.core.ownership import can_manage_team, is_admin, role_key
from src.db.session import get_db
from src.models.team import Team
from src.models.user import User
from src.schemas.team import TeamResponse, TeamCreate, TeamUpdate

router = APIRouter()

TEAM_DENIED = "You can only manage teams you belong to or that belong to your institution."


def _with_creator(members: List[Any], current_user: User) -> List[Any]:
    """Ensure the creator is a member so the team has a derivable owner."""
    people = list(members or [])
    if role_key(current_user) in {"researcher", "institution"} and not any(
        isinstance(m, dict) and m.get("name") == current_user.name for m in people
    ):
        people.append(
            {
                "name": current_user.name,
                "role": "Team Lead",
                "initials": current_user.initials,
            }
        )
    return people


@router.get("/", response_model=List[TeamResponse])
async def list_teams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Team))
    return result.scalars().all()


@router.post("/", response_model=TeamResponse)
async def create_team(
    team_in: TeamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    team = Team(
        name=team_in.name,
        project=team_in.project,
        members=_with_creator(team_in.members, current_user),
    )
    if not is_admin(current_user) and not await can_manage_team(db, current_user, team):
        raise HTTPException(status_code=403, detail=TEAM_DENIED)
    db.add(team)
    await record_audit(db, actor=current_user.name, action="created team", target=team.name)
    await db.commit()
    await db.refresh(team)
    return team


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_in: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    updates = team_in.model_dump(exclude_unset=True)
    # Authorise against the prospective state so members cannot be used to
    # escape the caller's scope.
    candidate = Team(
        name=updates.get("name", team.name),
        project=updates.get("project", team.project),
        members=updates.get("members", team.members),
    )
    if not is_admin(current_user) and not await can_manage_team(db, current_user, candidate):
        raise HTTPException(status_code=403, detail=TEAM_DENIED)

    for field, value in updates.items():
        setattr(team, field, value)
    await record_audit(db, actor=current_user.name, action="updated team", target=team.name)
    await db.commit()
    await db.refresh(team)
    return team


@router.delete("/{team_id}", response_model=dict)
async def delete_team(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalars().first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if not is_admin(current_user) and not await can_manage_team(db, current_user, team):
        raise HTTPException(status_code=403, detail=TEAM_DENIED)
    await record_audit(db, actor=current_user.name, action="deleted team", target=team.name)
    await db.delete(team)
    await db.commit()
    return {"success": True, "deleted": team.id}
