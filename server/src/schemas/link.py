from typing import Optional
from pydantic import BaseModel


class LinkBase(BaseModel):
    sourceTitle: str
    targetTitle: str
    targetAuthors: str
    targetYear: str
    targetType: str = "Journal"
    relation: str = "Cites"


class LinkCreate(LinkBase):
    pass


class LinkUpdate(BaseModel):
    relation: Optional[str] = None


class LinkResponse(LinkBase):
    id: int

    class Config:
        from_attributes = True
