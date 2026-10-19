from typing import Any, List, Optional
from pydantic import BaseModel


class TeamBase(BaseModel):
    name: str
    project: Optional[str] = "No project assigned"
    members: List[Any] = []


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    project: Optional[str] = None
    members: Optional[List[Any]] = None


class TeamResponse(TeamBase):
    id: int

    class Config:
        from_attributes = True
