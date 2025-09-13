from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # App
    APP_NAME: str = "QuickBird"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./quickbird.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate a secure secret key if using default
        if self.SECRET_KEY == "your-secret-key-change-this-in-production":
            import secrets
            self.SECRET_KEY = secrets.token_urlsafe(32)
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # Stripe
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # File Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    
    # Usage Limits
    FREE_TIER_DAILY_LIMIT: int = 10
    PRO_TIER_DAILY_LIMIT: int = 100
    ENTERPRISE_TIER_DAILY_LIMIT: int = 1000
    
    # Currency
    DEFAULT_CURRENCY: str = "PKR"
    SUPPORTED_CURRENCIES: list = ["USD", "PKR", "EUR", "GBP", "CAD", "AUD"]
    
    class Config:
        env_file = "env.local"
        case_sensitive = True

settings = Settings()
