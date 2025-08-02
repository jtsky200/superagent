#!/bin/bash
# CADILLAC EV CIS - Complete System Startup

echo "Starting CADILLAC EV CIS System..."

# Start all services
echo "Starting Frontend..."
cd frontend && npm run dev &

echo "Starting Backend..."
cd ../backend && npm run start:dev &

echo "Starting AI Services..."
cd ../ai-services && python src/main.py &

echo "Starting Firebase Emulators..."
firebase emulators:start &

echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "AI Services: http://localhost:5000"
echo "Firebase: http://localhost:4000"

# Wait for services to start
sleep 10

# Run health check
echo "Running health check..."
python test_api_keys.py
