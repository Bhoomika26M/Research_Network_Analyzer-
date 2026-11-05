# modules/auth/backend/schemas.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator

class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., description="One of: Researcher, Institution Admin, Reviewer, System Admin")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    institution_id: Optional[int] = None

class UserRead(UserBase):
    id: int
    is_active: bool
    institution_id: Optional[int]
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[int] = None  # user id
    role: Optional[str] = None
    exp: Optional[int] = None

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class RefreshInput(BaseModel):
    refresh_token: str
