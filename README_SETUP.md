# QuickBird - Local Setup Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy env.local .env  # Windows
cp env.local .env    # Linux/Mac
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy env.local .env.local  # Windows
cp env.local .env.local    # Linux/Mac
```

## 🏃‍♂️ Running the Application

### Start Backend
```bash
cd backend
python start.py
```
Backend will be available at: http://localhost:8000

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will be available at: http://localhost:3000

## 🧪 Testing the Setup

### Test Backend
```bash
cd backend
python test_migration.py
```

### Test Frontend
1. Open http://localhost:3000
2. Try registering a new user
3. Login with your credentials
4. Access the dashboard

## 📁 Project Structure

```
QuickBird/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application
│   ├── database.py         # Database models
│   ├── auth.py             # Authentication
│   ├── requirements.txt    # Python dependencies
│   ├── start.py            # Startup script
│   └── test_migration.py   # Test script
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # API client
│   └── package.json        # Node dependencies
├── setup.sh               # Linux/Mac setup script
├── setup.bat              # Windows setup script
└── README_SETUP.md        # This file
```

## 🔧 Configuration

### Backend Environment (.env)
```env
DATABASE_URL=sqlite:///./quickbird.db
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Backend: Change port in `backend/start.py`
   - Frontend: Change port in `frontend/package.json`

2. **Python dependencies not found**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Node modules not found**
   ```bash
   cd frontend
   npm install
   ```

4. **Database errors**
   - Delete `backend/quickbird.db` and restart
   - Check DATABASE_URL in `.env`

### Getting Help

1. Check the console output for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check that ports 3000 and 8000 are available

## 🎉 Success!

If everything is working:
- ✅ Backend API running on http://localhost:8000
- ✅ Frontend app running on http://localhost:3000
- ✅ Database created automatically
- ✅ Authentication working
- ✅ Dashboard accessible

You're ready to start developing! 🚀
