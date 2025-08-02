# CADILLAC EV CIS - Setup Guide

## 🚗 Übersicht

Das CADILLAC EV Customer Intelligence System ist eine umfassende Lösung für den Verkauf von CADILLAC Elektrofahrzeugen in der Schweiz. Das System besteht aus mehreren Services:

- **Frontend**: Next.js 14 mit TypeScript und Tailwind CSS
- **Backend**: NestJS mit PostgreSQL und GraphQL
- **AI Services**: Flask-basierte KI-Services mit OpenAI, DeepSeek und Gemini
- **Database**: PostgreSQL mit Redis Cache
- **Firebase**: Hosting und Firestore für Produktion

## 📋 Systemanforderungen

### Mindestanforderungen
- **Node.js**: 18.0.0 oder höher
- **npm**: 9.0.0 oder höher
- **Python**: 3.8 oder höher
- **PostgreSQL**: 15 oder höher
- **Redis**: 7.0 oder höher
- **Docker**: 20.10 oder höher (optional)

### Empfohlene Anforderungen
- **RAM**: 8GB oder mehr
- **Speicher**: 10GB freier Speicherplatz
- **CPU**: 4 Kerne oder mehr

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/jtsky200/superagent.git
cd cadillac-ev-cis
```

### 2. Automatisches Setup (Empfohlen)
```bash
# Setup-Script ausführbar machen
chmod +x scripts/setup-dev.sh

# Automatisches Setup ausführen
./scripts/setup-dev.sh
```

### 3. Manuelles Setup

#### Dependencies installieren
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..

# AI Services dependencies
cd ai-services
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cd ..
```

#### Environment konfigurieren
```bash
# Hauptkonfiguration
cp env.example .env
# Bearbeite .env mit deinen API-Keys

# Frontend-Konfiguration
cp frontend/.env.example frontend/.env.local
# Bearbeite frontend/.env.local mit deinen Firebase-Keys
```

#### Database setup
```bash
# PostgreSQL starten
# (Installation und Start je nach Betriebssystem)

# Database erstellen
npm run db:init

# Migrationen ausführen
npm run db:migrate

# Sample-Daten laden
npm run db:seed
```

## 🔧 Services starten

### Alle Services gleichzeitig
```bash
npm run dev
```

### Einzelne Services
```bash
# Frontend nur
npm run dev:frontend

# Backend nur
npm run dev:backend

# AI Services nur
npm run dev:ai

# Firebase Emulatoren
npm run dev:firebase
```

### Docker (Alternative)
```bash
# Alle Services in Docker starten
npm run docker:up

# Services stoppen
npm run docker:down

# Logs anzeigen
npm run docker:logs
```

## 🌐 Zugriff auf Services

Nach dem Start sind folgende Services verfügbar:

| Service | URL | Beschreibung |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Next.js Web-App |
| Backend API | http://localhost:3001 | NestJS REST/GraphQL API |
| AI Services | http://localhost:5000 | Flask AI Services |
| pgAdmin | http://localhost:5050 | Database Management |
| Redis Commander | http://localhost:8081 | Redis Management |

## 🔑 API-Keys konfigurieren

### Erforderliche API-Keys

#### AI Services
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-your-key
OPENAI_ASSISTANT_ID=asst_your-id

# DeepSeek
DEEPSEEK_API_KEY=sk-your-key

# Google Gemini
GEMINI_API_KEY=AIza-your-key

# Web Search
SERPER_API_KEY=your-key
FIRECRAWL_API_KEY=fc-your-key

# Vector Database
QDRANT_URL=https://your-instance.cloud.qdrant.io
QDRANT_API_KEY=your-key
```

#### Schweizer APIs
```bash
# Handelsregister
HANDELSREGISTER_API_KEY=your-key

# ZEK/CRIF
ZEK_API_KEY=your-key
CRIF_API_KEY=your-key

# Moneyhouse
MONEYHOUSE_API_KEY=your-key
```

#### Firebase
```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 🗄️ Database Management

### PostgreSQL Setup
```bash
# Database erstellen
npm run db:init

# Migrationen ausführen
npm run db:migrate

# Database zurücksetzen
npm run db:reset

# Backup erstellen
npm run db:backup

# Backup wiederherstellen
npm run db:restore backup_file.sql
```

### Redis Setup
```bash
# Redis starten (Linux/Mac)
redis-server

# Redis starten (Windows)
redis-server.exe

# Redis testen
redis-cli ping
```

## 🧪 Testing

### Alle Tests ausführen
```bash
npm run test
```

### Einzelne Test-Suites
```bash
# Frontend Tests
npm run test:frontend

# Backend Tests
npm run test:backend

# AI Services Tests
npm run test:ai
```

## 🔍 Health Check

### Automatischer Health Check
```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

### Manueller Health Check
```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:3001/health

# AI Services
curl http://localhost:5000/health

# Database
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

## 🐳 Docker Setup

### Docker Compose verwenden
```bash
# Services starten
docker-compose up -d

# Services stoppen
docker-compose down

# Logs anzeigen
docker-compose logs -f

# Services neu starten
docker-compose restart
```

### Einzelne Container
```bash
# PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=cadillac_ev_cis \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

## 📊 Monitoring

### Logs anzeigen
```bash
# Alle Logs
npm run logs:frontend
npm run logs:backend
npm run logs:ai

# Docker Logs
npm run docker:logs
```

### Performance Monitoring
```bash
# System-Ressourcen
npm run check:health

# Service-Status
curl http://localhost:3001/health
curl http://localhost:5000/health
```

## 🚀 Deployment

### Firebase Deployment
```bash
# Alle Services deployen
npm run firebase:deploy

# Nur Hosting
npm run firebase:deploy:hosting

# Nur Functions
npm run firebase:deploy:functions

# Nur Firestore
npm run firebase:deploy:firestore
```

### Production Build
```bash
# Vollständiger Build
npm run build:full

# Production Setup
npm run setup:prod
```

## 🛠️ Troubleshooting

### Häufige Probleme

#### Port bereits in Verwendung
```bash
# Ports überprüfen
netstat -tuln | grep :3000
netstat -tuln | grep :3001
netstat -tuln | grep :5000

# Prozesse beenden
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:5000)
```

#### Database-Verbindung fehlschlägt
```bash
# PostgreSQL Status prüfen
pg_isready -h localhost -p 5432

# Database neu erstellen
npm run db:reset
```

#### Dependencies Probleme
```bash
# Node modules löschen und neu installieren
npm run clean:node_modules
npm run install:all
```

#### Python Virtual Environment
```bash
# Virtual Environment neu erstellen
cd ai-services
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Logs analysieren
```bash
# Frontend Logs
tail -f frontend/logs/frontend.log

# Backend Logs
tail -f backend/logs/backend.log

# AI Services Logs
tail -f ai-services/logs/ai.log
```

## 📚 Nützliche Befehle

### Development
```bash
# Alle Services starten
npm run dev

# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend

# Nur AI Services
npm run dev:ai
```

### Build & Test
```bash
# Vollständiger Build
npm run build:full

# Tests ausführen
npm run test

# Linting
npm run lint
npm run lint:fix
```

### Database
```bash
# Setup
npm run db:setup

# Migrationen
npm run db:migrate

# Seed-Daten
npm run db:seed
```

### Docker
```bash
# Starten
npm run docker:up

# Stoppen
npm run docker:down

# Logs
npm run docker:logs
```

### Health Check
```bash
# Automatisch
./scripts/health-check.sh

# Manuell
npm run check:health
```

## 📞 Support

Bei Problemen:

1. **Health Check ausführen**: `./scripts/health-check.sh`
2. **Logs überprüfen**: Siehe Logs-Sektion
3. **Issues erstellen**: GitHub Repository
4. **Dokumentation**: Siehe `/docs` Ordner

## 🔄 Updates

### System aktualisieren
```bash
# Git Pull
git pull origin main

# Dependencies aktualisieren
npm run install:all

# Database Migrationen
npm run db:migrate

# Services neu starten
npm run dev
```

---

**CADILLAC EV CIS** - Customer Intelligence System für die Schweiz 🇨🇭 