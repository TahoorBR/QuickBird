#!/usr/bin/env python3
"""
Verification script to check if QuickBird setup is working correctly
"""

import os
import sys
import subprocess
import requests
import time
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists."""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (NOT FOUND)")
        return False

def check_python_dependencies():
    """Check if Python dependencies are installed."""
    try:
        import fastapi
        import sqlalchemy
        import uvicorn
        import jose
        import passlib
        print("✅ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        return False

def check_node_dependencies():
    """Check if Node.js dependencies are installed."""
    frontend_path = Path("frontend")
    node_modules = frontend_path / "node_modules"
    
    if node_modules.exists():
        print("✅ Node.js dependencies are installed")
        return True
    else:
        print("❌ Node.js dependencies not found. Run: cd frontend && npm install")
        return False

def check_environment_files():
    """Check if environment files exist."""
    backend_env = Path("backend/.env")
    frontend_env = Path("frontend/.env.local")
    
    backend_ok = check_file_exists(backend_env, "Backend environment file")
    frontend_ok = check_file_exists(frontend_env, "Frontend environment file")
    
    return backend_ok and frontend_ok

def test_backend_imports():
    """Test if backend can be imported."""
    try:
        sys.path.insert(0, "backend")
        from main import app
        print("✅ Backend imports successfully")
        return True
    except Exception as e:
        print(f"❌ Backend import failed: {e}")
        return False

def test_backend_startup():
    """Test if backend can start (quick test)."""
    try:
        # Try to start the backend in a subprocess for a few seconds
        process = subprocess.Popen(
            [sys.executable, "start.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for startup
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            process.terminate()
            process.wait()
            print("✅ Backend can start successfully")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend startup failed: {stderr.decode()}")
            return False
    except Exception as e:
        print(f"❌ Backend startup test failed: {e}")
        return False

def main():
    """Run all verification checks."""
    print("🔍 QuickBird Setup Verification")
    print("=" * 50)
    
    checks = [
        ("File Structure", lambda: all([
            check_file_exists("backend/main.py", "Backend main file"),
            check_file_exists("backend/database.py", "Database module"),
            check_file_exists("backend/auth.py", "Auth module"),
            check_file_exists("frontend/lib/api.ts", "API client"),
            check_file_exists("frontend/package.json", "Frontend package.json")
        ])),
        ("Environment Files", check_environment_files),
        ("Python Dependencies", check_python_dependencies),
        ("Node Dependencies", check_node_dependencies),
        ("Backend Imports", test_backend_imports),
    ]
    
    passed = 0
    total = len(checks)
    
    for check_name, check_func in checks:
        print(f"\n📋 {check_name}:")
        if check_func():
            passed += 1
        else:
            print(f"   ⚠️  {check_name} needs attention")
    
    print("\n" + "=" * 50)
    print(f"📊 Verification Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! QuickBird is ready to run!")
        print("\n🚀 To start the application:")
        print("   1. Backend: cd backend && python start.py")
        print("   2. Frontend: cd frontend && npm run dev")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("\n💡 Quick fixes:")
        print("   - Run: pip install -r backend/requirements.txt")
        print("   - Run: cd frontend && npm install")
        print("   - Copy env files: cp backend/env.local backend/.env")
        print("   - Copy env files: cp frontend/env.local frontend/.env.local")
        return 1

if __name__ == "__main__":
    sys.exit(main())
