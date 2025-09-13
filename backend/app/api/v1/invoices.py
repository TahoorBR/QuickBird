from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.invoice import Invoice, InvoiceItem
from ...models.client import Client
from ...models.project import Project
from ...schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceListResponse,
    InvoiceStatsResponse,
    InvoiceItemCreate
)

router = APIRouter()

def generate_invoice_number(user_id: int, db: Session) -> str:
    """Generate unique invoice number"""
    count = db.query(Invoice).filter(Invoice.user_id == user_id).count()
    return f"INV-{user_id:04d}-{count + 1:04d}"

@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invoices for the current user"""
    query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    
    if status:
        query = query.filter(Invoice.status == status)
    if client_id:
        query = query.filter(Invoice.client_id == client_id)
    if project_id:
        query = query.filter(Invoice.project_id == project_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Invoice.invoice_number.ilike(search_filter)) |
            (Invoice.title.ilike(search_filter)) |
            (Invoice.client_name.ilike(search_filter))
        )
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific invoice by ID"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return invoice

@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new invoice"""
    # Generate invoice number
    invoice_number = generate_invoice_number(current_user.id, db)
    
    # Verify client exists if client_id is provided
    if invoice.client_id:
        client = db.query(Client).filter(
            Client.id == invoice.client_id,
            Client.user_id == current_user.id
        ).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
    
    # Verify project exists if project_id is provided
    if invoice.project_id:
        project = db.query(Project).filter(
            Project.id == invoice.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=invoice_number,
        title=invoice.title,
        description=invoice.description,
        client_id=invoice.client_id,
        client_name=invoice.client_name,
        client_email=invoice.client_email,
        client_address=invoice.client_address,
        project_id=invoice.project_id,
        project_title=invoice.project_title,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        status=invoice.status,
        due_date=invoice.due_date,
        notes=invoice.notes,
        terms=invoice.terms,
        is_recurring=invoice.is_recurring,
        recurring_frequency=invoice.recurring_frequency,
        user_id=current_user.id
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Create invoice items
    for item_data in invoice.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_data.total_price,
            task_id=item_data.task_id
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an invoice"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Verify client exists if client_id is being updated
    if invoice_update.client_id:
        client = db.query(Client).filter(
            Client.id == invoice_update.client_id,
            Client.user_id == current_user.id
        ).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found"
            )
    
    # Verify project exists if project_id is being updated
    if invoice_update.project_id:
        project = db.query(Project).filter(
            Project.id == invoice_update.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Update only provided fields
    update_data = invoice_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    invoice.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(invoice)
    
    return invoice

@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an invoice"""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Only allow deletion of draft invoices
    if invoice.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft invoices can be deleted"
        )
    
    db.delete(invoice)
    db.commit()
    
    return {"message": "Invoice deleted successfully"}

@router.patch("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: int,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update invoice status"""
    if new_status not in ["draft", "sent", "paid", "overdue", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: draft, sent, paid, overdue, or cancelled"
        )
    
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == current_user.id
    ).first()
    
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice.status = new_status
    
    # Update relevant dates
    if new_status == "sent" and not invoice.sent_date:
        invoice.sent_date = datetime.utcnow()
    elif new_status == "paid" and not invoice.paid_date:
        invoice.paid_date = datetime.utcnow()
    
    invoice.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Invoice status updated to {new_status}"}

@router.get("/stats/summary", response_model=InvoiceStatsResponse)
async def get_invoice_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get invoice statistics"""
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    
    total_invoices = len(invoices)
    total_amount = sum(invoice.total_amount for invoice in invoices)
    paid_amount = sum(invoice.total_amount for invoice in invoices if invoice.status == "paid")
    pending_amount = sum(invoice.total_amount for invoice in invoices if invoice.status == "sent")
    overdue_amount = sum(invoice.total_amount for invoice in invoices if invoice.status == "overdue")
    draft_amount = sum(invoice.total_amount for invoice in invoices if invoice.status == "draft")
    
    return InvoiceStatsResponse(
        total_invoices=total_invoices,
        total_amount=total_amount,
        paid_amount=paid_amount,
        pending_amount=pending_amount,
        overdue_amount=overdue_amount,
        draft_amount=draft_amount
    )
