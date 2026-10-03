from typing import List, Optional
from pydantic import BaseModel, computed_field

from src.core.permissions import get_role_permissions


class UserBase(BaseModel):
    name: str
    initials: str
    email: str  # plain str to avoid email-validator dependency at import time
    institution: str
    department: str
    role: str = "researcher"
    bio: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    h_index: int = 0
    citations_total: int = 0


class UserCreate(BaseModel):
    name: str
    email: str
    institution: str = "Scientific Network"
    department: str = "General Department"
    role: str = "researcher"
    initials: Optional[str] = None
    password: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    publications_ids: List[int] = []
    h_index: int = 0
    citations_total: int = 0


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    h_index: Optional[int] = None
    citations_total: Optional[int] = None


class UserResponse(UserBase):
    id: int
    publications_ids: List[int] = []
    is_active: Optional[str] = "Active"

    @computed_field
    @property
    def permissions(self) -> List[str]:
        """Permissions the account's role holds (mirrors the frontend permission model)."""
        return get_role_permissions(self.role)

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
