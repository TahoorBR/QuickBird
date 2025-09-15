#!/usr/bin/env python3
"""
Script to create an admin user for testing
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

def create_admin_user():
    """Create an admin user for testing"""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@quickbird.com").first()
        if admin_user:
            print("Admin user already exists!")
            return admin_user
        
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
        
        print(f"Admin user created successfully!")
        print(f"Email: admin@quickbird.com")
        print(f"Password: admin123")
        print(f"Username: admin")
        
        return admin_user
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
