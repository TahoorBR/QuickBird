from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active", nullable=False)  # active, completed, paused
    client_name = Column(String(100), nullable=True)
    client_email = Column(String(255), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    budget = Column(Integer, nullable=True)  # In cents
    currency = Column(String(3), default="USD", nullable=False)
    deadline = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    hourly_rate = Column(Integer, nullable=True)  # In cents
    total_hours = Column(Integer, default=0, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    client = relationship("Client", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    work_logs = relationship("WorkLog", back_populates="project")

    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title}, status={self.status})>"
