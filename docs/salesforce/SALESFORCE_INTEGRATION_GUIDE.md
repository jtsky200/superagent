# 🏢 Salesforce CRM Integration - Complete Guide

## 📋 Overview

The Cadillac EV Customer Intelligence System includes a comprehensive bidirectional Salesforce integration that enables seamless CRM functionality with real-time synchronization, conflict resolution, and advanced workflow automation.

---

## 🚀 Key Features

### ✅ **Bidirectional Synchronization**
- **Real-time data sync** between Salesforce and local system
- **Conflict detection and resolution** for simultaneous changes
- **Automatic retry mechanisms** for failed synchronizations
- **Queue-based offline sync** for network interruptions

### ✅ **OAuth 2.0 Authentication**
- **Secure token management** with automatic refresh
- **Multi-environment support** (Sandbox & Production)
- **User-specific connections** with isolated data access
- **CSRF protection** with state verification

### ✅ **Comprehensive CRM Operations**
- **Lead Management**: Create, search, update, convert leads
- **Contact Management**: Full contact lifecycle management
- **Case Management**: Support case tracking and resolution
- **Activity Tracking**: Email and call logging with context

### ✅ **Real-time Webhooks**
- **Push notifications** from Salesforce for instant updates
- **Signature verification** for security
- **Automatic conflict resolution** for webhook updates
- **Replay protection** against duplicate events

### ✅ **Advanced Features**
- **Bulk operations** for mass data handling (up to 200 records)
- **Custom API requests** for specialized integrations
- **Metadata exploration** for dynamic form generation
- **Swiss market optimization** with local address validation

---

## 🔧 Setup Instructions

### **Step 1: Salesforce Connected App Configuration**

1. **Log into Salesforce Setup**
   - Navigate to: Setup → Apps → App Manager
   - Click "New Connected App"

2. **Basic Information**
   ```
   Connected App Name: Cadillac EV CIS
   API Name: Cadillac_EV_CIS
   Contact Email: [your-email]
   Description: Cadillac EV Customer Intelligence System Integration
   ```

3. **API (Enable OAuth Settings)**
   ```
   ✅ Enable OAuth Settings
   Callback URL: http://localhost:3000/api/salesforce/oauth/callback
   Selected OAuth Scopes:
   - Manage user data via APIs (api)
   - Perform requests at any time (refresh_token, offline_access)
   - Access the identity URL service (id, profile, email, address, phone)
   ```

4. **Advanced Settings**
   ```
   ✅ Enable for Device Flow
   ✅ Require Secret for Web Server Flow
   ✅ Require Secret for Refresh Token Flow
   ```

5. **Save and Note Credentials**
   - Copy **Consumer Key** (Client ID)
   - Copy **Consumer Secret** (Client Secret)

### **Step 2: Environment Configuration**

Update your `.env` file with the Salesforce credentials:

```bash
# Salesforce Integration Configuration
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_SANDBOX_URL=https://test.salesforce.com
SALESFORCE_PRODUCTION_URL=https://login.salesforce.com
SALESFORCE_INSTANCE_URL=
SALESFORCE_API_VERSION=v60.0
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/salesforce/oauth/callback
SALESFORCE_WEBHOOK_SECRET=your_webhook_secret_here
SALESFORCE_ENVIRONMENT=sandbox
```

### **Step 3: Database Migration**

Run the database migration to create Salesforce tables:

```bash
cd backend
npm run migration:run
```

This creates the following tables:
- `salesforce_tokens` - OAuth token storage
- `salesforce_sync_logs` - Synchronization history and conflict tracking

### **Step 4: Application Startup**

```bash
# Start the backend
cd backend
npm run start:dev

# Start the frontend
cd frontend
npm run dev

# Start AI services (if needed)
cd ai-services
python -m flask run --port=5000
```

### **Step 5: User Authentication**

1. **Navigate to Salesforce Integration**
   - Go to: http://localhost:3000/salesforce
   - Click "Setup" tab

2. **Connect to Salesforce**
   - Click "Connect to Salesforce"
   - Login with your Salesforce credentials
   - Authorize the application

3. **Verify Connection**
   - Check that status shows "Connected"
   - Verify user information is displayed correctly

---

## 📊 Usage Guide

### **Lead Management**

#### **Create a New Lead**
```typescript
// Via API
const newLead = await fetch('/api/salesforce/leads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    FirstName: 'Max',
    LastName: 'Mustermann',
    Company: 'Swiss EV Solutions AG',
    Email: 'max.mustermann@swiss-ev.ch',
    Phone: '+41 44 123 45 67',
    Status: 'New',
    LeadSource: 'Web',
    City: 'Zürich',
    State: 'ZH',
    Country: 'Switzerland'
  })
});
```

#### **Search Leads**
```typescript
// Search by multiple criteria
const leads = await fetch('/api/salesforce/leads?' + new URLSearchParams({
  name: 'Mustermann',
  company: 'Swiss EV',
  status: 'New',
  limit: '50'
}), {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### **Update Lead**
```typescript
const updateLead = await fetch(`/api/salesforce/leads/${leadId}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    Status: 'Qualified',
    Industry: 'Automotive'
  })
});
```

### **Activity Tracking**

#### **Log Email Activity**
```typescript
const emailActivity = await fetch('/api/salesforce/activities/email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'EV Model Information Request',
    body: 'Thank you for your interest in our Cadillac EV models...',
    contactId: '003XXXXXXXXXXXXXXX',
    leadId: '00QXXXXXXXXXXXXXXX',
    to: 'customer@example.com'
  })
});
```

#### **Log Call Activity**
```typescript
const callActivity = await fetch('/api/salesforce/activities/call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Follow-up call about test drive',
    notes: 'Customer interested in Lyriq model. Scheduled test drive for next week.',
    date: new Date().toISOString(),
    duration: '15',
    callType: 'Outbound',
    callResult: 'Completed',
    leadId: '00QXXXXXXXXXXXXXXX'
  })
});
```

### **Synchronization**

#### **Full Synchronization**
```typescript
const fullSync = await fetch('/api/salesforce/sync/full', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response includes detailed sync results
const result = await fullSync.json();
console.log(`Synced: ${result.result.synced}, Conflicts: ${result.result.conflicts}`);
```

#### **Handle Sync Conflicts**
```typescript
// Get conflicts
const conflicts = await fetch('/api/salesforce/sync/conflicts', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Resolve conflict
const resolution = await fetch(`/api/salesforce/sync/conflicts/${conflictId}/resolve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    strategy: 'USE_SALESFORCE', // or 'USE_LOCAL', 'MERGE'
    mergeData: { /* custom merge data */ }
  })
});
```

### **Bulk Operations**

#### **Bulk Create Leads**
```typescript
const bulkCreate = await fetch('/api/salesforce/bulk/create/Lead', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([
    {
      FirstName: 'Anna',
      LastName: 'Müller',
      Company: 'Green Transport GmbH',
      Email: 'anna.mueller@greentransport.ch'
    },
    {
      FirstName: 'Thomas',
      LastName: 'Weber',
      Company: 'Eco Mobility AG',
      Email: 'thomas.weber@ecomobility.ch'
    }
    // ... up to 200 records
  ])
});
```

---

## 🔒 Security Features

### **OAuth 2.0 Security**
- **Secure token storage** with encryption
- **Automatic token refresh** before expiration
- **State parameter validation** to prevent CSRF attacks
- **Token revocation** on disconnect

### **Webhook Security**
- **HMAC signature verification** for all webhook requests
- **Timestamp validation** to prevent replay attacks
- **IP allowlisting** for Salesforce webhook sources
- **Rate limiting** to prevent abuse

### **Data Protection**
- **User data isolation** - users only access their own data
- **Audit logging** for all synchronization operations
- **Error logging** without exposing sensitive information
- **GDPR compliance** with data retention policies

---

## 🔄 Webhook Configuration

### **Setup Push Topics in Salesforce**

1. **Open Developer Console** in Salesforce
2. **Execute Apex** to create Push Topics:

```apex
// Lead Changes Push Topic
PushTopic leadTopic = new PushTopic();
leadTopic.Name = 'CadillacEV_Lead_Changes';
leadTopic.Query = 'SELECT Id, FirstName, LastName, Company, Email, Phone, Status, LastModifiedDate FROM Lead';
leadTopic.ApiVersion = 60.0;
leadTopic.NotifyForOperationCreate = true;
leadTopic.NotifyForOperationUpdate = true;
leadTopic.NotifyForOperationDelete = true;
leadTopic.NotifyForOperationUndelete = true;
leadTopic.NotifyForFields = 'All';
insert leadTopic;

// Contact Changes Push Topic
PushTopic contactTopic = new PushTopic();
contactTopic.Name = 'CadillacEV_Contact_Changes';
contactTopic.Query = 'SELECT Id, FirstName, LastName, Email, Phone, AccountId, LastModifiedDate FROM Contact';
contactTopic.ApiVersion = 60.0;
contactTopic.NotifyForOperationCreate = true;
contactTopic.NotifyForOperationUpdate = true;
contactTopic.NotifyForOperationDelete = true;
contactTopic.NotifyForOperationUndelete = true;
contactTopic.NotifyForFields = 'All';
insert contactTopic;
```

### **Webhook Endpoint Configuration**

The system provides these webhook endpoints:

```
POST /api/salesforce/webhooks/receive    # Main webhook receiver
GET  /api/salesforce/webhooks/health     # Health check
POST /api/salesforce/webhooks/setup      # Auto-setup subscriptions
POST /api/salesforce/webhooks/remove     # Remove subscriptions
POST /api/salesforce/webhooks/test       # Test endpoint
```

---

## 📈 Monitoring & Troubleshooting

### **Sync Status Monitoring**

```typescript
// Get sync logs
const logs = await fetch('/api/salesforce/sync/logs?limit=100', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Monitor for errors
const errorLogs = logs.filter(log => log.status === 'FAILED');
console.log(`${errorLogs.length} failed sync operations`);
```

### **Common Issues & Solutions**

#### **Authentication Issues**
```
Problem: "Salesforce authentication failed"
Solution: 
1. Check SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET
2. Verify callback URL matches Connected App configuration
3. Ensure user has appropriate Salesforce permissions
```

#### **Sync Conflicts**
```
Problem: Multiple conflicts during synchronization
Solution:
1. Review conflict resolution strategy
2. Implement field-level merge rules
3. Consider master data source designation
```

#### **Webhook Failures**
```
Problem: Webhooks not receiving or processing correctly
Solution:
1. Verify webhook secret configuration
2. Check Push Topic SOQL queries
3. Review webhook endpoint logs
4. Test with /api/salesforce/webhooks/test
```

#### **Rate Limiting**
```
Problem: Salesforce API rate limits exceeded
Solution:
1. Implement exponential backoff
2. Use bulk operations where possible
3. Optimize sync frequency
4. Monitor API usage in Salesforce
```

---

## 🧪 Testing

### **Unit Tests**
```bash
cd backend
npm run test -- salesforce
```

### **Integration Tests**
```bash
# Test with Salesforce Sandbox
npm run test:e2e -- salesforce-integration
```

### **Manual Testing Checklist**

#### **Authentication Flow**
- [ ] OAuth authorization URL generation
- [ ] Successful authentication with Salesforce
- [ ] Token refresh functionality
- [ ] Disconnect and reconnect

#### **CRUD Operations**
- [ ] Create lead, contact, case
- [ ] Search with various criteria
- [ ] Update records in both systems
- [ ] Delete and restore operations

#### **Synchronization**
- [ ] Full sync completes successfully
- [ ] Incremental sync updates recent changes
- [ ] Conflict detection and resolution
- [ ] Offline queue processing

#### **Webhooks**
- [ ] Webhook signature verification
- [ ] Real-time updates from Salesforce
- [ ] Conflict handling for webhook updates
- [ ] Error handling and logging

---

## 🔧 Advanced Configuration

### **Custom Field Mapping**

Create custom field mappings in `salesforce-sync.service.ts`:

```typescript
private mapLocalLeadToSalesforce(localLead: any): any {
  return {
    FirstName: localLead.firstName,
    LastName: localLead.lastName,
    Company: localLead.company,
    Email: localLead.email,
    Phone: localLead.phone,
    // Custom fields
    EV_Interest_Level__c: localLead.evInterestLevel,
    Preferred_Model__c: localLead.preferredModel,
    Budget_Range__c: localLead.budgetRange,
  };
}
```

### **Sync Scheduling**

Customize sync frequency in `salesforce-sync.service.ts`:

```typescript
// Custom cron schedule (every 30 minutes)
@Cron('0 */30 * * * *')
async handleCustomSync(): Promise<void> {
  // Your custom sync logic
}
```

### **Webhook Filtering**

Add custom webhook filtering logic:

```typescript
private shouldProcessWebhook(payload: SalesforceWebhookPayload): boolean {
  // Custom filtering logic
  if (payload.sobject.LastModifiedBy === 'Integration User') {
    return false; // Skip updates from integration user
  }
  
  return true;
}
```

---

## 🆘 Support

### **Technical Support**
- **Documentation**: See `/docs/salesforce/` for detailed technical documentation
- **API Reference**: Available at `/api/docs` when backend is running
- **Logs**: Check application logs for detailed error information

### **Salesforce Support**
- **Trailhead**: https://trailhead.salesforce.com/
- **Developer Documentation**: https://developer.salesforce.com/
- **Community**: https://developer.salesforce.com/forums/

---

## 📄 License & Compliance

- **GDPR Compliant**: Personal data handling according to EU regulations
- **SOC 2 Type II**: Security controls for data protection
- **Swiss Data Protection**: Compliance with Swiss DPA requirements
- **Salesforce Trust**: All integrations follow Salesforce security best practices

---

*Last Updated: January 30, 2024*  
*Version: 1.0.0*  
*Integration Status: Production Ready* ✅