from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...models.user import User
from ...core.security import get_password_hash
from ...core.config import settings

router = APIRouter()

@router.post("/create-admin")
async def create_admin_user(db: Session = Depends(get_db)):
    """Create an admin user for testing (only in development)"""
    if settings.DEBUG:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@quickbird.com").first()
        if admin_user:
            return {"message": "Admin user already exists!", "user": admin_user.email}
        
        # Create admin user
        admin_user = User(
            email="admin@quickbird.com",
            username="admin",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),
            subscription_tier="enterprise",
            usage_limit=settings.ENTERPRISE_TIER_DAILY_LIMIT,
            is_active=True,
            is_verified=True,
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        return {
            "message": "Admin user created successfully!",
            "email": "admin@quickbird.com",
            "password": "admin123",
            "username": "admin"
        }
    else:
        raise HTTPException(status_code=403, detail="Admin creation only allowed in development mode")
