from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
from ...models.project_template import ProjectTemplate
from ...models.project import Project
from ...models.task import Task
from ...models.milestone import Milestone
from ...schemas.project_template import (
    ProjectTemplateCreate,
    ProjectTemplateUpdate,
    ProjectTemplateResponse,
    ProjectFromTemplateRequest
)

router = APIRouter()

@router.get("/", response_model=List[ProjectTemplateResponse])
async def get_project_templates(
    category: Optional[str] = None,
    include_public: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project templates available to the current user"""
    query = db.query(ProjectTemplate).filter(
        (ProjectTemplate.user_id == current_user.id) | 
        (ProjectTemplate.is_public == True) |
        (ProjectTemplate.is_system == True)
    )
    
    if category:
        query = query.filter(ProjectTemplate.category == category)
    
    if not include_public:
        query = query.filter(ProjectTemplate.user_id == current_user.id)
    
    templates = query.all()
    return templates

@router.get("/{template_id}", response_model=ProjectTemplateResponse)
async def get_project_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project template"""
    template = db.query(ProjectTemplate).filter(
        ProjectTemplate.id == template_id,
        (ProjectTemplate.user_id == current_user.id) | 
        (ProjectTemplate.is_public == True) |
        (ProjectTemplate.is_system == True)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project template not found"
        )
    
    return template

@router.post("/", response_model=ProjectTemplateResponse)
async def create_project_template(
    template: ProjectTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project template"""
    db_template = ProjectTemplate(
        **template.dict(),
        user_id=current_user.id
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template

@router.put("/{template_id}", response_model=ProjectTemplateResponse)
async def update_project_template(
    template_id: int,
    template_update: ProjectTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project template"""
    template = db.query(ProjectTemplate).filter(
        ProjectTemplate.id == template_id,
        ProjectTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project template not found"
        )
    
    # Update fields
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    
    return template

@router.delete("/{template_id}")
async def delete_project_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project template"""
    template = db.query(ProjectTemplate).filter(
        ProjectTemplate.id == template_id,
        ProjectTemplate.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project template not found"
        )
    
    if template.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system templates"
        )
    
    db.delete(template)
    db.commit()
    
    return {"message": "Project template deleted successfully"}

@router.post("/{template_id}/create-project", response_model=dict)
async def create_project_from_template(
    template_id: int,
    request: ProjectFromTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project from a template"""
    template = db.query(ProjectTemplate).filter(
        ProjectTemplate.id == template_id,
        (ProjectTemplate.user_id == current_user.id) | 
        (ProjectTemplate.is_public == True) |
        (ProjectTemplate.is_system == True)
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project template not found"
        )
    
    # Calculate dates
    start_date = request.start_date or datetime.utcnow()
    deadline = request.deadline
    if not deadline and template.default_duration_days:
        deadline = start_date + timedelta(days=template.default_duration_days)
    
    # Create project
    project = Project(
        title=request.project_name,
        description=template.description,
        status="active",
        client_name=request.client_name,
        client_email=request.client_email,
        budget=request.budget or template.default_budget,
        currency=request.currency or template.default_currency,
        start_date=start_date,
        deadline=deadline,
        hourly_rate=request.budget or template.default_hourly_rate,
        user_id=current_user.id
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Create tasks from template
    if template.default_tasks:
        try:
            default_tasks = json.loads(template.default_tasks)
            for task_data in default_tasks:
                task = Task(
                    title=task_data.get("title", ""),
                    description=task_data.get("description", ""),
                    status="pending",
                    priority=task_data.get("priority", "medium"),
                    project_id=project.id,
                    user_id=current_user.id
                )
                db.add(task)
        except json.JSONDecodeError:
            pass  # Skip if JSON is invalid
    
    # Create milestones from template
    if template.default_milestones:
        try:
            default_milestones = json.loads(template.default_milestones)
            for milestone_data in default_milestones:
                milestone = Milestone(
                    title=milestone_data.get("title", ""),
                    description=milestone_data.get("description", ""),
                    status="pending",
                    due_date=start_date + timedelta(days=milestone_data.get("days_from_start", 0)),
                    project_id=project.id,
                    user_id=current_user.id
                )
                db.add(milestone)
        except json.JSONDecodeError:
            pass  # Skip if JSON is invalid
    
    # Update template usage count
    template.usage_count += 1
    db.commit()
    
    return {
        "message": "Project created successfully from template",
        "project_id": project.id,
        "project_title": project.title
    }

@router.get("/categories/list")
async def get_template_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available template categories"""
    categories = db.query(ProjectTemplate.category).filter(
        ProjectTemplate.category.isnot(None),
        (ProjectTemplate.user_id == current_user.id) | 
        (ProjectTemplate.is_public == True) |
        (ProjectTemplate.is_system == True)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]
