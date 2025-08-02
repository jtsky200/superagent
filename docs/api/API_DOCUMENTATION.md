# Cadillac EV Customer Intelligence System - API Documentation

## 📋 Overview

The Cadillac EV Customer Intelligence System provides comprehensive APIs for customer management, Swiss market integration, analytics, and business intelligence specifically tailored for the Swiss electric vehicle market.

**Base URL:** `https://api.cadillac-ev-cis.ch/api`  
**Version:** 1.0.0  
**Authentication:** Bearer Token  

---

## 🔐 Authentication

All API endpoints require authentication using Bearer tokens.

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@cadillac.ch",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@cadillac.ch",
      "name": "Max Mustermann",
      "role": "sales_manager"
    }
  },
  "timestamp": "2024-01-30T10:00:00Z"
}
```

---

## 🇨🇭 Swiss Data Integration APIs

### Company Lookup (ZEFIX Integration)

#### POST /swiss-data/company-lookup
Lookup Swiss company information via ZEFIX (Swiss Federal Commercial Registry).

**Important:** No mock data is provided. Returns HTTP 503 if ZEFIX service is unavailable.

**Request:**
```json
{
  "query": "Cadillac Schweiz AG",
  "canton": "ZH",
  "exactMatch": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "uid": "CHE-123.456.789",
        "name": "Cadillac Schweiz AG",
        "legalForm": "AG",
        "status": "active",
        "address": {
          "street": "Bahnhofstrasse 1",
          "city": "Zürich",
          "postalCode": "8001",
          "canton": "ZH"
        },
        "registrationDate": "2020-01-15",
        "employees": "50-99",
        "sector": "Automotive Retail"
      }
    ],
    "totalResults": 1,
    "source": "ZEFIX",
    "cached": false
  },
  "timestamp": "2024-01-30T10:00:00Z"
}
```

**Service Unavailable Response (503):**
```json
{
  "success": false,
  "error": "Swiss Federal Commercial Registry (ZEFIX) is currently unavailable. Status: 503",
  "service_unavailable": true,
  "retry_suggested": true,
  "timestamp": "2024-01-30T10:00:00Z"
}
```

### Postal Code Validation

#### GET /swiss-data/postal-codes
Get valid Swiss postal codes with city information.

**Query Parameters:**
- `code` (optional): Specific postal code to validate
- `city` (optional): City name to search
- `canton` (optional): Canton abbreviation (ZH, BE, etc.)

**Request Example:**
```http
GET /swiss-data/postal-codes?code=8001&city=Zürich
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "postalCodes": [
      {
        "code": "8001",
        "city": "Zürich",
        "canton": "ZH",
        "region": "Zürich",
        "coordinates": {
          "lat": 47.3769,
          "lng": 8.5417
        }
      }
    ],
    "source": "Swiss Post API"
  }
}
```

#### POST /swiss-data/postal-codes/validate
Validate specific postal code and address combination.

**Request:**
```json
{
  "postalCode": "8001",
  "city": "Zürich",
  "street": "Bahnhofstrasse 1"
}
```

### EV Charging Stations

#### GET /swiss-data/charging-stations
Find EV charging stations in Switzerland.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude  
- `radius` (optional): Search radius in km (default: 10)
- `connectorType` (optional): Connector type filter
- `powerMin` (optional): Minimum power in kW
- `networkId` (optional): Specific charging network

**Request Example:**
```http
GET /swiss-data/charging-stations?lat=47.3769&lng=8.5417&radius=5&powerMin=50
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "station_001",
        "name": "Zürich HB Charging Hub",
        "location": {
          "lat": 47.3784,
          "lng": 8.5403,
          "address": "Bahnhofplatz 1, 8001 Zürich"
        },
        "distance": 0.8,
        "network": "MOVE",
        "connectors": [
          {
            "type": "CCS",
            "power": 150,
            "available": true,
            "pricing": "0.45 CHF/kWh"
          },
          {
            "type": "CHAdeMO", 
            "power": 50,
            "available": false,
            "pricing": "0.42 CHF/kWh"
          }
        ],
        "amenities": ["restaurant", "parking", "wifi"],
        "operatingHours": "24/7",
        "realTimeStatus": "operational"
      }
    ],
    "total": 15,
    "source": "ich-tanke-strom.ch"
  }
}
```

### EV Incentives Calculator

#### POST /swiss-data/ev-incentives/calculate
Calculate EV incentives for specific canton.

**Request:**
```json
{
  "canton": "ZH",
  "vehicle": {
    "purchase_price": 65000,
    "power_kw": 150,
    "weight_kg": 2200,
    "battery_capacity_kwh": 75,
    "efficiency_kwh_100km": 18
  },
  "customer": {
    "annual_mileage": 15000,
    "years_ownership": 4,
    "business_use": false
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "canton": "ZH",
    "total_incentive": 5500,
    "breakdown": {
      "purchase_rebate": 3000,
      "tax_reduction": 2500,
      "charging_bonus": 0
    },
    "annual_savings": {
      "motor_vehicle_tax": 420,
      "fuel_savings": 2100,
      "maintenance_savings": 800
    },
    "total_cost_ownership": {
      "four_years": 48500,
      "vs_ice_vehicle": -8500
    }
  }
}
```

---

## 📊 Analytics APIs

### Dashboard Metrics

#### GET /analytics/kpi-metrics
Get comprehensive dashboard KPI metrics.

**Query Parameters:**
- `period` (optional): Time period (24h, 7d, 30d, 90d, 1y)
- `canton` (optional): Filter by canton
- `vehicleModel` (optional): Filter by vehicle model

**Success Response:**
```json
{
  "success": true,
  "data": {
    "overview": [
      {
        "id": "total_customers",
        "title": "Total Customers",
        "value": 2847,
        "change": {
          "value": 12.5,
          "isPositive": true,
          "period": "vs last month"
        },
        "target": 3000,
        "unit": "customers"
      }
    ],
    "customerMetrics": [...],
    "salesMetrics": [...],
    "marketingMetrics": [...],
    "operationalMetrics": [...],
    "lastUpdated": "2024-01-30T09:45:00Z"
  }
}
```

### Customer Journey Tracking

#### GET /analytics/customer-journeys
Track customer journey through sales funnel.

**Query Parameters:**
- `customerId` (optional): Specific customer ID
- `stage` (optional): Journey stage filter
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Success Response:**
```json
{
  "success": true,
  "data": {
    "journeys": [
      {
        "customerId": "cust_001",
        "currentStage": "test_drive_scheduled",
        "stages": [
          {
            "stage": "initial_interest",
            "timestamp": "2024-01-15T10:00:00Z",
            "touchpoint": "website",
            "duration": 180
          },
          {
            "stage": "brochure_request",
            "timestamp": "2024-01-15T10:03:00Z", 
            "touchpoint": "website_form",
            "duration": 300
          }
        ],
        "vehicleInterest": ["LYRIQ", "OPTIQ"],
        "estimatedValue": 72000,
        "probability": 0.65
      }
    ]
  }
}
```

### Sales Funnel Analysis

#### GET /analytics/sales-funnel
Analyze sales funnel performance and conversion rates.

**Query Parameters:**
- `period` (optional): Analysis period
- `canton` (optional): Canton filter
- `vehicleModel` (optional): Vehicle model filter

**Success Response:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "stage": "awareness",
        "prospects": 5420,
        "conversionRate": 100,
        "previousPeriod": 5100,
        "change": 6.3
      },
      {
        "stage": "interest", 
        "prospects": 3250,
        "conversionRate": 60.0,
        "previousPeriod": 3100,
        "change": 4.8
      }
    ],
    "metrics": {
      "overallConversion": 12.5,
      "averageDealSize": 68500,
      "salesCycleLength": 45
    }
  }
}
```

---

## 👥 Customer Management APIs

### Customer Profiles

#### GET /customers
Get customer list with filtering and pagination.

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20): Items per page
- `search` (optional): Search term
- `canton` (optional): Canton filter
- `stage` (optional): Customer stage filter
- `vehicleInterest` (optional): Vehicle model interest

**Success Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cust_001",
        "profile": {
          "name": "Max Mustermann",
          "email": "max.mustermann@email.ch",
          "phone": "+41 78 123 45 67",
          "address": {
            "street": "Musterstrasse 123",
            "city": "Zürich",
            "postalCode": "8001",
            "canton": "ZH"
          }
        },
        "preferences": {
          "vehicleInterest": ["LYRIQ"],
          "budgetRange": "60000-80000",
          "timeframe": "3_months"
        },
        "journey": {
          "currentStage": "test_drive_completed",
          "lastContact": "2024-01-28T14:30:00Z",
          "assignedSalesperson": "sales_001"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2847,
      "totalPages": 143
    }
  }
}
```

#### POST /customers
Create new customer profile.

**Request:**
```json
{
  "profile": {
    "name": "Maria Schweizer",
    "email": "maria.schweizer@email.ch",
    "phone": "+41 79 987 65 43",
    "address": {
      "street": "Baselstrasse 45",
      "city": "Basel",
      "postalCode": "4001",
      "canton": "BS"
    }
  },
  "preferences": {
    "vehicleInterest": ["OPTIQ"],
    "budgetRange": "50000-70000",
    "timeframe": "6_months"
  },
  "source": "website_form"
}
```

---

## 🚗 Vehicle & Inventory APIs

### Vehicle Models

#### GET /vehicles/models
Get available Cadillac EV models for Swiss market.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "lyriq_2024",
        "name": "CADILLAC LYRIQ",
        "year": 2024,
        "category": "luxury_suv",
        "specifications": {
          "range_wltp": 450,
          "power_kw": 255,
          "acceleration_0_100": 6.0,
          "battery_capacity": 100.4,
          "charging_speed_max": 190
        },
        "pricing": {
          "base_price_chf": 62900,
          "available_incentives": true,
          "financing_available": true
        },
        "availability": {
          "inStock": 5,
          "nextDelivery": "2024-03-15",
          "waitingList": 23
        }
      }
    ]
  }
}
```

---

## 🔧 System APIs

### Health Check

#### GET /health
System health and status check.

**Success Response:**
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "database": "healthy",
    "zefix_api": "healthy",
    "swiss_post_api": "healthy",
    "charging_stations_api": "degraded",
    "analytics_engine": "healthy"
  },
  "uptime": 2591999,
  "version": "1.0.0",
  "timestamp": "2024-01-30T10:00:00Z"
}
```

---

## 📝 Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error details if applicable"
  },
  "service_unavailable": false,
  "retry_suggested": false,
  "timestamp": "2024-01-30T10:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service unavailable |

### Service-Specific Error Codes

#### Swiss Data Integration Errors
- `ZEFIX_UNAVAILABLE`: ZEFIX service unavailable
- `SWISS_POST_UNAVAILABLE`: Swiss Post API unavailable
- `CHARGING_API_UNAVAILABLE`: Charging stations API unavailable
- `INVALID_POSTAL_CODE`: Invalid Swiss postal code
- `CANTON_NOT_SUPPORTED`: Canton not supported

#### Analytics Errors
- `ANALYTICS_DB_UNAVAILABLE`: Analytics database unavailable
- `INSUFFICIENT_DATA`: Not enough data for analysis
- `INVALID_TIME_PERIOD`: Invalid time period specified

---

## 🚀 Rate Limiting

API rate limits are enforced per endpoint:

- **Authentication**: 5 requests per 15 minutes
- **Swiss Data APIs**: 100 requests per 15 minutes
- **Analytics APIs**: 100 requests per 15 minutes
- **Customer APIs**: 1000 requests per 15 minutes

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
X-RateLimit-Window: 900000
```

---

## 🔄 Webhooks

### Customer Journey Events

Register webhook endpoints to receive real-time customer journey updates:

```json
{
  "event": "customer.stage_changed",
  "data": {
    "customerId": "cust_001",
    "previousStage": "interest",
    "newStage": "test_drive_scheduled",
    "timestamp": "2024-01-30T10:00:00Z"
  }
}
```

### Available Events
- `customer.created`
- `customer.stage_changed`
- `customer.vehicle_interest_updated`
- `sale.completed`
- `test_drive.scheduled`
- `test_drive.completed`

---

## 🧪 Testing

### Sandbox Environment

Base URL: `https://api-sandbox.cadillac-ev-cis.ch/api`

Test credentials:
```
Email: test@cadillac.ch
Password: TestPassword123
```

### Postman Collection

Download our Postman collection: [CadillacEV_API.postman_collection.json](./postman/CadillacEV_API.postman_collection.json)

---

## 📞 Support

For API support and questions:
- **Email**: api-support@cadillac.ch
- **Documentation**: https://docs.cadillac-ev-cis.ch
- **Status Page**: https://status.cadillac-ev-cis.ch

---

*Last Updated: January 30, 2024*  
*Version: 1.0.0*