#!/bin/bash

# Smart Study Buddy - Dependency Installation Script
# Run this after pip3 is installed

set -e

echo "🔧 Installing Smart Study Buddy Dependencies..."
echo "================================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="/home/dilshan/Desktop/project/Smart-Study-Buddy"
cd "$PROJECT_ROOT"

# Install Python dependencies
echo ""
echo -e "${BLUE}📦 Installing Python AI Service dependencies...${NC}"
cd python-ai-service
pip3 install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"
cd ..

# Install React dependencies
echo ""
echo -e "${BLUE}📦 Installing React Frontend dependencies...${NC}"
cd react-frontend
npm install
echo -e "${GREEN}✓ React dependencies installed${NC}"
cd ..

echo ""
echo "================================================"
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo "================================================"
echo ""
echo "🚀 Ready to start the application!"
echo ""
echo "Run these commands in 3 separate terminals:"
echo ""
echo "Terminal 1 (Python AI - Port 8000):"
echo "  cd $PROJECT_ROOT/python-ai-service"
echo "  uvicorn main:app --reload --port 8000"
echo ""
echo "Terminal 2 (Spring Backend - Port 8080):"
echo "  cd $PROJECT_ROOT/Spring-backend"
echo "  export GOOGLE_APPLICATION_CREDENTIALS=\"$PROJECT_ROOT/firebase-service-account-key.json\""
echo "  ./mvnw spring-boot:run"
echo ""
echo "Terminal 3 (React Frontend - Port 5173):"
echo "  cd $PROJECT_ROOT/react-frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
