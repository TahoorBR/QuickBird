#!/bin/bash

# QuickBird Frontend Build Script for Vercel
echo "🚀 Building QuickBird Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Frontend build completed successfully!"
echo "📁 Build output: .next/"
echo "🌐 Ready for Vercel deployment!"
