from pydantic import BaseModel
from typing import Optional, Dict, Any

class AIRequest(BaseModel):
    tool: str
    prompt: str
    parameters: Optional[Dict[str, Any]] = None
    context: Optional[str] = None

class AIResponse(BaseModel):
    result: str
    usage_count: int
    usage_limit: int
    metadata: Optional[Dict[str, Any]] = None

class UsageStats(BaseModel):
    usage_count: int
    usage_limit: int
    remaining_requests: int
    subscription_tier: str
