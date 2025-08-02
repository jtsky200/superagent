#!/usr/bin/env python3
"""
CADILLAC EV CIS - System Setup & Verification Script
Comprehensive setup and testing for all system components
"""

import os
import sys
import requests
import json
import subprocess
import time
from datetime import datetime

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"🚗 {title}")
    print(f"{'='*60}")

def print_section(title):
    """Print a formatted section"""
    print(f"\n📋 {title}")
    print(f"{'-'*40}")

def check_service(url, name, timeout=5):
    """Check if a service is running"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            print(f"✅ {name} is running (Status: {response.status_code})")
            return True
        else:
            print(f"⚠️ {name} responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name} is not responding: {e}")
        return False

def test_api_endpoints():
    """Test all API endpoints"""
    print_section("Testing API Endpoints")
    
    endpoints = [
        ("Frontend", "http://localhost:3000"),
        ("AI Services Health", "http://localhost:5000/health"),
        ("Backend Health", "http://localhost:3001/health"),
        ("Firebase Functions", "https://us-central1-superagent-ff2fe.cloudfunctions.net/api/health")
    ]
    
    results = []
    for name, url in endpoints:
        results.append(check_service(url, name))
    
    return results

def test_ai_services():
    """Test AI Services functionality"""
    print_section("Testing AI Services")
    
    try:
        # Test customer analysis endpoint
        url = "http://localhost:5000/analyze-customer"
        test_data = {
            "customer": {
                "firstName": "Test",
                "lastName": "Customer",
                "customerType": "private",
                "city": "Zürich",
                "canton": "ZH",
                "age": 35
            },
            "vehicle_preferences": {
                "budget_min": 80000,
                "budget_max": 120000,
                "usage": "daily_commute",
                "features": ["autonomous_driving", "premium_sound"]
            }
        }
        
        response = requests.post(url, json=test_data, timeout=10)
        if response.status_code == 200:
            print("✅ Customer Analysis API working")
            return True
        else:
            print(f"⚠️ Customer Analysis API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ AI Services test failed: {e}")
        return False

def check_environment_files():
    """Check if all environment files are properly configured"""
    print_section("Checking Environment Configuration")
    
    env_files = [
        (".env", "Root Environment"),
        ("ai-services/.env", "AI Services Environment"),
        ("functions/.env", "Firebase Functions Environment"),
        ("frontend/.env.local", "Frontend Environment")
    ]
    
    results = []
    for file_path, description in env_files:
        if os.path.exists(file_path):
            print(f"✅ {description} file exists")
            results.append(True)
        else:
            print(f"❌ {description} file missing")
            results.append(False)
    
    return results

def check_dependencies():
    """Check if all required dependencies are installed"""
    print_section("Checking Dependencies")
    
    # Check Python dependencies
    try:
        import openai
        print("✅ OpenAI library installed")
    except ImportError:
        print("❌ OpenAI library missing")
    
    try:
        import google.generativeai
        print("✅ Google Generative AI library installed")
    except ImportError:
        print("❌ Google Generative AI library missing")
    
    try:
        from qdrant_client import QdrantClient
        print("✅ Qdrant client installed")
    except ImportError:
        print("❌ Qdrant client missing")

def create_database_setup():
    """Create database setup scripts"""
    print_section("Creating Database Setup")
    
    # Create PostgreSQL setup script
    postgres_setup = """#!/bin/bash
# PostgreSQL Setup for CADILLAC EV CIS

echo "Setting up PostgreSQL database..."

# Create database
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE cadillac_ev_cis;"

# Run migrations
cd backend && npm run migration:run

# Seed data
cd ../database/seeds && psql -h localhost -U postgres -d cadillac_ev_cis -f 01_cantons.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 02_vehicles.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 03_vehicle_options.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 04_users.sql

echo "Database setup complete!"
"""
    
    with open("scripts/setup-database.sh", "w") as f:
        f.write(postgres_setup)
    
    print("✅ Database setup script created")

def create_firestore_setup():
    """Create Firestore setup script"""
    print_section("Setting up Firestore")
    
    firestore_setup = """#!/bin/bash
# Firestore Setup for CADILLAC EV CIS

echo "Setting up Firestore collections..."

# Create collections and indexes
firebase firestore:indexes

# Deploy Firestore rules
firebase deploy --only firestore

echo "Firestore setup complete!"
"""
    
    with open("scripts/setup-firestore.sh", "w") as f:
        f.write(firestore_setup)
    
    print("✅ Firestore setup script created")

def create_startup_script():
    """Create a comprehensive startup script"""
    print_section("Creating Startup Scripts")
    
    startup_script = """#!/bin/bash
# CADILLAC EV CIS - Complete System Startup

echo "🚗 Starting CADILLAC EV CIS System..."

# Start all services
echo "Starting Frontend..."
cd frontend && npm run dev &

echo "Starting Backend..."
cd ../backend && npm run start:dev &

echo "Starting AI Services..."
cd ../ai-services && python src/main.py &

echo "Starting Firebase Emulators..."
firebase emulators:start &

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🤖 AI Services: http://localhost:5000"
echo "🔥 Firebase: http://localhost:4000"

# Wait for services to start
sleep 10

# Run health check
echo "Running health check..."
python test_api_keys.py
"""
    
    with open("scripts/start-all.sh", "w") as f:
        f.write(startup_script)
    
    print("✅ Startup script created")

def main():
    """Main setup function"""
    print_header("CADILLAC EV CIS - System Setup & Verification")
    print(f"Setup started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create scripts directory if it doesn't exist
    if not os.path.exists("scripts"):
        os.makedirs("scripts")
    
    # Check environment files
    env_results = check_environment_files()
    
    # Check dependencies
    check_dependencies()
    
    # Test services
    service_results = test_api_endpoints()
    
    # Test AI services
    ai_results = test_ai_services()
    
    # Create setup scripts
    create_database_setup()
    create_firestore_setup()
    create_startup_script()
    
    # Summary
    print_header("Setup Summary")
    
    working_services = sum(service_results)
    total_services = len(service_results)
    
    print(f"📊 Services Status: {working_services}/{total_services} running")
    print(f"🔧 Environment Files: {sum(env_results)}/{len(env_results)} configured")
    print(f"🤖 AI Services: {'✅ Working' if ai_results else '❌ Issues'}")
    
    print("\n🚀 Next Steps:")
    print("1. Run database setup: bash scripts/setup-database.sh")
    print("2. Run Firestore setup: bash scripts/setup-firestore.sh")
    print("3. Start all services: bash scripts/start-all.sh")
    print("4. Access the system:")
    print("   - Frontend: http://localhost:3000")
    print("   - Backend: http://localhost:3001")
    print("   - AI Services: http://localhost:5000")
    print("   - Firebase: https://superagent-ff2fe.web.app")
    
    if working_services == total_services and ai_results:
        print("\n🎉 System is ready for development!")
    else:
        print("\n⚠️ Some components need attention")
    
    print("\n📋 Created Scripts:")
    print("- scripts/setup-database.sh")
    print("- scripts/setup-firestore.sh")
    print("- scripts/start-all.sh")

if __name__ == "__main__":
    main() 