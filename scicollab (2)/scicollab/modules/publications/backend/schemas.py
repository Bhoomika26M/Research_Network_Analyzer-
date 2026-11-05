# modules/publications/backend/schemas.py

from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from enum import Enum

class PubType(str, Enum):
    JOURNAL = "Journal"
    CONFERENCE = "Conference"
    BOOK = "Book"
    PATENT = "Patent"
    TECH_REPORT = "Technical Report"

class PubStatus(str, Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"

class PublicationBase(BaseModel):
    title: str
    type: PubType
    status: PubStatus = PubStatus.DRAFT
    doi: Optional[str] = None

class PublicationCreate(PublicationBase):
    institution_id: Optional[int] = None

class PublicationRead(PublicationBase):
    id: int
    file_path: Optional[str] = None
    created_at: str
    created_by_id: int
    institution_id: Optional[int]
    class Config:
        orm_mode = True

class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[PubType] = None
    status: Optional[PubStatus] = None
    doi: Optional[str] = None
