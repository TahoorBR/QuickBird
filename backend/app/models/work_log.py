from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class WorkLog(Base):
    __tablename__ = "work_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Task and project relationships
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Time tracking
    hours_worked = Column(Numeric(8, 2), nullable=False, default=0)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    # AI-generated content
    ai_explanation = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    
    # Billing information
    is_billable = Column(Boolean, default=True, nullable=False)
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    
    # Status and notes
    status = Column(String(20), default="logged", nullable=False)  # logged, approved, rejected, pending
    notes = Column(Text, nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="work_logs")
    task = relationship("Task", back_populates="work_logs")
    project = relationship("Project", back_populates="work_logs")
