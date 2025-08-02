#!/bin/bash

# 🔍 CADILLAC EV CIS - Interactive Debug Toolkit
# Comprehensive debugging and troubleshooting tool for Swiss market

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Swiss flag and icons
SWISS_FLAG="🇨🇭"
DEBUG_ICON="🔍"
ERROR_ICON="🚨"
SUCCESS_ICON="✅"
WARNING_ICON="⚠️"

# Configuration
NAMESPACE="cadillac-ev-production"
LOG_LINES=50
TIMEOUT=30

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}${ERROR_ICON} [ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}${SUCCESS_ICON} [SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}${WARNING_ICON} [WARNING] $1${NC}"
}

info() {
    echo -e "${PURPLE}[INFO] $1${NC}"
}

debug() {
    echo -e "${CYAN}${DEBUG_ICON} [DEBUG] $1${NC}"
}

# Banner
print_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║  ${SWISS_FLAG} CADILLAC EV CIS - Interactive Debug Toolkit ${DEBUG_ICON}              ║"
    echo "║  Comprehensive Swiss Market Debugging & Troubleshooting                     ║"
    echo "║  Environment: Production | Namespace: $NAMESPACE                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    debug "Checking debug toolkit prerequisites..."
    
    local missing_tools=()
    
    # Check for required tools
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        echo "Please install missing tools and try again."
        exit 1
    fi
    
    # Check Kubernetes access
    if ! kubectl cluster-info >/dev/null 2>&1; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    success "All prerequisites met"
}

# Error Analysis Functions
analyze_error() {
    local error_message="$1"
    local component="${2:-unknown}"
    
    log "🔍 Analyzing error: $error_message"
    echo ""
    
    # Error classification
    case "$error_message" in
        *"CORS"*|*"cors"*)
            analyze_cors_error "$error_message"
            ;;
        *"connection"*|*"timeout"*|*"Connection"*)
            analyze_connection_error "$error_message"
            ;;
        *"TypeScript"*|*"TS"*|*"type"*)
            analyze_typescript_error "$error_message"
            ;;
        *"404"*|*"Not Found"*|*"not found"*)
            analyze_routing_error "$error_message"
            ;;
        *"500"*|*"Internal Server Error"*)
            analyze_server_error "$error_message"
            ;;
        *"Database"*|*"SQL"*|*"postgres"*)
            analyze_database_error "$error_message"
            ;;
        *"Swiss"*|*"Canton"*|*"DSGVO"*)
            analyze_swiss_compliance_error "$error_message"
            ;;
        *)
            analyze_generic_error "$error_message"
            ;;
    esac
}

analyze_cors_error() {
    local error="$1"
    
    error "🌐 CORS Error Detected"
    echo ""
    echo "🔧 CORS Troubleshooting Steps:"
    echo "1. Check backend CORS configuration in main.ts"
    echo "2. Verify frontend API base URL"
    echo "3. Check nginx reverse proxy CORS headers"
    echo "4. Validate domain whitelist"
    echo ""
    
    # Check CORS configuration
    info "Checking current CORS configuration..."
    
    # Check backend pod logs for CORS issues
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=20 | grep -i cors || true
    
    echo ""
    echo "🛠️ Quick Fixes:"
    echo "• Backend: Add your domain to CORS origins"
    echo "• Frontend: Check API_BASE_URL environment variable"
    echo "• Nginx: Verify Access-Control-Allow-Origin header"
    echo "• Development: Use http://localhost:3000 in CORS origins"
}

analyze_connection_error() {
    local error="$1"
    
    error "🔌 Connection Error Detected"
    echo ""
    
    # Check service connectivity
    info "Checking service connectivity..."
    
    echo "🔍 Service Status:"
    kubectl get services -n "$NAMESPACE" -o wide
    
    echo ""
    echo "🔍 Pod Status:"
    kubectl get pods -n "$NAMESPACE" -o wide
    
    echo ""
    echo "🔍 Network Policies:"
    kubectl get networkpolicy -n "$NAMESPACE" || echo "No network policies found"
    
    echo ""
    echo "🛠️ Connection Troubleshooting:"
    echo "• Check if pods are running and ready"
    echo "• Verify service endpoints"
    echo "• Test internal DNS resolution"
    echo "• Check network policies"
    echo "• Verify firewall rules"
}

analyze_typescript_error() {
    local error="$1"
    
    error "📝 TypeScript Error Detected"
    echo ""
    
    echo "🔧 TypeScript Troubleshooting:"
    echo "1. Check type definitions in src/types/"
    echo "2. Verify import paths and module resolution"
    echo "3. Check tsconfig.json configuration"
    echo "4. Install missing @types packages"
    echo ""
    
    # Check common TypeScript issues
    info "Common TypeScript fixes:"
    echo "• npm install --save-dev @types/node @types/react"
    echo "• Check import paths: @/types, @/components"
    echo "• Verify Swiss market types: SwissCanton, TCOCalculation"
    echo "• Update tsconfig.json baseUrl and paths"
}

analyze_routing_error() {
    local error="$1"
    
    error "🔍 Routing Error Detected"
    echo ""
    
    echo "🗺️ Route Troubleshooting:"
    echo "1. Check frontend route configuration"
    echo "2. Verify API endpoint paths"
    echo "3. Check nginx proxy_pass configuration"
    echo "4. Validate Swiss market routes (/api/cantons, /api/tco)"
    echo ""
    
    # Check ingress configuration
    info "Checking ingress configuration..."
    kubectl get ingress -n "$NAMESPACE" -o yaml || echo "No ingress found"
}

analyze_server_error() {
    local error="$1"
    
    error "🚨 Server Error (500) Detected"
    echo ""
    
    # Get recent backend logs
    info "Checking backend logs for server errors..."
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=30 | tail -10
    
    echo ""
    echo "🔧 Server Error Investigation:"
    echo "• Check backend application logs"
    echo "• Verify database connectivity"
    echo "• Check external API integrations"
    echo "• Review Swiss compliance validations"
    echo "• Monitor resource usage (CPU/Memory)"
}

analyze_database_error() {
    local error="$1"
    
    error "🗄️ Database Error Detected"
    echo ""
    
    info "Checking database connectivity..."
    
    # Check PostgreSQL pod status
    kubectl get pods -n "$NAMESPACE" -l app=cadillac-ev-postgres
    
    echo ""
    echo "🔧 Database Troubleshooting:"
    echo "1. Check PostgreSQL pod status and logs"
    echo "2. Verify connection pool configuration"
    echo "3. Check Swiss cantons data integrity"
    echo "4. Monitor query performance"
    echo "5. Verify database credentials"
    
    # Check database logs
    info "Recent database logs:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-postgres --tail=10 || true
}

analyze_swiss_compliance_error() {
    local error="$1"
    
    error "🇨🇭 Swiss Compliance Error Detected"
    echo ""
    
    echo "🛡️ Swiss Compliance Troubleshooting:"
    echo "1. Check DSGVO consent tracking"
    echo "2. Verify data retention policies"
    echo "3. Check Swiss canton data availability"
    echo "4. Validate data residency compliance"
    echo "5. Review audit logging"
    echo ""
    
    # Check Swiss compliance metrics
    info "Checking Swiss compliance status..."
    kubectl get configmap swiss-cantons-config -n "$NAMESPACE" -o yaml | grep -A 5 -B 5 "ZH\|BE\|GE" || true
}

analyze_generic_error() {
    local error="$1"
    
    warning "❓ Generic Error - Manual Analysis Required"
    echo ""
    
    echo "🔍 General Troubleshooting Steps:"
    echo "1. Check application logs"
    echo "2. Verify service status"
    echo "3. Check resource usage"
    echo "4. Review recent deployments"
    echo "5. Check external dependencies"
    echo ""
    
    # Get system overview
    info "System Overview:"
    kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics server not available"
}

# Performance Analysis Functions
analyze_performance() {
    local component="$1"
    
    log "⚡ Analyzing performance for: $component"
    echo ""
    
    case "$component" in
        "frontend"|"next"|"react")
            analyze_frontend_performance
            ;;
        "backend"|"api"|"nestjs")
            analyze_backend_performance
            ;;
        "database"|"postgres"|"db")
            analyze_database_performance
            ;;
        "ai"|"ai-services"|"python")
            analyze_ai_performance
            ;;
        *)
            analyze_general_performance
            ;;
    esac
}

analyze_frontend_performance() {
    info "🎨 Frontend Performance Analysis"
    echo ""
    
    # Check frontend pods
    echo "📊 Frontend Pod Status:"
    kubectl get pods -n "$NAMESPACE" -l app=cadillac-ev-frontend
    
    echo ""
    echo "📈 Performance Optimization Recommendations:"
    echo "• Enable Next.js Image Optimization"
    echo "• Implement Swiss canton data caching"
    echo "• Use dynamic imports for large components"
    echo "• Optimize bundle size with webpack-bundle-analyzer"
    echo "• Implement service worker for Swiss offline support"
    
    # Check frontend logs for performance issues
    info "Recent frontend logs:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-frontend --tail=10 | grep -E "(slow|performance|timeout)" || true
}

analyze_backend_performance() {
    info "🔧 Backend Performance Analysis"
    echo ""
    
    # Check backend resource usage
    echo "📊 Backend Resource Usage:"
    kubectl top pods -n "$NAMESPACE" -l app=cadillac-ev-backend 2>/dev/null || echo "Metrics not available"
    
    echo ""
    echo "📈 Performance Optimization Recommendations:"
    echo "• Optimize database queries (add indexes)"
    echo "• Implement Redis caching for Swiss canton data"
    echo "• Use connection pooling"
    echo "• Optimize API response sizes"
    echo "• Implement request caching for TCO calculations"
    
    # Check for slow queries
    info "Checking for performance issues:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=50 | grep -E "(slow|timeout|performance)" || true
}

analyze_database_performance() {
    info "🗄️ Database Performance Analysis"
    echo ""
    
    echo "📊 Database Recommendations:"
    echo "• Create indexes on frequently queried columns"
    echo "• Optimize Swiss canton lookup queries"
    echo "• Monitor connection pool usage"
    echo "• Implement query caching"
    echo "• Regular VACUUM and ANALYZE operations"
    
    # Check database metrics
    info "Database connection status:"
    kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-postgres -- psql -U postgres -d cadillac_ev_cis_prod -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || true
}

analyze_ai_performance() {
    info "🤖 AI Services Performance Analysis"
    echo ""
    
    # Check AI service resource usage
    echo "📊 AI Services Resource Usage:"
    kubectl top pods -n "$NAMESPACE" -l app=cadillac-ev-ai 2>/dev/null || echo "Metrics not available"
    
    echo ""
    echo "📈 AI Performance Optimization:"
    echo "• Implement response caching for similar requests"
    echo "• Optimize prompt engineering for Swiss market"
    echo "• Use async processing for long-running analysis"
    echo "• Implement request queuing"
    echo "• Monitor external AI API rate limits"
    
    # Check AI service logs
    info "AI service performance logs:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-ai --tail=20 | grep -E "(slow|timeout|latency)" || true
}

analyze_general_performance() {
    info "📊 General System Performance Analysis"
    echo ""
    
    # System overview
    echo "🖥️ System Overview:"
    kubectl get nodes -o wide
    
    echo ""
    echo "📈 Pod Resource Usage:"
    kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics server not available"
    
    echo ""
    echo "🔍 Performance Recommendations:"
    echo "• Monitor CPU and memory usage"
    echo "• Check network latency between services"
    echo "• Optimize inter-service communication"
    echo "• Implement health checks and monitoring"
    echo "• Use horizontal pod autoscaling"
}

# Swiss Market Specific Debugging
debug_swiss_features() {
    log "🇨🇭 Swiss Market Feature Debugging"
    echo ""
    
    echo "🏔️ Swiss Features Status Check:"
    echo ""
    
    # Check Swiss cantons configuration
    info "1. Swiss Cantons Configuration:"
    kubectl get configmap swiss-cantons-config -n "$NAMESPACE" >/dev/null 2>&1 && success "Swiss cantons config found" || error "Swiss cantons config missing"
    
    # Check Swiss compliance configuration
    info "2. Swiss Compliance Configuration:"
    kubectl get configmap swiss-data-protection-policy -n "$NAMESPACE" >/dev/null 2>&1 && success "DSGVO policy config found" || error "DSGVO policy config missing"
    
    # Check Swiss language support
    info "3. Swiss Language Support:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-frontend --tail=100 | grep -E "(de|fr|it)" >/dev/null && success "Multi-language logs found" || warning "Limited language activity"
    
    # Check TCO calculation service
    info "4. TCO Calculation Service:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-ai --tail=50 | grep -i "tco" >/dev/null && success "TCO calculation activity found" || warning "No recent TCO calculations"
    
    # Check Swiss API integrations
    info "5. Swiss API Integrations:"
    kubectl get secrets swiss-compliance-secrets -n "$NAMESPACE" >/dev/null 2>&1 && success "Swiss API secrets found" || warning "Swiss API secrets missing"
    
    echo ""
    echo "🔧 Swiss Feature Troubleshooting:"
    echo "• Verify all 26 cantons are in configuration"
    echo "• Check DE/FR/IT language resource loading"
    echo "• Test TCO calculation for different cantons"
    echo "• Validate DSGVO consent tracking"
    echo "• Check Swiss postal code validation"
}

# Interactive Menu System
show_main_menu() {
    echo ""
    echo -e "${CYAN}🛠️ CADILLAC EV CIS Debug Toolkit - Main Menu${NC}"
    echo "════════════════════════════════════════════════"
    echo "1. 🔍 Error Analysis"
    echo "2. ⚡ Performance Analysis"
    echo "3. 🇨🇭 Swiss Market Debug"
    echo "4. 🗄️ Database Debug"
    echo "5. 🌐 Network Debug"
    echo "6. 📊 System Overview"
    echo "7. 📝 Generate Debug Report"
    echo "8. 🚨 Emergency Debug"
    echo "9. ❌ Exit"
    echo "════════════════════════════════════════════════"
    echo -n "Select option (1-9): "
}

error_analysis_menu() {
    echo ""
    echo -e "${YELLOW}🔍 Error Analysis Menu${NC}"
    echo "═══════════════════════════"
    echo "1. Analyze Custom Error Message"
    echo "2. Check Recent Error Logs"
    echo "3. CORS Error Analysis"
    echo "4. TypeScript Error Check"
    echo "5. Database Connection Errors"
    echo "6. Swiss Compliance Errors"
    echo "7. Back to Main Menu"
    echo "═══════════════════════════"
    echo -n "Select option (1-7): "
}

performance_analysis_menu() {
    echo ""
    echo -e "${GREEN}⚡ Performance Analysis Menu${NC}"
    echo "═══════════════════════════════"
    echo "1. Frontend Performance"
    echo "2. Backend API Performance"
    echo "3. Database Performance"
    echo "4. AI Services Performance"
    echo "5. Overall System Performance"
    echo "6. Swiss Market Features Performance"
    echo "7. Back to Main Menu"
    echo "═══════════════════════════════"
    echo -n "Select option (1-7): "
}

# Debug Report Generation
generate_debug_report() {
    local report_file="debug-report-$(date +%Y%m%d-%H%M%S).md"
    
    log "📝 Generating comprehensive debug report..."
    
    cat > "$report_file" << EOF
# 🇨🇭 CADILLAC EV CIS - Debug Report

**Generated:** $(date)  
**Namespace:** $NAMESPACE  
**Cluster:** $(kubectl config current-context)

## 📊 System Overview

### Pods Status
\`\`\`
$(kubectl get pods -n "$NAMESPACE" -o wide)
\`\`\`

### Services Status
\`\`\`
$(kubectl get services -n "$NAMESPACE")
\`\`\`

### Resource Usage
\`\`\`
$(kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics not available")
\`\`\`

## 🇨🇭 Swiss Market Features

### Swiss Cantons Configuration
$(kubectl get configmap swiss-cantons-config -n "$NAMESPACE" >/dev/null 2>&1 && echo "✅ Available" || echo "❌ Missing")

### DSGVO Compliance Configuration
$(kubectl get configmap swiss-data-protection-policy -n "$NAMESPACE" >/dev/null 2>&1 && echo "✅ Available" || echo "❌ Missing")

## 📝 Recent Logs

### Backend Logs (Last 20 lines)
\`\`\`
$(kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=20 2>/dev/null || echo "Logs not available")
\`\`\`

### Frontend Logs (Last 20 lines)
\`\`\`
$(kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-frontend --tail=20 2>/dev/null || echo "Logs not available")
\`\`\`

### AI Services Logs (Last 20 lines)
\`\`\`
$(kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-ai --tail=20 2>/dev/null || echo "Logs not available")
\`\`\`

## 🔍 Health Checks

### Backend Health
$(kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- curl -f http://localhost:3001/health 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy")

### Database Health
$(kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-postgres -- psql -U postgres -c "SELECT 1" 2>/dev/null && echo "✅ Healthy" || echo "❌ Unhealthy")

## 🚨 Recent Errors

$(kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=100 2>/dev/null | grep -i "error" | tail -10 || echo "No recent errors found")

---

**Report generated by CADILLAC EV CIS Debug Toolkit**  
**Swiss Market Ready! 🇨🇭⚡🏎️**
EOF

    success "Debug report generated: $report_file"
    
    # Offer to display report
    echo -n "Display report now? (y/n): "
    read -r display_choice
    if [[ "$display_choice" =~ ^[Yy]$ ]]; then
        less "$report_file" || cat "$report_file"
    fi
}

# Emergency Debug Mode
emergency_debug() {
    error "🚨 EMERGENCY DEBUG MODE ACTIVATED"
    echo ""
    
    log "Running emergency system diagnostics..."
    
    # Critical system checks
    echo "1. 🔍 Pod Status Check:"
    kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
    
    echo ""
    echo "2. 🚨 Recent Critical Errors:"
    kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=50 | grep -i "critical\|fatal\|emergency" || echo "No critical errors found"
    
    echo ""
    echo "3. 🗄️ Database Connectivity:"
    kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-postgres -- psql -U postgres -c "SELECT version();" 2>/dev/null && success "Database accessible" || error "Database connection failed"
    
    echo ""
    echo "4. 🌐 External Connectivity:"
    kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- curl -f https://api.openai.com/v1/models --max-time 10 >/dev/null 2>&1 && success "External APIs accessible" || warning "External API connectivity issues"
    
    echo ""
    echo "5. 🇨🇭 Swiss Compliance Status:"
    kubectl get secrets swiss-compliance-secrets -n "$NAMESPACE" >/dev/null 2>&1 && success "Swiss compliance secrets available" || error "Swiss compliance configuration missing"
    
    echo ""
    warning "Emergency diagnostics complete. Review results above."
}

# Main execution function
main() {
    print_banner
    check_prerequisites
    
    while true; do
        show_main_menu
        read -r choice
        
        case $choice in
            1)
                while true; do
                    error_analysis_menu
                    read -r error_choice
                    case $error_choice in
                        1)
                            echo -n "Enter error message: "
                            read -r error_msg
                            echo -n "Enter component (optional): "
                            read -r component
                            analyze_error "$error_msg" "$component"
                            ;;
                        2)
                            log "Checking recent error logs..."
                            kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=50 | grep -i "error" | tail -10
                            ;;
                        3)
                            analyze_cors_error "CORS policy error"
                            ;;
                        4)
                            analyze_typescript_error "TypeScript compilation error"
                            ;;
                        5)
                            analyze_database_error "Database connection error"
                            ;;
                        6)
                            analyze_swiss_compliance_error "Swiss compliance validation error"
                            ;;
                        7)
                            break
                            ;;
                        *)
                            error "Invalid choice"
                            ;;
                    esac
                    echo ""
                    echo -n "Press Enter to continue..."
                    read -r
                done
                ;;
            2)
                while true; do
                    performance_analysis_menu
                    read -r perf_choice
                    case $perf_choice in
                        1) analyze_frontend_performance ;;
                        2) analyze_backend_performance ;;
                        3) analyze_database_performance ;;
                        4) analyze_ai_performance ;;
                        5) analyze_general_performance ;;
                        6) debug_swiss_features ;;
                        7) break ;;
                        *) error "Invalid choice" ;;
                    esac
                    echo ""
                    echo -n "Press Enter to continue..."
                    read -r
                done
                ;;
            3)
                debug_swiss_features
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            4)
                analyze_database_error "Manual database debug"
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            5)
                analyze_connection_error "Manual network debug"
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            6)
                analyze_general_performance
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            7)
                generate_debug_report
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            8)
                emergency_debug
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            9)
                success "🇨🇭 CADILLAC EV CIS Debug Toolkit - Session Complete! ⚡🏎️"
                exit 0
                ;;
            *)
                error "Invalid choice. Please select 1-9."
                ;;
        esac
    done
}

# Run the main function
main "$@"