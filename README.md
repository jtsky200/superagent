# 🚗 CADILLAC EV Customer Intelligence System Schweiz

Ein umfassendes Kundenintelligenz-System für den Verkauf von CADILLAC Elektrofahrzeugen in der Schweiz, powered by Firebase.

## 🎯 Projektübersicht

Das CADILLAC EV CIS nutzt minimale Kundendaten (E-Mail, Telefonnummer) für umfangreiche Kundenprofile und integriert Schweizer Finanz-, Fahrzeug- und Unternehmensdaten mit Firebase Firestore als Backend-Datenbank.

### Schlüsselfunktionen

- ✅ Automatisierte Kundenrecherche mit minimalen Eingabedaten
- ✅ Integration von Schweizer Handelsregisterdaten
- ✅ Schweiz-spezifische Finanzdatenintegration (ZEK, CEFIX)
- ✅ TCO-Berechnung für CADILLAC EV-Modelle
- ✅ KI-gestützte Analyse und Verkaufsstrategie-Generierung
- ✅ Firebase Firestore für skalierbare Datenbank
- ✅ Firebase Functions für Serverless Backend
- ✅ Firebase Hosting für Frontend-Deployment
- ✅ Monochromes Design (schwarz-weiss) mit professionellen Icons

## 🎯 Projektübersicht

Das CADILLAC EV CIS nutzt minimale Kundendaten (E-Mail, Telefonnummer) für umfangreiche Kundenprofile und integriert Schweizer Finanz-, Fahrzeug- und Unternehmensdaten.

### Schlüsselfunktionen

- ✅ Automatisierte Kundenrecherche mit minimalen Eingabedaten
- ✅ Integration von Schweizer Handelsregisterdaten
- ✅ Schweiz-spezifische Finanzdatenintegration (ZEK, CEFIX)
- ✅ TCO-Berechnung für CADILLAC EV-Modelle
- ✅ KI-gestützte Analyse und Verkaufsstrategie-Generierung
- ✅ Monochromes Design (schwarz-weiss) mit professionellen Icons

## 🏗️ Systemarchitektur

```
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Web-Frontend    │ │ Mobile-Frontend  │ │ Admin-Portal     │
│ (Next.js 14)    │ │ (React Native)   │ │ (Next.js)        │
└────────┬────────┘ └─────────┬────────┘ └─────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ API Gateway & Load Balancer                                         │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Microservices (NestJS + Python)                                      │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐       │
│ │ Auth Service│ │Customer Intel│ │ TCO Calculator│ │ AI Service│       │
│ └─────────────┘ └──────────────┘ └──────────────┘ └──────────┘       │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ PostgreSQL   │ │ Redis Cache  │ │ File Storage │
            │ (Primary DB) │ │ (Sessions)   │ │ (Documents)  │
            └──────────────┘ └──────────────┘ └──────────────┘
```

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Next.js 14 mit App Router
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS (monochromes Design)
- **Icons**: Font Awesome Pro + Custom SVG
- **Charts**: Chart.js + D3.js
- **State Management**: Zustand
- **Deployment**: Firebase Hosting

### Backend
- **Framework**: Firebase Functions (Node.js)
- **APIs**: REST APIs
- **Authentifizierung**: Firebase Auth
- **Validation**: Joi/Yup
- **Documentation**: Swagger/OpenAPI

### KI-Services
- **Framework**: Firebase Functions + OpenAI
- **AI APIs**: OpenAI GPT-4, DeepSeek, Google Gemini
- **Data Processing**: Firebase Functions

### Datenbanken
- **Primary**: Firebase Firestore
- **Cache**: Firebase Firestore Cache
- **Search**: Firestore Queries

### DevOps
- **Hosting**: Firebase Hosting
- **Functions**: Firebase Functions
- **Database**: Firebase Firestore
- **CI/CD**: GitHub Actions + Firebase CLI
- **Monitoring**: Firebase Console

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Firebase Project (erstellen unter [Firebase Console](https://console.firebase.google.com/))

### 1. Repository klonen

```bash
git clone https://github.com/your-org/cadillac-ev-cis.git
cd cadillac-ev-cis
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebung konfigurieren

```bash
cp .env.example .env.local
# Bearbeiten Sie .env.local mit Ihren Konfigurationen
```

### 4. Firebase konfigurieren

```bash
# Firebase login
firebase login

# Firebase project initialisieren
firebase use --add

# Environment-Variablen setzen
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
```

### 5. Entwicklungsserver starten

```bash
# Frontend Development
cd frontend && npm run dev

# Firebase Emulators (für lokale Entwicklung)
firebase emulators:start
```

Die Anwendung ist verfügbar unter:
- Frontend: http://localhost:3000
- Firebase Functions: http://localhost:5001
- Firebase Emulator UI: http://localhost:4000

## 📁 Projektstruktur

```
cadillac-ev-cis/
├── .devcontainer/          # GitHub Codespaces Konfiguration
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router Pages
│   │   ├── components/    # React Komponenten
│   │   ├── lib/          # Utilities & Konfiguration
│   │   └── types/        # TypeScript Definitionen
├── backend/               # NestJS Backend
│   ├── src/
│   │   ├── modules/      # Feature Module
│   │   ├── common/       # Shared Code
│   │   └── database/     # DB Konfiguration
├── ai-services/           # Python KI-Services
│   ├── src/
│   │   ├── services/     # ML Services
│   │   ├── models/       # AI Models
│   │   └── utils/        # Utilities
├── database/              # DB Schemas & Migrations
├── docker/                # Docker Konfigurationen
├── docs/                  # Dokumentation
└── shared/                # Geteilte TypeScript Types
```

## 🇨🇭 Schweizer Datenintegration

### Unterstützte APIs

- **Handelsregister**: Eidgenössisches Amt für das Handelsregister
- **ZEK**: Zentralstelle für Kreditinformation
- **CRIF**: Kreditrisikoinformationen
- **ASTRA**: Bundesamt für Strassen (Fahrzeugdaten)
- **SFOE**: Bundesamt für Energie (Energiedaten)
- **ElCom**: Strompreise nach Kantonen

### Kantonale Daten

- Motorfahrzeugsteuern (alle 26 Kantone)
- Versicherungskosten
- Stromtarife
- Zulassungsgebühren

## 🚗 CADILLAC EV Modelle

| Modell | Batterie | Reichweite | Leistung | Preis (CHF) |
|--------|----------|------------|----------|-------------|
| LYRIQ Luxury | 100 kWh | 502 km | 250 kW | 82'900 |
| LYRIQ Premium | 100 kWh | 500 km | 250 kW | 89'900 |
| LYRIQ Sport | 100 kWh | 495 km | 280 kW | 96'900 |
| CELESTIQ | 111 kWh | 480 km | 447 kW | 340'000 |
| OPTIQ | 85 kWh | 480 km | 220 kW | 72'900 |
| ESCALADE IQ | 200 kWh | 724 km | 560 kW | 179'000 |

## 🎨 Design System

Das System verwendet ein streng monochromes (schwarz-weiss) Design mit professioneller Ästhetik.

### Farbpalette

- **Primary**: #000000 (Schwarz) bis #ffffff (Weiss)
- **Graustufen**: 10 Abstufungen für optimale Kontraste
- **Akzente**: Minimale Verwendung für Status-Indikatoren

### Typografie

- **Font Family**: Helvetica, Arial, sans-serif
- **Gewichte**: Normal (400), Medium (500), Semibold (600), Bold (700)
- **Größen**: 0.75rem bis 3rem (responsive)

## 📊 TCO-Berechnung

Die Total Cost of Ownership wird mit Schweiz-spezifischen Parametern berechnet:

### Kostenkomponenten

- **Einmalige Kosten**: Kaufpreis, MwSt (7.7%), Zulassung
- **Jährliche Kosten**: Steuern, Versicherung, Wartung
- **Energiekosten**: Stromverbrauch, Ladekosten
- **Wertverlust**: Marktbasierte Restwertberechnung

### Kantonale Unterschiede

- Motorfahrzeugsteuern variieren stark
- E-Fahrzeug Rabatte (0-100% je nach Kanton)
- Strompreise nach Region

## 🔐 Sicherheit

- **Authentifizierung**: JWT + OAuth2
- **Autorisierung**: RBAC (Role-Based Access Control)
- **Datenschutz**: DSGVO-konform
- **API Security**: Rate Limiting, Input Validation
- **Verschlüsselung**: TLS 1.3, AES-256

## 🧪 Testing

```bash
# Alle Tests ausführen
npm test

# Frontend Tests
npm run test:frontend

# Backend Tests
npm run test:backend

# E2E Tests
npm run test:e2e
```

## 📈 Monitoring & Logging

- **Application Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Logging**: Winston + ELK Stack
- **Performance**: New Relic

## 🚀 Deployment

### Entwicklung

```bash
npm run dev
```

### Staging

```bash
npm run build
npm run start
```

### Produktion

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 API Dokumentation

- **REST API**: http://localhost:3001/api/docs
- **GraphQL**: http://localhost:3001/graphql
- **AI Services**: http://localhost:8000/docs

## 🤝 Contributing

1. Fork das Repository
2. Erstellen Sie einen Feature Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie zum Branch
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt ist proprietär und gehört CADILLAC Switzerland.

## 📞 Support

Bei Fragen oder Problemen wenden Sie sich an:
- **Email**: dev-team@cadillac.ch
- **Slack**: #cadillac-ev-cis
- **Jira**: CADILLAC-EV Project

---

**Made with ❤️ for CADILLAC Switzerland**

