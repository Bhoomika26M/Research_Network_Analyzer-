from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.api.deps import get_current_user, require_permission
from src.core.audit import record_audit
from src.db.session import get_db
from src.models.project import Project
from src.models.user import User
from src.schemas.project import ProjectResponse, ProjectCreate, ProjectUpdate

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Project).where(Project.is_deleted == False))
    return result.scalars().all()


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    project = Project(**project_in.model_dump())
    db.add(project)
    await record_audit(db, actor=current_user.name, action="created project", target=project.title)
    await db.commit()
    await db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await record_audit(db, actor=current_user.name, action="updated project", target=project.title)
    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", response_model=dict)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("research.manageProjects")),
) -> Any:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    # Soft delete: keep the row (members, tags, tasks) for the audit trail.
    project.is_deleted = True
    project.deleted_at = datetime.utcnow()
    await record_audit(
        db,
        actor=current_user.name,
        action="deleted project",
        target=project.title,
        category="Data",
    )
    await db.commit()
    return {"success": True, "deleted": True}
