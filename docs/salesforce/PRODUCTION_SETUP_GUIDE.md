# 🏢 Salesforce Production Setup - Schritt-für-Schritt Anleitung

## 🎯 **Produktions-Konfiguration für Cadillac EV CIS**

Sie haben recht - für die echte Nutzung brauchen Sie Ihre **Salesforce Production-Umgebung**, nicht die Sandbox!

---

## 📋 **Schritt 1: Salesforce Production Connected App erstellen**

### **1.1 In Salesforce Production anmelden**
```
🌐 URL: https://login.salesforce.com
👤 Ihre Salesforce Production Credentials verwenden
```

### **1.2 Connected App erstellen**
1. **Setup aufrufen**
   - Klicken Sie auf das Zahnrad-Symbol (⚙️) oben rechts
   - Wählen Sie "Setup"

2. **App Manager öffnen**
   - Im Quick Find suchen Sie nach: "App Manager"
   - Klicken Sie auf "App Manager"

3. **Neue Connected App erstellen**
   - Klicken Sie auf "New Connected App"

### **1.3 Connected App konfigurieren**

**Basic Information:**
```
Connected App Name: Cadillac EV Customer Intelligence System
API Name: Cadillac_EV_CIS_Production
Contact Email: [Ihre E-Mail]
Description: Production CRM Integration for Cadillac EV Switzerland
```

**API (Enable OAuth Settings):**
```
✅ Enable OAuth Settings

Callback URL: 
http://localhost:3000/api/salesforce/oauth/callback

Selected OAuth Scopes:
✅ Manage user data via APIs (api)
✅ Perform requests at any time (refresh_token, offline_access)  
✅ Access the identity URL service (id, profile, email, address, phone)
✅ Access and manage your data (full)
```

**Advanced Settings:**
```
✅ Enable for Device Flow
✅ Require Secret for Web Server Flow
✅ Require Secret for Refresh Token Flow
IP Relaxation: Relax IP restrictions (für Development)
```

### **1.4 Consumer Key & Secret erhalten**
Nach dem Speichern:
1. **Warten Sie 2-10 Minuten** (Salesforce braucht Zeit zur Aktivierung)
2. **Consumer Key kopieren** (das ist Ihre `SALESFORCE_CLIENT_ID`)
3. **Consumer Secret anzeigen** und kopieren (das ist Ihre `SALESFORCE_CLIENT_SECRET`)

---

## 🔧 **Schritt 2: Credentials konfigurieren**

### **2.1 .env Datei aktualisieren**
```bash
# Öffnen Sie Ihre .env Datei und fügen Sie Ihre echten Credentials ein:

SALESFORCE_CLIENT_ID=your_consumer_key_from_salesforce
SALESFORCE_CLIENT_SECRET=your_consumer_secret_from_salesforce  
SALESFORCE_ENVIRONMENT=production
```

### **2.2 Webhook Secret generieren**
```bash
# Generieren Sie einen sicheren Webhook Secret
openssl rand -base64 32
# Oder verwenden Sie: 
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Fügen Sie das Ergebnis in .env ein:
SALESFORCE_WEBHOOK_SECRET=ihr_generierter_webhook_secret
```

---

## 🚀 **Schritt 3: Integration testen**

### **3.1 Backend starten**
```bash
cd backend
npm run start:dev
```

### **3.2 Frontend starten**
```bash
cd frontend  
npm run dev
```

### **3.3 Verbindung testen**
1. **Gehen Sie zu:** http://localhost:3000/salesforce
2. **Klicken Sie auf:** "Connect to Salesforce" 
3. **Loggen Sie sich ein** mit Ihren Production Credentials
4. **Autorisieren Sie** die Anwendung

---

## 📊 **Schritt 4: Produktions-Validierung**

### **4.1 Verbindung prüfen**
Nach erfolgreicher Anmeldung sollten Sie sehen:
```
✅ Environment: production
✅ Instance URL: https://[ihre-org].my.salesforce.com  
✅ Connected User: [Ihr Name]
✅ Organization ID: [Ihre Org ID]
```

### **4.2 Test-Lead erstellen**
```bash
# Testen Sie die Integration mit einem echten Lead:
curl -X POST http://localhost:3000/api/salesforce/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "FirstName": "Test",
    "LastName": "Production",
    "Company": "Cadillac Switzerland",
    "Email": "test@cadillac-switzerland.ch",
    "Phone": "+41 44 123 45 67"
  }'
```

---

## 🔒 **Sicherheits-Überlegungen für Production**

### **4.1 IP-Beschränkungen**
Für höhere Sicherheit in Production:
```
1. Gehen Sie zu Ihrer Connected App
2. Bearbeiten Sie "IP Relaxation"  
3. Setzen Sie "Enforce IP restrictions"
4. Fügen Sie Ihre Server-IPs zur Whitelist hinzu
```

### **4.2 Benutzer-Berechtigungen**
```
1. Erstellen Sie ein "Integration User" Profil
2. Geben Sie nur nötige Berechtigungen:
   - Lead: Create, Read, Edit
   - Contact: Create, Read, Edit  
   - Case: Create, Read, Edit
   - Task/Event: Create, Read, Edit
```

### **4.3 OAuth-Policies**
```
1. Setup → OAuth and OpenID Connect Settings
2. ✅ "Allow OAuth Username-Password Flows"
3. ✅ "Allow OAuth Username-Password Flows only for whitelisted users"
```

---

## 🛠️ **Troubleshooting**

### **Problem: "invalid_client_id"**
```
Lösung:
1. Warten Sie 10 Minuten nach Connected App Erstellung
2. Prüfen Sie SALESFORCE_CLIENT_ID in .env
3. Prüfen Sie, ob Connected App aktiv ist
```

### **Problem: "redirect_uri_mismatch"** 
```
Lösung:
1. Prüfen Sie Callback URL in Connected App
2. Muss exakt sein: http://localhost:3000/api/salesforce/oauth/callback
3. Keine trailing slashes oder zusätzliche Parameter
```

### **Problem: "insufficient_scope"**
```
Lösung:
1. Fügen Sie alle erforderlichen OAuth Scopes hinzu
2. Speichern und 2-10 Minuten warten
3. Neue Autorisierung durchführen
```

---

## 💡 **Hilfe beim Login**

Falls Sie Unterstützung bei der Anmeldung brauchen, kann ich Ihnen helfen:

### **Option 1: Credentials direkt eingeben**
```bash
# Führen Sie aus:
echo "Bitte geben Sie Ihre Salesforce Production Credentials ein:"
echo "SALESFORCE_CLIENT_ID=your_consumer_key_here" 
echo "SALESFORCE_CLIENT_SECRET=your_consumer_secret_here"
echo "Dann kopieren Sie diese in Ihre .env Datei"
```

### **Option 2: Schritt-für-Schritt Terminal-Guided Setup**
Ich kann Sie durch jeden Schritt führen und Ihnen beim Konfigurieren helfen.

### **Option 3: Automatische Setup-Validierung**
```bash
# Ich kann ein Skript erstellen, das Ihre Konfiguration validiert
node scripts/validate-salesforce-production.js
```

---

## 📞 **Nächste Schritte**

Sind Sie bereit, Ihre **Salesforce Production Credentials** zu konfigurieren? 

1. **Haben Sie bereits eine Salesforce Production Org?**
2. **Haben Sie Admin-Rechte für Connected Apps?**
3. **Soll ich Sie Schritt-für-Schritt durch das Setup führen?**

Lassen Sie es mich wissen, und ich helfe Ihnen beim kompletten Setup! 🚀

---

*Produktions-Setup Guide - Version 1.0*  
*Cadillac EV CIS - Schweizer Markt Integration*