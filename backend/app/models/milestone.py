from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Project relationship
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Status and progress
    status = Column(String(20), default="not_started", nullable=False)  # not_started, in_progress, completed, paused
    priority = Column(String(10), default="medium", nullable=False)  # low, medium, high
    progress = Column(Numeric(5, 2), default=0, nullable=False)  # 0-100 percentage
    
    # Dates
    due_date = Column(DateTime, nullable=True)
    completed_date = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    
    # Additional information
    estimated_hours = Column(Numeric(8, 2), nullable=True)
    actual_hours = Column(Numeric(8, 2), nullable=True)
    notes = Column(Text, nullable=True)
    is_billable = Column(Boolean, default=True, nullable=False)
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="milestones")
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone", cascade="all, delete-orphan")
