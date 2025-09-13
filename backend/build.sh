#!/bin/bash

# QuickBird Backend Build Script for Render
echo "🚀 Building QuickBird Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Check if all imports work
echo "🔍 Checking Python imports..."
python -c "from app.main import app; print('✅ All imports successful')"

echo "✅ Backend build completed successfully!"
echo "🌐 Ready for Render deployment!"
