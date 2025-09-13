from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class RecurringFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class RecurringInvoiceBase(BaseModel):
    title: str
    description: Optional[str] = None
    client_id: int
    project_id: Optional[int] = None
    subtotal: Decimal
    tax_rate: Decimal = Decimal('0.0')
    tax_amount: Decimal = Decimal('0.0')
    total_amount: Decimal
    frequency: RecurringFrequency = RecurringFrequency.MONTHLY
    interval: int = 1
    start_date: datetime
    end_date: Optional[datetime] = None
    next_invoice_date: datetime
    is_active: bool = True
    auto_send: bool = False
    send_reminders: bool = True
    reminder_days: int = 7
    payment_terms: str = "Net 30"
    notes: Optional[str] = None

class RecurringInvoiceCreate(RecurringInvoiceBase):
    pass

class RecurringInvoiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None
    project_id: Optional[int] = None
    subtotal: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    frequency: Optional[RecurringFrequency] = None
    interval: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    next_invoice_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    auto_send: Optional[bool] = None
    send_reminders: Optional[bool] = None
    reminder_days: Optional[int] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None

class RecurringInvoiceResponse(RecurringInvoiceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
