from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.work_log import WorkLog
from ...models.task import Task
from ...models.project import Project
from ...schemas.work_log import (
    WorkLogCreate,
    WorkLogUpdate,
    WorkLogResponse,
    WorkLogListResponse,
    WorkLogStatsResponse
)

router = APIRouter()

@router.get("/", response_model=List[WorkLogResponse])
async def get_work_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    task_id: Optional[int] = Query(None),
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    is_billable: Optional[bool] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all work logs for the current user"""
    query = db.query(WorkLog).filter(WorkLog.user_id == current_user.id)
    
    if task_id:
        query = query.filter(WorkLog.task_id == task_id)
    if project_id:
        query = query.filter(WorkLog.project_id == project_id)
    if status:
        query = query.filter(WorkLog.status == status)
    if is_billable is not None:
        query = query.filter(WorkLog.is_billable == is_billable)
    if start_date:
        query = query.filter(WorkLog.created_at >= start_date)
    if end_date:
        query = query.filter(WorkLog.created_at <= end_date)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (WorkLog.title.ilike(search_filter)) |
            (WorkLog.description.ilike(search_filter))
        )
    
    work_logs = query.order_by(WorkLog.created_at.desc()).offset(skip).limit(limit).all()
    return work_logs

@router.get("/{work_log_id}", response_model=WorkLogResponse)
async def get_work_log(
    work_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific work log by ID"""
    work_log = db.query(WorkLog).filter(
        WorkLog.id == work_log_id,
        WorkLog.user_id == current_user.id
    ).first()
    
    if not work_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work log not found"
        )
    
    return work_log

@router.post("/", response_model=WorkLogResponse)
async def create_work_log(
    work_log: WorkLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new work log"""
    # Verify task exists and belongs to user if task_id is provided
    if work_log.task_id:
        task = db.query(Task).filter(
            Task.id == work_log.task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
    
    # Verify project exists and belongs to user if project_id is provided
    if work_log.project_id:
        project = db.query(Project).filter(
            Project.id == work_log.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Validate status
    if work_log.status not in ["logged", "approved", "rejected", "pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: logged, approved, rejected, or pending"
        )
    
    # Calculate total amount if hourly rate is provided
    total_amount = None
    if work_log.hourly_rate and work_log.hours_worked:
        total_amount = work_log.hourly_rate * work_log.hours_worked
    
    db_work_log = WorkLog(
        title=work_log.title,
        description=work_log.description,
        task_id=work_log.task_id,
        project_id=work_log.project_id,
        hours_worked=work_log.hours_worked,
        start_time=work_log.start_time,
        end_time=work_log.end_time,
        ai_explanation=work_log.ai_explanation,
        is_ai_generated=work_log.is_ai_generated,
        is_billable=work_log.is_billable,
        hourly_rate=work_log.hourly_rate,
        total_amount=total_amount,
        status=work_log.status,
        notes=work_log.notes,
        user_id=current_user.id
    )
    
    db.add(db_work_log)
    db.commit()
    db.refresh(db_work_log)
    
    return db_work_log

@router.put("/{work_log_id}", response_model=WorkLogResponse)
async def update_work_log(
    work_log_id: int,
    work_log_update: WorkLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a work log"""
    work_log = db.query(WorkLog).filter(
        WorkLog.id == work_log_id,
        WorkLog.user_id == current_user.id
    ).first()
    
    if not work_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work log not found"
        )
    
    # Verify task exists and belongs to user if task_id is being updated
    if work_log_update.task_id:
        task = db.query(Task).filter(
            Task.id == work_log_update.task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
    
    # Verify project exists and belongs to user if project_id is being updated
    if work_log_update.project_id:
        project = db.query(Project).filter(
            Project.id == work_log_update.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
    
    # Validate status if being updated
    if work_log_update.status and work_log_update.status not in ["logged", "approved", "rejected", "pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: logged, approved, rejected, or pending"
        )
    
    # Update only provided fields
    update_data = work_log_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(work_log, field, value)
    
    # Recalculate total amount if hourly rate or hours worked changed
    if work_log_update.hourly_rate is not None or work_log_update.hours_worked is not None:
        if work_log.hourly_rate and work_log.hours_worked:
            work_log.total_amount = work_log.hourly_rate * work_log.hours_worked
        else:
            work_log.total_amount = None
    
    work_log.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(work_log)
    
    return work_log

@router.delete("/{work_log_id}")
async def delete_work_log(
    work_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a work log"""
    work_log = db.query(WorkLog).filter(
        WorkLog.id == work_log_id,
        WorkLog.user_id == current_user.id
    ).first()
    
    if not work_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work log not found"
        )
    
    db.delete(work_log)
    db.commit()
    
    return {"message": "Work log deleted successfully"}

@router.patch("/{work_log_id}/status")
async def update_work_log_status(
    work_log_id: int,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update work log status"""
    if new_status not in ["logged", "approved", "rejected", "pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: logged, approved, rejected, or pending"
        )
    
    work_log = db.query(WorkLog).filter(
        WorkLog.id == work_log_id,
        WorkLog.user_id == current_user.id
    ).first()
    
    if not work_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work log not found"
        )
    
    work_log.status = new_status
    work_log.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Work log status updated to {new_status}"}

@router.get("/stats/summary", response_model=WorkLogStatsResponse)
async def get_work_log_stats(
    project_id: Optional[int] = Query(None),
    task_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get work log statistics"""
    query = db.query(WorkLog).filter(WorkLog.user_id == current_user.id)
    
    if project_id:
        query = query.filter(WorkLog.project_id == project_id)
    if task_id:
        query = query.filter(WorkLog.task_id == task_id)
    if start_date:
        query = query.filter(WorkLog.created_at >= start_date)
    if end_date:
        query = query.filter(WorkLog.created_at <= end_date)
    
    work_logs = query.all()
    
    total_hours = sum(log.hours_worked for log in work_logs)
    billable_hours = sum(log.hours_worked for log in work_logs if log.is_billable)
    non_billable_hours = total_hours - billable_hours
    total_amount = sum(log.total_amount or 0 for log in work_logs)
    total_logs = len(work_logs)
    average_hours_per_log = total_hours / total_logs if total_logs > 0 else 0
    
    # Calculate this week and this month
    now = datetime.utcnow()
    week_start = now - timedelta(days=now.weekday())
    month_start = now.replace(day=1)
    
    this_week_hours = sum(
        log.hours_worked for log in work_logs 
        if log.created_at >= week_start
    )
    this_month_hours = sum(
        log.hours_worked for log in work_logs 
        if log.created_at >= month_start
    )
    
    return WorkLogStatsResponse(
        total_hours=total_hours,
        billable_hours=billable_hours,
        non_billable_hours=non_billable_hours,
        total_amount=total_amount,
        total_logs=total_logs,
        average_hours_per_log=average_hours_per_log,
        this_week_hours=this_week_hours,
        this_month_hours=this_month_hours
    )
