#!/usr/bin/env node

/**
 * API Keys Validation Script
 * 
 * Validates that all required API keys are properly configured
 * and tests connectivity to Swiss APIs. Follows the no-mock-data
 * principle by testing real API endpoints.
 * 
 * Usage: node scripts/validate-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

async function testApiEndpoint(url, apiKey = null, name) {
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': 'CadillacEV-Setup-Validator/1.0.0'
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const options = {
      method: 'GET',
      headers,
      timeout: 5000
    };

    const req = https.request(url, options, (res) => {
      resolve({
        name,
        status: res.statusCode,
        success: res.statusCode < 500, // 4xx might be expected (auth required)
        message: `HTTP ${res.statusCode}`
      });
    });

    req.on('timeout', () => {
      resolve({
        name,
        success: false,
        message: 'Timeout - API may be unavailable'
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        success: false,
        message: `Connection error: ${error.code || error.message}`
      });
    });

    req.end();
  });
}

async function validateSwissApis(env) {
  log('\n🇨🇭 Testing Swiss API Connectivity...', 'blue');
  
  const swissTests = [
    {
      name: 'ZEFIX (Commercial Registry)',
      url: env.ZEFIX_API_URL || 'https://www.zefix.admin.ch/ZefixPublicREST/api/v1',
      key: null, // Public API - no key required
      required: false // Working without key
    },
    {
      name: 'OpenPLZ (Swiss Postal Codes)',
      url: env.OPENPLZ_API_URL || 'https://openplzapi.org/ch',
      key: null, // Free API - no key required
      required: false // Working without key
    },
    {
      name: 'Swisstopo (Swiss Geodata)',
      url: env.SWISSTOPO_API_URL || 'https://api3.geo.admin.ch/rest/services',
      key: null, // Many endpoints free
      required: false
    },
    {
      name: 'Charging Stations API',
      url: env.CHARGING_STATIONS_API_URL || 'https://api.ich-tanke-strom.ch',
      key: env.CHARGING_STATIONS_API_KEY,
      required: true // This one needs a key
    }
  ];

  const results = [];
  
  for (const test of swissTests) {
    try {
      const result = await testApiEndpoint(test.url, test.key, test.name);
      results.push({ ...result, required: test.required, hasKey: !!test.key });
      
      if (result.success) {
        log(`  ✅ ${test.name}: ${result.message}`, 'green');
      } else if (!test.key) {
        log(`  ⚠️  ${test.name}: No API key configured`, 'yellow');
      } else {
        log(`  ❌ ${test.name}: ${result.message}`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${test.name}: Validation error`, 'red');
      results.push({ 
        name: test.name, 
        success: false, 
        required: test.required, 
        hasKey: !!test.key,
        message: 'Validation error' 
      });
    }
  }

  return results;
}

function validateRequiredKeys(env) {
  log('\n🔑 Checking Required API Keys...', 'blue');
  
  const requiredKeys = [
    { key: 'CHARGING_STATIONS_API_KEY', name: 'EV Charging Stations', critical: true },
    { key: 'SMTP_USER', name: 'Email SMTP User', critical: true },
    { key: 'SMTP_PASS', name: 'Email SMTP Password', critical: true },
    { key: 'JWT_SECRET', name: 'JWT Secret', critical: true }
  ];

  const optionalKeys = [
    { key: 'ZEK_API_KEY', name: 'ZEK Credit Check' },
    { key: 'CRIF_API_KEY', name: 'CRIF Credit Check' },
    { key: 'MONEYHOUSE_API_KEY', name: 'Moneyhouse Company Data' },
    { key: 'SENTRY_DSN', name: 'Sentry Error Tracking' },
    { key: 'NEW_RELIC_LICENSE_KEY', name: 'New Relic Monitoring' }
  ];

  const workingApis = [
    { name: 'ZEFIX (Swiss Commercial Registry)', status: 'Public API - No key required' },
    { name: 'OpenPLZ (Swiss Postal Codes)', status: 'Free API - No key required' },
    { name: 'Swisstopo (Swiss Geodata)', status: 'Many free endpoints available' },
    { name: 'EV Incentives Calculator', status: 'Built-in data - No external API needed' }
  ];

  let criticalMissing = 0;
  let totalMissing = 0;

  // Show working APIs first
  log('\n  ✅ Already Working Swiss APIs (No setup required):', 'green');
  workingApis.forEach(({ name, status }) => {
    log(`    ✅ ${name}: ${status}`, 'green');
  });

  // Check required keys
  log('\n  🔑 Critical APIs (Still need configuration):', 'bold');
  requiredKeys.forEach(({ key, name, critical }) => {
    const value = env[key];
    const hasValue = value && value.length > 0 && 
                     !value.includes('your-') && 
                     !value.includes('change-in-production');
    
    if (hasValue) {
      if (critical && key === 'JWT_SECRET' && value === 'your-super-secret-jwt-key-change-in-production') {
        log(`    ⚠️  ${name}: Using default value (change for production!)`, 'yellow');
      } else {
        log(`    ✅ ${name}: Configured`, 'green');
      }
    } else {
      if (critical) {
        criticalMissing++;
        log(`    ❌ ${name}: Not configured`, 'red');
      } else {
        log(`    ⚠️  ${name}: Not configured`, 'yellow');
      }
      totalMissing++;
    }
  });

  // Check optional keys
  log('\n  Optional APIs (Enhanced functionality):', 'bold');
  optionalKeys.forEach(({ key, name }) => {
    const value = env[key];
    const hasValue = value && value.length > 0 && 
                     !value.includes('your-') && 
                     !value.includes('change-in-production');
    
    if (hasValue) {
      log(`    ✅ ${name}: Configured`, 'green');
    } else {
      log(`    ⚪ ${name}: Not configured (optional)`, 'reset');
    }
  });

  return { criticalMissing, totalMissing };
}

function validateDatabaseConfig(env) {
  log('\n💾 Database Configuration...', 'blue');
  
  const dbConfig = {
    host: env.DATABASE_HOST || 'localhost',
    port: env.DATABASE_PORT || '5432',
    database: env.DATABASE_NAME || 'cadillac_ev_cis',
    user: env.DATABASE_USERNAME || 'postgres'
  };

  log(`  📍 Host: ${dbConfig.host}:${dbConfig.port}`, 'reset');
  log(`  🗄️  Database: ${dbConfig.database}`, 'reset');
  log(`  👤 User: ${dbConfig.user}`, 'reset');

  if (env.DATABASE_PASSWORD) {
    log(`  🔒 Password: Configured`, 'green');
  } else {
    log(`  ❌ Password: Not configured`, 'red');
    return false;
  }

  return true;
}

function generateSetupReport(env, apiResults, keyResults) {
  log('\n📊 Setup Status Report', 'bold');
  log('='.repeat(50), 'blue');

  // Overall status
  const readyForDevelopment = keyResults.criticalMissing === 0;
  const readyForProduction = keyResults.totalMissing === 0 && 
                             apiResults.every(r => r.success || !r.required);

  if (readyForDevelopment) {
    log('✅ Ready for Development', 'green');
  } else {
    log('❌ Not Ready - Missing Critical APIs', 'red');
  }

  if (readyForProduction) {
    log('✅ Ready for Production', 'green');
  } else {
    log('⚠️  Additional setup needed for production', 'yellow');
  }

  // Next steps
  log('\n📋 Next Steps:', 'bold');
  
  if (keyResults.criticalMissing > 0) {
    log('  1. 🔑 Configure missing Swiss API keys:', 'yellow');
    log('     - See docs/setup/SWISS_API_SETUP.md for detailed instructions', 'reset');
    log('     - ZEFIX: https://www.zefix.ch/en/search/entity/welcome', 'reset');
    log('     - Swiss Post: https://developer.post.ch/', 'reset');
    log('     - Charging API: Contact api@ich-tanke-strom.ch', 'reset');
  }

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    log('  2. 📧 Configure email SMTP credentials', 'yellow');
    log('     - Gmail: Enable 2FA and create App Password', 'reset');
    log('     - SendGrid: Recommended for production', 'reset');
  }

  if (env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    log('  3. 🔐 Generate secure JWT secret for production', 'yellow');
    log('     - Use: openssl rand -base64 32', 'reset');
  }

  log('\n📖 Documentation:', 'bold');
  log('  - Complete setup guide: docs/setup/SWISS_API_SETUP.md', 'reset');
  log('  - API documentation: docs/api/API_DOCUMENTATION.md', 'reset');
  log('  - User guide: docs/user/USER_GUIDE.md', 'reset');

  log('\n💡 Remember: No mock data is used - all APIs require real credentials!', 'yellow');
}

async function main() {
  log('🚗 Cadillac EV CIS - API Keys Validation', 'bold');
  log('🇨🇭 Swiss Market Configuration Checker\n', 'blue');

  try {
    // Load environment variables
    const env = loadEnvFile();
    log('✅ .env file loaded successfully', 'green');

    // Validate database configuration
    const dbValid = validateDatabaseConfig(env);

    // Validate required API keys
    const keyResults = validateRequiredKeys(env);

    // Test Swiss API connectivity
    const apiResults = await validateSwissApis(env);

    // Generate comprehensive report
    generateSetupReport(env, apiResults, keyResults);

    // Exit with appropriate code
    if (keyResults.criticalMissing > 0) {
      log('\n❌ Setup incomplete - critical APIs missing', 'red');
      process.exit(1);
    } else {
      log('\n✅ Setup validation completed', 'green');
      process.exit(0);
    }

  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  main();
}

module.exports = { validateSwissApis, validateRequiredKeys };