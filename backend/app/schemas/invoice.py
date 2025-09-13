from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class InvoiceItemBase(BaseModel):
    description: str
    quantity: Decimal
    unit_price: Decimal
    total_price: Decimal
    task_id: Optional[int] = None

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemUpdate(BaseModel):
    description: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    task_id: Optional[int] = None

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str
    title: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None
    client_name: str
    client_email: EmailStr
    client_address: Optional[str] = None
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    subtotal: Decimal = Decimal('0.00')
    tax_rate: Decimal = Decimal('0.00')
    tax_amount: Decimal = Decimal('0.00')
    total_amount: Decimal = Decimal('0.00')
    currency: str = "USD"
    status: str = "draft"
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    is_recurring: bool = False
    recurring_frequency: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    client_address: Optional[str] = None
    project_id: Optional[int] = None
    project_title: Optional[str] = None
    subtotal: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurring_frequency: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    user_id: int
    sent_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True

class InvoiceListResponse(BaseModel):
    invoices: List[InvoiceResponse]
    total: int
    page: int
    size: int

class InvoiceStatsResponse(BaseModel):
    total_invoices: int
    total_amount: Decimal
    paid_amount: Decimal
    pending_amount: Decimal
    overdue_amount: Decimal
    draft_amount: Decimal
