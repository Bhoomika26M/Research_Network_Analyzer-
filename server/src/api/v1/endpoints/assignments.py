from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.assignment import Assignment
from src.models.user import User
from src.schemas.assignment import AssignmentResponse, AssignmentCreate, AssignmentUpdate

router = APIRouter()


@router.get("/", response_model=List[AssignmentResponse])
async def list_assignments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Assignment))
    return result.scalars().all()


@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment_in: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    # Upsert: one assignment per (project, researcher) pair.
    result = await db.execute(
        select(Assignment).where(
            Assignment.projectId == assignment_in.projectId,
            Assignment.researcherId == assignment_in.researcherId,
        )
    )
    existing = result.scalars().first()
    if existing:
        existing.status = assignment_in.status
        existing.role = assignment_in.role or existing.role
        await record_audit(
            db,
            actor=current_user.name,
            action="updated assignment",
            target=f"Project {existing.projectId} × Researcher {existing.researcherId}",
        )
        await db.commit()
        await db.refresh(existing)
        return existing
    assignment = Assignment(**assignment_in.model_dump())
    db.add(assignment)
    await record_audit(
        db,
        actor=current_user.name,
        action="created assignment",
        target=f"Project {assignment.projectId} × Researcher {assignment.researcherId}",
    )
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: int,
    assignment_in: AssignmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for field, value in assignment_in.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)
    await record_audit(
        db,
        actor=current_user.name,
        action="updated assignment",
        target=f"Project {assignment.projectId} × Researcher {assignment.researcherId}",
    )
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}", response_model=dict)
async def delete_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted assignment",
        target=f"Project {assignment.projectId} × Researcher {assignment.researcherId}",
    )
    await db.delete(assignment)
    await db.commit()
    return {"success": True}
