from typing import Optional
from pydantic import BaseModel


class ReviewBase(BaseModel):
    pub_id: int
    pub_title: str
    pub_author: str
    pub_institution: str
    pub_abstract: Optional[str] = None
    pub_keywords: Optional[str] = None
    pub_venue: Optional[str] = None
    pub_type: str = "Journal"
    submitted_date: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "Pending"
    decision: Optional[str] = None
    overall_score: Optional[int] = None
    method_score: Optional[int] = None
    novelty_score: Optional[int] = None
    clarity_score: Optional[int] = None
    comments: Optional[str] = None
    reviewer_name: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    status: Optional[str] = None
    decision: Optional[str] = None
    overall_score: Optional[int] = None
    method_score: Optional[int] = None
    novelty_score: Optional[int] = None
    clarity_score: Optional[int] = None
    comments: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int

    class Config:
        from_attributes = True
