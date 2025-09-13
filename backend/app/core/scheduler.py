from datetime import datetime, time
import asyncio
from sqlalchemy.orm import Session
from .database import SessionLocal
from ..models.user import User
import logging

logger = logging.getLogger(__name__)

class UsageScheduler:
    def __init__(self):
        self.running = False
    
    async def start(self):
        """Start the usage reset scheduler"""
        self.running = True
        logger.info("Usage reset scheduler started")
        
        while self.running:
            try:
                await self.reset_daily_usage()
                # Wait until next midnight
                await self.wait_until_midnight()
            except Exception as e:
                logger.error(f"Error in usage reset scheduler: {e}")
                await asyncio.sleep(3600)  # Wait 1 hour on error
    
    def stop(self):
        """Stop the usage reset scheduler"""
        self.running = False
        logger.info("Usage reset scheduler stopped")
    
    async def wait_until_midnight(self):
        """Wait until the next midnight"""
        now = datetime.now()
        midnight = datetime.combine(now.date() + time.resolution, time.min)
        if midnight <= now:
            midnight += time.resolution
        wait_seconds = (midnight - now).total_seconds()
        await asyncio.sleep(wait_seconds)
    
    async def reset_daily_usage(self):
        """Reset daily usage count for all users"""
        db = SessionLocal()
        try:
            # Reset usage count for all users
            db.query(User).update({"usage_count": 0})
            db.commit()
            logger.info("Daily usage count reset for all users")
        except Exception as e:
            logger.error(f"Error resetting usage count: {e}")
            db.rollback()
        finally:
            db.close()

# Global scheduler instance
usage_scheduler = UsageScheduler()
