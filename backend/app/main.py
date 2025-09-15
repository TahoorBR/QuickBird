from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import os
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import engine, Base
from .core.scheduler import usage_scheduler
from .core.rate_limiter import rate_limit_middleware
from .api.v1 import auth, users, projects, tasks, ai, payments, clients, invoices, milestones, work_logs, notifications, recurring_invoices, admin, upload, analytics, websocket, project_templates, time_tracking, client_portal

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    
    # Create uploads directory if it doesn't exist
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir, exist_ok=True)
    
    # Start usage reset scheduler
    if not settings.DEBUG:  # Only run in production
        asyncio.create_task(usage_scheduler.start())
    
    yield
    # Shutdown
    usage_scheduler.stop()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered tools for freelancers to manage projects, generate proposals, and grow their business.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add middleware
app.middleware("http")(rate_limit_middleware)

# Mount static files for uploads (only if directory exists)
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if isinstance(settings.CORS_ORIGINS, str) else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Only add TrustedHostMiddleware in production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.CORS_ORIGINS.split(",") if isinstance(settings.CORS_ORIGINS, str) else ["*"]
    )

# Include API routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(clients.router, prefix="/api/v1/clients", tags=["Clients"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(milestones.router, prefix="/api/v1/milestones", tags=["Milestones"])
app.include_router(work_logs.router, prefix="/api/v1/work-logs", tags=["Work Logs"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(recurring_invoices.router, prefix="/api/v1/recurring-invoices", tags=["Recurring Invoices"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Tools"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(upload.router, prefix="/api/v1", tags=["File Upload"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(websocket.router, prefix="/api/v1", tags=["WebSocket"])
app.include_router(project_templates.router, prefix="/api/v1/project-templates", tags=["Project Templates"])
app.include_router(time_tracking.router, prefix="/api/v1/time-tracking", tags=["Time Tracking"])
app.include_router(client_portal.router, prefix="/api/v1/client-portal", tags=["Client Portal"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation not available in production"
    }

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(exc)}"}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
