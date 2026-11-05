from typing import Optional
from pydantic import BaseModel


class TaskBase(BaseModel):
    projectId: int
    title: str
    assignee: str
    dueDate: str
    status: str = "In Progress"
    priority: str = "Medium"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    assignee: Optional[str] = None
    dueDate: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None


class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True
