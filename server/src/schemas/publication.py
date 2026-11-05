from typing import List, Optional
from pydantic import BaseModel


class PublicationBase(BaseModel):
    title: str
    authors: List[str]
    abstract: str
    journal: str
    year: int
    type: str = "Journal"
    status: str = "Published"
    doi: Optional[str] = None
    citations: int = 0
    pages: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    type: Optional[str] = None
    status: Optional[str] = None
    doi: Optional[str] = None
    citations: Optional[int] = None
    pages: Optional[str] = None
    volume: Optional[str] = None
    issue: Optional[str] = None


class PublicationResponse(PublicationBase):
    id: int

    class Config:
        from_attributes = True
