from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"  # Add status field with default value
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    budget: Optional[int] = None  # In cents
    currency: str = "USD"
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    hourly_rate: Optional[int] = None  # In cents

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    budget: Optional[int] = None
    currency: Optional[str] = None
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    hourly_rate: Optional[int] = None
    total_hours: Optional[int] = None
    is_archived: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: int
    status: str
    total_hours: int
    is_archived: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int
    page: int
    limit: int
