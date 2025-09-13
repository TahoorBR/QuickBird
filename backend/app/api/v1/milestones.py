from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.milestone import Milestone
from ...models.project import Project
from ...schemas.milestone import (
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    MilestoneListResponse,
    MilestoneStatsResponse
)

router = APIRouter()

@router.get("/", response_model=List[MilestoneResponse])
async def get_milestones(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all milestones for the current user"""
    query = db.query(Milestone).filter(Milestone.user_id == current_user.id)
    
    if project_id:
        query = query.filter(Milestone.project_id == project_id)
    if status:
        query = query.filter(Milestone.status == status)
    if priority:
        query = query.filter(Milestone.priority == priority)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Milestone.title.ilike(search_filter)) |
            (Milestone.description.ilike(search_filter))
        )
    
    milestones = query.offset(skip).limit(limit).all()
    return milestones

@router.get("/{milestone_id}", response_model=MilestoneResponse)
async def get_milestone(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific milestone by ID"""
    milestone = db.query(Milestone).filter(
        Milestone.id == milestone_id,
        Milestone.user_id == current_user.id
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    return milestone

@router.post("/", response_model=MilestoneResponse)
async def create_milestone(
    milestone: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new milestone"""
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == milestone.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Validate status
    if milestone.status not in ["not_started", "in_progress", "completed", "paused"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: not_started, in_progress, completed, or paused"
        )
    
    # Validate priority
    if milestone.priority not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be: low, medium, or high"
        )
    
    # Validate progress
    if milestone.progress < 0 or milestone.progress > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress must be between 0 and 100"
        )
    
    db_milestone = Milestone(
        title=milestone.title,
        description=milestone.description,
        project_id=milestone.project_id,
        status=milestone.status,
        priority=milestone.priority,
        progress=milestone.progress,
        due_date=milestone.due_date,
        start_date=milestone.start_date,
        estimated_hours=milestone.estimated_hours,
        actual_hours=milestone.actual_hours,
        notes=milestone.notes,
        is_billable=milestone.is_billable,
        hourly_rate=milestone.hourly_rate,
        user_id=current_user.id
    )
    
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    
    return db_milestone

@router.put("/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: int,
    milestone_update: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a milestone"""
    milestone = db.query(Milestone).filter(
        Milestone.id == milestone_id,
        Milestone.user_id == current_user.id
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    # Validate status if being updated
    if milestone_update.status and milestone_update.status not in ["not_started", "in_progress", "completed", "paused"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: not_started, in_progress, completed, or paused"
        )
    
    # Validate priority if being updated
    if milestone_update.priority and milestone_update.priority not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid priority. Must be: low, medium, or high"
        )
    
    # Validate progress if being updated
    if milestone_update.progress is not None and (milestone_update.progress < 0 or milestone_update.progress > 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress must be between 0 and 100"
        )
    
    # Update only provided fields
    update_data = milestone_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(milestone, field, value)
    
    # Set completed_date if status is being changed to completed
    if milestone_update.status == "completed" and milestone.status != "completed":
        milestone.completed_date = datetime.utcnow()
        milestone.progress = Decimal('100.00')
    elif milestone_update.status and milestone_update.status != "completed":
        milestone.completed_date = None
    
    milestone.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(milestone)
    
    return milestone

@router.delete("/{milestone_id}")
async def delete_milestone(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a milestone"""
    milestone = db.query(Milestone).filter(
        Milestone.id == milestone_id,
        Milestone.user_id == current_user.id
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    db.delete(milestone)
    db.commit()
    
    return {"message": "Milestone deleted successfully"}

@router.patch("/{milestone_id}/status")
async def update_milestone_status(
    milestone_id: int,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update milestone status"""
    if new_status not in ["not_started", "in_progress", "completed", "paused"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: not_started, in_progress, completed, or paused"
        )
    
    milestone = db.query(Milestone).filter(
        Milestone.id == milestone_id,
        Milestone.user_id == current_user.id
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    milestone.status = new_status
    
    # Set completed_date if status is being changed to completed
    if new_status == "completed" and milestone.status != "completed":
        milestone.completed_date = datetime.utcnow()
        milestone.progress = Decimal('100.00')
    elif new_status != "completed":
        milestone.completed_date = None
    
    milestone.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Milestone status updated to {new_status}"}

@router.patch("/{milestone_id}/progress")
async def update_milestone_progress(
    milestone_id: int,
    progress: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update milestone progress"""
    if progress < 0 or progress > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress must be between 0 and 100"
        )
    
    milestone = db.query(Milestone).filter(
        Milestone.id == milestone_id,
        Milestone.user_id == current_user.id
    ).first()
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    milestone.progress = Decimal(str(progress))
    
    # Update status based on progress
    if progress == 100 and milestone.status != "completed":
        milestone.status = "completed"
        milestone.completed_date = datetime.utcnow()
    elif progress > 0 and milestone.status == "not_started":
        milestone.status = "in_progress"
    
    milestone.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Milestone progress updated to {progress}%"}

@router.get("/stats/summary", response_model=MilestoneStatsResponse)
async def get_milestone_stats(
    project_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get milestone statistics"""
    query = db.query(Milestone).filter(Milestone.user_id == current_user.id)
    
    if project_id:
        query = query.filter(Milestone.project_id == project_id)
    
    milestones = query.all()
    
    total_milestones = len(milestones)
    completed_milestones = len([m for m in milestones if m.status == "completed"])
    in_progress_milestones = len([m for m in milestones if m.status == "in_progress"])
    not_started_milestones = len([m for m in milestones if m.status == "not_started"])
    paused_milestones = len([m for m in milestones if m.status == "paused"])
    
    completion_rate = (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
    
    total_estimated_hours = sum(m.estimated_hours or 0 for m in milestones)
    total_actual_hours = sum(m.actual_hours or 0 for m in milestones)
    
    return MilestoneStatsResponse(
        total_milestones=total_milestones,
        completed_milestones=completed_milestones,
        in_progress_milestones=in_progress_milestones,
        not_started_milestones=not_started_milestones,
        paused_milestones=paused_milestones,
        completion_rate=completion_rate,
        total_estimated_hours=total_estimated_hours,
        total_actual_hours=total_actual_hours
    )
