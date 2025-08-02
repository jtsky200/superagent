#!/bin/bash

# CADILLAC EV CIS - Health Check Script
# This script checks the health of all services

set -e

echo "🏥 CADILLAC EV CIS - Health Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if a service is responding
check_service() {
    local service_name=$1
    local url=$2
    local timeout=${3:-5}
    
    print_status "Checking $service_name..."
    
    if curl -f -s --max-time $timeout "$url" > /dev/null 2>&1; then
        print_success "$service_name is responding"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Check database connection
check_database() {
    print_status "Checking PostgreSQL database..."
    
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            print_success "PostgreSQL is running"
            
            # Try to connect to the database
            if psql -h localhost -U postgres -d cadillac_ev_cis -c "SELECT 1;" &> /dev/null; then
                print_success "Database connection successful"
                return 0
            else
                print_error "Cannot connect to database"
                return 1
            fi
        else
            print_error "PostgreSQL is not running"
            return 1
        fi
    else
        print_warning "PostgreSQL client not found"
        return 1
    fi
}

# Check Redis connection
check_redis() {
    print_status "Checking Redis..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis is running"
            return 0
        else
            print_error "Redis is not responding"
            return 1
        fi
    else
        print_warning "Redis client not found"
        return 1
    fi
}

# Check Node.js processes
check_node_processes() {
    print_status "Checking Node.js processes..."
    
    local frontend_running=false
    local backend_running=false
    
    # Check if processes are running on expected ports
    if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
        frontend_running=true
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
        backend_running=true
    fi
    
    if [ "$frontend_running" = true ]; then
        print_success "Frontend process is running (port 3000)"
    else
        print_warning "Frontend process is not running"
    fi
    
    if [ "$backend_running" = true ]; then
        print_success "Backend process is running (port 3001)"
    else
        print_warning "Backend process is not running"
    fi
}

# Check Python processes
check_python_processes() {
    print_status "Checking Python processes..."
    
    local ai_running=false
    
    # Check if AI services are running on expected port
    if netstat -tuln 2>/dev/null | grep -q ":5000 "; then
        ai_running=true
    fi
    
    if [ "$ai_running" = true ]; then
        print_success "AI Services process is running (port 5000)"
    else
        print_warning "AI Services process is not running"
    fi
}

# Check Docker containers
check_docker_containers() {
    print_status "Checking Docker containers..."
    
    if command -v docker &> /dev/null; then
        local containers=(
            "cadillac-ev-cis-postgres"
            "cadillac-ev-cis-redis"
            "cadillac-ev-cis-backend"
            "cadillac-ev-cis-ai"
            "cadillac-ev-cis-frontend"
        )
        
        for container in "${containers[@]}"; do
            if docker ps --format "table {{.Names}}" | grep -q "$container"; then
                print_success "Container $container is running"
            else
                print_warning "Container $container is not running"
            fi
        done
    else
        print_warning "Docker not found"
    fi
}

# Check environment files
check_environment() {
    print_status "Checking environment files..."
    
    local env_files=(
        ".env"
        "frontend/.env.local"
    )
    
    for file in "${env_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_warning "$file is missing"
        fi
    done
}

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_success "Node.js version: $node_version"
    else
        print_error "Node.js not found"
    fi
    
    # Check npm version
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        print_success "npm version: $npm_version"
    else
        print_error "npm not found"
    fi
    
    # Check Python version
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version)
        print_success "Python version: $python_version"
    else
        print_error "Python3 not found"
    fi
}

# Check disk space
check_disk_space() {
    print_status "Checking disk space..."
    
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        print_success "Disk usage: ${disk_usage}%"
    elif [ "$disk_usage" -lt 90 ]; then
        print_warning "Disk usage: ${disk_usage}%"
    else
        print_error "Disk usage: ${disk_usage}% (critical)"
    fi
}

# Check memory usage
check_memory() {
    print_status "Checking memory usage..."
    
    if command -v free &> /dev/null; then
        local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
        print_success "Memory usage: ${memory_usage}%"
    else
        print_warning "Cannot check memory usage"
    fi
}

# Main health check function
main() {
    local all_healthy=true
    
    echo ""
    check_dependencies
    echo ""
    
    check_environment
    echo ""
    
    check_disk_space
    check_memory
    echo ""
    
    if check_database; then
        echo ""
    else
        all_healthy=false
    fi
    
    if check_redis; then
        echo ""
    else
        all_healthy=false
    fi
    
    check_node_processes
    echo ""
    
    check_python_processes
    echo ""
    
    check_docker_containers
    echo ""
    
    # Check service endpoints
    print_status "Checking service endpoints..."
    echo ""
    
    if check_service "Frontend" "http://localhost:3000" 10; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not accessible"
        all_healthy=false
    fi
    
    if check_service "Backend API" "http://localhost:3001/health" 10; then
        print_success "Backend API is accessible"
    else
        print_warning "Backend API is not accessible"
        all_healthy=false
    fi
    
    if check_service "AI Services" "http://localhost:5000/health" 10; then
        print_success "AI Services are accessible"
    else
        print_warning "AI Services are not accessible"
        all_healthy=false
    fi
    
    echo ""
    echo "================================="
    
    if [ "$all_healthy" = true ]; then
        print_success "All services are healthy! 🎉"
        exit 0
    else
        print_error "Some services have issues. Please check the warnings above."
        exit 1
    fi
}

# Run main function
main "$@" 