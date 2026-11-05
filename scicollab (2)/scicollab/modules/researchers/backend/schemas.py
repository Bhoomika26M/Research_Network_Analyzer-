# modules/researchers/backend/schemas.py

from pydantic import BaseModel, Field
from typing import Optional, List

class ResearcherBase(BaseModel):
    department: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    affiliations: Optional[List[int]] = None  # institution IDs

class ResearcherCreate(ResearcherBase):
    user_id: int

class ResearcherRead(ResearcherBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class ResearcherUpdate(BaseModel):
    department: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    affiliations: Optional[List[int]] = None
