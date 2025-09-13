from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None
    is_billable: bool = True
    hourly_rate: Optional[int] = None  # In cents

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    time_tracked: Optional[int] = None
    is_billable: Optional[bool] = None
    hourly_rate: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    actual_hours: int
    time_tracked: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    page: int
    limit: int
