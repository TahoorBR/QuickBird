from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProjectTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    default_budget: Optional[int] = None
    default_currency: str = "USD"
    default_duration_days: Optional[int] = None
    default_hourly_rate: Optional[int] = None
    default_tasks: Optional[str] = None  # JSON string
    default_milestones: Optional[str] = None  # JSON string
    default_phases: Optional[str] = None  # JSON string
    is_public: bool = False

class ProjectTemplateCreate(ProjectTemplateBase):
    pass

class ProjectTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    default_budget: Optional[int] = None
    default_currency: Optional[str] = None
    default_duration_days: Optional[int] = None
    default_hourly_rate: Optional[int] = None
    default_tasks: Optional[str] = None
    default_milestones: Optional[str] = None
    default_phases: Optional[str] = None
    is_public: Optional[bool] = None

class ProjectTemplateResponse(ProjectTemplateBase):
    id: int
    is_system: bool
    usage_count: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectFromTemplateRequest(BaseModel):
    template_id: int
    project_name: str
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    budget: Optional[int] = None
    currency: Optional[str] = None
    start_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    custom_tasks: Optional[List[Dict[str, Any]]] = None
    custom_milestones: Optional[List[Dict[str, Any]]] = None
