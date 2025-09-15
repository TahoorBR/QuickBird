from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.security import get_current_user
from ...models.user import User
import aiofiles
import os
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file and return the URL"""
    
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
