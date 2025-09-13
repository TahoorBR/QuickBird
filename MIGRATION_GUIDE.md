# QuickBird Migration: Supabase → Local Database

## 🎯 Migration Overview

This migration removes the Supabase cloud dependency and replaces it with a local SQLite database, making the project fully self-contained and ready for open source deployment.

## ✅ What's Changed

### Backend Changes
- **Removed**: Supabase client and dependencies
- **Added**: SQLAlchemy ORM with SQLite database
- **Added**: JWT-based authentication system
- **Added**: Local database models (User, Project, Task)
- **Updated**: All API endpoints to use local database

### Frontend Changes
- **Removed**: Supabase client and dependencies
- **Added**: Custom API client (`lib/api.ts`)
- **Updated**: Authentication flow to use JWT tokens
- **Updated**: All components to use new API endpoints

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file
cp env.example .env
# Edit .env with your settings

# Run the server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp env.example .env.local
# Edit .env.local with your API URL

# Run the development server
npm run dev
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id INTEGER,
    user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication Flow

### Registration
1. User submits registration form
2. Backend validates and hashes password
3. User record created in local database
4. Success response returned

### Login
1. User submits login credentials
2. Backend verifies password against hash
3. JWT token generated and returned
4. Frontend stores token in localStorage
5. Token used for authenticated requests

### Protected Routes
1. AuthGuard checks for valid token
2. Token verified with backend on each request
3. Invalid tokens trigger logout

## 🌐 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user

### Projects
- `GET /projects` - Get user's projects
- `POST /projects` - Create new project

### Health
- `GET /health` - Health check

## 🚀 Deployment Ready

### Vercel Deployment
The project is now ready for Vercel deployment:

1. **Frontend**: Deploy to Vercel with environment variables
2. **Backend**: Deploy to Vercel with SQLite database
3. **Database**: SQLite file included in deployment

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./quickbird.db
SECRET_KEY=your-super-secret-jwt-key
CORS_ORIGINS=https://yourdomain.vercel.app
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

## 🔧 Development

### Database Operations
```python
# Create tables
from database import create_tables
create_tables()

# Get database session
from database import get_db
db = next(get_db())
```

### API Testing
```bash
# Register user
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Benefits of Migration

1. **No External Dependencies**: No need for Supabase account
2. **Open Source Ready**: Fully self-contained
3. **Easy Deployment**: Works with any hosting platform
4. **Cost Effective**: No cloud database costs
5. **Full Control**: Complete control over data and infrastructure
6. **Simple Setup**: One-command database setup

## 🎉 Next Steps

1. Test the complete authentication flow
2. Add more features (tasks, file uploads, etc.)
3. Deploy to Vercel or your preferred platform
4. Share as open source project!

The migration is complete and the project is now fully self-contained! 🚀
