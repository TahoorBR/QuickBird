from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class WorkLogBase(BaseModel):
    title: str
    description: Optional[str] = None
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    hours_worked: Decimal = Decimal('0.00')
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    ai_explanation: Optional[str] = None
    is_ai_generated: bool = False
    is_billable: bool = True
    hourly_rate: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    status: str = "logged"
    notes: Optional[str] = None

class WorkLogCreate(WorkLogBase):
    pass

class WorkLogUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    hours_worked: Optional[Decimal] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    ai_explanation: Optional[str] = None
    is_ai_generated: Optional[bool] = None
    is_billable: Optional[bool] = None
    hourly_rate: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class WorkLogResponse(WorkLogBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkLogListResponse(BaseModel):
    work_logs: List[WorkLogResponse]
    total: int
    page: int
    size: int

class WorkLogStatsResponse(BaseModel):
    total_hours: Decimal
    billable_hours: Decimal
    non_billable_hours: Decimal
    total_amount: Decimal
    total_logs: int
    average_hours_per_log: Decimal
    this_week_hours: Decimal
    this_month_hours: Decimal
