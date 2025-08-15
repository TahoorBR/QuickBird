from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()  # <-- add this line

# Load Supabase environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL or SUPABASE_KEY not set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="QuickBird Auth API")


# ----------------------------
# Schemas
# ----------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# ----------------------------
# Routes
# ----------------------------
@app.post("/register")
async def register(req: RegisterRequest):
    # Sign up with Supabase
    response = supabase.auth.sign_up(
        {
            "email": req.email,
            "password": req.password,
        },
        {
            "data": {"username": req.username}
        }
    )

    if response.get("error"):
        raise HTTPException(status_code=400, detail=response["error"]["message"])

    return {"message": "Account created! Check your email to confirm."}


@app.post("/login")
async def login(req: LoginRequest):
    # Sign in with Supabase
    response = supabase.auth.sign_in_with_password({
        "email": req.email,
        "password": req.password
    })

    if response.get("error"):
        raise HTTPException(status_code=400, detail=response["error"]["message"])

    return {"message": "Logged in successfully", "user": response.get("data")}


@app.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    response = supabase.auth.reset_password_for_email(
        req.email,
        {"redirect_to": os.getenv("FRONTEND_URL", "http://localhost:3000/auth/login")}
    )

    if response.get("error"):
        raise HTTPException(status_code=400, detail=response["error"]["message"])

    return {"message": "Password reset link sent successfully."}


# ----------------------------
# Optional: health check
# ----------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}
