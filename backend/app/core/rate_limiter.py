from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import time
from typing import Dict, Tuple
import asyncio
from collections import defaultdict, deque

class RateLimiter:
    def __init__(self):
        # Store request timestamps for each IP
        self.requests: Dict[str, deque] = defaultdict(lambda: deque())
        # Cleanup old entries periodically
        self.last_cleanup = time.time()
    
    def is_rate_limited(self, ip: str, max_requests: int = 100, window_seconds: int = 3600) -> bool:
        """Check if IP is rate limited"""
        now = time.time()
        
        # Cleanup old entries every 5 minutes
        if now - self.last_cleanup > 300:
            self._cleanup_old_entries(now)
            self.last_cleanup = now
        
        # Get request history for this IP
        request_times = self.requests[ip]
        
        # Remove requests older than the window
        while request_times and request_times[0] <= now - window_seconds:
            request_times.popleft()
        
        # Check if rate limit exceeded
        if len(request_times) >= max_requests:
            return True
        
        # Add current request
        request_times.append(now)
        return False
    
    def _cleanup_old_entries(self, now: float):
        """Remove old entries to prevent memory leaks"""
        cutoff_time = now - 3600  # Remove entries older than 1 hour
        for ip in list(self.requests.keys()):
            request_times = self.requests[ip]
            while request_times and request_times[0] <= cutoff_time:
                request_times.popleft()
            
            # Remove IP if no recent requests
            if not request_times:
                del self.requests[ip]
    
    def clear_rate_limits(self):
        """Clear all rate limits (useful for development)"""
        self.requests.clear()
        self.last_cleanup = time.time()

# Global rate limiter instance
rate_limiter = RateLimiter()

def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check for forwarded IP first (for reverse proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct client IP
    return request.client.host if request.client else "unknown"

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for health checks
    if request.url.path == "/health":
        return await call_next(request)
    
    client_ip = get_client_ip(request)
    
    # Different rate limits for different endpoints
    if request.url.path.startswith("/api/v1/auth"):
        max_requests = 100  # 100 requests per hour for auth (increased for development)
        window_seconds = 3600
    elif request.url.path.startswith("/api/v1/ai"):
        max_requests = 200  # 200 AI requests per hour
        window_seconds = 3600
    else:
        max_requests = 500  # 500 requests per hour for other endpoints
        window_seconds = 3600
    
    if rate_limiter.is_rate_limited(client_ip, max_requests, window_seconds):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds//60} minutes."
            }
        )
    
    response = await call_next(request)
    return response
