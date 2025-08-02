# 🌐 CADILLAC EV CIS - Domain Setup Guide

## ⚠️ WICHTIG: Domain Registrierung erforderlich

Die in der Production-Konfiguration verwendeten Domains sind **Platzhalter** und müssen **registriert und konfiguriert** werden.

## 🎯 **1. Domain Registrierung**

### **Empfohlene Domain-Optionen:**
```
Option 1: cadillac-ev-switzerland.com
Option 2: cadillac-ev-swiss.com  
Option 3: cadillac-cis.ch (falls verfügbar)
Option 4: ev-cadillac.ch
Option 5: your-company-name.com/cadillac-ev
```

### **Swiss Domain (.ch) Registrierung:**
- **Registrar:** switch.ch, hostpoint.ch, cyon.ch
- **Anforderungen:** Swiss legal entity oder resident
- **Kosten:** ~30-50 CHF/Jahr
- **Zeit:** 1-3 Werktage

### **Alternative (.com/.net):**
- **Registrar:** Namecheap, GoDaddy, Cloudflare
- **Kosten:** ~10-15 USD/Jahr
- **Zeit:** Sofort verfügbar

## 🔧 **2. Nach Domain-Registrierung**

### **Dateien aktualisieren:**

#### A) **Nginx Configuration:**
```bash
# Datei: docker/production/nginx.conf
# Zeile 122 & 232 ändern:
server_name YOUR-ACTUAL-DOMAIN.com www.YOUR-ACTUAL-DOMAIN.com;
```

#### B) **Kubernetes Ingress:**
```bash
# Datei: deployment/k8s/production/ingress.yaml (erstellen)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cadillac-ev-ingress
  namespace: cadillac-ev-production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - YOUR-ACTUAL-DOMAIN.com
    - www.YOUR-ACTUAL-DOMAIN.com
    secretName: cadillac-ev-tls
  rules:
  - host: YOUR-ACTUAL-DOMAIN.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cadillac-ev-frontend
            port:
              number: 3000
  - host: www.YOUR-ACTUAL-DOMAIN.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cadillac-ev-frontend
            port:
              number: 3000
```

#### C) **CI/CD Pipeline URLs:**
```bash
# Datei: .github/workflows/ci-cd-pipeline.yml
# Alle cadillac-ev-cis.ch ersetzen mit YOUR-ACTUAL-DOMAIN.com
```

#### D) **Environment Variables:**
```bash
# Frontend
NEXTAUTH_URL=https://YOUR-ACTUAL-DOMAIN.com

# Backend  
CORS_ORIGIN=https://YOUR-ACTUAL-DOMAIN.com
```

## 🔒 **3. SSL/TLS Zertifikat Setup**

### **Option A: Let's Encrypt (Kostenlos)**
```bash
# Cert-Manager installieren
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# ClusterIssuer erstellen
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ssl@YOUR-ACTUAL-DOMAIN.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### **Option B: Wildcard Certificate**
```bash
# Wildcard für Subdomains
*.YOUR-ACTUAL-DOMAIN.com
```

## 🌐 **4. DNS Konfiguration**

### **DNS Records erstellen:**
```
A Record:    YOUR-ACTUAL-DOMAIN.com        → [LOAD_BALANCER_IP]
A Record:    www.YOUR-ACTUAL-DOMAIN.com    → [LOAD_BALANCER_IP]
CNAME:       staging.YOUR-ACTUAL-DOMAIN.com → YOUR-ACTUAL-DOMAIN.com
CNAME:       monitoring.YOUR-ACTUAL-DOMAIN.com → YOUR-ACTUAL-DOMAIN.com
CNAME:       docs.YOUR-ACTUAL-DOMAIN.com   → YOUR-ACTUAL-DOMAIN.com
```

### **Swiss DNS Provider:**
- **Cloudflare** (empfohlen): Kostenlos, schnell, Swiss Presence
- **AWS Route 53**: Professional, teurer
- **Domain Registrar DNS**: Einfach, basic features

## 📧 **5. Email Setup (für Alerts/Compliance)**

### **Professional Email Accounts erstellen:**
```
devops@YOUR-ACTUAL-DOMAIN.com
security@YOUR-ACTUAL-DOMAIN.com  
datenschutz@YOUR-ACTUAL-DOMAIN.com (Swiss DPO)
monitoring@YOUR-ACTUAL-DOMAIN.com
legal@YOUR-ACTUAL-DOMAIN.com
audit@YOUR-ACTUAL-DOMAIN.com
```

### **Email Provider Optionen:**
- **Google Workspace**: ~6 CHF/User/Monat
- **Microsoft 365**: ~4-12 CHF/User/Monat  
- **ProtonMail** (Swiss): ~5-8 CHF/User/Monat
- **Hostpoint** (Swiss): ~3-5 CHF/User/Monat

## 🔄 **6. Domain Update Script**

### **Automated Domain Replacement:**
```bash
#!/bin/bash
# update-domain.sh

OLD_DOMAIN="cadillac-ev-cis.ch"
NEW_DOMAIN="$1"

if [ -z "$NEW_DOMAIN" ]; then
    echo "Usage: ./update-domain.sh your-actual-domain.com"
    exit 1
fi

echo "🔄 Updating domain from $OLD_DOMAIN to $NEW_DOMAIN..."

# Update all configuration files
find . -type f \( -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name "*.sh" -o -name "*.md" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" \) -exec sed -i "s/$OLD_DOMAIN/$NEW_DOMAIN/g" {} +

echo "✅ Domain updated in all configuration files"
echo "📝 Manual steps still required:"
echo "   1. Register domain: $NEW_DOMAIN"
echo "   2. Configure DNS records"  
echo "   3. Setup SSL certificate"
echo "   4. Create email accounts"
echo "   5. Test deployment"
```

## 🚀 **7. Testing mit localhost/staging**

### **Für sofortiges Testing (Development):**
```bash
# /etc/hosts (Linux/Mac) oder C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 cadillac-ev-cis.local
127.0.0.1 staging.cadillac-ev-cis.local
```

### **Oder Ngrok für Public Testing:**
```bash
# Install ngrok
npm install -g ngrok

# Expose local frontend  
ngrok http 3000

# Use ngrok URL temporarily: https://abc123.ngrok.io
```

## 📋 **8. Production Checklist**

### **Before Deployment:**
- [ ] **Domain registriert**: YOUR-ACTUAL-DOMAIN.com
- [ ] **DNS konfiguriert**: A Records zeigen auf Load Balancer
- [ ] **SSL Zertifikat**: Let's Encrypt oder Commercial
- [ ] **Email Accounts**: Professional emails erstellt
- [ ] **Configuration Files**: Alle Platzhalter ersetzt
- [ ] **Testing**: Staging environment getestet
- [ ] **Monitoring**: Alerts auf echte Email-Adressen
- [ ] **Compliance**: Swiss DPO Email funktional

### **Swiss Market Specific:**
- [ ] **Swiss Domain (.ch)**: Falls gewünscht registriert
- [ ] **Swiss Hosting**: Server in CH/EU for data residency
- [ ] **Swiss Email**: ProtonMail oder Swiss provider
- [ ] **DSGVO Compliance**: Alle Email-Kontakte funktional
- [ ] **Legal Requirements**: Impressum, Datenschutz pages

## 💡 **9. Empfohlene Domain-Struktur**

### **Production Setup:**
```
Main:        your-domain.com
Staging:     staging.your-domain.com  
Monitoring:  monitoring.your-domain.com
Docs:        docs.your-domain.com
API:         api.your-domain.com (optional)
```

### **Swiss Market Consideration:**
- **.ch Domain** für Swiss Credibility
- **German/French/Italian** content routes
- **Canton-specific** subdomains (optional)

---

## 🎯 **Next Steps:**

1. **🏷️ Choose Domain**: Entscheiden Sie sich für einen Domain-Namen
2. **📝 Register**: Domain registrieren (Swiss .ch empfohlen)
3. **🔧 Update**: Alle Config-Dateien aktualisieren
4. **🌐 DNS**: DNS Records konfigurieren  
5. **🔒 SSL**: SSL-Zertifikat einrichten
6. **📧 Email**: Professional Email-Accounts erstellen
7. **🚀 Deploy**: Production deployment starten

**Das System ist bereit - es braucht nur echte Domains! 🇨🇭⚡🏎️**