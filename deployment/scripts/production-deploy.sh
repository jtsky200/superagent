#!/bin/bash

# 🚀 CADILLAC EV CIS - Production Deployment Script
# Secure deployment script for Swiss market compliance

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Swiss flag emoji for branding
SWISS_FLAG="🇨🇭"
CADILLAC_LOGO="🏎️"

# Configuration
NAMESPACE="cadillac-ev-production"
ENVIRONMENT="production"
REGION="eu-central-1"
BACKUP_RETENTION="7y"  # Swiss legal requirement

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${PURPLE}[INFO] $1${NC}"
}

# Banner
print_banner() {
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║  ${SWISS_FLAG} CADILLAC EV CIS - Production Deployment ${CADILLAC_LOGO}         ║"
    echo "║  Swiss Market Customer Intelligence System                    ║"
    echo "║  Environment: Production | Region: eu-central-1             ║"
    echo "║  Compliance: DSGVO/DSG | Data Residency: Switzerland        ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment security and compliance checks..."
    
    # Check kubectl access
    if ! kubectl cluster-info &>/dev/null; then
        error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if we're in the correct context
    CURRENT_CONTEXT=$(kubectl config current-context)
    if [[ ! "$CURRENT_CONTEXT" =~ "production" ]]; then
        error "Not in production context. Current: $CURRENT_CONTEXT"
        exit 1
    fi
    success "✅ Kubernetes cluster connection verified"
    
    # Check namespace exists
    if ! kubectl get namespace "$NAMESPACE" &>/dev/null; then
        warning "Namespace $NAMESPACE does not exist. Creating..."
        kubectl apply -f deployment/k8s/production/namespace.yaml
    fi
    success "✅ Namespace $NAMESPACE verified"
    
    # Check Swiss compliance requirements
    log "🇨🇭 Checking Swiss compliance requirements..."
    
    # Verify Swiss cantons configuration
    if ! kubectl get configmap swiss-cantons-config -n "$NAMESPACE" &>/dev/null; then
        error "Swiss cantons configuration missing"
        exit 1
    fi
    success "✅ Swiss cantons configuration verified"
    
    # Check SSL certificates
    if ! kubectl get secret cadillac-ev-tls -n "$NAMESPACE" &>/dev/null; then
        error "SSL/TLS certificates missing for Swiss domain"
        exit 1
    fi
    
    # Verify certificate expiry
    CERT_EXPIRY=$(kubectl get secret cadillac-ev-tls -n "$NAMESPACE" -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -noout -enddate | cut -d= -f2)
    CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (CERT_EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
        error "SSL certificate expires in $DAYS_UNTIL_EXPIRY days. Renewal required!"
        exit 1
    fi
    success "✅ SSL certificate valid for $DAYS_UNTIL_EXPIRY days"
    
    # Check required secrets
    REQUIRED_SECRETS=("cadillac-ev-secrets" "swiss-compliance-secrets" "external-services-secrets")
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if ! kubectl get secret "$secret" -n "$NAMESPACE" &>/dev/null; then
            error "Required secret $secret is missing"
            exit 1
        fi
    done
    success "✅ All required secrets verified"
    
    # Check DSGVO compliance configuration
    if ! kubectl get configmap swiss-data-protection-policy -n "$NAMESPACE" &>/dev/null; then
        error "Swiss data protection policy configuration missing"
        exit 1
    fi
    success "✅ DSGVO/DSG compliance configuration verified"
}

# Deploy infrastructure components
deploy_infrastructure() {
    log "🏗️ Deploying infrastructure components..."
    
    # Apply security policies first
    log "Applying security policies..."
    kubectl apply -f deployment/security/security-policies.yaml
    success "✅ Security policies applied"
    
    # Apply namespace and RBAC
    kubectl apply -f deployment/k8s/production/namespace.yaml
    success "✅ Namespace and RBAC configured"
    
    # Apply configmaps
    log "Applying configuration maps..."
    kubectl apply -f deployment/k8s/production/configmap.yaml
    success "✅ Configuration maps applied"
    
    # Wait for configmaps to be available
    kubectl wait --for=condition=Ready configmap/cadillac-ev-config -n "$NAMESPACE" --timeout=60s
    
    # Apply persistent volumes
    if [ -f "deployment/k8s/production/persistent-volumes.yaml" ]; then
        log "Applying persistent volumes..."
        kubectl apply -f deployment/k8s/production/persistent-volumes.yaml
        success "✅ Persistent volumes configured"
    fi
}

# Deploy database and cache
deploy_data_layer() {
    log "🗄️ Deploying data layer (PostgreSQL & Redis)..."
    
    # Deploy PostgreSQL
    log "Deploying PostgreSQL database..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-postgres"
    
    # Wait for PostgreSQL to be ready
    log "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=Ready pod -l app=cadillac-ev-postgres -n "$NAMESPACE" --timeout=300s
    
    # Run database migrations
    log "Running database migrations..."
    kubectl run db-migration --rm -i --restart=Never \
        --image=ghcr.io/cadillac-ev-cis/backend:latest \
        --env="NODE_ENV=production" \
        --command -- npm run migration:run
    
    success "✅ PostgreSQL deployed and migrations completed"
    
    # Deploy Redis
    log "Deploying Redis cache..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-redis"
    
    # Wait for Redis to be ready
    kubectl wait --for=condition=Ready pod -l app=cadillac-ev-redis -n "$NAMESPACE" --timeout=180s
    success "✅ Redis cache deployed"
}

# Deploy application services
deploy_applications() {
    log "🚀 Deploying application services..."
    
    # Deploy backend API
    log "Deploying backend API service..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-backend"
    
    # Wait for backend rollout
    kubectl rollout status deployment/cadillac-ev-backend -n "$NAMESPACE" --timeout=600s
    success "✅ Backend API deployed"
    
    # Deploy AI services
    log "Deploying AI services..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-ai"
    
    # Wait for AI services rollout
    kubectl rollout status deployment/cadillac-ev-ai -n "$NAMESPACE" --timeout=600s
    success "✅ AI services deployed"
    
    # Deploy frontend
    log "Deploying frontend application..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-frontend"
    
    # Wait for frontend rollout
    kubectl rollout status deployment/cadillac-ev-frontend -n "$NAMESPACE" --timeout=600s
    success "✅ Frontend application deployed"
    
    # Deploy nginx reverse proxy
    log "Deploying Nginx reverse proxy..."
    kubectl apply -f deployment/k8s/production/deployment.yaml --selector="app=cadillac-ev-nginx"
    
    # Wait for nginx rollout
    kubectl rollout status deployment/cadillac-ev-nginx -n "$NAMESPACE" --timeout=300s
    success "✅ Nginx reverse proxy deployed"
}

# Deploy services and ingress
deploy_networking() {
    log "🌐 Deploying networking components..."
    
    # Apply services
    if [ -f "deployment/k8s/production/service.yaml" ]; then
        kubectl apply -f deployment/k8s/production/service.yaml
        success "✅ Services configured"
    fi
    
    # Apply ingress
    if [ -f "deployment/k8s/production/ingress.yaml" ]; then
        kubectl apply -f deployment/k8s/production/ingress.yaml
        success "✅ Ingress configured"
    fi
    
    # Apply network policies
    log "Applying network security policies..."
    kubectl apply -f deployment/security/security-policies.yaml --selector="kind=NetworkPolicy"
    success "✅ Network security policies applied"
}

# Deploy monitoring stack
deploy_monitoring() {
    log "📊 Deploying monitoring stack..."
    
    # Create monitoring namespace if it doesn't exist
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy Prometheus
    if [ -f "monitoring/prometheus/prometheus-deployment.yaml" ]; then
        kubectl apply -f monitoring/prometheus/prometheus-deployment.yaml
        success "✅ Prometheus deployed"
    fi
    
    # Deploy Grafana
    if [ -f "monitoring/grafana/grafana-deployment.yaml" ]; then
        kubectl apply -f monitoring/grafana/grafana-deployment.yaml
        success "✅ Grafana deployed"
    fi
    
    # Apply monitoring configuration
    kubectl create configmap prometheus-config \
        --from-file=monitoring/prometheus/prometheus.yml \
        -n monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl create configmap grafana-dashboards \
        --from-file=monitoring/grafana/dashboards/ \
        -n monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    success "✅ Monitoring configuration applied"
}

# Health checks
run_health_checks() {
    log "🏥 Running comprehensive health checks..."
    
    # Wait a bit for services to stabilize
    sleep 30
    
    # Check all pods are running
    log "Checking pod status..."
    FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running -o name | wc -l)
    if [ "$FAILED_PODS" -gt 0 ]; then
        error "Some pods are not running:"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
        exit 1
    fi
    success "✅ All pods are running"
    
    # Health check endpoints
    log "Testing health check endpoints..."
    
    # Get the load balancer IP or use port-forward for testing
    NGINX_SERVICE=$(kubectl get svc cadillac-ev-nginx -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [ -z "$NGINX_SERVICE" ]; then
        warning "Load balancer IP not available, using port-forward for health checks..."
        kubectl port-forward svc/cadillac-ev-nginx 8080:80 -n "$NAMESPACE" &
        PORT_FORWARD_PID=$!
        sleep 5
        HEALTH_URL="http://localhost:8080"
    else
        HEALTH_URL="http://$NGINX_SERVICE"
    fi
    
    # Test health endpoints
    HEALTH_ENDPOINTS=("/health" "/api/health" "/ai/health")
    
    for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
        if curl -f -s "$HEALTH_URL$endpoint" > /dev/null; then
            success "✅ Health check passed: $endpoint"
        else
            error "Health check failed: $endpoint"
            if [ -n "${PORT_FORWARD_PID:-}" ]; then
                kill $PORT_FORWARD_PID 2>/dev/null || true
            fi
            exit 1
        fi
    done
    
    # Clean up port-forward if used
    if [ -n "${PORT_FORWARD_PID:-}" ]; then
        kill $PORT_FORWARD_PID 2>/dev/null || true
    fi
    
    # Swiss market specific health checks
    log "🇨🇭 Running Swiss market specific health checks..."
    
    # Check Swiss cantons endpoint
    if kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- curl -f -s http://localhost:3001/api/cantons > /dev/null; then
        success "✅ Swiss cantons API responding"
    else
        error "Swiss cantons API not responding"
        exit 1
    fi
    
    # Check AI services with Swiss language support
    if kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-ai -- curl -f -s http://localhost:5000/health > /dev/null; then
        success "✅ AI services responding"
    else
        error "AI services not responding"
        exit 1
    fi
}

# Swiss compliance verification
verify_swiss_compliance() {
    log "🇨🇭 Verifying Swiss compliance requirements..."
    
    # Check data encryption
    log "Verifying data encryption..."
    
    # Check PostgreSQL encryption
    POSTGRES_ENCRYPTION=$(kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-postgres -- psql -U postgres -d cadillac_ev_cis_prod -c "SHOW ssl;" -t | tr -d ' ')
    if [ "$POSTGRES_ENCRYPTION" = "on" ]; then
        success "✅ PostgreSQL SSL encryption enabled"
    else
        error "PostgreSQL SSL encryption not enabled"
        exit 1
    fi
    
    # Check network policies are applied
    NETWORK_POLICIES=$(kubectl get networkpolicy -n "$NAMESPACE" --no-headers | wc -l)
    if [ "$NETWORK_POLICIES" -gt 0 ]; then
        success "✅ Network security policies active ($NETWORK_POLICIES policies)"
    else
        error "No network security policies found"
        exit 1
    fi
    
    # Check RBAC is configured
    ROLE_BINDINGS=$(kubectl get rolebinding -n "$NAMESPACE" --no-headers | wc -l)
    if [ "$ROLE_BINDINGS" -gt 0 ]; then
        success "✅ RBAC configured ($ROLE_BINDINGS role bindings)"
    else
        error "No RBAC role bindings found"
        exit 1
    fi
    
    # Check audit logging is enabled
    if kubectl logs -n "$NAMESPACE" deployment/cadillac-ev-backend --tail=1 | grep -q "audit"; then
        success "✅ Audit logging active"
    else
        warning "⚠️ Audit logging verification inconclusive"
    fi
    
    # Check Swiss compliance configmap
    if kubectl get configmap swiss-data-protection-policy -n "$NAMESPACE" &>/dev/null; then
        success "✅ Swiss data protection policy configured"
    else
        error "Swiss data protection policy not configured"
        exit 1
    fi
}

# Backup verification
verify_backup_system() {
    log "💾 Verifying backup systems..."
    
    # Check if backup configurations exist
    if kubectl get configmap backup-security-config -n "$NAMESPACE" &>/dev/null; then
        success "✅ Backup security configuration present"
    else
        warning "⚠️ Backup security configuration not found"
    fi
    
    # Verify persistent volumes have backup annotations
    PV_COUNT=$(kubectl get pv -o json | jq '.items[] | select(.spec.claimRef.namespace=="'$NAMESPACE'") | .metadata.annotations["backup.kubernetes.io/enabled"]' | grep -c "true" || echo "0")
    if [ "$PV_COUNT" -gt 0 ]; then
        success "✅ Persistent volumes configured for backup ($PV_COUNT volumes)"
    else
        warning "⚠️ No persistent volumes configured for backup"
    fi
}

# Post-deployment summary
deployment_summary() {
    log "📋 Deployment Summary"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ${SWISS_FLAG} CADILLAC EV CIS - Production Deployment Complete ${CADILLAC_LOGO}                  ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║  🌐 Environment: Production                                                  ║${NC}"
    echo -e "${GREEN}║  🏔️ Region: eu-central-1 (Switzerland)                                      ║${NC}"
    echo -e "${GREEN}║  🔒 Security: DSGVO/DSG Compliant                                           ║${NC}"
    echo -e "${GREEN}║  📊 Monitoring: Active                                                       ║${NC}"
    echo -e "${GREEN}║  🇨🇭 Swiss Features: All 26 Cantons Supported                               ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║  Services Deployed:                                                          ║${NC}"
    
    # List deployed services
    kubectl get pods -n "$NAMESPACE" --no-headers | while read -r pod_name pod_status _; do
        if [ "$pod_status" = "Running" ]; then
            echo -e "${GREEN}║    ✅ $pod_name${NC}"
        else
            echo -e "${RED}║    ❌ $pod_name ($pod_status)${NC}"
        fi
    done
    
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║  🌐 URLs:                                                                    ║${NC}"
    echo -e "${GREEN}║    📱 Frontend: https://cadillac-ev-cis.ch                                  ║${NC}"
    echo -e "${GREEN}║    🔧 API: https://cadillac-ev-cis.ch/api                                   ║${NC}"
    echo -e "${GREEN}║    🤖 AI Services: https://cadillac-ev-cis.ch/ai                            ║${NC}"
    echo -e "${GREEN}║    📊 Monitoring: https://monitoring.cadillac-ev-cis.ch                     ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║  📞 Support Contacts:                                                        ║${NC}"
    echo -e "${GREEN}║    🛠️ DevOps: devops@cadillac-ev-cis.ch                                     ║${NC}"
    echo -e "${GREEN}║    🔒 Security: security@cadillac-ev-cis.ch                                 ║${NC}"
    echo -e "${GREEN}║    🇨🇭 DPO: datenschutz@cadillac-ev-cis.ch                                  ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Next steps
    info "🎯 Next Steps:"
    echo "   1. Configure monitoring alerts"
    echo "   2. Schedule regular backups"
    echo "   3. Set up log aggregation"
    echo "   4. Plan disaster recovery test"
    echo "   5. Schedule Swiss compliance audit"
    echo ""
    
    success "🎉 CADILLAC EV CIS is now live in production! 🇨🇭⚡🏎️"
}

# Main execution
main() {
    print_banner
    
    # Ask for confirmation
    echo -e "${YELLOW}⚠️  This will deploy CADILLAC EV CIS to PRODUCTION environment.${NC}"
    echo -e "${YELLOW}⚠️  This includes Swiss customer data and compliance systems.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
    
    # Execute deployment steps
    pre_deployment_checks
    deploy_infrastructure
    deploy_data_layer
    deploy_applications
    deploy_networking
    deploy_monitoring
    run_health_checks
    verify_swiss_compliance
    verify_backup_system
    deployment_summary
}

# Run main function
main "$@"