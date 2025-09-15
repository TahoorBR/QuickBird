from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.work_log import WorkLog
from ...models.project import Project
from ...models.task import Task
from ...schemas.work_log import WorkLogCreate, WorkLogUpdate, WorkLogResponse

router = APIRouter()

@router.get("/timer/active", response_model=Optional[WorkLogResponse])
async def get_active_timer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get currently active timer for the user"""
    active_log = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.is_active == True
        )
    ).first()
    
    return active_log

@router.post("/timer/start")
async def start_timer(
    project_id: int,
    task_id: Optional[int] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new timer"""
    
    # Check if there's already an active timer
    active_timer = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.is_active == True
        )
    ).first()
    
    if active_timer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There is already an active timer. Please stop it first."
        )
    
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Verify task exists and belongs to user (if provided)
    if task_id:
        task = db.query(Task).filter(
            and_(
                Task.id == task_id,
                Task.user_id == current_user.id,
                Task.project_id == project_id
            )
        ).first()
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
    
    # Create new work log
    work_log = WorkLog(
        user_id=current_user.id,
        project_id=project_id,
        task_id=task_id,
        description=description,
        start_time=datetime.utcnow(),
        is_active=True,
        is_billable=True  # Default to billable
    )
    
    db.add(work_log)
    db.commit()
    db.refresh(work_log)
    
    return {
        "message": "Timer started successfully",
        "work_log_id": work_log.id,
        "start_time": work_log.start_time.isoformat()
    }

@router.post("/timer/stop")
async def stop_timer(
    work_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop the active timer"""
    
    work_log = db.query(WorkLog).filter(
        and_(
            WorkLog.id == work_log_id,
            WorkLog.user_id == current_user.id,
            WorkLog.is_active == True
        )
    ).first()
    
    if not work_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active timer not found"
        )
    
    # Calculate hours worked
    end_time = datetime.utcnow()
    hours_worked = (end_time - work_log.start_time).total_seconds() / 3600
    
    # Update work log
    work_log.end_time = end_time
    work_log.hours_worked = hours_worked
    work_log.is_active = False
    work_log.updated_at = datetime.utcnow()
    
    # Update task time if applicable
    if work_log.task_id:
        task = db.query(Task).filter(Task.id == work_log.task_id).first()
        if task:
            task.time_tracked = (task.time_tracked or 0) + hours_worked
            task.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Timer stopped successfully",
        "hours_worked": hours_worked,
        "end_time": end_time.isoformat()
    }

@router.get("/reports/daily", response_model=Dict[str, Any])
async def get_daily_time_report(
    date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily time tracking report"""
    
    target_date = date or datetime.utcnow().date()
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())
    
    # Get work logs for the day
    work_logs = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.start_time >= start_datetime,
            WorkLog.start_time <= end_datetime,
            WorkLog.is_active == False
        )
    ).all()
    
    # Calculate totals
    total_hours = sum(log.hours_worked for log in work_logs)
    billable_hours = sum(log.hours_worked for log in work_logs if log.is_billable)
    non_billable_hours = total_hours - billable_hours
    
    # Group by project
    project_summary = {}
    for log in work_logs:
        project_name = log.project.title if log.project else "Unknown Project"
        if project_name not in project_summary:
            project_summary[project_name] = {
                "hours": 0,
                "billable_hours": 0,
                "tasks": []
            }
        
        project_summary[project_name]["hours"] += log.hours_worked
        if log.is_billable:
            project_summary[project_name]["billable_hours"] += log.hours_worked
        
        if log.task:
            project_summary[project_name]["tasks"].append({
                "task_title": log.task.title,
                "hours": log.hours_worked,
                "description": log.description
            })
    
    return {
        "date": target_date.isoformat(),
        "total_hours": total_hours,
        "billable_hours": billable_hours,
        "non_billable_hours": non_billable_hours,
        "project_summary": project_summary,
        "work_logs": [
            {
                "id": log.id,
                "project": log.project.title if log.project else "Unknown",
                "task": log.task.title if log.task else None,
                "description": log.description,
                "start_time": log.start_time.isoformat(),
                "end_time": log.end_time.isoformat() if log.end_time else None,
                "hours_worked": log.hours_worked,
                "is_billable": log.is_billable
            }
            for log in work_logs
        ]
    }

@router.get("/reports/weekly", response_model=Dict[str, Any])
async def get_weekly_time_report(
    week_start: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly time tracking report"""
    
    if week_start:
        start_date = week_start
    else:
        # Get start of current week (Monday)
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=today.weekday())
    
    end_date = start_date + timedelta(days=6)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Get work logs for the week
    work_logs = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.start_time >= start_datetime,
            WorkLog.start_time <= end_datetime,
            WorkLog.is_active == False
        )
    ).all()
    
    # Calculate daily totals
    daily_totals = {}
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        daily_logs = [log for log in work_logs if log.start_time.date() == current_date]
        daily_totals[current_date.isoformat()] = {
            "total_hours": sum(log.hours_worked for log in daily_logs),
            "billable_hours": sum(log.hours_worked for log in daily_logs if log.is_billable),
            "work_logs_count": len(daily_logs)
        }
    
    # Calculate weekly totals
    total_hours = sum(log.hours_worked for log in work_logs)
    billable_hours = sum(log.hours_worked for log in work_logs if log.is_billable)
    
    # Group by project
    project_summary = {}
    for log in work_logs:
        project_name = log.project.title if log.project else "Unknown Project"
        if project_name not in project_summary:
            project_summary[project_name] = {
                "total_hours": 0,
                "billable_hours": 0,
                "days_worked": set()
            }
        
        project_summary[project_name]["total_hours"] += log.hours_worked
        if log.is_billable:
            project_summary[project_name]["billable_hours"] += log.hours_worked
        project_summary[project_name]["days_worked"].add(log.start_time.date())
    
    # Convert sets to counts
    for project in project_summary.values():
        project["days_worked"] = len(project["days_worked"])
    
    return {
        "week_start": start_date.isoformat(),
        "week_end": end_date.isoformat(),
        "total_hours": total_hours,
        "billable_hours": billable_hours,
        "daily_totals": daily_totals,
        "project_summary": project_summary
    }

@router.get("/reports/monthly", response_model=Dict[str, Any])
async def get_monthly_time_report(
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly time tracking report"""
    
    now = datetime.utcnow()
    target_year = year or now.year
    target_month = month or now.month
    
    # Get start and end of month
    start_date = date(target_year, target_month, 1)
    if target_month == 12:
        end_date = date(target_year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(target_year, target_month + 1, 1) - timedelta(days=1)
    
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Get work logs for the month
    work_logs = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.start_time >= start_datetime,
            WorkLog.start_time <= end_datetime,
            WorkLog.is_active == False
        )
    ).all()
    
    # Calculate daily totals
    daily_totals = {}
    current_date = start_date
    while current_date <= end_date:
        daily_logs = [log for log in work_logs if log.start_time.date() == current_date]
        daily_totals[current_date.isoformat()] = {
            "total_hours": sum(log.hours_worked for log in daily_logs),
            "billable_hours": sum(log.hours_worked for log in daily_logs if log.is_billable),
            "work_logs_count": len(daily_logs)
        }
        current_date += timedelta(days=1)
    
    # Calculate monthly totals
    total_hours = sum(log.hours_worked for log in work_logs)
    billable_hours = sum(log.hours_worked for log in work_logs if log.is_billable)
    
    # Group by project
    project_summary = {}
    for log in work_logs:
        project_name = log.project.title if log.project else "Unknown Project"
        if project_name not in project_summary:
            project_summary[project_name] = {
                "total_hours": 0,
                "billable_hours": 0,
                "days_worked": set()
            }
        
        project_summary[project_name]["total_hours"] += log.hours_worked
        if log.is_billable:
            project_summary[project_name]["billable_hours"] += log.hours_worked
        project_summary[project_name]["days_worked"].add(log.start_time.date())
    
    # Convert sets to counts
    for project in project_summary.values():
        project["days_worked"] = len(project["days_worked"])
    
    return {
        "year": target_year,
        "month": target_month,
        "total_hours": total_hours,
        "billable_hours": billable_hours,
        "daily_totals": daily_totals,
        "project_summary": project_summary
    }

@router.get("/reports/project/{project_id}", response_model=Dict[str, Any])
async def get_project_time_report(
    project_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get time tracking report for a specific project"""
    
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Set date range
    if not start_date:
        start_date = project.start_date.date() if project.start_date else date.today() - timedelta(days=30)
    if not end_date:
        end_date = project.deadline.date() if project.deadline else date.today()
    
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Get work logs for the project
    work_logs = db.query(WorkLog).filter(
        and_(
            WorkLog.user_id == current_user.id,
            WorkLog.project_id == project_id,
            WorkLog.start_time >= start_datetime,
            WorkLog.start_time <= end_datetime,
            WorkLog.is_active == False
        )
    ).all()
    
    # Calculate totals
    total_hours = sum(log.hours_worked for log in work_logs)
    billable_hours = sum(log.hours_worked for log in work_logs if log.is_billable)
    
    # Group by task
    task_summary = {}
    for log in work_logs:
        if log.task:
            task_name = log.task.title
            if task_name not in task_summary:
                task_summary[task_name] = {
                    "total_hours": 0,
                    "billable_hours": 0,
                    "work_logs": []
                }
            
            task_summary[task_name]["total_hours"] += log.hours_worked
            if log.is_billable:
                task_summary[task_name]["billable_hours"] += log.hours_worked
            
            task_summary[task_name]["work_logs"].append({
                "id": log.id,
                "description": log.description,
                "start_time": log.start_time.isoformat(),
                "end_time": log.end_time.isoformat() if log.end_time else None,
                "hours_worked": log.hours_worked,
                "is_billable": log.is_billable
            })
    
    return {
        "project_id": project_id,
        "project_title": project.title,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_hours": total_hours,
        "billable_hours": billable_hours,
        "task_summary": task_summary,
        "work_logs": [
            {
                "id": log.id,
                "task": log.task.title if log.task else None,
                "description": log.description,
                "start_time": log.start_time.isoformat(),
                "end_time": log.end_time.isoformat() if log.end_time else None,
                "hours_worked": log.hours_worked,
                "is_billable": log.is_billable
            }
            for log in work_logs
        ]
    }
