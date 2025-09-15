from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
import aiofiles
import os
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload resume and update user AI profile"""
    
    # Validate file type (only PDF for resume)
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed for resume upload"
        )
    
    # Create user-specific directory
    user_dir = f"uploads/{current_user.id}/resume"
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"resume_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"
    file_path = os.path.join(user_dir, unique_filename)
    
    try:
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return file URL
        file_url = f"/uploads/{current_user.id}/resume/{unique_filename}"
        
        return {
            "message": "Resume uploaded successfully",
            "filename": file.filename,
            "file_url": file_url,
            "size": len(content),
            "ai_profile_updated": True
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume upload failed: {str(e)}"
        )

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document for AI context"""
    
    # Validate file type
    allowed_types = ['pdf', 'txt', 'doc', 'docx']
    file_extension = file.filename.split('.')[-1].lower()
    
    if file_extension not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_extension} not allowed. Allowed types: {allowed_types}"
        )
    
    # Create user-specific directory
    user_dir = f"uploads/{current_user.id}/documents"
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{document_type}_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = os.path.join(user_dir, unique_filename)
    
    try:
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return file URL
        file_url = f"/uploads/{current_user.id}/documents/{unique_filename}"
        
        return {
            "message": "Document uploaded successfully",
            "filename": file.filename,
            "file_url": file_url,
            "document_type": document_type,
            "size": len(content)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document upload failed: {str(e)}"
        )

@router.get("/resume")
async def get_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current resume"""
    
    # Check if user has a resume
    user_dir = f"uploads/{current_user.id}/resume"
    if not os.path.exists(user_dir):
        return {"resume_url": None, "message": "No resume found"}
    
    # Find the most recent resume file
    resume_files = [f for f in os.listdir(user_dir) if f.startswith("resume_") and f.endswith(".pdf")]
    if not resume_files:
        return {"resume_url": None, "message": "No resume found"}
    
    # Get the most recent one (by filename timestamp)
    latest_resume = sorted(resume_files)[-1]
    resume_url = f"/uploads/{current_user.id}/resume/{latest_resume}"
    
    return {
        "resume_url": resume_url,
        "filename": latest_resume,
        "message": "Resume found"
    }

@router.get("/documents")
async def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's uploaded documents"""
    
    user_dir = f"uploads/{current_user.id}/documents"
    if not os.path.exists(user_dir):
        return {"documents": []}
    
    documents = []
    for filename in os.listdir(user_dir):
        if filename.endswith(('.pdf', '.txt', '.doc', '.docx')):
            file_path = os.path.join(user_dir, filename)
            file_url = f"/uploads/{current_user.id}/documents/{filename}"
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Extract document type from filename
            doc_type = filename.split('_')[0] if '_' in filename else 'unknown'
            
            documents.append({
                "filename": filename,
                "file_url": file_url,
                "document_type": doc_type,
                "size": file_size,
                "uploaded_at": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
            })
    
    return {"documents": documents}

# Keep the old upload endpoint for backward compatibility
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file and return the URL (legacy endpoint)"""
    
    # Validate file type
    allowed_types = ['pdf', 'txt', 'doc', 'docx', 'png', 'jpg', 'jpeg']
    file_extension = file.filename.split('.')[-1].lower()
    
    if file_extension not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_extension} not allowed. Allowed types: {allowed_types}"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = f"uploads/{current_user.id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return file URL
        file_url = f"/uploads/{current_user.id}/{filename}"
        return {"url": file_url, "filename": filename}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )
