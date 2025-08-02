# Swiss API Keys Setup Guide

## 🇨🇭 Required Swiss API Credentials

To enable full functionality of the Cadillac EV Customer Intelligence System with real Swiss data integration, you need to obtain API keys from the following Swiss services:

---

## 🏢 **1. ZEFIX (Swiss Federal Commercial Registry) - REQUIRED**

**Purpose:** Real-time Swiss company lookup and validation  
**Priority:** ⭐⭐⭐ CRITICAL

### How to Get Access:
1. **Visit:** https://www.zefix.ch/en/search/entity/welcome
2. **API Documentation:** https://www.zefix.ch/ZefixREST/api/v1
3. **Contact:** Federal Statistical Office (FSO)
   - Email: zefix@bfs.admin.ch
   - Phone: +41 58 463 67 00

### Setup Steps:
```bash
# 1. Register for API access through Swiss Federal Statistical Office
# 2. Complete application with business justification
# 3. Receive API credentials (usually takes 5-10 business days)
# 4. Add to .env file:
ZEFIX_API_KEY=your_actual_zefix_api_key
```

### Pricing:
- **Free Tier:** 1,000 requests/month
- **Commercial:** CHF 0.10 per request (above free tier)
- **Enterprise:** Custom pricing for high-volume usage

---

## 📮 **2. Swiss Post API - REQUIRED**

**Purpose:** Postal code validation and address verification  
**Priority:** ⭐⭐⭐ CRITICAL

### How to Get Access:
1. **Visit:** https://developer.post.ch/
2. **Register:** Create developer account
3. **API Portal:** https://developer.post.ch/apis

### Setup Steps:
```bash
# 1. Create account at developer.post.ch
# 2. Subscribe to "Address & Geo Data API"
# 3. Generate API key
# 4. Add to .env file:
SWISS_POST_API_KEY=your_actual_swiss_post_api_key
```

### Pricing:
- **Free Tier:** 1,000 requests/month
- **Standard:** CHF 0.05 per request
- **Premium:** Volume discounts available

---

## ⚡ **3. EV Charging Stations API - REQUIRED**

**Purpose:** Real-time EV charging station data  
**Priority:** ⭐⭐⭐ CRITICAL

### Option A: ich-tanke-strom.ch (Recommended)
1. **Contact:** api@ich-tanke-strom.ch
2. **Website:** https://ich-tanke-strom.ch/
3. **Request:** API access for commercial use

### Option B: Open Data Swiss
1. **Visit:** https://opendata.swiss/en/dataset
2. **Search:** "Ladestationen" or "charging stations"
3. **Free access** but limited real-time data

### Setup Steps:
```bash
# Contact ich-tanke-strom.ch for API access
# Business justification required
# Add to .env file:
CHARGING_STATIONS_API_KEY=your_actual_charging_api_key
```

---

## 💳 **4. Credit Check Services - OPTIONAL**

**Purpose:** Business customer credit verification  
**Priority:** ⭐⭐ OPTIONAL (for B2B customers)

### ZEK (Central Office for Credit Information)
1. **Visit:** https://www.zek.ch/
2. **Contact:** info@zek.ch
3. **Phone:** +41 44 444 75 75

### CRIF (Credit Information)
1. **Visit:** https://www.crif.ch/
2. **Contact:** info@crif.ch
3. **Phone:** +41 44 913 60 60

### Moneyhouse (Company Information)
1. **Visit:** https://www.moneyhouse.ch/
2. **API Info:** https://www.moneyhouse.ch/en/api
3. **Contact:** api@moneyhouse.ch

---

## 📧 **5. Email Configuration - REQUIRED**

**Purpose:** Customer notifications and system alerts  
**Priority:** ⭐⭐⭐ CRITICAL

### Gmail SMTP Setup:
```bash
# 1. Enable 2-factor authentication on your Google account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
# 3. Use App Password (not your regular password)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-business-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_EMAIL=your-business-email@gmail.com
```

### Alternative: SendGrid (Recommended for Production)
```bash
# 1. Sign up at https://sendgrid.com/
# 2. Create API key
# 3. Configure:

SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## 📊 **6. Monitoring Services - OPTIONAL**

**Purpose:** Production monitoring and error tracking  
**Priority:** ⭐ OPTIONAL (for production)

### Sentry (Error Tracking)
```bash
# 1. Sign up at https://sentry.io/
# 2. Create new project
# 3. Get DSN from project settings
SENTRY_DSN=https://your-key@sentry.io/project-id
```

### New Relic (Performance Monitoring)
```bash
# 1. Sign up at https://newrelic.com/
# 2. Get license key from account settings
NEW_RELIC_LICENSE_KEY=your-newrelic-license-key
```

---

## 🔧 **Quick Setup Checklist**

### Immediate Setup (for development):
- [ ] **ZEFIX API** - Apply for access (5-10 business days)
- [ ] **Swiss Post API** - Register and get key (immediate)
- [ ] **Charging Stations** - Contact ich-tanke-strom.ch
- [ ] **Email SMTP** - Configure Gmail or SendGrid

### Optional Services:
- [ ] ZEK API (for business credit checks)
- [ ] CRIF API (for enhanced credit data)
- [ ] Moneyhouse API (for company details)
- [ ] Sentry (for error tracking)
- [ ] New Relic (for performance monitoring)

---

## 🚨 **Important Notes**

### Data Protection Compliance:
- All APIs must comply with Swiss DSG (Data Protection Act)
- Ensure proper data handling agreements with providers
- Document data processing activities for compliance

### Cost Considerations:
- **ZEFIX:** ~CHF 100-500/month (depending on usage)
- **Swiss Post:** ~CHF 50-200/month
- **Charging Stations:** Usually free or low-cost
- **Credit Services:** ~CHF 200-1000/month (if used)

### Testing vs Production:
- Use **sandbox/test environments** where available
- Start with **free tiers** for development
- Upgrade to **commercial plans** for production

---

## 📞 **Support Contacts**

### Swiss Government APIs:
- **Federal Statistical Office:** +41 58 463 67 00
- **Swiss Post:** +41 848 888 888
- **General Government Services:** +41 58 462 90 00

### Commercial Services:
- **ich-tanke-strom.ch:** api@ich-tanke-strom.ch
- **ZEK:** +41 44 444 75 75
- **CRIF:** +41 44 913 60 60

---

## 🔄 **API Rate Limits & Best Practices**

### Recommended Usage Patterns:
```typescript
// Cache frequently accessed data
const postalCodes = await cache.get('swiss-postal-codes', 
  () => fetchFromSwissPost(), 
  { ttl: 24 * 60 * 60 * 1000 } // 24 hours
);

// Implement retry logic for critical APIs
const retryOptions = {
  retries: 3,
  backoff: 'exponential',
  timeout: 10000
};
```

### Error Handling:
```typescript
// Always handle API unavailability gracefully
try {
  const companyData = await zefixAPI.search(query);
  return companyData;
} catch (error) {
  // Return service unavailable error (no mock data)
  throw new ServiceUnavailableException(
    'ZEFIX service is currently unavailable. Please try again later.'
  );
}
```

---

*Last Updated: January 30, 2024*  
*For technical support: dev-support@cadillac.ch*