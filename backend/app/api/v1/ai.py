from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import openai
from datetime import datetime

from ...core.database import get_db
from ...core.security import get_current_user
from ...core.config import settings
from ...core.ai_service import ai_service
from ...models.user import User
from ...schemas.ai import (
    AIRequest,
    AIResponse,
    UsageStats
)

router = APIRouter()

# Initialize OpenAI client
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY

@router.post("/generate", response_model=AIResponse)
async def generate_content(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI content using various tools"""
    
    # Check usage limits
    if current_user.usage_count >= current_user.usage_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily usage limit exceeded. Please upgrade your plan."
        )
    
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured"
        )
    
    try:
        # Generate content using AI service
        ai_result = await ai_service.generate_content(
            tool=request.tool,
            prompt=request.prompt,
            parameters=request.parameters,
            context=request.context
        )
        
        # Update usage count
        current_user.usage_count += 1
        db.commit()
        
        return AIResponse(
            result=ai_result.get("result", ""),
            usage_count=current_user.usage_count,
            usage_limit=current_user.usage_limit,
            metadata={"tool": request.tool, "timestamp": datetime.utcnow().isoformat()}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}"
        )

@router.get("/usage", response_model=UsageStats)
async def get_usage_stats(
    current_user: User = Depends(get_current_user)
):
    """Get AI usage statistics"""
    return UsageStats(
        usage_count=current_user.usage_count,
        usage_limit=current_user.usage_limit,
        remaining_requests=current_user.usage_limit - current_user.usage_count,
        subscription_tier=current_user.subscription_tier
    )

@router.get("/tools")
async def get_available_tools():
    """Get list of available AI tools"""
    return {
        "tools": [
            {
                "name": "proposal_generator",
                "title": "Proposal Generator",
                "description": "Generate professional project proposals",
                "category": "business"
            },
            {
                "name": "cover_letter_writer",
                "title": "Cover Letter Writer",
                "description": "Create compelling cover letters and bios",
                "category": "business"
            },
            {
                "name": "contract_generator",
                "title": "Contract Generator",
                "description": "Generate legal contracts and agreements",
                "category": "legal"
            },
            {
                "name": "price_estimator",
                "title": "Price Estimator",
                "description": "Get accurate project pricing estimates",
                "category": "business"
            },
            {
                "name": "task_planner",
                "title": "Task Planner",
                "description": "Break down projects into manageable tasks",
                "category": "project_management"
            },
            {
                "name": "communication_templates",
                "title": "Communication Templates",
                "description": "Professional client communication templates",
                "category": "communication"
            },
            {
                "name": "case_study_writer",
                "title": "Case Study Writer",
                "description": "Create compelling portfolio case studies",
                "category": "portfolio"
            },
            {
                "name": "feedback_analyzer",
                "title": "Feedback Analyzer",
                "description": "Analyze client feedback for insights",
                "category": "analytics"
            },
            {
                "name": "proposal_translator",
                "title": "Proposal Translator",
                "description": "Translate proposals to different languages",
                "category": "international"
            }
        ]
    }

