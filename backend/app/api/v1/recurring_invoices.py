from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.recurring_invoice import RecurringInvoice, RecurringFrequency
from ...schemas.recurring_invoice import (
    RecurringInvoiceCreate,
    RecurringInvoiceUpdate,
    RecurringInvoiceResponse
)

router = APIRouter()

@router.get("/", response_model=List[RecurringInvoiceResponse])
async def get_recurring_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recurring invoices for the current user"""
    query = db.query(RecurringInvoice).filter(RecurringInvoice.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(RecurringInvoice.is_active == is_active)
    
    recurring_invoices = query.order_by(RecurringInvoice.created_at.desc()).offset(skip).limit(limit).all()
    return recurring_invoices

@router.get("/{recurring_invoice_id}", response_model=RecurringInvoiceResponse)
async def get_recurring_invoice(
    recurring_invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific recurring invoice by ID"""
    recurring_invoice = db.query(RecurringInvoice).filter(
        RecurringInvoice.id == recurring_invoice_id,
        RecurringInvoice.user_id == current_user.id
    ).first()
    
    if not recurring_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring invoice not found"
        )
    
    return recurring_invoice

@router.post("/", response_model=RecurringInvoiceResponse)
async def create_recurring_invoice(
    recurring_invoice: RecurringInvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new recurring invoice"""
    # Calculate next invoice date based on frequency
    next_date = recurring_invoice.start_date
    if recurring_invoice.frequency == RecurringFrequency.DAILY:
        next_date += timedelta(days=recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.WEEKLY:
        next_date += timedelta(weeks=recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.MONTHLY:
        next_date += timedelta(days=30 * recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.QUARTERLY:
        next_date += timedelta(days=90 * recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.YEARLY:
        next_date += timedelta(days=365 * recurring_invoice.interval)
    
    db_recurring_invoice = RecurringInvoice(
        title=recurring_invoice.title,
        description=recurring_invoice.description,
        client_id=recurring_invoice.client_id,
        project_id=recurring_invoice.project_id,
        subtotal=recurring_invoice.subtotal,
        tax_rate=recurring_invoice.tax_rate,
        tax_amount=recurring_invoice.tax_amount,
        total_amount=recurring_invoice.total_amount,
        frequency=recurring_invoice.frequency,
        interval=recurring_invoice.interval,
        start_date=recurring_invoice.start_date,
        end_date=recurring_invoice.end_date,
        next_invoice_date=next_date,
        is_active=recurring_invoice.is_active,
        auto_send=recurring_invoice.auto_send,
        send_reminders=recurring_invoice.send_reminders,
        reminder_days=recurring_invoice.reminder_days,
        payment_terms=recurring_invoice.payment_terms,
        notes=recurring_invoice.notes,
        user_id=current_user.id
    )
    
    db.add(db_recurring_invoice)
    db.commit()
    db.refresh(db_recurring_invoice)
    
    return db_recurring_invoice

@router.put("/{recurring_invoice_id}", response_model=RecurringInvoiceResponse)
async def update_recurring_invoice(
    recurring_invoice_id: int,
    recurring_invoice_update: RecurringInvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a recurring invoice"""
    recurring_invoice = db.query(RecurringInvoice).filter(
        RecurringInvoice.id == recurring_invoice_id,
        RecurringInvoice.user_id == current_user.id
    ).first()
    
    if not recurring_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring invoice not found"
        )
    
    # Update only provided fields
    update_data = recurring_invoice_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recurring_invoice, field, value)
    
    # Recalculate next invoice date if frequency or interval changed
    if 'frequency' in update_data or 'interval' in update_data:
        next_date = recurring_invoice.start_date
        if recurring_invoice.frequency == RecurringFrequency.DAILY:
            next_date += timedelta(days=recurring_invoice.interval)
        elif recurring_invoice.frequency == RecurringFrequency.WEEKLY:
            next_date += timedelta(weeks=recurring_invoice.interval)
        elif recurring_invoice.frequency == RecurringFrequency.MONTHLY:
            next_date += timedelta(days=30 * recurring_invoice.interval)
        elif recurring_invoice.frequency == RecurringFrequency.QUARTERLY:
            next_date += timedelta(days=90 * recurring_invoice.interval)
        elif recurring_invoice.frequency == RecurringFrequency.YEARLY:
            next_date += timedelta(days=365 * recurring_invoice.interval)
        recurring_invoice.next_invoice_date = next_date
    
    db.commit()
    db.refresh(recurring_invoice)
    
    return recurring_invoice

@router.delete("/{recurring_invoice_id}")
async def delete_recurring_invoice(
    recurring_invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a recurring invoice"""
    recurring_invoice = db.query(RecurringInvoice).filter(
        RecurringInvoice.id == recurring_invoice_id,
        RecurringInvoice.user_id == current_user.id
    ).first()
    
    if not recurring_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring invoice not found"
        )
    
    db.delete(recurring_invoice)
    db.commit()
    
    return {"message": "Recurring invoice deleted successfully"}

@router.post("/{recurring_invoice_id}/generate")
async def generate_invoice_from_recurring(
    recurring_invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a regular invoice from a recurring invoice"""
    recurring_invoice = db.query(RecurringInvoice).filter(
        RecurringInvoice.id == recurring_invoice_id,
        RecurringInvoice.user_id == current_user.id
    ).first()
    
    if not recurring_invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring invoice not found"
        )
    
    # Create a regular invoice from the recurring invoice
    from ...models.invoice import Invoice
    from ...models.invoice_item import InvoiceItem
    
    new_invoice = Invoice(
        title=f"{recurring_invoice.title} - {datetime.now().strftime('%Y-%m-%d')}",
        description=recurring_invoice.description,
        client_id=recurring_invoice.client_id,
        project_id=recurring_invoice.project_id,
        subtotal=recurring_invoice.subtotal,
        tax_rate=recurring_invoice.tax_rate,
        tax_amount=recurring_invoice.tax_amount,
        total_amount=recurring_invoice.total_amount,
        status="pending",
        payment_terms=recurring_invoice.payment_terms,
        notes=recurring_invoice.notes,
        user_id=current_user.id
    )
    
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    
    # Update next invoice date
    if recurring_invoice.frequency == RecurringFrequency.DAILY:
        recurring_invoice.next_invoice_date += timedelta(days=recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.WEEKLY:
        recurring_invoice.next_invoice_date += timedelta(weeks=recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.MONTHLY:
        recurring_invoice.next_invoice_date += timedelta(days=30 * recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.QUARTERLY:
        recurring_invoice.next_invoice_date += timedelta(days=90 * recurring_invoice.interval)
    elif recurring_invoice.frequency == RecurringFrequency.YEARLY:
        recurring_invoice.next_invoice_date += timedelta(days=365 * recurring_invoice.interval)
    
    db.commit()
    
    return {"message": "Invoice generated successfully", "invoice_id": new_invoice.id}

@router.get("/due/upcoming")
async def get_upcoming_recurring_invoices(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recurring invoices due in the next N days"""
    cutoff_date = datetime.utcnow() + timedelta(days=days)
    
    upcoming_invoices = db.query(RecurringInvoice).filter(
        RecurringInvoice.user_id == current_user.id,
        RecurringInvoice.is_active == True,
        RecurringInvoice.next_invoice_date <= cutoff_date
    ).order_by(RecurringInvoice.next_invoice_date.asc()).all()
    
    return upcoming_invoices
