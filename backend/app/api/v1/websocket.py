from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
import json
import asyncio
from datetime import datetime

from ...core.database import get_db
from ...models.user import User
from ...models.notification import Notification

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    # Remove broken connections
                    self.active_connections[user_id].remove(connection)

    async def broadcast_to_user(self, user_id: int, notification: dict):
        await self.send_personal_message({
            "type": "notification",
            "data": notification
        }, user_id)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=1008, reason="User not found")
        return

    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "mark_read":
                # Mark notification as read
                notification_id = message.get("notification_id")
                if notification_id:
                    notification = db.query(Notification).filter(
                        Notification.id == notification_id,
                        Notification.user_id == user_id
                    ).first()
                    if notification:
                        notification.is_read = True
                        db.commit()
                        
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# Helper function to send notifications
async def send_notification_to_user(user_id: int, title: str, message: str, notification_type: str = "info", db: Session = None):
    """Send a notification to a specific user via WebSocket and save to database"""
    
    # Save to database
    if db:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Send via WebSocket
        await manager.broadcast_to_user(user_id, {
            "id": notification.id,
            "title": title,
            "message": message,
            "type": notification_type,
            "created_at": notification.created_at.isoformat(),
            "is_read": False
        })
    else:
        # Just send via WebSocket if no database session
        await manager.broadcast_to_user(user_id, {
            "title": title,
            "message": message,
            "type": notification_type,
            "created_at": datetime.utcnow().isoformat(),
            "is_read": False
        })

# Notification triggers
async def notify_project_deadline_approaching(project, db: Session):
    """Notify when project deadline is approaching"""
    await send_notification_to_user(
        project.user_id,
        "Project Deadline Approaching",
        f"Project '{project.title}' deadline is approaching on {project.deadline.strftime('%B %d, %Y')}",
        "warning",
        db
    )

async def notify_invoice_payment_received(invoice, db: Session):
    """Notify when invoice payment is received"""
    await send_notification_to_user(
        invoice.user_id,
        "Payment Received",
        f"Payment received for invoice {invoice.invoice_number} - ${invoice.total_amount:,.2f}",
        "success",
        db
    )

async def notify_task_assigned(task, db: Session):
    """Notify when a task is assigned"""
    await send_notification_to_user(
        task.user_id,
        "New Task Assigned",
        f"You have been assigned a new task: '{task.title}'",
        "info",
        db
    )

async def notify_milestone_completed(milestone, db: Session):
    """Notify when a milestone is completed"""
    await send_notification_to_user(
        milestone.user_id,
        "Milestone Completed",
        f"Milestone '{milestone.title}' has been completed",
        "success",
        db
    )
