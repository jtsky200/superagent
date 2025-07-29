from flask import Blueprint, request, jsonify
import requests
import json
from datetime import datetime
import random

swiss_bp = Blueprint('swiss_data', __name__)

# Mock Swiss API endpoints (replace with real ones in production)
SWISS_APIS = {
    'handelsregister': 'https://api.zefix.ch/v1',
    'zek': 'https://api.zek.ch/v1',
    'astra': 'https://api.astra.admin.ch/v1',
    'postal': 'https://api.post.ch/v1'
}

@swiss_bp.route('/company-lookup', methods=['POST'])
def company_lookup():
    """
    Look up company information from Swiss Handelsregister
    """
    try:
        data = request.get_json()
        uid_number = data.get('uid_number', '')
        company_name = data.get('company_name', '')
        
        # Mock company data (replace with actual API call)
        mock_companies = [
            {
                "uid": "CHE-123.456.789",
                "name": "TechCorp AG",
                "legal_form": "AG",
                "status": "active",
                "address": {
                    "street": "Bahnhofstrasse 1",
                    "postal_code": "8001",
                    "city": "Zürich",
                    "canton": "ZH"
                },
                "industry": "Information Technology",
                "founded_date": "2015-03-15",
                "capital": 100000,
                "employees_range": "10-50",
                "vat_number": "CHE-123.456.789 MWST"
            },
            {
                "uid": "CHE-987.654.321",
                "name": "Swiss Innovations GmbH",
                "legal_form": "GmbH",
                "status": "active",
                "address": {
                    "street": "Industriestrasse 25",
                    "postal_code": "4051",
                    "city": "Basel",
                    "canton": "BS"
                },
                "industry": "Manufacturing",
                "founded_date": "2010-07-22",
                "capital": 50000,
                "employees_range": "50-100",
                "vat_number": "CHE-987.654.321 MWST"
            }
        ]
        
        # Filter based on search criteria
        results = []
        for company in mock_companies:
            if uid_number and uid_number in company['uid']:
                results.append(company)
            elif company_name and company_name.lower() in company['name'].lower():
                results.append(company)
        
        if not results and (uid_number or company_name):
            # Generate mock result for demo
            results = [{
                "uid": uid_number or "CHE-000.000.000",
                "name": company_name or "Demo Company AG",
                "legal_form": "AG",
                "status": "active",
                "address": {
                    "street": "Musterstrasse 1",
                    "postal_code": "8000",
                    "city": "Zürich",
                    "canton": "ZH"
                },
                "industry": "Services",
                "founded_date": "2020-01-01",
                "capital": 100000,
                "employees_range": "1-10",
                "vat_number": f"{uid_number or 'CHE-000.000.000'} MWST"
            }]
        
        return jsonify({
            'success': True,
            'companies': results,
            'source': 'Swiss Handelsregister (Mock)',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/credit-check', methods=['POST'])
def credit_check():
    """
    Perform credit check via ZEK (Swiss Credit Bureau)
    """
    try:
        data = request.get_json()
        
        customer_data = data.get('customer', {})
        check_type = data.get('check_type', 'basic')  # basic, detailed, business
        
        # Mock credit check result
        credit_scores = ['A', 'B', 'C', 'D', 'E']
        risk_levels = ['very_low', 'low', 'medium', 'high', 'very_high']
        
        mock_result = {
            "customer_id": customer_data.get('id', 'unknown'),
            "check_type": check_type,
            "credit_score": random.choice(credit_scores),
            "risk_level": random.choice(risk_levels),
            "score_details": {
                "payment_history": random.randint(70, 100),
                "debt_ratio": random.randint(10, 40),
                "credit_utilization": random.randint(20, 80),
                "account_age": random.randint(1, 20)
            },
            "recommendations": {
                "financing_approved": random.choice([True, False]),
                "max_loan_amount": random.randint(50000, 150000),
                "recommended_down_payment": random.randint(10000, 30000),
                "interest_rate_range": f"{random.uniform(2.5, 6.5):.1f}% - {random.uniform(6.5, 9.5):.1f}%"
            },
            "flags": [],
            "valid_until": "2024-12-31",
            "checked_at": datetime.now().isoformat()
        }
        
        # Add flags based on risk level
        if mock_result['risk_level'] in ['high', 'very_high']:
            mock_result['flags'].append('requires_additional_documentation')
        if mock_result['score_details']['debt_ratio'] > 35:
            mock_result['flags'].append('high_debt_ratio')
        
        return jsonify({
            'success': True,
            'credit_check': mock_result,
            'source': 'ZEK Swiss Credit Bureau (Mock)',
            'disclaimer': 'This is a mock credit check for demonstration purposes'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/vehicle-registration', methods=['POST'])
def vehicle_registration():
    """
    Check vehicle registration data via ASTRA
    """
    try:
        data = request.get_json()
        license_plate = data.get('license_plate', '')
        vin = data.get('vin', '')
        
        # Mock vehicle registration data
        mock_registration = {
            "license_plate": license_plate or "ZH 123456",
            "vin": vin or "WBY8P2C51K7A12345",
            "vehicle_details": {
                "make": "CADILLAC",
                "model": "LYRIQ",
                "year": 2024,
                "fuel_type": "Electric",
                "power_kw": 255,
                "co2_emissions": 0,
                "weight": 2234,
                "color": "Summit White"
            },
            "registration_info": {
                "first_registration": "2024-01-15",
                "canton": "ZH",
                "status": "active",
                "owner_type": "private",
                "technical_inspection_due": "2027-01-15"
            },
            "environmental_data": {
                "energy_efficiency_class": "A",
                "noise_level": 68,
                "particulate_filter": "not_applicable"
            },
            "fees_and_taxes": {
                "annual_road_tax": 0,  # Electric vehicles exempt in most cantons
                "registration_fee": 150,
                "inspection_fee": 50
            }
        }
        
        return jsonify({
            'success': True,
            'registration': mock_registration,
            'source': 'ASTRA Vehicle Registry (Mock)'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/postal-codes', methods=['GET'])
def get_postal_codes():
    """
    Get Swiss postal codes and location data
    """
    try:
        canton = request.args.get('canton', '')
        city = request.args.get('city', '')
        
        # Mock postal code data
        mock_postal_data = [
            {"postal_code": "8001", "city": "Zürich", "canton": "ZH", "region": "Zürich"},
            {"postal_code": "8002", "city": "Zürich", "canton": "ZH", "region": "Zürich"},
            {"postal_code": "4051", "city": "Basel", "canton": "BS", "region": "Basel"},
            {"postal_code": "1201", "city": "Genève", "canton": "GE", "region": "Genève"},
            {"postal_code": "3001", "city": "Bern", "canton": "BE", "region": "Bern"},
            {"postal_code": "6900", "city": "Lugano", "canton": "TI", "region": "Lugano"},
            {"postal_code": "9000", "city": "St. Gallen", "canton": "SG", "region": "St. Gallen"}
        ]
        
        # Filter results
        results = mock_postal_data
        if canton:
            results = [item for item in results if item['canton'].lower() == canton.lower()]
        if city:
            results = [item for item in results if city.lower() in item['city'].lower()]
        
        return jsonify({
            'success': True,
            'postal_codes': results,
            'total': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/charging-stations', methods=['GET'])
def get_charging_stations():
    """
    Get EV charging station data for Switzerland
    """
    try:
        canton = request.args.get('canton', '')
        city = request.args.get('city', '')
        charging_type = request.args.get('type', '')  # fast, normal, tesla
        
        # Mock charging station data
        mock_stations = [
            {
                "id": "CH-ZH-001",
                "name": "Zürich HB Charging Hub",
                "address": "Bahnhofplatz 15, 8001 Zürich",
                "canton": "ZH",
                "city": "Zürich",
                "coordinates": {"lat": 47.3769, "lng": 8.5417},
                "charging_points": [
                    {"type": "CCS", "power_kw": 150, "available": True},
                    {"type": "CHAdeMO", "power_kw": 50, "available": True},
                    {"type": "Type2", "power_kw": 22, "available": False}
                ],
                "operator": "IONITY",
                "pricing": "0.79 CHF/kWh",
                "amenities": ["restaurant", "shopping", "wifi"],
                "24_7": True
            },
            {
                "id": "CH-BS-002",
                "name": "Basel Airport Fast Charge",
                "address": "Flughafen Basel-Mulhouse, 4056 Basel",
                "canton": "BS",
                "city": "Basel",
                "coordinates": {"lat": 47.5896, "lng": 7.5298},
                "charging_points": [
                    {"type": "CCS", "power_kw": 350, "available": True},
                    {"type": "CCS", "power_kw": 350, "available": True}
                ],
                "operator": "Fastned",
                "pricing": "0.69 CHF/kWh",
                "amenities": ["airport", "cafe"],
                "24_7": True
            }
        ]
        
        # Filter results
        results = mock_stations
        if canton:
            results = [station for station in results if station['canton'].lower() == canton.lower()]
        if city:
            results = [station for station in results if city.lower() in station['city'].lower()]
        
        return jsonify({
            'success': True,
            'charging_stations': results,
            'total': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

