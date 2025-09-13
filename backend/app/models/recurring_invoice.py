from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
from ..schemas.recurring_invoice import RecurringFrequency

class RecurringInvoice(Base):
    __tablename__ = "recurring_invoices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Invoice details
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Amount and billing
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), default=0.0, nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Recurring settings
    frequency = Column(Enum(RecurringFrequency), default=RecurringFrequency.MONTHLY, nullable=False)
    interval = Column(Integer, default=1, nullable=False)  # Every X days/weeks/months
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    next_invoice_date = Column(DateTime(timezone=True), nullable=False)
    
    # Status and settings
    is_active = Column(Boolean, default=True, nullable=False)
    auto_send = Column(Boolean, default=False, nullable=False)
    send_reminders = Column(Boolean, default=True, nullable=False)
    reminder_days = Column(Integer, default=7, nullable=False)
    
    # Payment terms
    payment_terms = Column(String(100), default="Net 30", nullable=False)
    notes = Column(Text, nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recurring_invoices")
    client = relationship("Client", back_populates="recurring_invoices")
    project = relationship("Project", back_populates="recurring_invoices")
