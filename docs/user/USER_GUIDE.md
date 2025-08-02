# Cadillac EV Customer Intelligence System - User Guide

<div align="center">

![Cadillac EV Logo](../assets/cadillac-ev-header.png)

**🇨🇭 Complete User Manual for Swiss Electric Vehicle Sales**

*Version 1.0.0 | January 2024*

</div>

---

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Dashboard Overview](#-dashboard-overview)
- [Customer Management](#-customer-management)
- [Swiss Data Integration](#-swiss-data-integration)
- [Analytics & Reporting](#-analytics--reporting)
- [Vehicle Management](#-vehicle-management)
- [Sales Process](#-sales-process)
- [Accessibility Features](#-accessibility-features)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### 🔐 Logging In

1. **Access the System**
   - Open your web browser
   - Navigate to: `https://cis.cadillac.ch`
   - Ensure you're using a supported browser (Chrome 90+, Firefox 88+, Safari 14+)

2. **Authentication**
   ```
   Email: your.name@cadillac.ch
   Password: [Your assigned password]
   ```

3. **First Login Setup**
   - Change your temporary password
   - Set up two-factor authentication (recommended)
   - Select your preferred language (German, French, Italian)

### 👥 User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|----------------|
| **Sales Manager** | Team leadership and oversight | Full access, team analytics, approval workflows |
| **Sales Representative** | Direct customer interaction | Customer management, sales process, basic analytics |
| **Marketing Specialist** | Campaign and lead management | Analytics, customer insights, lead scoring |
| **System Administrator** | Technical system management | User management, system configuration, data export |

---

## 📊 Dashboard Overview

### 🏠 Main Dashboard

The dashboard provides a comprehensive view of your sales performance, customer pipeline, and Swiss market insights.

![Dashboard Screenshot](../assets/dashboard-overview.png)

#### Key Sections:

1. **Performance Metrics**
   - Daily, weekly, monthly sales figures
   - Customer acquisition costs
   - Conversion rates by canton
   - EV market share in Switzerland

2. **Customer Pipeline**
   - Current prospects by journey stage
   - Hot leads requiring immediate attention
   - Test drives scheduled for today/this week
   - Follow-up reminders

3. **Swiss Market Intelligence**
   - EV incentives by canton
   - Charging station availability
   - Regional market trends
   - Competitor analysis

### 🎯 Quick Actions

Access frequently used functions directly from the dashboard:

- **📞 Schedule Customer Call**
- **🚗 Book Test Drive**
- **📊 Generate Report**
- **🔍 Search Customers**
- **📈 View Analytics**

---

## 👥 Customer Management

### 🔍 Customer Search & Discovery

#### Advanced Search Features

1. **Basic Search**
   ```
   Search by: Name, Email, Phone, Company
   Example: "Müller" or "max.mueller@email.ch"
   ```

2. **Advanced Filters**
   - **Canton**: Filter by Swiss canton (ZH, BE, VD, etc.)
   - **Journey Stage**: Awareness, Interest, Consideration, Test Drive, Purchase
   - **Vehicle Interest**: LYRIQ, OPTIQ, or specific models
   - **Budget Range**: Customizable price ranges
   - **Last Contact**: Date-based filtering

3. **Swiss Business Search**
   - **ZEFIX Integration**: Search by Swiss company registry
   - **UID Lookup**: Find businesses by Swiss UID number
   - **Canton Registration**: Filter by company registration canton

#### Search Tips
- Use partial names: "Mül" will find "Müller", "Mülheim", etc.
- Search Swiss postal codes: "8001" for Zürich city center
- Use company abbreviations: "AG", "GmbH", "SA"

### 📝 Customer Profiles

#### Creating New Customer Profiles

1. **Personal Information**
   ```
   ✓ Full Name (Required)
   ✓ Email Address (Required)
   ✓ Phone Number (Swiss format: +41 XX XXX XX XX)
   ✓ Preferred Language (DE/FR/IT/RM)
   ```

2. **Swiss Address Validation**
   ```
   Street Address: Bahnhofstrasse 1
   Postal Code: 8001 (Validated with Swiss Post)
   City: Zürich (Auto-populated)
   Canton: ZH (Auto-detected)
   ```

3. **Business Customer Information**
   ```
   Company Name: [Auto-suggest from ZEFIX]
   Swiss UID: CHE-123.456.789
   Industry: Automotive, Technology, etc.
   Company Size: 1-10, 11-50, 51-200, 200+ employees
   ```

4. **Vehicle Preferences**
   ```
   Models of Interest: LYRIQ ☑️ OPTIQ ☑️
   Budget Range: CHF 50,000 - CHF 80,000
   Timeframe: 3 months, 6 months, 1 year+
   Current Vehicle: Tesla Model S (2020)
   ```

#### Customer Journey Tracking

The system automatically tracks customer interactions and provides insights:

1. **Journey Stages**
   - 🎯 **Awareness**: First contact, website visit
   - 🤔 **Interest**: Brochure request, pricing inquiry
   - 📊 **Consideration**: Specification comparison, incentive calculation
   - 🚗 **Test Drive**: Scheduled and completed test drives
   - 💰 **Negotiation**: Price discussions, financing options
   - ✅ **Purchase**: Contract signing, delivery scheduling

2. **Touchpoint History**
   ```
   📅 2024-01-28 14:30 | Website Visit | LYRIQ Product Page
   📞 2024-01-25 10:15 | Phone Call | 15 minutes
   📧 2024-01-22 16:45 | Email Sent | OPTIQ Brochure
   🏢 2024-01-20 11:00 | Showroom Visit | Zürich Location
   ```

3. **Predictive Insights**
   - **Conversion Probability**: 73% likely to purchase
   - **Recommended Next Action**: Schedule test drive
   - **Best Contact Time**: Weekday afternoons
   - **Preferred Communication**: Email with phone follow-up

---

## 🇨🇭 Swiss Data Integration

### 🏢 Company Lookup (ZEFIX)

The system integrates with the Swiss Federal Commercial Registry for accurate business customer information.

#### How to Use Company Lookup

1. **Search by Company Name**
   ```
   Input: "Cadillac Schweiz"
   Results: All matching Swiss companies
   ```

2. **Search by UID**
   ```
   Input: "CHE-123.456.789"
   Result: Exact company match
   ```

3. **Company Information Retrieved**
   - Official company name
   - Legal form (AG, GmbH, SA, etc.)
   - Registration date
   - Business address
   - Current status (active, dissolved, etc.)
   - Industry classification

#### Important Notes
- ⚠️ **No Mock Data**: If ZEFIX is unavailable, the system clearly indicates service unavailability
- 🔄 **Real-Time Data**: All company information is fetched live from official sources
- 🎯 **Data Accuracy**: Ensures customer information filed is accurate and reliable

### 📮 Swiss Postal Code Validation

Automatic validation ensures accurate customer addresses using Swiss Post data.

#### Features
- **4-Digit Validation**: Swiss postal codes (1000-9999)
- **City Auto-Population**: Automatic city name completion
- **Canton Detection**: Automatic canton assignment
- **Address Verification**: Street-level validation when available

#### Example Validation
```
Input: 8001
Auto-Complete: 
  City: Zürich
  Canton: ZH (Zürich)
  Region: Greater Zürich Area
```

### ⚡ EV Charging Stations

Find and display EV charging infrastructure across Switzerland.

#### Search Capabilities
1. **Location-Based Search**
   ```
   Address: Bahnhofstrasse 1, Zürich
   Radius: 5 km, 10 km, 20 km
   ```

2. **Filter Options**
   - **Connector Type**: CCS, CHAdeMO, Type 2
   - **Power Level**: 11kW, 22kW, 50kW, 150kW+
   - **Network**: MOVE, Ionity, Tesla Supercharger
   - **Availability**: Available now, 24/7 access

3. **Station Information**
   ```
   📍 Location: Zürich HB Charging Hub
   🔌 Connectors: 4x CCS (150kW), 2x CHAdeMO (50kW)
   💰 Pricing: CHF 0.45/kWh (CCS), CHF 0.42/kWh (CHAdeMO)
   🕒 Hours: 24/7
   ⚡ Status: 3 Available, 1 Occupied
   ```

### 💰 EV Incentives Calculator

Calculate Swiss cantonal EV incentives and tax benefits for customers.

#### How to Calculate Incentives

1. **Select Canton**
   ```
   Available: All 26 Swiss Cantons
   Example: Zürich (ZH)
   ```

2. **Vehicle Information**
   ```
   Model: CADILLAC LYRIQ
   Purchase Price: CHF 65,000
   Power: 255 kW
   Battery: 100.4 kWh
   Efficiency: 18 kWh/100km
   ```

3. **Customer Profile**
   ```
   Annual Mileage: 15,000 km
   Ownership Period: 4 years
   Business Use: No
   ```

4. **Results Example**
   ```
   💰 Total Incentives: CHF 5,500
   
   Breakdown:
   ├─ Purchase Rebate: CHF 3,000
   ├─ Tax Reduction: CHF 2,500
   └─ Charging Bonus: CHF 0
   
   Annual Savings:
   ├─ Motor Vehicle Tax: CHF 420
   ├─ Fuel Savings: CHF 2,100
   └─ Maintenance: CHF 800
   
   4-Year Total Cost: CHF 48,500
   vs ICE Vehicle: CHF -8,500 savings
   ```

---

## 📊 Analytics & Reporting

### 📈 Dashboard Metrics

Access comprehensive business intelligence through interactive dashboards.

#### Key Performance Indicators (KPIs)

1. **Sales Metrics**
   ```
   📊 Monthly Sales: 47 vehicles (+12% vs last month)
   💰 Revenue: CHF 3.2M (+8% vs last month)
   📈 Conversion Rate: 18.5% (+2.3% vs last month)
   🎯 Average Deal Size: CHF 68,500
   ```

2. **Customer Metrics**
   ```
   👥 Total Customers: 2,847 (+125 this month)
   🆕 New Leads: 89 (this week)
   🚗 Test Drives: 23 (scheduled this week)
   📞 Follow-ups Due: 156 (today)
   ```

3. **Swiss Market Metrics**
   ```
   🇨🇭 Market Share: 4.2% (Swiss EV market)
   📍 Top Canton: Zürich (28% of sales)
   ⚡ Charging Utilization: 67% (customer locations)
   💳 Avg Incentive Used: CHF 4,200
   ```

### 📊 Customer Journey Analytics

Track and analyze customer progression through the sales funnel.

#### Journey Funnel View
```
Awareness     │████████████████████│ 5,420 prospects (100%)
Interest      │████████████        │ 3,250 prospects (60%)
Consideration │████████            │ 2,100 prospects (39%)
Test Drive    │██████              │ 1,500 prospects (28%)
Negotiation   │████                │ 950 prospects (18%)
Purchase      │██                  │ 675 prospects (12.5%)
```

#### Stage Analysis
- **Average Time in Stage**: Detailed breakdown by journey stage
- **Drop-off Points**: Identify where prospects are lost
- **Conversion Drivers**: Factors that move customers forward
- **Regional Differences**: Canton-specific journey patterns

### 📈 Sales Funnel Analysis

Deep dive into sales performance and optimization opportunities.

#### Conversion Analysis
```
Stage Transitions (Last 30 Days):
├─ Awareness → Interest: 60% (Industry avg: 55%)
├─ Interest → Consideration: 65% (Industry avg: 58%)
├─ Consideration → Test Drive: 71% (Industry avg: 45%)
├─ Test Drive → Negotiation: 63% (Industry avg: 70%)
└─ Negotiation → Purchase: 71% (Industry avg: 65%)
```

#### Performance by Canton
| Canton | Leads | Conversions | Rate | Revenue |
|--------|-------|-------------|------|---------|
| ZH | 1,250 | 156 | 12.5% | CHF 1.1M |
| BE | 890 | 98 | 11.0% | CHF 675K |
| VD | 645 | 89 | 13.8% | CHF 590K |
| AG | 578 | 67 | 11.6% | CHF 445K |

### 💰 ROI Calculator

Analyze marketing campaign effectiveness and return on investment.

#### Campaign Analysis
```
Campaign: "Zürich EV Week 2024"
├─ Investment: CHF 45,000
├─ Leads Generated: 234
├─ Conversions: 28
├─ Revenue: CHF 1.89M
├─ ROI: 4,100% (CHF 41 return per CHF 1 invested)
└─ Cost per Acquisition: CHF 1,607
```

#### Channel Performance
| Channel | Investment | Leads | Conversions | ROI |
|---------|------------|-------|-------------|-----|
| Digital Ads | CHF 25K | 145 | 18 | 4,680% |
| Events | CHF 15K | 67 | 8 | 3,420% |
| PR/Media | CHF 5K | 22 | 2 | 2,680% |

### 🔮 Predictive Analytics

AI-powered insights for sales forecasting and customer behavior prediction.

#### Sales Forecasting
```
Next 30 Days Prediction:
├─ Expected Sales: 52 vehicles (±5)
├─ Revenue Forecast: CHF 3.6M (±CHF 350K)
├─ Confidence Level: 87%
└─ Key Factors: Q1 incentives, weather improvement, showroom events
```

#### Customer Scoring
```
High-Value Prospects (Score > 80):
├─ Max Müller (Score: 92) - Likely purchase in 7 days
├─ Anna Bachmann (Score: 87) - Likely purchase in 14 days
├─ Peter Schmid (Score: 84) - Likely purchase in 21 days
└─ Maria Weber (Score: 81) - Needs follow-up call
```

---

## 🚗 Vehicle Management

### 📋 Vehicle Inventory

Manage and track Cadillac EV models available for the Swiss market.

#### Current Models

1. **CADILLAC LYRIQ**
   ```
   🔋 Range: 450 km (WLTP)
   ⚡ Power: 255 kW (340 hp)
   🏃 0-100 km/h: 6.0 seconds
   💰 Starting Price: CHF 62,900
   📦 In Stock: 5 units
   📅 Next Delivery: March 15, 2024
   👥 Waiting List: 23 customers
   ```

2. **CADILLAC OPTIQ** (Coming Soon)
   ```
   🔋 Range: 400 km (WLTP, estimated)
   ⚡ Power: 220 kW (295 hp)
   🏃 0-100 km/h: 6.5 seconds
   💰 Expected Price: CHF 55,900
   📅 Launch: Q3 2024
   👥 Pre-orders: 67 customers
   ```

#### Inventory Management
- **Stock Levels**: Real-time inventory tracking
- **Allocation**: Assign specific vehicles to customers
- **Delivery Scheduling**: Coordinate customer deliveries
- **Pre-order Management**: Handle future model reservations

### 🎨 Configuration & Options

Help customers configure their ideal Cadillac EV.

#### Available Configurations

1. **Exterior Options**
   ```
   Colors:
   ├─ Dark Moon Metallic (Standard)
   ├─ Crystal White Tricoat (+CHF 1,200)
   ├─ Infrared Tintcoat (+CHF 1,500)
   └─ Electric Blue Pearl (+CHF 1,200)
   
   Wheels:
   ├─ 20" Premium (Standard)
   └─ 22" Performance (+CHF 2,800)
   ```

2. **Interior Options**
   ```
   Seating:
   ├─ Premium Fabric (Standard)
   ├─ Synthetic Leather (+CHF 1,800)
   └─ Nappa Leather (+CHF 3,500)
   
   Technology:
   ├─ Standard Infotainment (33" Display)
   ├─ Premium Audio (+CHF 1,200)
   └─ Super Cruise (+CHF 3,200)
   ```

3. **Swiss-Specific Options**
   ```
   ├─ Swiss Map Updates (3 years included)
   ├─ MOVE Charging Network Access
   ├─ Vignette Holder (Standard)
   └─ Winter Package (+CHF 800)
   ```

---

## 💼 Sales Process

### 📅 Scheduling & Calendar

Manage appointments, test drives, and customer meetings efficiently.

#### Calendar Features
- **Integrated Scheduling**: Sync with Outlook/Google Calendar
- **Test Drive Booking**: Dedicated test drive slots
- **Showroom Visits**: Customer appointment scheduling
- **Follow-up Reminders**: Automatic reminder notifications

#### Test Drive Management

1. **Booking Process**
   ```
   Customer: Max Müller
   Vehicle: CADILLAC LYRIQ
   Date: March 5, 2024
   Time: 14:00 - 15:00
   Route: City Center + Highway (45 minutes)
   Sales Rep: Anna Bachmann
   ```

2. **Pre-Drive Checklist**
   ```
   ✓ Valid driving license verification
   ✓ Insurance confirmation
   ✓ Vehicle preparation and charging
   ✓ Route planning with charging stops
   ✓ Customer preference documentation
   ```

3. **Post-Drive Follow-up**
   ```
   Immediate (within 2 hours):
   ├─ Experience feedback collection
   ├─ Address any concerns raised
   ├─ Schedule next meeting if interested
   └─ Update customer journey stage
   ```

### 💰 Pricing & Financing

Provide accurate pricing including Swiss incentives and financing options.

#### Pricing Calculator

1. **Base Price Calculation**
   ```
   CADILLAC LYRIQ Base: CHF 62,900
   ├─ Selected Options: CHF 4,200
   ├─ Swiss VAT (7.7%): CHF 5,167
   └─ Total MSRP: CHF 72,267
   ```

2. **Incentive Application**
   ```
   Canton Zürich Incentives:
   ├─ EV Purchase Rebate: -CHF 3,000
   ├─ Tax Reduction (4 years): -CHF 2,500
   └─ Net Price: CHF 66,767
   ```

3. **Financing Options**
   ```
   Option 1 - Traditional Loan:
   ├─ Down Payment: CHF 13,353 (20%)
   ├─ Loan Amount: CHF 53,414
   ├─ Term: 48 months
   ├─ Interest Rate: 2.9%
   └─ Monthly Payment: CHF 1,189
   
   Option 2 - Leasing:
   ├─ Down Payment: CHF 6,677 (10%)
   ├─ Monthly Lease: CHF 589
   ├─ Term: 36 months
   ├─ Mileage: 15,000 km/year
   └─ Residual Value: CHF 35,000
   ```

### 📋 Contract Management

Streamline the sales contract and delivery process.

#### Contract Generation
- **Automated Contracts**: Pre-filled based on configuration
- **Swiss Legal Compliance**: Adheres to Swiss consumer protection laws
- **Multi-language Support**: Contracts in German, French, Italian
- **Digital Signatures**: Secure electronic signing process

#### Delivery Coordination
```
Delivery Checklist:
├─ Final vehicle inspection
├─ Customer orientation (2 hours)
├─ Charging infrastructure setup
├─ Swiss registration and insurance
├─ First service appointment scheduling
└─ Customer satisfaction survey
```

---

## ♿ Accessibility Features

The system is designed to be accessible to all users, following WCAG 2.1 AA guidelines.

### 🎛️ Accessibility Controls

Access the accessibility menu via the settings icon or keyboard shortcut (Alt + A).

#### Visual Accessibility
```
High Contrast Mode:
├─ Increases color contrast for better visibility
├─ Works with system preferences
└─ Manual toggle available

Large Text Mode:
├─ Increases font size by 25%
├─ Maintains layout integrity
└─ Includes improved line spacing

Reduced Motion:
├─ Minimizes animations and transitions
├─ Respects system preferences
└─ Maintains full functionality
```

#### Interaction Accessibility
```
Keyboard Navigation:
├─ Tab through all interactive elements
├─ Arrow keys for navigation within components
├─ Enter/Space for activation
├─ Escape to close dialogs
└─ Skip links for main content

Screen Reader Support:
├─ Semantic HTML structure
├─ ARIA labels and descriptions
├─ Live regions for dynamic content
├─ Table headers and relationships
└─ Form labels and error associations
```

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + H` | Go to Homepage |
| `Alt + C` | Customer Search |
| `Alt + N` | New Customer |
| `Alt + A` | Accessibility Menu |
| `Alt + ?` | Help Menu |
| `Ctrl + /` | Search Everything |
| `Esc` | Close Current Dialog |

### 🔊 Screen Reader Features

- **Comprehensive ARIA Support**: All interactive elements properly labeled
- **Live Announcements**: Dynamic content changes announced
- **Table Navigation**: Proper table headers and relationships
- **Form Accessibility**: Clear labels, required field indicators, error messages
- **Skip Navigation**: Jump to main content, search, or navigation

---

## 🛠️ Troubleshooting

### ❓ Common Issues & Solutions

#### 1. Login Problems

**Issue**: Cannot log in to the system
```
Solutions:
├─ Verify your email address and password
├─ Check if Caps Lock is enabled
├─ Clear browser cache and cookies
├─ Try incognito/private browsing mode
└─ Contact IT support if problem persists
```

**Issue**: Two-factor authentication not working
```
Solutions:
├─ Ensure phone has network connectivity
├─ Check if time on device is correct
├─ Try backup authentication codes
└─ Contact IT to reset 2FA
```

#### 2. Swiss Data Services

**Issue**: "ZEFIX service unavailable" error
```
Understanding:
├─ This is NOT an error in our system
├─ Swiss Federal Registry is temporarily down
├─ NO mock data is provided (by design)
├─ Ensures data accuracy and reliability

Actions:
├─ Wait for ZEFIX service to restore
├─ Try again in 15-30 minutes
├─ Use manual company entry if urgent
└─ Contact customer that validation is pending
```

**Issue**: Postal code validation fails
```
Solutions:
├─ Verify the postal code is 4 digits
├─ Ensure it's a valid Swiss postal code
├─ Check if Swiss Post API is available
└─ Manually enter address if service unavailable
```

#### 3. Performance Issues

**Issue**: System is running slowly
```
Solutions:
├─ Check internet connection speed
├─ Close unnecessary browser tabs
├─ Clear browser cache
├─ Disable browser extensions temporarily
├─ Try a different browser
└─ Contact IT if issue persists
```

**Issue**: Pages not loading properly
```
Solutions:
├─ Refresh the page (F5)
├─ Hard refresh (Ctrl + F5)
├─ Check browser console for errors
├─ Verify JavaScript is enabled
└─ Try incognito/private mode
```

#### 4. Customer Data Issues

**Issue**: Customer information not saving
```
Check:
├─ All required fields are completed
├─ Email format is valid
├─ Phone number follows Swiss format
├─ Postal code is valid Swiss code
└─ No special characters in name fields
```

**Issue**: Customer search not finding results
```
Tips:
├─ Try partial name searches
├─ Use different search terms
├─ Check spelling and accents
├─ Try searching by email or phone
└─ Use advanced filters to narrow search
```

### 📞 Getting Help

#### Support Channels

1. **In-App Help**
   - Click the "?" icon in the top navigation
   - Access contextual help on any page
   - View video tutorials and guides

2. **IT Support**
   ```
   Email: it-support@cadillac.ch
   Phone: +41 44 123 45 67
   Hours: Monday-Friday, 8:00-17:00
   Emergency: 24/7 for critical issues
   ```

3. **Training Resources**
   ```
   Online Training Portal: training.cadillac.ch
   Monthly Webinars: First Friday of each month
   Video Library: 50+ tutorial videos
   User Community: Forum for questions and tips
   ```

#### When Contacting Support

Please provide:
- Your username and role
- Browser type and version
- Exact error message (screenshot helpful)
- Steps to reproduce the issue
- Time when the issue occurred

### 🔄 System Updates

The system is continuously improved with regular updates:

- **Weekly**: Bug fixes and minor improvements
- **Monthly**: New features and enhancements
- **Quarterly**: Major feature releases

**Update Notifications**: You'll receive in-app notifications about new features and important changes.

---

## 📚 Additional Resources

### 📖 Documentation
- **API Documentation**: For technical integrations
- **Admin Guide**: For system administrators
- **Training Materials**: Comprehensive learning resources

### 🎓 Training
- **New User Onboarding**: 2-hour guided tour
- **Advanced Features**: Monthly deep-dive sessions
- **Swiss Market Specifics**: Specialized training modules

### 🤝 Community
- **User Forum**: Share tips and ask questions
- **Feature Requests**: Suggest improvements
- **Beta Testing**: Test new features early

---

*This user guide is regularly updated to reflect the latest system features and improvements. For the most current version, always refer to the online documentation.*

**Version**: 1.0.0  
**Last Updated**: January 30, 2024  
**Next Review**: April 30, 2024