from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    GENERAL = "general"
    TASK_DUE = "task_due"
    TASK_COMPLETED = "task_completed"
    PROJECT_DEADLINE = "project_deadline"
    MILESTONE_COMPLETED = "milestone_completed"
    INVOICE_OVERDUE = "invoice_overdue"
    PAYMENT_RECEIVED = "payment_received"
    SYSTEM_UPDATE = "system_update"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType = NotificationType.GENERAL
    priority: NotificationPriority = NotificationPriority.MEDIUM
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    action_url: Optional[str] = None
    action_text: Optional[str] = None
    expires_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    is_archived: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    size: int

class NotificationStatsResponse(BaseModel):
    total_notifications: int
    unread_notifications: int
    high_priority_unread: int
    overdue_tasks: int
    overdue_invoices: int
    upcoming_deadlines: int
