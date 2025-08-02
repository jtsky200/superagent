#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function log(message, color = 'reset') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupSalesforceProduction() {
  log('\n🚀 SALESFORCE PRODUCTION SETUP - Cadillac EV CIS', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  log('\n📋 Was wir heute konfigurieren werden:', 'blue');
  log('   ✅ Salesforce Production Connected App');
  log('   ✅ OAuth Credentials (Client ID & Secret)');
  log('   ✅ Webhook Secret Generation');
  log('   ✅ .env Datei Update');
  log('   ✅ Integration Test');

  // Schritt 1: Salesforce Zugang prüfen
  log('\n🔐 SCHRITT 1: Salesforce Production Zugang', 'yellow');
  const hasAccess = await question('   Haben Sie Zugriff auf eine Salesforce Production Org? (j/n): ');
  
  if (hasAccess.toLowerCase() !== 'j' && hasAccess.toLowerCase() !== 'ja') {
    log('\n❌ Sie benötigen Zugriff auf eine Salesforce Production Organisation.', 'red');
    log('   Bitte kontaktieren Sie Ihren Salesforce Administrator.', 'red');
    rl.close();
    return;
  }

  // Schritt 2: Admin-Rechte prüfen
  log('\n👑 SCHRITT 2: Administrator-Rechte', 'yellow');
  const hasAdmin = await question('   Haben Sie Administrator-Rechte zum Erstellen von Connected Apps? (j/n): ');
  
  if (hasAdmin.toLowerCase() !== 'j' && hasAdmin.toLowerCase() !== 'ja') {
    log('\n⚠️  Sie benötigen Admin-Rechte oder Hilfe von einem Admin.', 'yellow');
    log('   Bitte bitten Sie einen Salesforce Admin, diese Schritte durchzuführen:', 'yellow');
    log('   1. Setup → App Manager → New Connected App', 'white');
    log('   2. OAuth Settings aktivieren', 'white');
    log('   3. Callback URL: http://localhost:3000/api/salesforce/oauth/callback', 'white');
    log('   4. OAuth Scopes: api, refresh_token, id, profile, email', 'white');
  }

  // Schritt 3: Connected App Setup Guide
  log('\n🔧 SCHRITT 3: Connected App erstellen', 'yellow');
  log('   Bitte folgen Sie diesen Schritten in Salesforce:', 'white');
  log('   1. 🌐 Gehen Sie zu: https://login.salesforce.com', 'green');
  log('   2. ⚙️  Klicken Sie auf Setup (Zahnrad oben rechts)', 'green');
  log('   3. 🔍 Suchen Sie nach "App Manager"', 'green');
  log('   4. ➕ Klicken Sie "New Connected App"', 'green');

  const readyForApp = await question('\n   Sind Sie bereit, die Connected App zu erstellen? (j/n): ');
  
  if (readyForApp.toLowerCase() === 'j' || readyForApp.toLowerCase() === 'ja') {
    log('\n📝 Connected App Konfiguration:', 'blue');
    log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('   Connected App Name: Cadillac EV Customer Intelligence System', 'white');
    log('   API Name: Cadillac_EV_CIS_Production', 'white');
    log('   Contact Email: [Ihre E-Mail]', 'white');
    log('   Description: Production CRM Integration for Cadillac EV Switzerland', 'white');
    log('   ', 'white');
    log('   ✅ Enable OAuth Settings', 'green');
    log('   Callback URL: http://localhost:3000/api/salesforce/oauth/callback', 'green');
    log('   ', 'white');
    log('   OAuth Scopes:', 'white');
    log('   ✅ Manage user data via APIs (api)', 'green');
    log('   ✅ Perform requests at any time (refresh_token, offline_access)', 'green');
    log('   ✅ Access the identity URL service (id, profile, email, address, phone)', 'green');
    log('   ✅ Access and manage your data (full)', 'green');
    log('   ', 'white');
    log('   Advanced Settings:', 'white');
    log('   ✅ Enable for Device Flow', 'green');
    log('   ✅ Require Secret for Web Server Flow', 'green');
    log('   ✅ Require Secret for Refresh Token Flow', 'green');
    log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  }

  // Schritt 4: Credentials eingeben
  log('\n🔑 SCHRITT 4: Credentials konfigurieren', 'yellow');
  log('   Nach dem Speichern der Connected App erhalten Sie:', 'white');
  log('   • Consumer Key (Client ID)', 'white');
  log('   • Consumer Secret (Client Secret)', 'white');

  const hasCredentials = await question('\n   Haben Sie die Consumer Key und Consumer Secret erhalten? (j/n): ');
  
  let clientId = '';
  let clientSecret = '';
  let webhookSecret = '';

  if (hasCredentials.toLowerCase() === 'j' || hasCredentials.toLowerCase() === 'ja') {
    clientId = await question('   📋 Bitte geben Sie die Consumer Key (Client ID) ein: ');
    clientSecret = await question('   🔐 Bitte geben Sie das Consumer Secret ein: ');
    
    if (!clientId || !clientSecret) {
      log('\n❌ Consumer Key und Secret sind erforderlich!', 'red');
      rl.close();
      return;
    }

    // Webhook Secret generieren
    webhookSecret = crypto.randomBytes(32).toString('base64');
    log(`\n🔒 Webhook Secret generiert: ${webhookSecret}`, 'green');

    // .env Datei aktualisieren
    log('\n📄 .env Datei wird aktualisiert...', 'blue');
    
    try {
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update Salesforce configuration
      envContent = envContent.replace(
        /SALESFORCE_CLIENT_ID=.*/,
        `SALESFORCE_CLIENT_ID=${clientId}`
      );
      envContent = envContent.replace(
        /SALESFORCE_CLIENT_SECRET=.*/,
        `SALESFORCE_CLIENT_SECRET=${clientSecret}`
      );
      envContent = envContent.replace(
        /SALESFORCE_WEBHOOK_SECRET=.*/,
        `SALESFORCE_WEBHOOK_SECRET=${webhookSecret}`
      );
      envContent = envContent.replace(
        /SALESFORCE_ENVIRONMENT=.*/,
        `SALESFORCE_ENVIRONMENT=production`
      );

      fs.writeFileSync(envPath, envContent);
      log('   ✅ .env Datei erfolgreich aktualisiert!', 'green');

    } catch (error) {
      log(`   ❌ Fehler beim Aktualisieren der .env Datei: ${error.message}`, 'red');
      
      // Manual backup
      log('\n📋 Manuelle Konfiguration:', 'yellow');
      log('   Bitte fügen Sie diese Werte in Ihre .env Datei ein:', 'white');
      log(`   SALESFORCE_CLIENT_ID=${clientId}`, 'white');
      log(`   SALESFORCE_CLIENT_SECRET=${clientSecret}`, 'white');
      log(`   SALESFORCE_WEBHOOK_SECRET=${webhookSecret}`, 'white');
      log(`   SALESFORCE_ENVIRONMENT=production`, 'white');
    }

    // Schritt 5: Integration testen
    log('\n🧪 SCHRITT 5: Integration testen', 'yellow');
    const testNow = await question('   Möchten Sie die Integration jetzt testen? (j/n): ');
    
    if (testNow.toLowerCase() === 'j' || testNow.toLowerCase() === 'ja') {
      log('\n🚀 Test-Anweisungen:', 'blue');
      log('   1. Starten Sie das Backend:', 'white');
      log('      cd backend && npm run start:dev', 'green');
      log('   ', 'white');
      log('   2. Starten Sie das Frontend:', 'white');
      log('      cd frontend && npm run dev', 'green');
      log('   ', 'white');
      log('   3. Öffnen Sie im Browser:', 'white');
      log('      http://localhost:3000/salesforce', 'green');
      log('   ', 'white');
      log('   4. Klicken Sie "Connect to Salesforce"', 'white');
      log('   5. Loggen Sie sich mit Ihren Production Credentials ein', 'white');
    }

  } else {
    log('\n⏳ Bitte kehren Sie zurück, nachdem Sie die Connected App erstellt haben.', 'yellow');
    log('   Führen Sie dann dieses Skript erneut aus:', 'white');
    log('   node scripts/setup-salesforce-production.js', 'green');
  }

  // Schritt 6: Nächste Schritte
  log('\n🎯 NÄCHSTE SCHRITTE:', 'magenta');
  log('   1. ✅ Salesforce Production konfiguriert', clientId ? 'green' : 'yellow');
  log('   2. ⚡ Backend & Frontend starten', 'white');
  log('   3. 🔗 Salesforce-Verbindung testen', 'white');
  log('   4. 📊 Erste Leads in Production erstellen', 'white');
  log('   5. 🔄 Bidirektionale Synchronisation validieren', 'white');

  log('\n📖 Weitere Hilfe:', 'blue');
  log('   • Vollständiger Guide: docs/salesforce/PRODUCTION_SETUP_GUIDE.md', 'white');
  log('   • API-Dokumentation: docs/salesforce/SALESFORCE_INTEGRATION_GUIDE.md', 'white');
  log('   • Troubleshooting: Bei Problemen Screenshots von Salesforce Setup senden', 'white');

  log('\n🎉 Setup abgeschlossen! Viel Erfolg mit Ihrer Salesforce Integration!', 'green');
  
  rl.close();
}

// Error handling
process.on('SIGINT', () => {
  log('\n\n👋 Setup abgebrochen. Sie können jederzeit wieder starten mit:', 'yellow');
  log('   node scripts/setup-salesforce-production.js', 'green');
  rl.close();
  process.exit(0);
});

// Start setup
setupSalesforceProduction().catch(error => {
  log(`\n❌ Fehler beim Setup: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});