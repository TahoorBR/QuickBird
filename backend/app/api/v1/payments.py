from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import stripe
from datetime import datetime

from ...core.database import get_db
from ...core.security import get_current_user
from ...core.config import settings
from ...models.user import User
from ...schemas.payment import (
    SubscriptionPlan,
    PaymentIntent,
    SubscriptionResponse,
    PaymentMethodResponse
)

router = APIRouter()

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans():
    """Get available subscription plans"""
    return [
        SubscriptionPlan(
            id="free",
            name="Free",
            price=0,
            currency="USD",
            interval="month",
            features=[
                "10 AI requests per day",
                "Basic project management",
                "Community support"
            ],
            limits={
                "daily_ai_requests": 10,
                "storage_gb": 0.1,
                "projects": 5
            }
        ),
        SubscriptionPlan(
            id="pro",
            name="Pro",
            price=2900,  # $29.00 in cents
            currency="USD",
            interval="month",
            features=[
                "100 AI requests per day",
                "Advanced project management",
                "Priority support",
                "File uploads",
                "Time tracking"
            ],
            limits={
                "daily_ai_requests": 100,
                "storage_gb": 1,
                "projects": 50
            }
        ),
        SubscriptionPlan(
            id="enterprise",
            name="Enterprise",
            price=9900,  # $99.00 in cents
            currency="USD",
            interval="month",
            features=[
                "1000 AI requests per day",
                "Unlimited projects",
                "Custom integrations",
                "Dedicated support",
                "Team collaboration"
            ],
            limits={
                "daily_ai_requests": 1000,
                "storage_gb": 10,
                "projects": -1  # Unlimited
            }
        )
    ]

@router.post("/create-payment-intent", response_model=PaymentIntent)
async def create_payment_intent(
    plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """Create a payment intent for subscription"""
    
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    # Get plan details
    plans = await get_subscription_plans()
    plan = next((p for p in plans if p.id == plan_id), None)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    if plan.price == 0:
        # Free plan - no payment needed
        return PaymentIntent(
            client_secret=None,
            amount=0,
            currency="USD",
            status="succeeded"
        )
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=plan.price,
            currency=plan.currency.lower(),
            metadata={
                "user_id": str(current_user.id),
                "plan_id": plan_id
            }
        )
        
        return PaymentIntent(
            client_secret=intent.client_secret,
            amount=plan.price,
            currency=plan.currency,
            status=intent.status
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment error: {str(e)}"
        )

@router.post("/subscribe")
async def subscribe_to_plan(
    plan_id: str,
    payment_method_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Subscribe user to a plan"""
    
    # Get plan details
    plans = await get_subscription_plans()
    plan = next((p for p in plans if p.id == plan_id), None)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Update user subscription
    current_user.subscription_tier = plan_id
    
    # Update usage limits based on plan
    if plan_id == "free":
        current_user.usage_limit = 10
    elif plan_id == "pro":
        current_user.usage_limit = 100
    elif plan_id == "enterprise":
        current_user.usage_limit = 1000
    
    db.commit()
    
    return {"message": f"Successfully subscribed to {plan.name} plan"}

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user)
):
    """Get current user subscription"""
    
    plans = await get_subscription_plans()
    current_plan = next((p for p in plans if p.id == current_user.subscription_tier), None)
    
    return SubscriptionResponse(
        plan_id=current_user.subscription_tier,
        plan_name=current_plan.name if current_plan else "Unknown",
        status="active" if current_user.is_active else "inactive",
        usage_count=current_user.usage_count,
        usage_limit=current_user.usage_limit,
        next_billing_date=None  # Implement based on your billing logic
    )

@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel current subscription"""
    
    # Downgrade to free plan
    current_user.subscription_tier = "free"
    current_user.usage_limit = 10
    current_user.usage_count = 0  # Reset usage
    
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}

@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(
    current_user: User = Depends(get_current_user)
):
    """Get user's payment methods"""
    # This would integrate with Stripe to get saved payment methods
    # For now, return empty list
    return []

@router.post("/webhook")
async def stripe_webhook(request: dict):
    """Handle Stripe webhooks"""
    # Implement Stripe webhook handling
    # This should verify the webhook signature and process events
    return {"status": "received"}
