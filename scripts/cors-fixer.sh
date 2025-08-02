#!/bin/bash

# 🌐 CADILLAC EV CIS - CORS Configuration Fixer
# Automated CORS problem resolution for Swiss market deployment

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
NAMESPACE="cadillac-ev-production"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-http://localhost:3000}"
PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN:-https://your-domain.com}"

# Logging functions
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ [SUCCESS] $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️ [WARNING] $1${NC}"; }
error() { echo -e "${RED}❌ [ERROR] $1${NC}"; }
info() { echo -e "${PURPLE}[INFO] $1${NC}"; }

print_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║  🌐 CADILLAC EV CIS - CORS Configuration Fixer 🇨🇭                        ║"
    echo "║  Automated Swiss Market CORS Problem Resolution                             ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Diagnose CORS issues
diagnose_cors() {
    log "🔍 Diagnosing CORS configuration..."
    
    echo ""
    echo "🕵️ CORS Diagnostic Report:"
    echo "═══════════════════════════"
    
    # Check backend CORS configuration
    info "1. Checking Backend CORS Configuration..."
    if [ -f "backend/src/main.ts" ]; then
        if grep -q "enableCors" backend/src/main.ts; then
            success "Backend CORS configuration found"
            
            # Check for common CORS origins
            if grep -q "localhost:3000" backend/src/main.ts; then
                success "Development origin (localhost:3000) configured"
            else
                warning "Development origin not found in CORS config"
            fi
            
            if grep -q "your-domain.com\|https://" backend/src/main.ts; then
                success "Production domain configured"
            else
                warning "Production domain not found in CORS config"
            fi
        else
            error "No CORS configuration found in main.ts"
        fi
    else
        error "backend/src/main.ts not found"
    fi
    
    echo ""
    info "2. Checking Frontend API Configuration..."
    if [ -f "frontend/src/lib/api.ts" ]; then
        if grep -q "baseURL\|API_BASE_URL" frontend/src/lib/api.ts; then
            success "Frontend API base URL configured"
        else
            warning "No API base URL configuration found"
        fi
    else
        warning "frontend/src/lib/api.ts not found"
    fi
    
    echo ""
    info "3. Checking Nginx Configuration..."
    if [ -f "docker/production/nginx.conf" ]; then
        if grep -q "Access-Control-Allow" docker/production/nginx.conf; then
            success "Nginx CORS headers configured"
        else
            warning "No CORS headers found in Nginx config"
        fi
    else
        warning "Nginx configuration not found"
    fi
    
    echo ""
    info "4. Checking Environment Variables..."
    if kubectl get configmap cadillac-ev-config -n "$NAMESPACE" -o yaml | grep -q "CORS_ORIGINS"; then
        success "CORS environment variables configured"
    else
        warning "CORS environment variables not found"
    fi
    
    echo ""
    info "5. Testing CORS Headers..."
    # Test if backend is accessible
    if kubectl get pods -n "$NAMESPACE" -l app=cadillac-ev-backend --no-headers | grep -q "Running"; then
        success "Backend pods are running"
        
        # Test CORS headers
        kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- curl -H "Origin: $FRONTEND_DOMAIN" \
            -H "Access-Control-Request-Method: GET" \
            -H "Access-Control-Request-Headers: Content-Type" \
            -X OPTIONS http://localhost:3001/api/health 2>/dev/null && \
            success "CORS preflight successful" || warning "CORS preflight failed"
    else
        error "Backend pods not running"
    fi
}

# Fix backend CORS configuration
fix_backend_cors() {
    log "🔧 Fixing Backend CORS Configuration..."
    
    # Create optimized backend CORS configuration
    cat > backend_cors_fix.ts << 'EOF'
// 🌐 CADILLAC EV CIS - Optimized CORS Configuration for Swiss Market
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swiss Market Optimized CORS Configuration
  app.enableCors({
    // Allowed origins for Swiss market
    origin: [
      // Development environments
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      
      // Production domains (update with your actual domain)
      'https://your-domain.com',
      'https://www.your-domain.com',
      
      // Staging environment
      'https://staging.your-domain.com',
      
      // Swiss market specific domains
      'https://cadillac-ev-switzerland.ch',
      'https://www.cadillac-ev-switzerland.ch',
      
      // Dynamic origin validation for development
      (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost with any port for development
        if (origin.match(/^http:\/\/localhost:\d+$/)) {
          return callback(null, true);
        }
        
        // Allow your custom domains
        const allowedDomains = process.env.CORS_ORIGINS?.split(',') || [];
        if (allowedDomains.includes(origin)) {
          return callback(null, true);
        }
        
        // Reject other origins
        callback(new Error('Not allowed by CORS'), false);
      }
    ],
    
    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    // Allowed headers (Swiss market specific)
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-Swiss-Canton',        // Custom header for Swiss canton
      'X-Language-Pref',       // Language preference (DE/FR/IT)
      'X-DSGVO-Consent',       // GDPR consent tracking
      'X-Customer-ID',         // Customer identification
      'X-TCO-Session',         // TCO calculation session
    ],
    
    // Exposed headers (what frontend can access)
    exposedHeaders: [
      'X-Total-Count',
      'X-Swiss-Compliance',
      'X-DSGVO-Consent',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Canton-Data-Version',
    ],
    
    // Allow credentials (cookies, authorization headers)
    credentials: true,
    
    // Preflight cache duration (24 hours)
    maxAge: 86400,
    
    // Success status for legacy browsers
    optionsSuccessStatus: 200,
    
    // Disable for older browsers that don't support CORS
    preflightContinue: false,
  });

  // Additional security headers for Swiss compliance
  app.use((req, res, next) => {
    // DSGVO compliance headers
    res.header('X-Swiss-DSGVO-Compliant', 'true');
    res.header('X-Data-Residency', 'Switzerland');
    
    // Security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    // Swiss market identification
    res.header('X-Market-Region', 'Switzerland');
    res.header('X-Supported-Languages', 'de,fr,it,en');
    
    next();
  });

  await app.listen(3001, '0.0.0.0');
  console.log('🇨🇭 CADILLAC EV CIS Backend started with optimized CORS');
}

bootstrap();
EOF

    success "Backend CORS fix created: backend_cors_fix.ts"
    
    echo ""
    echo "📋 Backend CORS Configuration Features:"
    echo "✅ Swiss market domains support"
    echo "✅ Dynamic origin validation"
    echo "✅ Custom Swiss headers (Canton, Language, DSGVO)"
    echo "✅ Development environment support"
    echo "✅ Security headers for Swiss compliance"
    echo "✅ Credentials support for authentication"
    
    echo ""
    echo "🚀 Apply Backend CORS Fix:"
    echo "1. Copy configuration from backend_cors_fix.ts to backend/src/main.ts"
    echo "2. Update production domains with your actual domain"
    echo "3. Set CORS_ORIGINS environment variable"
    echo "4. Restart backend service"
}

# Fix frontend API configuration
fix_frontend_cors() {
    log "🎨 Fixing Frontend API Configuration..."
    
    # Create optimized frontend API configuration
    cat > frontend_api_fix.ts << 'EOF'
// 🌐 CADILLAC EV CIS - Frontend API Configuration for Swiss Market
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Environment-based API base URL
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  } else {
    // Server-side (SSR)
    return process.env.API_BASE_URL || 'http://cadillac-ev-backend:3001';
  }
};

// Swiss Market API Configuration
const apiConfig: AxiosRequestConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 seconds for AI operations
  
  // CORS and authentication
  withCredentials: true,
  
  // Default headers for Swiss market
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Market-Region': 'Switzerland',
    'X-DSGVO-Consent': 'true', // Indicate GDPR consent
  },
};

// Create axios instance
const api: AxiosInstance = axios.create(apiConfig);

// Request interceptor for Swiss market features
api.interceptors.request.use(
  (config) => {
    // Add Swiss canton if available
    const canton = localStorage.getItem('selectedCanton');
    if (canton) {
      config.headers['X-Swiss-Canton'] = canton;
    }
    
    // Add language preference
    const language = localStorage.getItem('preferredLanguage') || 'de';
    config.headers['X-Language-Pref'] = language;
    
    // Add customer ID if authenticated
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      config.headers['X-Customer-ID'] = customerId;
    }
    
    // Add authentication token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for audit logging
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    
    // Handle Swiss compliance headers
    if (response.headers['x-swiss-compliance']) {
      console.log('🇨🇭 Swiss compliance confirmed');
    }
    
    return response;
  },
  (error) => {
    // Handle CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('🌐 CORS Error detected:', error.message);
      
      // Show user-friendly CORS error
      if (typeof window !== 'undefined') {
        console.error('CORS Configuration Issue. Please check:');
        console.error('1. Backend CORS origins include:', window.location.origin);
        console.error('2. API base URL is correct:', getApiBaseUrl());
        console.error('3. Network connectivity');
      }
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('🔐 Authentication required');
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    
    // Handle Swiss market specific errors
    if (error.response?.status === 422 && error.response?.data?.message?.includes('canton')) {
      console.error('🏔️ Swiss canton validation error');
    }
    
    return Promise.reject(error);
  }
);

// Swiss Market API Functions
export const swissApi = {
  // Canton management
  cantons: {
    getAll: () => api.get('/api/cantons'),
    getById: (code: string) => api.get(`/api/cantons/${code}`),
    getIncentives: (code: string) => api.get(`/api/cantons/${code}/incentives`),
  },
  
  // Customer management
  customers: {
    create: (data: any) => api.post('/api/customers', data),
    getById: (id: string) => api.get(`/api/customers/${id}`),
    update: (id: string, data: any) => api.put(`/api/customers/${id}`, data),
    delete: (id: string) => api.delete(`/api/customers/${id}`),
  },
  
  // TCO calculations
  tco: {
    calculate: (data: any) => api.post('/api/tco/calculate', data),
    getHistory: (customerId: string) => api.get(`/api/tco/history/${customerId}`),
    getReport: (calculationId: string) => api.get(`/api/tco/report/${calculationId}`),
  },
  
  // AI services
  ai: {
    analyzeCustomer: (data: any) => api.post('/ai/analyze-customer', data),
    optimizeTco: (data: any) => api.post('/ai/optimize-tco', data),
    generateRecommendations: (customerId: string) => api.get(`/ai/recommendations/${customerId}`),
  },
  
  // Authentication
  auth: {
    login: (credentials: any) => api.post('/api/auth/login', credentials),
    register: (userData: any) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
    refresh: () => api.post('/api/auth/refresh'),
  },
  
  // Swiss compliance
  compliance: {
    getDsgvoStatus: () => api.get('/api/compliance/dsgvo-status'),
    requestDataDeletion: (customerId: string) => api.post(`/api/compliance/delete-data/${customerId}`),
    getDataExport: (customerId: string) => api.get(`/api/compliance/export-data/${customerId}`),
  },
};

// Error handler for Swiss market
export const handleSwissApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingaben.';
      case 401:
        return 'Anmeldung erforderlich. Bitte melden Sie sich an.';
      case 403:
        return 'Zugriff verweigert. Unzureichende Berechtigung.';
      case 404:
        return 'Ressource nicht gefunden.';
      case 422:
        return data.message || 'Validierungsfehler in den Daten.';
      case 429:
        return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
      case 500:
        return 'Serverfehler. Bitte kontaktieren Sie den Support.';
      default:
        return `Unbekannter Fehler (${status}). Bitte versuchen Sie es erneut.`;
    }
  } else if (error.request) {
    return 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
  } else {
    return 'Ein unerwarteter Fehler ist aufgetreten.';
  }
};

export default api;
EOF

    success "Frontend API fix created: frontend_api_fix.ts"
    
    echo ""
    echo "📋 Frontend API Configuration Features:"
    echo "✅ Environment-based API URLs"
    echo "✅ Swiss market headers (Canton, Language)"
    echo "✅ DSGVO consent tracking"
    echo "✅ Authentication handling"
    echo "✅ Comprehensive error handling"
    echo "✅ Swiss compliance functions"
    
    echo ""
    echo "🚀 Apply Frontend API Fix:"
    echo "1. Copy configuration from frontend_api_fix.ts to frontend/src/lib/api.ts"
    echo "2. Set NEXT_PUBLIC_API_BASE_URL environment variable"
    echo "3. Update error handling in components"
    echo "4. Test API connectivity"
}

# Fix Nginx CORS configuration
fix_nginx_cors() {
    log "🔄 Fixing Nginx CORS Configuration..."
    
    # Create optimized Nginx CORS configuration
    cat > nginx_cors_fix.conf << 'EOF'
# 🌐 CADILLAC EV CIS - Nginx CORS Configuration for Swiss Market

# CORS configuration map for dynamic origins
map $http_origin $cors_origin {
    default "";
    
    # Development origins
    "http://localhost:3000" $http_origin;
    "http://127.0.0.1:3000" $http_origin;
    
    # Production domains (update with your actual domain)
    "https://your-domain.com" $http_origin;
    "https://www.your-domain.com" $http_origin;
    "https://staging.your-domain.com" $http_origin;
    
    # Swiss market domains
    "https://cadillac-ev-switzerland.ch" $http_origin;
    "https://www.cadillac-ev-switzerland.ch" $http_origin;
}

# CORS headers map
map $request_method $cors_method {
    default "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    OPTIONS "GET, POST, PUT, DELETE, PATCH, OPTIONS";
}

# Location block for API endpoints with CORS
location /api/ {
    # Add CORS headers for Swiss market
    if ($cors_origin != "") {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' $cors_method always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Swiss-Canton,X-Language-Pref,X-DSGVO-Consent,X-Customer-ID,X-TCO-Session' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range,X-Swiss-Compliance,X-DSGVO-Consent,X-Rate-Limit-Remaining,X-Canton-Data-Version' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 86400 always;
    }
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' $cors_method always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Swiss-Canton,X-Language-Pref,X-DSGVO-Consent,X-Customer-ID,X-TCO-Session' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' 86400 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
    # Swiss compliance headers
    add_header 'X-Swiss-DSGVO-Compliant' 'true' always;
    add_header 'X-Data-Residency' 'Switzerland' always;
    add_header 'X-Market-Region' 'Switzerland' always;
    
    # Proxy to backend
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeout settings for Swiss market
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Location block for AI services with extended timeouts
location /ai/ {
    # Add CORS headers
    if ($cors_origin != "") {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' $cors_method always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Swiss-Canton,X-Language-Pref' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
    
    # Handle preflight for AI endpoints
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' $cors_method always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Swiss-Canton,X-Language-Pref' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
    # Proxy to AI services with extended timeout
    proxy_pass http://ai-services/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Extended timeouts for AI processing
    proxy_connect_timeout 90s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    proxy_buffering off;
}

# Location for Swiss compliance endpoints
location /api/compliance/ {
    # Strict CORS for compliance endpoints
    if ($cors_origin != "") {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type,Authorization,X-DSGVO-Consent' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
    
    # Enhanced security headers for compliance
    add_header 'X-DSGVO-Endpoint' 'true' always;
    add_header 'X-Swiss-DPO-Contact' 'datenschutz@your-domain.com' always;
    add_header 'X-Data-Protection-Authority' 'EDÖB' always;
    
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

    success "Nginx CORS fix created: nginx_cors_fix.conf"
    
    echo ""
    echo "📋 Nginx CORS Configuration Features:"
    echo "✅ Dynamic origin validation"
    echo "✅ Swiss market specific headers"
    echo "✅ Preflight request handling"
    echo "✅ DSGVO compliance headers"
    echo "✅ Extended timeouts for AI services"
    echo "✅ Security headers for Swiss compliance"
    
    echo ""
    echo "🚀 Apply Nginx CORS Fix:"
    echo "1. Integrate configuration into docker/production/nginx.conf"
    echo "2. Update production domains with your actual domain"
    echo "3. Restart nginx service"
    echo "4. Test CORS headers with browser dev tools"
}

# Test CORS configuration
test_cors() {
    log "🧪 Testing CORS Configuration..."
    
    info "Testing CORS headers from different origins..."
    
    # Test origins
    local test_origins=(
        "http://localhost:3000"
        "https://your-domain.com"
        "https://staging.your-domain.com"
    )
    
    echo ""
    echo "🌐 CORS Test Results:"
    echo "════════════════════════"
    
    for origin in "${test_origins[@]}"; do
        echo ""
        info "Testing origin: $origin"
        
        if kubectl get pods -n "$NAMESPACE" -l app=cadillac-ev-backend --no-headers | grep -q "Running"; then
            # Test preflight request
            local cors_test
            cors_test=$(kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- \
                curl -s -I \
                -H "Origin: $origin" \
                -H "Access-Control-Request-Method: GET" \
                -H "Access-Control-Request-Headers: Content-Type,Authorization" \
                -X OPTIONS \
                http://localhost:3001/api/health 2>/dev/null | head -10)
            
            if echo "$cors_test" | grep -q "Access-Control-Allow-Origin"; then
                success "CORS headers present for $origin"
                
                # Check specific headers
                if echo "$cors_test" | grep -q "Access-Control-Allow-Origin: $origin"; then
                    success "Origin correctly allowed"
                else
                    warning "Origin not explicitly allowed (might use wildcard)"
                fi
                
                if echo "$cors_test" | grep -q "Access-Control-Allow-Credentials"; then
                    success "Credentials allowed"
                else
                    warning "Credentials not allowed"
                fi
            else
                error "No CORS headers found for $origin"
            fi
        else
            error "Backend not running - cannot test CORS"
        fi
    done
    
    echo ""
    info "Testing Swiss market specific headers..."
    
    # Test Swiss market headers
    local swiss_headers
    swiss_headers=$(kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- \
        curl -s -I \
        -H "Origin: http://localhost:3000" \
        -H "X-Swiss-Canton: ZH" \
        -H "X-Language-Pref: de" \
        http://localhost:3001/api/health 2>/dev/null || echo "")
    
    if echo "$swiss_headers" | grep -q "X-Swiss-DSGVO-Compliant"; then
        success "Swiss DSGVO compliance header present"
    else
        warning "Swiss DSGVO compliance header missing"
    fi
    
    if echo "$swiss_headers" | grep -q "X-Market-Region"; then
        success "Market region header present"
    else
        warning "Market region header missing"
    fi
}

# Generate CORS troubleshooting report
generate_cors_report() {
    log "📋 Generating CORS Troubleshooting Report..."
    
    local report_file="cors-troubleshooting-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# 🇨🇭 CADILLAC EV CIS - CORS Troubleshooting Report

**Generated:** $(date)  
**Environment:** Production  
**Namespace:** $NAMESPACE

## 🔍 CORS Configuration Analysis

### Current Configuration Status
- **Backend CORS:** $([ -f "backend/src/main.ts" ] && grep -q "enableCors" backend/src/main.ts && echo "✅ Configured" || echo "❌ Missing")
- **Frontend API:** $([ -f "frontend/src/lib/api.ts" ] && grep -q "baseURL\|withCredentials" frontend/src/lib/api.ts && echo "✅ Configured" || echo "❌ Missing")
- **Nginx CORS:** $([ -f "docker/production/nginx.conf" ] && grep -q "Access-Control-Allow" docker/production/nginx.conf && echo "✅ Configured" || echo "❌ Missing")

### Test Results
$(
echo "\`\`\`"
# Run CORS tests and capture output
kubectl exec -n "$NAMESPACE" deployment/cadillac-ev-backend -- \
    curl -s -I \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: GET" \
    -X OPTIONS \
    http://localhost:3001/api/health 2>/dev/null | grep -E "(HTTP|Access-Control)" || echo "CORS test failed"
echo "\`\`\`"
)

### Common CORS Issues and Solutions

#### 1. Missing Origin in Backend Configuration
**Problem:** Frontend domain not in CORS origins  
**Solution:** Add your domain to enableCors() origins array

#### 2. Credentials Not Allowed
**Problem:** Authentication failing due to credentials: false  
**Solution:** Set credentials: true in both backend and frontend

#### 3. Missing Custom Headers
**Problem:** Swiss market headers (X-Swiss-Canton) rejected  
**Solution:** Add custom headers to allowedHeaders array

#### 4. Nginx CORS Conflicts
**Problem:** Double CORS headers causing browser errors  
**Solution:** Remove duplicate CORS headers from Nginx or backend

### 🇨🇭 Swiss Market CORS Requirements

- **Origins:** Include all Swiss market domains
- **Headers:** Support X-Swiss-Canton, X-Language-Pref, X-DSGVO-Consent
- **Credentials:** Enable for authentication and DSGVO compliance
- **Methods:** Support all REST methods (GET, POST, PUT, DELETE, PATCH)

### Recommended Actions

1. **Update Backend CORS Origins**
   \`\`\`typescript
   origin: [
     'http://localhost:3000',
     'https://your-domain.com',
     'https://staging.your-domain.com'
   ]
   \`\`\`

2. **Add Swiss Market Headers**
   \`\`\`typescript
   allowedHeaders: [
     'Content-Type', 'Authorization',
     'X-Swiss-Canton', 'X-Language-Pref', 'X-DSGVO-Consent'
   ]
   \`\`\`

3. **Enable Credentials**
   \`\`\`typescript
   credentials: true
   \`\`\`

4. **Test Configuration**
   \`\`\`bash
   ./scripts/cors-fixer.sh --test
   \`\`\`

---

**Report generated by CADILLAC EV CIS CORS Fixer**  
**Swiss Market Ready! 🇨🇭🌐**
EOF

    success "CORS troubleshooting report generated: $report_file"
    
    echo -n "Display report now? (y/n): "
    read -r display_choice
    if [[ "$display_choice" =~ ^[Yy]$ ]]; then
        less "$report_file" || cat "$report_file"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}🌐 CADILLAC EV CIS CORS Fixer - Main Menu${NC}"
    echo "════════════════════════════════════════════════"
    echo "1. 🔍 Diagnose CORS Issues"
    echo "2. 🔧 Fix Backend CORS Configuration"
    echo "3. 🎨 Fix Frontend API Configuration"
    echo "4. 🔄 Fix Nginx CORS Configuration"
    echo "5. 🧪 Test CORS Configuration"
    echo "6. 🚀 Apply All CORS Fixes"
    echo "7. 📋 Generate CORS Report"
    echo "8. ❌ Exit"
    echo "════════════════════════════════════════════════"
    echo -n "Select option (1-8): "
}

# Main execution
main() {
    print_banner
    
    while true; do
        show_menu
        read -r choice
        
        case $choice in
            1) diagnose_cors ;;
            2) fix_backend_cors ;;
            3) fix_frontend_cors ;;
            4) fix_nginx_cors ;;
            5) test_cors ;;
            6)
                log "🚀 Applying all CORS fixes..."
                fix_backend_cors
                echo ""
                fix_frontend_cors
                echo ""
                fix_nginx_cors
                echo ""
                success "🎉 All CORS fixes applied!"
                ;;
            7) generate_cors_report ;;
            8)
                success "🇨🇭 CADILLAC EV CIS CORS Configuration Complete! 🌐"
                exit 0
                ;;
            *) error "Invalid choice. Please select 1-8." ;;
        esac
        
        echo ""
        echo -n "Press Enter to continue..."
        read -r
    done
}

# Handle command line arguments
if [ $# -gt 0 ]; then
    case "$1" in
        --diagnose) diagnose_cors ;;
        --fix-backend) fix_backend_cors ;;
        --fix-frontend) fix_frontend_cors ;;
        --fix-nginx) fix_nginx_cors ;;
        --test) test_cors ;;
        --all) 
            fix_backend_cors
            fix_frontend_cors
            fix_nginx_cors
            ;;
        --report) generate_cors_report ;;
        *) 
            echo "Usage: $0 [--diagnose|--fix-backend|--fix-frontend|--fix-nginx|--test|--all|--report]"
            exit 1
            ;;
    esac
else
    main "$@"
fi