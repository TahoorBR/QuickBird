from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.project import Project
from ...models.task import Task
from ...models.work_log import WorkLog
from ...models.invoice import Invoice
from ...models.client import Client

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_analytics(
    time_range: str = "30",  # days
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics for the current user"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=int(time_range))
    
    # Projects analytics
    projects_query = db.query(Project).filter(Project.user_id == current_user.id)
    projects_total = projects_query.count()
    projects_active = projects_query.filter(Project.status == "active").count()
    projects_completed = projects_query.filter(Project.status == "completed").count()
    projects_overdue = projects_query.filter(
        and_(
            Project.deadline < end_date,
            Project.status.in_(["active", "paused"])
        )
    ).count()
    
    # Tasks analytics
    tasks_query = db.query(Task).join(Project).filter(Project.user_id == current_user.id)
    tasks_total = tasks_query.count()
    tasks_completed = tasks_query.filter(Task.status == "completed").count()
    tasks_pending = tasks_query.filter(Task.status == "pending").count()
    tasks_overdue = tasks_query.filter(
        and_(
            Task.due_date < end_date,
            Task.status.in_(["pending", "in_progress"])
        )
    ).count()
    
    # Time tracking analytics
    work_logs_query = db.query(WorkLog).join(Project).filter(Project.user_id == current_user.id)
    
    # Total hours
    total_hours_result = work_logs_query.with_entities(
        func.sum(WorkLog.hours_worked)
    ).scalar() or 0
    total_hours = float(total_hours_result) if total_hours_result else 0
    
    # Billable hours
    billable_hours_result = work_logs_query.filter(WorkLog.is_billable == True).with_entities(
        func.sum(WorkLog.hours_worked)
    ).scalar() or 0
    billable_hours = float(billable_hours_result) if billable_hours_result else 0
    
    # This week hours
    week_start = end_date - timedelta(days=end_date.weekday())
    this_week_hours_result = work_logs_query.filter(
        WorkLog.date >= week_start
    ).with_entities(
        func.sum(WorkLog.hours_worked)
    ).scalar() or 0
    this_week_hours = float(this_week_hours_result) if this_week_hours_result else 0
    
    # Last week hours
    last_week_start = week_start - timedelta(days=7)
    last_week_hours_result = work_logs_query.filter(
        and_(
            WorkLog.date >= last_week_start,
            WorkLog.date < week_start
        )
    ).with_entities(
        func.sum(WorkLog.hours_worked)
    ).scalar() or 0
    last_week_hours = float(last_week_hours_result) if last_week_hours_result else 0
    
    # Revenue analytics
    invoices_query = db.query(Invoice).join(Project).filter(Project.user_id == current_user.id)
    
    # Total revenue
    total_revenue_result = invoices_query.with_entities(
        func.sum(Invoice.total_amount)
    ).scalar() or 0
    total_revenue = float(total_revenue_result) if total_revenue_result else 0
    
    # This month revenue
    month_start = end_date.replace(day=1)
    this_month_revenue_result = invoices_query.filter(
        Invoice.created_at >= month_start
    ).with_entities(
        func.sum(Invoice.total_amount)
    ).scalar() or 0
    this_month_revenue = float(this_month_revenue_result) if this_month_revenue_result else 0
    
    # Last month revenue
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_revenue_result = invoices_query.filter(
        and_(
            Invoice.created_at >= last_month_start,
            Invoice.created_at < month_start
        )
    ).with_entities(
        func.sum(Invoice.total_amount)
    ).scalar() or 0
    last_month_revenue = float(last_month_revenue_result) if last_month_revenue_result else 0
    
    # Pending revenue
    pending_revenue_result = invoices_query.filter(
        Invoice.status == "pending"
    ).with_entities(
        func.sum(Invoice.total_amount)
    ).scalar() or 0
    pending_revenue = float(pending_revenue_result) if pending_revenue_result else 0
    
    # Clients analytics
    clients_query = db.query(Client).filter(Client.user_id == current_user.id)
    clients_total = clients_query.count()
    clients_active = clients_query.join(Project).filter(
        Project.status == "active"
    ).distinct().count()
    
    # New clients this month
    new_clients_this_month = clients_query.filter(
        Client.created_at >= month_start
    ).count()
    
    # Productivity metrics
    avg_task_time = 0
    if tasks_completed > 0:
        # Calculate average time per completed task
        completed_tasks_with_time = tasks_query.filter(
            and_(
                Task.status == "completed",
                Task.time_tracked > 0
            )
        ).count()
        if completed_tasks_with_time > 0:
            total_task_time = tasks_query.filter(
                and_(
                    Task.status == "completed",
                    Task.time_tracked > 0
                )
            ).with_entities(
                func.sum(Task.time_tracked)
            ).scalar() or 0
            avg_task_time = float(total_task_time) / completed_tasks_with_time
    
    efficiency = 0
    if total_hours > 0:
        efficiency = (billable_hours / total_hours) * 100
    
    return {
        "projects": {
            "total": projects_total,
            "active": projects_active,
            "completed": projects_completed,
            "overdue": projects_overdue
        },
        "tasks": {
            "total": tasks_total,
            "completed": tasks_completed,
            "pending": tasks_pending,
            "overdue": tasks_overdue
        },
        "timeTracking": {
            "totalHours": total_hours,
            "billableHours": billable_hours,
            "thisWeek": this_week_hours,
            "lastWeek": last_week_hours
        },
        "revenue": {
            "total": total_revenue,
            "thisMonth": this_month_revenue,
            "lastMonth": last_month_revenue,
            "pending": pending_revenue
        },
        "clients": {
            "total": clients_total,
            "active": clients_active,
            "newThisMonth": new_clients_this_month
        },
        "productivity": {
            "tasksCompleted": tasks_completed,
            "avgTaskTime": avg_task_time,
            "efficiency": efficiency
        },
        "timeRange": time_range,
        "generatedAt": datetime.utcnow().isoformat()
    }

@router.get("/revenue-trend", response_model=Dict[str, Any])
async def get_revenue_trend(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue trend over time"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get daily revenue data
    daily_revenue = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        next_date = date + timedelta(days=1)
        
        revenue_result = db.query(Invoice).join(Project).filter(
            and_(
                Project.user_id == current_user.id,
                Invoice.created_at >= date,
                Invoice.created_at < next_date
            )
        ).with_entities(
            func.sum(Invoice.total_amount)
        ).scalar() or 0
        
        daily_revenue.append({
            "date": date.strftime("%Y-%m-%d"),
            "revenue": float(revenue_result) if revenue_result else 0
        })
    
    return {
        "dailyRevenue": daily_revenue,
        "totalRevenue": sum(day["revenue"] for day in daily_revenue),
        "averageDaily": sum(day["revenue"] for day in daily_revenue) / days if days > 0 else 0
    }

@router.get("/project-performance", response_model=Dict[str, Any])
async def get_project_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project performance metrics"""
    
    # Get projects with their completion rates
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    
    project_metrics = []
    for project in projects:
        # Get tasks for this project
        tasks = db.query(Task).filter(Task.project_id == project.id).all()
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == "completed"])
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Get total hours for this project
        total_hours = db.query(WorkLog).filter(WorkLog.project_id == project.id).with_entities(
            func.sum(WorkLog.hours_worked)
        ).scalar() or 0
        
        project_metrics.append({
            "id": project.id,
            "title": project.title,
            "status": project.status,
            "completionRate": completion_rate,
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "totalHours": float(total_hours) if total_hours else 0,
            "budget": float(project.budget) if project.budget else 0,
            "deadline": project.deadline.isoformat() if project.deadline else None
        })
    
    return {
        "projects": project_metrics,
        "averageCompletionRate": sum(p["completionRate"] for p in project_metrics) / len(project_metrics) if project_metrics else 0
    }
