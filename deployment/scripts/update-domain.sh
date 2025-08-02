#!/bin/bash

# 🌐 CADILLAC EV CIS - Domain Update Script
# Updates all placeholder domains with your actual registered domain

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OLD_DOMAIN="cadillac-ev-cis.ch"
NEW_DOMAIN="$1"

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

# Banner
print_banner() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║  🌐 CADILLAC EV CIS - Domain Update Tool 🔧                                ║"
    echo "║  Update all configuration files with your actual domain                     ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Usage information
usage() {
    echo "Usage: $0 <your-actual-domain.com>"
    echo ""
    echo "Examples:"
    echo "  $0 cadillac-ev-switzerland.com"
    echo "  $0 mycompany.com"
    echo "  $0 ev-platform.ch"
    echo ""
    echo "This script will update all configuration files from:"
    echo "  FROM: $OLD_DOMAIN"
    echo "  TO:   <your-domain>"
    echo ""
    exit 1
}

# Validate domain format
validate_domain() {
    local domain="$1"
    
    # Basic domain validation
    if [[ ! "$domain" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        error "Invalid domain format: $domain"
        echo "Domain should be like: example.com or subdomain.example.com"
        exit 1
    fi
    
    # Check if domain contains spaces
    if [[ "$domain" =~ [[:space:]] ]]; then
        error "Domain cannot contain spaces: '$domain'"
        exit 1
    fi
    
    success "✅ Domain format valid: $domain"
}

# Check if running from correct directory
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -d "deployment" ]]; then
        error "Please run this script from the CADILLAC EV CIS root directory"
        echo "Expected files: package.json, deployment/"
        exit 1
    fi
    success "✅ Running from correct directory"
}

# Backup configuration files
backup_configs() {
    log "Creating backup of configuration files..."
    
    BACKUP_DIR="backups/domain-update-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Find and backup all config files
    find . -type f \( \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.conf" -o \
        -name "*.sh" -o \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.json" \
    \) -not -path "./node_modules/*" \
      -not -path "./.git/*" \
      -not -path "./backups/*" \
      -not -path "./*/node_modules/*" \
      -exec grep -l "$OLD_DOMAIN" {} \; | while read -r file; do
        
        # Create directory structure in backup
        backup_file="$BACKUP_DIR/$file"
        mkdir -p "$(dirname "$backup_file")"
        cp "$file" "$backup_file"
    done
    
    success "✅ Backup created: $BACKUP_DIR"
    echo "   Use this backup to restore if needed"
}

# Update domain in files
update_domain_in_files() {
    log "🔄 Updating domain from $OLD_DOMAIN to $NEW_DOMAIN..."
    
    local updated_files=0
    
    # Find and update all relevant files
    find . -type f \( \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.conf" -o \
        -name "*.sh" -o \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.json" \
    \) -not -path "./node_modules/*" \
      -not -path "./.git/*" \
      -not -path "./backups/*" \
      -not -path "./*/node_modules/*" \
      -exec grep -l "$OLD_DOMAIN" {} \; | while read -r file; do
        
        echo "  📝 Updating: $file"
        
        # Create temp file for atomic update
        temp_file=$(mktemp)
        sed "s/$OLD_DOMAIN/$NEW_DOMAIN/g" "$file" > "$temp_file"
        mv "$temp_file" "$file"
        
        ((updated_files++)) || true
    done
    
    success "✅ Domain updated in configuration files"
}

# Update email addresses
update_email_addresses() {
    log "📧 Updating email addresses..."
    
    # Update common email patterns
    local email_mappings=(
        "devops@$OLD_DOMAIN:devops@$NEW_DOMAIN"
        "security@$OLD_DOMAIN:security@$NEW_DOMAIN"
        "datenschutz@$OLD_DOMAIN:datenschutz@$NEW_DOMAIN"
        "monitoring@$OLD_DOMAIN:monitoring@$NEW_DOMAIN"
        "legal@$OLD_DOMAIN:legal@$NEW_DOMAIN"
        "audit@$OLD_DOMAIN:audit@$NEW_DOMAIN"
        "compliance@$OLD_DOMAIN:compliance@$NEW_DOMAIN"
        "backup-team@$OLD_DOMAIN:backup-team@$NEW_DOMAIN"
        "dpo@$OLD_DOMAIN:dpo@$NEW_DOMAIN"
    )
    
    for mapping in "${email_mappings[@]}"; do
        OLD_EMAIL="${mapping%:*}"
        NEW_EMAIL="${mapping#*:}"
        
        find . -type f \( \
            -name "*.yml" -o \
            -name "*.yaml" -o \
            -name "*.conf" -o \
            -name "*.sh" -o \
            -name "*.md" -o \
            -name "*.ts" -o \
            -name "*.tsx" -o \
            -name "*.js" -o \
            -name "*.json" \
        \) -not -path "./node_modules/*" \
          -not -path "./.git/*" \
          -not -path "./backups/*" \
          -exec sed -i "s/$OLD_EMAIL/$NEW_EMAIL/g" {} \; 2>/dev/null || true
    done
    
    success "✅ Email addresses updated"
}

# Verify updates
verify_updates() {
    log "🔍 Verifying updates..."
    
    local old_domain_count
    old_domain_count=$(find . -type f \( \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.conf" -o \
        -name "*.sh" -o \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.json" \
    \) -not -path "./node_modules/*" \
      -not -path "./.git/*" \
      -not -path "./backups/*" \
      -exec grep -l "$OLD_DOMAIN" {} \; | wc -l)
    
    if [ "$old_domain_count" -gt 0 ]; then
        warning "⚠️ Old domain still found in $old_domain_count files:"
        find . -type f \( \
            -name "*.yml" -o \
            -name "*.yaml" -o \
            -name "*.conf" -o \
            -name "*.sh" -o \
            -name "*.md" -o \
            -name "*.ts" -o \
            -name "*.tsx" -o \
            -name "*.js" -o \
            -name "*.json" \
        \) -not -path "./node_modules/*" \
          -not -path "./.git/*" \
          -not -path "./backups/*" \
          -exec grep -l "$OLD_DOMAIN" {} \; | head -10
        
        echo ""
        warning "Please manually check these files"
    else
        success "✅ All domain references updated successfully"
    fi
    
    # Check for new domain
    local new_domain_count
    new_domain_count=$(find . -type f \( \
        -name "*.yml" -o \
        -name "*.yaml" -o \
        -name "*.conf" -o \
        -name "*.sh" -o \
        -name "*.md" -o \
        -name "*.ts" -o \
        -name "*.tsx" -o \
        -name "*.js" -o \
        -name "*.json" \
    \) -not -path "./node_modules/*" \
      -not -path "./.git/*" \
      -not -path "./backups/*" \
      -exec grep -l "$NEW_DOMAIN" {} \; | wc -l)
    
    success "✅ New domain found in $new_domain_count files"
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 Domain Update Complete! 🌐                                             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📋 NEXT STEPS REQUIRED:${NC}"
    echo ""
    echo "1. 🏷️  Register Domain:"
    echo "   - Register: $NEW_DOMAIN"
    echo "   - Subdomains: staging.$NEW_DOMAIN, monitoring.$NEW_DOMAIN"
    echo ""
    echo "2. 🌐 Configure DNS:"
    echo "   - A Record: $NEW_DOMAIN → [LOAD_BALANCER_IP]"
    echo "   - A Record: www.$NEW_DOMAIN → [LOAD_BALANCER_IP]"
    echo "   - CNAME: staging.$NEW_DOMAIN → $NEW_DOMAIN"
    echo "   - CNAME: monitoring.$NEW_DOMAIN → $NEW_DOMAIN"
    echo ""
    echo "3. 🔒 Setup SSL Certificate:"
    echo "   - Option A: Let's Encrypt (free)"
    echo "   - Option B: Commercial SSL"
    echo "   - Certificate for: $NEW_DOMAIN, www.$NEW_DOMAIN"
    echo ""
    echo "4. 📧 Create Email Accounts:"
    echo "   - devops@$NEW_DOMAIN"
    echo "   - security@$NEW_DOMAIN"
    echo "   - datenschutz@$NEW_DOMAIN (Swiss DPO)"
    echo "   - monitoring@$NEW_DOMAIN"
    echo ""
    echo "5. 🧪 Test Configuration:"
    echo "   - Update /etc/hosts for local testing"
    echo "   - Test staging deployment"
    echo "   - Verify SSL works"
    echo ""
    echo "6. 🚀 Deploy to Production:"
    echo "   - Run: ./deployment/scripts/production-deploy.sh"
    echo "   - Monitor deployment logs"
    echo "   - Verify all services are healthy"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "   - Backup created in: backups/"
    echo "   - Test thoroughly before production"
    echo "   - Update DNS before deployment"
    echo ""
    echo -e "${GREEN}🇨🇭 Ready for Swiss Market! ⚡🏎️${NC}"
}

# Main execution
main() {
    print_banner
    
    # Check arguments
    if [ $# -ne 1 ]; then
        usage
    fi
    
    NEW_DOMAIN="$1"
    
    # Validations
    validate_domain "$NEW_DOMAIN"
    check_directory
    
    # Confirm with user
    echo -e "${YELLOW}🔄 Domain Update Configuration:${NC}"
    echo "   FROM: $OLD_DOMAIN"
    echo "   TO:   $NEW_DOMAIN"
    echo ""
    echo -e "${YELLOW}⚠️  This will update ALL configuration files!${NC}"
    echo ""
    read -p "Continue with domain update? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Domain update cancelled."
        exit 0
    fi
    
    # Execute updates
    backup_configs
    update_domain_in_files
    update_email_addresses
    verify_updates
    show_next_steps
}

# Run main function
main "$@"