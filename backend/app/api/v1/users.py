from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.database import get_db
from ...core.security import get_current_user, get_password_hash
from ...models.user import User
from ...schemas.user import (
    UserResponse,
    UserUpdate,
    UserProfileUpdate,
    PasswordChange
)

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    from ...core.security import verify_password
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/usage-stats")
async def get_usage_stats(
    current_user: User = Depends(get_current_user)
):
    """Get user usage statistics"""
    return {
        "usage_count": current_user.usage_count,
        "usage_limit": current_user.usage_limit,
        "subscription_tier": current_user.subscription_tier,
        "remaining_requests": current_user.usage_limit - current_user.usage_count
    }

@router.post("/reset-usage")
async def reset_daily_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset daily usage count (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    current_user.usage_count = 0
    db.commit()
    
    return {"message": "Usage count reset successfully"}

@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    # In a real application, you might want to soft delete
    # or archive the account instead of hard delete
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"}
