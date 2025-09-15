from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.client import Client
from ...models.project import Project
from ...models.task import Task
from ...models.milestone import Milestone
from ...models.invoice import Invoice
from ...models.work_log import WorkLog

router = APIRouter()

@router.get("/projects/{client_token}")
async def get_client_projects(
    client_token: str,
    db: Session = Depends(get_db)
):
    """Get projects visible to a client using their token"""
    
    # Find client by token
    client = db.query(Client).filter(Client.portal_token == client_token).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid client token"
        )
    
    # Get projects for this client
    projects = db.query(Project).filter(
        Project.client_id == client.id
    ).all()
    
    # Format project data for client view
    client_projects = []
    for project in projects:
        # Get project tasks
        tasks = db.query(Task).filter(Task.project_id == project.id).all()
        
        # Get project milestones
        milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
        
        # Get recent work logs (last 7 days)
        recent_work_logs = db.query(WorkLog).filter(
            WorkLog.project_id == project.id,
            WorkLog.start_time >= datetime.utcnow() - timedelta(days=7)
        ).all()
        
        client_projects.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "status": project.status,
            "budget": project.budget,
            "currency": project.currency,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "deadline": project.deadline.isoformat() if project.deadline else None,
            "progress": calculate_project_progress(tasks),
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "time_tracked": task.time_tracked
                }
                for task in tasks
            ],
            "milestones": [
                {
                    "id": milestone.id,
                    "title": milestone.title,
                    "description": milestone.description,
                    "status": milestone.status,
                    "due_date": milestone.due_date.isoformat() if milestone.due_date else None,
                    "completion_percentage": milestone.completion_percentage
                }
                for milestone in milestones
            ],
            "recent_activity": [
                {
                    "id": log.id,
                    "description": log.description,
                    "date": log.start_time.isoformat(),
                    "hours": log.hours_worked
                }
                for log in recent_work_logs
            ]
        })
    
    return {
        "client": {
            "name": client.name,
            "email": client.email,
            "company": client.company
        },
        "projects": client_projects
    }

@router.get("/invoices/{client_token}")
async def get_client_invoices(
    client_token: str,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get invoices visible to a client using their token"""
    
    # Find client by token
    client = db.query(Client).filter(Client.portal_token == client_token).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid client token"
        )
    
    # Get invoices for this client
    query = db.query(Invoice).filter(Invoice.client_id == client.id)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.all()
    
    # Format invoice data for client view
    client_invoices = []
    for invoice in invoices:
        client_invoices.append({
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "status": invoice.status,
            "total_amount": invoice.total_amount,
            "currency": invoice.currency,
            "invoice_date": invoice.invoice_date.isoformat(),
            "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
            "paid_date": invoice.paid_date.isoformat() if invoice.paid_date else None,
            "project": {
                "id": invoice.project.id,
                "title": invoice.project.title
            } if invoice.project else None,
            "items": [
                {
                    "description": item.description,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total": item.quantity * item.unit_price
                }
                for item in invoice.items
            ]
        })
    
    return {
        "client": {
            "name": client.name,
            "email": client.email,
            "company": client.company
        },
        "invoices": client_invoices
    }

@router.get("/project/{project_id}/{client_token}")
async def get_client_project_details(
    project_id: int,
    client_token: str,
    db: Session = Depends(get_db)
):
    """Get detailed project information for a client"""
    
    # Find client by token
    client = db.query(Client).filter(Client.portal_token == client_token).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid client token"
        )
    
    # Get project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.client_id == client.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get all tasks
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    
    # Get all milestones
    milestones = db.query(Milestone).filter(Milestone.project_id == project_id).all()
    
    # Get all work logs
    work_logs = db.query(WorkLog).filter(WorkLog.project_id == project_id).all()
    
    # Calculate project statistics
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.status == "completed"])
    total_milestones = len(milestones)
    completed_milestones = len([m for m in milestones if m.status == "completed"])
    total_hours = sum(log.hours_worked for log in work_logs)
    
    return {
        "project": {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "status": project.status,
            "budget": project.budget,
            "currency": project.currency,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "deadline": project.deadline.isoformat() if project.deadline else None,
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat()
        },
        "statistics": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "task_completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            "total_milestones": total_milestones,
            "completed_milestones": completed_milestones,
            "milestone_completion_rate": (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0,
            "total_hours_worked": total_hours
        },
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "time_tracked": task.time_tracked,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            for task in tasks
        ],
        "milestones": [
            {
                "id": milestone.id,
                "title": milestone.title,
                "description": milestone.description,
                "status": milestone.status,
                "due_date": milestone.due_date.isoformat() if milestone.due_date else None,
                "completion_percentage": milestone.completion_percentage,
                "created_at": milestone.created_at.isoformat(),
                "updated_at": milestone.updated_at.isoformat()
            }
            for milestone in milestones
        ],
        "work_logs": [
            {
                "id": log.id,
                "description": log.description,
                "start_time": log.start_time.isoformat(),
                "end_time": log.end_time.isoformat() if log.end_time else None,
                "hours_worked": log.hours_worked,
                "task": {
                    "id": log.task.id,
                    "title": log.task.title
                } if log.task else None
            }
            for log in work_logs
        ]
    }

@router.post("/project/{project_id}/comment/{client_token}")
async def add_project_comment(
    project_id: int,
    client_token: str,
    comment: str,
    db: Session = Depends(get_db)
):
    """Add a comment to a project (client feedback)"""
    
    # Find client by token
    client = db.query(Client).filter(Client.portal_token == client_token).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid client token"
        )
    
    # Verify project belongs to client
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.client_id == client.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # In a real implementation, you would save the comment to a database
    # For now, we'll just return success
    return {
        "message": "Comment added successfully",
        "project_id": project_id,
        "comment": comment,
        "client": client.name,
        "timestamp": datetime.utcnow().isoformat()
    }

def calculate_project_progress(tasks: List[Task]) -> float:
    """Calculate project progress based on task completion"""
    if not tasks:
        return 0.0
    
    completed_tasks = len([task for task in tasks if task.status == "completed"])
    return (completed_tasks / len(tasks)) * 100
