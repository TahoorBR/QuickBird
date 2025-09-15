from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)  # web_development, design, writing, etc.
    
    # Template data (JSON fields for flexibility)
    default_budget = Column(Integer, nullable=True)  # In cents
    default_currency = Column(String(3), default="USD", nullable=False)
    default_duration_days = Column(Integer, nullable=True)
    default_hourly_rate = Column(Integer, nullable=True)  # In cents
    
    # Template structure
    default_tasks = Column(Text, nullable=True)  # JSON string of default tasks
    default_milestones = Column(Text, nullable=True)  # JSON string of default milestones
    default_phases = Column(Text, nullable=True)  # JSON string of project phases
    
    # Metadata
    is_public = Column(Boolean, default=False, nullable=False)  # Can be used by other users
    is_system = Column(Boolean, default=False, nullable=False)  # System-provided template
    usage_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="project_templates")
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ProjectTemplate(id={self.id}, name={self.name}, category={self.category})>"
