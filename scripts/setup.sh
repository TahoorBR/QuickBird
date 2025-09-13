#!/bin/bash

# QuickBird Setup Script
# This script sets up the development environment for the QuickBird project

set -e

echo "🚀 Setting up QuickBird Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. You'll need it for containerized deployment."
    fi
    
    print_status "All requirements satisfied!"
}

# Setup Backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp env.example .env
        print_warning "Please update .env file with your API keys and configuration."
    fi
    
    # Initialize Alembic
    if [ ! -d "alembic/versions" ]; then
        print_status "Initializing database migrations..."
        alembic init alembic
    fi
    
    # Create initial migration
    print_status "Creating initial database migration..."
    alembic revision --autogenerate -m "Initial migration"
    
    # Run migrations
    print_status "Running database migrations..."
    alembic upgrade head
    
    cd ..
    print_status "Backend setup complete!"
}

# Setup Frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local file..."
        cp env.example .env.local
        print_warning "Please update .env.local file with your configuration."
    fi
    
    # Build the project
    print_status "Building frontend..."
    npm run build
    
    cd ..
    print_status "Frontend setup complete!"
}

# Setup Docker
setup_docker() {
    print_status "Setting up Docker..."
    
    # Build Docker images
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Docker setup complete!"
}

# Main setup function
main() {
    echo "=========================================="
    echo "  QuickBird Development Environment Setup"
    echo "=========================================="
    echo
    
    check_requirements
    echo
    
    setup_backend
    echo
    
    setup_frontend
    echo
    
    if command -v docker &> /dev/null; then
        setup_docker
        echo
    fi
    
    print_status "🎉 Setup complete!"
    echo
    echo "Next steps:"
    echo "1. Update your .env files with API keys and configuration"
    echo "2. Start the development servers:"
    echo "   - Backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
    echo "   - Frontend: cd frontend && npm run dev"
    echo "3. Or use Docker: docker-compose up"
    echo
    echo "Access the application:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8000"
    echo "  - API Docs: http://localhost:8000/docs"
    echo
}

# Run main function
main "$@"