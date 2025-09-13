from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SubscriptionPlan(BaseModel):
    id: str
    name: str
    price: int  # In cents
    currency: str
    interval: str  # month, year
    features: List[str]
    limits: Dict[str, Any]

class PaymentIntent(BaseModel):
    client_secret: Optional[str]
    amount: int
    currency: str
    status: str

class SubscriptionResponse(BaseModel):
    plan_id: str
    plan_name: str
    status: str
    usage_count: int
    usage_limit: int
    next_billing_date: Optional[str] = None

class PaymentMethodResponse(BaseModel):
    id: str
    type: str
    last4: Optional[str] = None
    brand: Optional[str] = None
    exp_month: Optional[int] = None
    exp_year: Optional[int] = None
