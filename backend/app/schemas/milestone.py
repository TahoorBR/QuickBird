from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    status: str = "not_started"
    priority: str = "medium"
    progress: Decimal = Decimal('0.00')
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    estimated_hours: Optional[Decimal] = None
    actual_hours: Optional[Decimal] = None
    notes: Optional[str] = None
    is_billable: bool = True
    hourly_rate: Optional[Decimal] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[Decimal] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    estimated_hours: Optional[Decimal] = None
    actual_hours: Optional[Decimal] = None
    notes: Optional[str] = None
    is_billable: Optional[bool] = None
    hourly_rate: Optional[Decimal] = None

class MilestoneResponse(MilestoneBase):
    id: int
    user_id: int
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MilestoneListResponse(BaseModel):
    milestones: List[MilestoneResponse]
    total: int
    page: int
    size: int

class MilestoneStatsResponse(BaseModel):
    total_milestones: int
    completed_milestones: int
    in_progress_milestones: int
    not_started_milestones: int
    paused_milestones: int
    completion_rate: float
    total_estimated_hours: Decimal
    total_actual_hours: Decimal
