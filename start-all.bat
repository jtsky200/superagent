@echo off
echo =================================================================
echo   🚀 CADILLAC EV CUSTOMER INTELLIGENCE SYSTEM - AUTO STARTER
echo =================================================================
echo.

echo ✅ Stopping all existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul

echo ✅ Starting Backend (NestJS)...
cd backend
start "Backend-Server" cmd /k "npm run start:dev"

echo ✅ Starting AI Services (Python Flask)...
cd ../ai-services
start "AI-Services" cmd /k "python src/main.py"

echo ✅ Starting Frontend (Next.js)...
cd ../frontend
start "Frontend-Server" cmd /k "npm run dev"

echo.
echo 🎉 All services starting...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 🤖 AI:       http://localhost:5000
echo 📚 API Docs: http://localhost:3001/api
echo.
echo ⏰ Wait 30 seconds then open: http://localhost:3000
timeout 30
start http://localhost:3000