#!/bin/bash

# CADILLAC EV CIS - Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚗 CADILLAC EV CIS - Development Setup"
echo "======================================"

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose is not installed. Some features may not work"
    fi
    
    print_success "System requirements check completed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy example environment file if .env doesn't exist
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
        else
            print_warning "No env.example found. Please create .env file manually"
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Setup frontend environment
    if [ ! -f frontend/.env.local ]; then
        if [ -f frontend/.env.example ]; then
            cp frontend/.env.example frontend/.env.local
            print_success "Created frontend/.env.local"
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    
    # AI Services dependencies
    cd ai-services
    if [ -d "venv" ]; then
        print_status "Using existing Python virtual environment"
    else
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    
    print_success "All dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            print_status "PostgreSQL is running"
            
            # Create database if it doesn't exist
            if ! psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw cadillac_ev_cis; then
                print_status "Creating database..."
                psql -h localhost -U postgres -c "CREATE DATABASE cadillac_ev_cis;"
                print_success "Database created"
            else
                print_success "Database already exists"
            fi
            
            # Run migrations
            cd backend
            npm run migration:run
            cd ..
            print_success "Database migrations completed"
        else
            print_warning "PostgreSQL is not running. Please start PostgreSQL manually"
        fi
    else
        print_warning "PostgreSQL client not found. Please install PostgreSQL"
    fi
}

# Setup Redis
setup_redis() {
    print_status "Setting up Redis..."
    
    # Check if Redis is running
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis is running"
        else
            print_warning "Redis is not running. Please start Redis manually"
        fi
    else
        print_warning "Redis client not found. Please install Redis"
    fi
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build frontend
    cd frontend
    npm run build
    cd ..
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p frontend/logs
    mkdir -p backend/logs
    mkdir -p ai-services/logs
    
    print_success "Directories created"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d .git ]; then
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint
npm run test
EOF
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    fi
}

# Display setup completion
show_completion() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Configure your .env file with your API keys"
    echo "2. Start the development servers:"
    echo "   - npm run dev (all services)"
    echo "   - npm run dev:frontend (frontend only)"
    echo "   - npm run dev:backend (backend only)"
    echo "   - npm run dev:ai (AI services only)"
    echo ""
    echo "3. Access the applications:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - AI Services: http://localhost:5000"
    echo "   - pgAdmin: http://localhost:5050"
    echo "   - Redis Commander: http://localhost:8081"
    echo ""
    echo "4. Database management:"
    echo "   - npm run db:setup (setup database)"
    echo "   - npm run db:seed (seed with sample data)"
    echo ""
    echo "5. Docker (optional):"
    echo "   - npm run docker:up (start all services in Docker)"
    echo "   - npm run docker:down (stop Docker services)"
    echo ""
}

# Main setup function
main() {
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    setup_redis
    create_directories
    build_applications
    setup_git_hooks
    show_completion
}

# Run main function
main "$@" 