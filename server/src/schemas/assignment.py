from typing import Optional
from pydantic import BaseModel


class AssignmentBase(BaseModel):
    projectId: int
    researcherId: int
    role: Optional[str] = "Researcher"
    status: Optional[str] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentUpdate(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None


class AssignmentResponse(AssignmentBase):
    id: int

    class Config:
        from_attributes = True
