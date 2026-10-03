from typing import List, Optional
from pydantic import BaseModel


class ConferenceBase(BaseModel):
    name: str
    shortName: str
    location: str
    startDate: str
    endDate: str
    type: str = "International"
    website: str
    presentations: List[int] = []


class ConferenceCreate(ConferenceBase):
    pass


class ConferenceUpdate(BaseModel):
    name: Optional[str] = None
    shortName: Optional[str] = None
    location: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    type: Optional[str] = None
    website: Optional[str] = None
    presentations: Optional[List[int]] = None


class ConferenceResponse(ConferenceBase):
    id: int

    class Config:
        from_attributes = True


class CitationBase(BaseModel):
    sourcePubId: int
    targetPubId: int
    year: int
    context: str


class CitationCreate(CitationBase):
    pass


class CitationUpdate(BaseModel):
    sourcePubId: Optional[int] = None
    targetPubId: Optional[int] = None
    year: Optional[int] = None
    context: Optional[str] = None


class CitationResponse(CitationBase):
    id: int

    class Config:
        from_attributes = True
