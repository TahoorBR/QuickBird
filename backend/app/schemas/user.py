from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.user import User

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_tier: str
    usage_count: int
    usage_limit: int
    is_active: bool
    is_verified: bool
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: str
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
