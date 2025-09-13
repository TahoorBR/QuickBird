from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    subscription_tier = Column(String(20), default="free", nullable=False)
    usage_count = Column(Integer, default=0, nullable=False)
    usage_limit = Column(Integer, default=10, nullable=False)  # Daily limit
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    bio = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(100), nullable=True)
    timezone = Column(String(50), default="UTC", nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    clients = relationship("Client", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    milestones = relationship("Milestone", back_populates="user")
    work_logs = relationship("WorkLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    recurring_invoices = relationship("RecurringInvoice", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
