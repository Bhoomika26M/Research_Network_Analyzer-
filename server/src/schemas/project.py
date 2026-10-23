from typing import List, Optional
from pydantic import BaseModel


class ProjectBase(BaseModel):
    title: str
    description: str
    status: str = "Active"
    pi: str
    members: List[int] = []
    startDate: str
    endDate: Optional[str] = None
    tags: List[str] = []


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    pi: Optional[str] = None
    members: Optional[List[int]] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    tags: Optional[List[str]] = None


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True
