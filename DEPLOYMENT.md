# 🚀 Firebase Deployment Guide

## Voraussetzungen

1. **Firebase CLI installieren**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account erstellen**
   - Gehe zu [Firebase Console](https://console.firebase.google.com/)
   - Erstelle ein neues Projekt: `cadillac-ev-cis`

3. **Firebase CLI Login**
   ```bash
   firebase login
   ```

## Projekt Setup

### 1. Firebase Projekt initialisieren

```bash
# Im Projektverzeichnis
firebase use --add
# Wähle dein Firebase Projekt aus
```

### 2. Environment Variables konfigurieren

```bash
# OpenAI API Key setzen
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"

# Weitere API Keys (optional)
firebase functions:config:set deepseek.key="YOUR_DEEPSEEK_API_KEY"
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

### 3. Frontend Environment Variables

Erstelle eine `.env.local` Datei im `frontend/` Verzeichnis:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Lokale Entwicklung

### 1. Firebase Emulators starten

```bash
# Alle Emulators
firebase emulators:start

# Nur spezifische Services
firebase emulators:start --only hosting,functions,firestore
```

### 2. Frontend Development

```bash
cd frontend
npm run dev
```

### 3. Datenbank seeden

```bash
# Firestore mit Testdaten füllen
npm run db:seed
```

## Deployment

### 1. Build erstellen

```bash
# Frontend build
cd frontend && npm run build

# Functions build
cd functions && npm run build
```

### 2. Deployment ausführen

```bash
# Alles deployen
firebase deploy

# Nur spezifische Services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

### 3. Production Environment

```bash
# Production config setzen
firebase use production

# Deploy to production
firebase deploy
```

## Firebase Services Konfiguration

### Firestore Security Rules

Die Firestore Security Rules sind bereits in `firestore.rules` konfiguriert:

- Authentifizierte Benutzer können ihre eigenen Daten lesen/schreiben
- Öffentliche Lesezugriffe für Fahrzeugdaten
- Admin-spezifische Berechtigungen für Audit-Logs

### Firebase Functions

Die Functions sind in `functions/src/index.ts` definiert:

- `/analyze-customer` - KI-gestützte Kundenanalyse
- `/calculate-tco` - TCO-Berechnung
- `/analytics/:customerId` - Kundenanalytics
- `/health` - Health Check

### Firebase Hosting

Konfiguriert in `firebase.json`:

- Statische Dateien aus `frontend/out`
- SPA Routing (alle Routes zu index.html)
- Cache-Headers für optimale Performance

## Monitoring & Logs

### Firebase Console

- **Hosting**: https://console.firebase.google.com/project/YOUR_PROJECT/hosting
- **Functions**: https://console.firebase.google.com/project/YOUR_PROJECT/functions
- **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT/firestore

### Logs anzeigen

```bash
# Functions Logs
firebase functions:log

# Emulator Logs
firebase emulators:start --only functions
```

## Troubleshooting

### Häufige Probleme

1. **Functions deployen nicht**
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

2. **Hosting funktioniert nicht**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

3. **Firestore Rules Fehler**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Environment Variables nicht verfügbar**
   ```bash
   firebase functions:config:get
   ```

### Performance Optimierung

1. **Firestore Indexes**
   - Indexes sind in `firestore.indexes.json` definiert
   - Automatisch beim ersten Deploy erstellt

2. **Functions Cold Start**
   - Functions sind auf Node.js 18 konfiguriert
   - Memory: 256MB (kann erhöht werden)

3. **Hosting Caching**
   - Statische Assets: 1 Jahr Cache
   - HTML: Kein Cache für SPA

## CI/CD Pipeline

### GitHub Actions

Erstelle `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Dependencies
      run: |
        npm ci
        cd frontend && npm ci
        cd functions && npm ci
        
    - name: Build
      run: |
        cd frontend && npm run build
        cd functions && npm run build
        
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: cadillac-ev-cis
        channelId: live
```

## Sicherheit

### API Keys

- Alle API Keys werden über Firebase Functions Config verwaltet
- Keine API Keys im Frontend Code
- Environment Variables für Frontend Firebase Config

### Firestore Security

- Authentifizierung erforderlich für sensible Daten
- Role-based Access Control
- Audit Logs für Admin-Aktionen

### CORS

- Firebase Functions haben CORS konfiguriert
- Nur erlaubte Origins können auf Functions zugreifen

## Support

Bei Problemen:

1. Firebase Console Logs prüfen
2. Emulator Logs analysieren
3. Firebase CLI Debug Mode aktivieren
4. Firebase Support kontaktieren 