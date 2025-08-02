from flask import Blueprint, request, jsonify
import requests
import json
from datetime import datetime
import random
import os
import logging

swiss_bp = Blueprint('swiss_data', __name__)

# Real Swiss API endpoints
SWISS_APIS = {
    'zefix': 'https://www.zefix.admin.ch/ZefixPublicREST/api/v1',
    'openplz': 'https://openplzapi.org/ch',
    'charging_stations': 'https://api.ich-tanke-strom.ch/api/v1',
    'swisstopo': 'https://api3.geo.admin.ch/rest/services'
}

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@swiss_bp.route('/company-lookup', methods=['POST'])
def company_lookup():
    """
    Look up company information from Swiss Handelsregister (ZEFIX)
    """
    try:
        data = request.get_json()
        uid_number = data.get('uid_number', '')
        company_name = data.get('company_name', '')
        
        if not uid_number and not company_name:
            return jsonify({
                'success': False,
                'error': 'Either uid_number or company_name must be provided'
            }), 400

        # Call real ZEFIX API
        results = []
        zefix_url = f"{SWISS_APIS['zefix']}/firm/search.json"
        
        # Search parameters for ZEFIX API
        params = {
            'offset': 0,
            'maxEntries': 20,
            'activeOnly': 'true'
        }
        
        if uid_number:
            # Clean UID format (remove CHE- prefix and dots)
            clean_uid = uid_number.replace('CHE-', '').replace('.', '').replace(' ', '')
            params['uid'] = clean_uid
        elif company_name:
            params['name'] = company_name
            
        logger.info(f"Calling ZEFIX API with params: {params}")
        
        response = requests.get(zefix_url, params=params, timeout=10)
        
        if response.status_code == 200:
            zefix_data = response.json()
            
            for firm in zefix_data.get('list', []):
                # Transform ZEFIX data to our standard format
                company = {
                    "uid": firm.get('uid', ''),
                    "name": firm.get('name', ''),
                    "legal_form": firm.get('legalForm', ''),
                    "status": 'active' if firm.get('status') == 'ACTIVE' else 'inactive',
                    "address": {
                        "street": firm.get('address', {}).get('street', ''),
                        "postal_code": firm.get('address', {}).get('swissZipCode', ''),
                        "city": firm.get('address', {}).get('city', ''),
                        "canton": _get_canton_abbreviation(firm.get('address', {}).get('canton', ''))
                    },
                    "industry": firm.get('purpose', ''),
                    "founded_date": firm.get('sogcDate', ''),
                    "registration_date": firm.get('registryOfCommerceDate', ''),
                    "last_updated": firm.get('lastUpdate', ''),
                    "ehraid": firm.get('ehraid', ''),
                    "language": firm.get('language', 'DE')
                }
                results.append(company)
        
            return jsonify({
                'success': True,
                'companies': results,
                'total_results': len(results),
                'source': 'Swiss Federal Commercial Registry (ZEFIX)',
                'timestamp': datetime.now().isoformat(),
                'query': {
                    'uid_number': uid_number,
                    'company_name': company_name
                }
            })
        else:
            logger.error(f"ZEFIX API error: {response.status_code} - {response.text}")
            return jsonify({
                'success': False,
                'error': f'Swiss Federal Commercial Registry (ZEFIX) is currently unavailable. Status: {response.status_code}',
                'service_unavailable': True,
                'retry_suggested': True,
                'timestamp': datetime.now().isoformat()
            }), 503
            
    except requests.exceptions.RequestException as e:
        logger.error(f"ZEFIX API request error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Swiss Federal Commercial Registry (ZEFIX) is currently unreachable. Please check your internet connection and try again.',
            'service_unavailable': True,
            'retry_suggested': True,
            'timestamp': datetime.now().isoformat()
        }), 503
    except Exception as e:
        logger.error(f"Company lookup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _get_canton_abbreviation(canton_name):
    """Convert canton name to abbreviation"""
    canton_mapping = {
        'Zürich': 'ZH', 'Bern': 'BE', 'Luzern': 'LU', 'Uri': 'UR', 'Schwyz': 'SZ',
        'Obwalden': 'OW', 'Nidwalden': 'NW', 'Glarus': 'GL', 'Zug': 'ZG',
        'Freiburg': 'FR', 'Solothurn': 'SO', 'Basel-Stadt': 'BS', 'Basel-Landschaft': 'BL',
        'Schaffhausen': 'SH', 'Appenzell Ausserrhoden': 'AR', 'Appenzell Innerrhoden': 'AI',
        'St. Gallen': 'SG', 'Graubünden': 'GR', 'Aargau': 'AG', 'Thurgau': 'TG',
        'Tessin': 'TI', 'Waadt': 'VD', 'Wallis': 'VS', 'Neuenburg': 'NE', 'Genf': 'GE',
        'Jura': 'JU'
    }
    return canton_mapping.get(canton_name, canton_name)



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
    Get Swiss postal codes and location data using OpenPLZ API
    """
    try:
        canton = request.args.get('canton', '')
        city = request.args.get('city', '')
        postal_code = request.args.get('postal_code', '')
        
        # Use OpenPLZ API for real Swiss postal data
        results = []
        
        if postal_code:
            # Search by postal code
            openplz_url = f"{SWISS_APIS['openplz']}/Localities"
            params = {'postalCode': postal_code}
            
        elif canton:
            # Search by canton
            openplz_url = f"{SWISS_APIS['openplz']}/Cantons/{canton}/Localities"
            params = {}
        if city:
                params['name'] = city
        elif city:
            # Search by city name
            openplz_url = f"{SWISS_APIS['openplz']}/Localities"
            params = {'name': city}
        else:
            # Get all cantons if no specific search
            openplz_url = f"{SWISS_APIS['openplz']}/Cantons"
            params = {}
            
        logger.info(f"Calling OpenPLZ API: {openplz_url} with params: {params}")
        
        response = requests.get(openplz_url, params=params, timeout=10)
        
        if response.status_code == 200:
            openplz_data = response.json()
            
            # Handle different response formats
            if 'cantons' in openplz_url:
                # Canton list response
                for canton_data in openplz_data:
                    results.append({
                        "canton_key": canton_data.get('key', ''),
                        "canton_name": canton_data.get('name', ''),
                        "canton_abbreviation": canton_data.get('shortName', ''),
                        "type": "canton"
                    })
            else:
                # Localities response
                for locality in openplz_data:
                    postal_data = {
                        "postal_code": locality.get('postalcode', ''),
                        "locality": locality.get('name', ''),
                        "commune": {
                            "key": locality.get('commune', {}).get('key', ''),
                            "name": locality.get('commune', {}).get('name', ''),
                            "short_name": locality.get('commune', {}).get('shortName', '')
                        },
                        "district": {
                            "key": locality.get('district', {}).get('key', ''),
                            "name": locality.get('district', {}).get('name', ''),
                            "short_name": locality.get('district', {}).get('shortName', '')
                        },
                        "canton": {
                            "key": locality.get('canton', {}).get('key', ''),
                            "name": locality.get('canton', {}).get('name', ''),
                            "abbreviation": locality.get('canton', {}).get('shortName', '')
                        },
                        "type": "locality"
                    }
                    results.append(postal_data)
                    
            return jsonify({
                'success': True,
                'postal_data': results,
                'total': len(results),
                'source': 'Swiss OpenPLZ API',
                'timestamp': datetime.now().isoformat(),
                'query': {
                    'canton': canton,
                    'city': city,
                    'postal_code': postal_code
                }
            })
        else:
            logger.error(f"OpenPLZ API error: {response.status_code} - {response.text}")
            return jsonify({
                'success': False,
                'error': f'Swiss OpenPLZ postal service is currently unavailable. Status: {response.status_code}',
                'service_unavailable': True,
                'retry_suggested': True,
                'timestamp': datetime.now().isoformat()
            }), 503
            
    except requests.exceptions.RequestException as e:
        logger.error(f"OpenPLZ API request error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Swiss OpenPLZ postal service is currently unreachable. Please check your internet connection and try again.',
            'service_unavailable': True,
            'retry_suggested': True,
            'timestamp': datetime.now().isoformat()
        }), 503
    except Exception as e:
        logger.error(f"Postal codes lookup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/postal-codes/validate', methods=['POST'])
def validate_postal_code():
    """
    Validate Swiss postal code with enhanced validation
    """
    try:
        data = request.get_json()
        postal_code = data.get('postal_code', '')
        city = data.get('city', '')
        
        if not postal_code:
            return jsonify({
                'success': False,
                'valid': False,
                'error': 'Postal code is required'
            }), 400
            
        # Swiss postal code format validation (4 digits)
        if not postal_code.isdigit() or len(postal_code) != 4:
        return jsonify({
            'success': True,
                'valid': False,
                'error': 'Swiss postal codes must be exactly 4 digits',
                'format_error': True
            })
            
        # Validate against OpenPLZ API
        openplz_url = f"{SWISS_APIS['openplz']}/Localities"
        params = {'postalCode': postal_code}
        if city:
            params['name'] = city
            
        response = requests.get(openplz_url, params=params, timeout=10)
        
        if response.status_code == 200:
            localities = response.json()
            
            if localities:
                # Valid postal code found
                matching_localities = []
                for locality in localities:
                    if not city or city.lower() in locality.get('name', '').lower():
                        matching_localities.append({
                            "postal_code": locality.get('postalcode', ''),
                            "locality": locality.get('name', ''),
                            "canton": locality.get('canton', {}).get('shortName', ''),
                            "district": locality.get('district', {}).get('name', ''),
                            "commune": locality.get('commune', {}).get('name', '')
                        })
                        
                return jsonify({
                    'success': True,
                    'valid': True,
                    'postal_code': postal_code,
                    'localities': matching_localities,
                    'source': 'Swiss OpenPLZ API'
                })
            else:
                return jsonify({
                    'success': True,
                    'valid': False,
                    'postal_code': postal_code,
                    'error': 'Postal code not found in Swiss postal system'
                })
        else:
            # Service unavailable - cannot validate
            return jsonify({
                'success': False,
                'valid': False,
                'postal_code': postal_code,
                'error': 'Swiss OpenPLZ postal service is unavailable. Cannot verify postal code against official database.',
                'service_unavailable': True,
                'retry_suggested': True,
                'source': 'Service unavailable'
        }), 503
        
    except Exception as e:
        logger.error(f"Postal code validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



@swiss_bp.route('/charging-stations', methods=['GET'])
def get_charging_stations():
    """
    Get EV charging station data for Switzerland with real-time data
    """
    try:
        canton = request.args.get('canton', '')
        city = request.args.get('city', '')
        charging_type = request.args.get('type', '')  # fast, normal, tesla, all
        power_min = request.args.get('power_min', 0, type=int)  # Minimum power in kW
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 50, type=int)  # Radius in km
        
        results = []
        
        # Try multiple sources for comprehensive charging station data
        charging_sources = []
        
        # Source 1: Try ich-tanke-strom.ch API (Swiss Federal Energy Office)
        try:
            ich_tanke_url = "https://api.ich-tanke-strom.ch/stations"
            params = {}
            if canton:
                params['canton'] = canton
            if city:
                params['city'] = city
                
            response = requests.get(ich_tanke_url, params=params, timeout=5)
            if response.status_code == 200:
                ich_tanke_data = response.json()
                for station in ich_tanke_data.get('stations', []):
                    charging_sources.append(_parse_ich_tanke_station(station))
        except Exception as e:
            logger.info(f"ich-tanke-strom API not available: {str(e)}")
        
        # Source 2: Static reference data for Swiss charging networks (when API unavailable)
        if not charging_sources:  # Only use static data if no real API data available
            static_stations = _get_static_charging_reference(canton, city, charging_type)
            results.extend(static_stations)
        
        # Add real data if available
        results.extend(charging_sources)
        
        # Apply filters
        filtered_results = []
        for station in results:
            # Filter by power
            if power_min > 0:
                max_power = max([cp.get('power_kw', 0) for cp in station.get('charging_points', [])])
                if max_power < power_min:
                    continue
            
            # Filter by charging type
            if charging_type and charging_type != 'all':
                station_types = [cp.get('type', '').lower() for cp in station.get('charging_points', [])]
                if charging_type == 'fast' and not any(cp.get('power_kw', 0) >= 50 for cp in station.get('charging_points', [])):
                    continue
                elif charging_type == 'normal' and not any(cp.get('power_kw', 0) < 50 for cp in station.get('charging_points', [])):
                    continue
                elif charging_type == 'tesla' and 'tesla' not in station.get('operator', '').lower():
                    continue
            
            # Filter by availability
            if available_only:
                available_points = [cp for cp in station.get('charging_points', []) if cp.get('available', False)]
                if not available_points:
                    continue
            
            # Filter by location if coordinates provided
            if lat is not None and lng is not None:
                station_lat = station.get('coordinates', {}).get('lat')
                station_lng = station.get('coordinates', {}).get('lng')
                if station_lat and station_lng:
                    distance = _calculate_distance(lat, lng, station_lat, station_lng)
                    if distance > radius:
                        continue
                    station['distance_km'] = round(distance, 1)
            
            filtered_results.append(station)
        
        # Sort by distance if coordinates provided
        if lat is not None and lng is not None:
            filtered_results.sort(key=lambda x: x.get('distance_km', float('inf')))
        
        # Determine data source and warning messages
        if not charging_sources and not filtered_results:
            return jsonify({
                'success': False,
                'error': 'Charging station services are currently unavailable. Please try again later.',
                'service_unavailable': True,
                'retry_suggested': True,
                'timestamp': datetime.now().isoformat()
            }), 503
        
        source = 'Swiss Charging Networks + Federal Energy Office'
        warning = None
        
        if not charging_sources and filtered_results:
            source = 'Reference Data (Limited - APIs unavailable)'
            warning = 'Real-time charging station data is currently unavailable. Showing reference locations only. Actual availability and pricing may differ.'

        return jsonify({
            'success': True,
            'charging_stations': filtered_results,
            'total': len(filtered_results),
            'filters_applied': {
                'canton': canton,
                'city': city,
                'charging_type': charging_type,
                'power_min': power_min,
                'available_only': available_only,
                'radius_km': radius if lat and lng else None
            },
            'source': source,
            'warning': warning,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Charging stations lookup error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/charging-stations/networks', methods=['GET'])
def get_charging_networks():
    """
    Get information about Swiss charging networks and operators
    """
    try:
        networks = [
            {
                "name": "IONITY",
                "type": "fast_charging",
                "coverage": "national",
                "stations_count": 25,
                "max_power_kw": 350,
                "pricing": "0.79 CHF/kWh",
                "payment_methods": ["app", "credit_card", "rfid"],
                "website": "https://ionity.eu"
            },
            {
                "name": "Swisscharge",
                "type": "comprehensive",
                "coverage": "national",
                "stations_count": 800,
                "max_power_kw": 150,
                "pricing": "0.50-0.65 CHF/kWh",
                "payment_methods": ["app", "credit_card", "rfid"],
                "website": "https://swisscharge.ch"
            },
            {
                "name": "Tesla Supercharger",
                "type": "fast_charging",
                "coverage": "national",
                "stations_count": 40,
                "max_power_kw": 250,
                "pricing": "Variable (Tesla owners: reduced)",
                "payment_methods": ["tesla_app", "credit_card"],
                "website": "https://tesla.com"
            },
            {
                "name": "MOVE",
                "type": "fast_charging", 
                "coverage": "national",
                "stations_count": 48,
                "max_power_kw": 300,
                "pricing": "0.62-0.78 CHF/kWh",
                "payment_methods": ["app", "credit_card"],
                "website": "https://www.move.ch"
            },
            {
                "name": "Energie 360°",
                "type": "comprehensive",
                "coverage": "regional",
                "stations_count": 200,
                "max_power_kw": 150,
                "pricing": "0.29-0.65 CHF/kWh",
                "payment_methods": ["app", "credit_card", "rfid"],
                "website": "https://energie360.ch"
            }
        ]
        
        return jsonify({
            'success': True,
            'charging_networks': networks,
            'total_networks': len(networks),
            'coverage': 'Switzerland',
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _parse_ich_tanke_station(station_data):
    """Parse station data from ich-tanke-strom.ch API"""
    return {
        "id": station_data.get('id', ''),
        "name": station_data.get('name', ''),
        "address": station_data.get('address', ''),
        "canton": station_data.get('canton', ''),
        "city": station_data.get('city', ''),
        "coordinates": {
            "lat": station_data.get('latitude'),
            "lng": station_data.get('longitude')
        },
        "charging_points": station_data.get('connectors', []),
        "operator": station_data.get('operator', ''),
        "pricing": station_data.get('pricing', 'Variable'),
        "amenities": station_data.get('amenities', []),
        "24_7": station_data.get('operating_hours') == '24/7',
        "status": station_data.get('status', 'unknown'),
        "source": "ich-tanke-strom.ch"
    }

def _get_static_charging_reference(canton, city, charging_type):
    """Get static reference data for Swiss charging networks (limited, real locations)"""
    stations = [
        {
            "id": "IONITY-ZH-001",
            "name": "IONITY Zürich Nord",
            "address": "Autobahnraststätte Würenlos, 5436 Würenlos",
            "canton": "AG",
            "city": "Würenlos",
            "coordinates": {"lat": 47.4378, "lng": 8.3561},
            "charging_points": [
                {"type": "CCS", "power_kw": 350, "available": True, "connector_id": "1"},
                {"type": "CCS", "power_kw": 350, "available": True, "connector_id": "2"},
                {"type": "CCS", "power_kw": 350, "available": False, "connector_id": "3"},
                {"type": "CHAdeMO", "power_kw": 50, "available": True, "connector_id": "4"}
            ],
            "operator": "IONITY",
            "pricing": "0.79 CHF/kWh",
            "amenities": ["restaurant", "shop", "toilets", "wifi"],
            "24_7": True,
            "payment_methods": ["app", "credit_card", "contactless"],
            "network": "IONITY",
            "last_updated": datetime.now().isoformat(),
            "note": "Reference data - actual availability may vary"
        }
    ]
    
    # Filter by location
        if canton:
        stations = [s for s in stations if s['canton'].lower() == canton.lower()]
        if city:
        stations = [s for s in stations if city.lower() in s['city'].lower()]
        
    return stations

def _calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in kilometers"""
    import math
    
    # Haversine formula
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

@swiss_bp.route('/ev-incentives/calculate', methods=['POST'])
def calculate_ev_incentives():
    """
    Calculate comprehensive EV incentives and costs for Swiss cantons
    """
    try:
        data = request.get_json()
        
        # Required parameters
        canton = data.get('canton', '').upper()
        vehicle_data = data.get('vehicle', {})
        customer_data = data.get('customer', {})
        
        if not canton:
            return jsonify({
                'success': False,
                'error': 'Canton is required'
            }), 400
            
        # Vehicle parameters
        purchase_price = vehicle_data.get('purchase_price', 70000)  # CHF
        power_kw = vehicle_data.get('power_kw', 255)
        weight_kg = vehicle_data.get('weight_kg', 2234)
        battery_capacity_kwh = vehicle_data.get('battery_capacity_kwh', 102)
        efficiency_kwh_100km = vehicle_data.get('efficiency_kwh_100km', 22)
        
        # Customer parameters
        annual_mileage = customer_data.get('annual_mileage', 15000)
        years_ownership = customer_data.get('years_ownership', 5)
        business_use = customer_data.get('business_use', False)
        
        # Get canton data
        canton_info = _get_canton_data(canton)
        if not canton_info:
            return jsonify({
                'success': False,
                'error': f'Canton {canton} not found'
            }), 404
            
        # Calculate incentives and costs
        calculations = _calculate_comprehensive_ev_costs(
            canton_info, vehicle_data, customer_data, 
            purchase_price, power_kw, weight_kg, 
            annual_mileage, years_ownership
        )
        
        return jsonify({
            'success': True,
            'canton': canton,
            'calculations': calculations,
            'vehicle': vehicle_data,
            'customer': customer_data,
            'timestamp': datetime.now().isoformat(),
            'disclaimer': 'Calculations are estimates based on current regulations. Please verify with local authorities.'
        })
        
    except Exception as e:
        logger.error(f"EV incentives calculation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/ev-incentives/compare', methods=['POST'])
def compare_ev_incentives():
    """
    Compare EV incentives across multiple Swiss cantons
    """
    try:
        data = request.get_json()
        
        cantons = data.get('cantons', [])
        vehicle_data = data.get('vehicle', {})
        customer_data = data.get('customer', {})
        
        if not cantons:
            # Default to major cantons if none specified
            cantons = ['ZH', 'BE', 'GE', 'VD', 'BS', 'TI']
            
        # Calculate for each canton
        comparison_results = []
        
        for canton in cantons:
            canton_info = _get_canton_data(canton.upper())
            if not canton_info:
                continue
                
            calculations = _calculate_comprehensive_ev_costs(
                canton_info, vehicle_data, customer_data,
                vehicle_data.get('purchase_price', 70000),
                vehicle_data.get('power_kw', 255),
                vehicle_data.get('weight_kg', 2234),
                customer_data.get('annual_mileage', 15000),
                customer_data.get('years_ownership', 5)
            )
            
            comparison_results.append({
                'canton': canton.upper(),
                'canton_name': canton_info['name'],
                'total_cost_5_years': calculations['total_cost_5_years'],
                'annual_savings': calculations['annual_savings'],
                'tax_benefits': calculations['tax_benefits'],
                'incentive_summary': calculations['incentive_summary'],
                'rank': 0  # Will be set after sorting
            })
        
        # Sort by total cost (lowest first)
        comparison_results.sort(key=lambda x: x['total_cost_5_years'])
        
        # Add rankings
        for i, result in enumerate(comparison_results):
            result['rank'] = i + 1
        
        return jsonify({
            'success': True,
            'comparison': comparison_results,
            'best_canton': comparison_results[0] if comparison_results else None,
            'vehicle': vehicle_data,
            'customer': customer_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"EV incentives comparison error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@swiss_bp.route('/ev-incentives/cantons', methods=['GET'])
def get_canton_incentives():
    """
    Get EV incentive information for all Swiss cantons
    """
    try:
        cantons_incentives = []
        
        # Swiss cantons with their EV incentive data
        canton_data = {
            'ZH': {'name': 'Zürich', 'ev_tax_discount': 100, 'ev_tax_discount_years': 8},
            'BE': {'name': 'Bern', 'ev_tax_discount': 90, 'ev_tax_discount_years': 5},
            'LU': {'name': 'Luzern', 'ev_tax_discount': 50, 'ev_tax_discount_years': None},
            'BS': {'name': 'Basel-Stadt', 'ev_tax_discount': 100, 'ev_tax_discount_years': 5},
            'BL': {'name': 'Basel-Landschaft', 'ev_tax_discount': 75, 'ev_tax_discount_years': None},
            'GE': {'name': 'Genf', 'ev_tax_discount': 75, 'ev_tax_discount_years': None},
            'VD': {'name': 'Waadt', 'ev_tax_discount': 80, 'ev_tax_discount_years': None},
            'TI': {'name': 'Tessin', 'ev_tax_discount': 50, 'ev_tax_discount_years': None},
            'SG': {'name': 'St. Gallen', 'ev_tax_discount': 60, 'ev_tax_discount_years': None},
            'AG': {'name': 'Aargau', 'ev_tax_discount': 50, 'ev_tax_discount_years': 3},
            'FR': {'name': 'Freiburg', 'ev_tax_discount': 70, 'ev_tax_discount_years': None},
            'SO': {'name': 'Solothurn', 'ev_tax_discount': 60, 'ev_tax_discount_years': None},
            'SH': {'name': 'Schaffhausen', 'ev_tax_discount': 80, 'ev_tax_discount_years': 5},
            'ZG': {'name': 'Zug', 'ev_tax_discount': 90, 'ev_tax_discount_years': 5},
            'NE': {'name': 'Neuenburg', 'ev_tax_discount': 85, 'ev_tax_discount_years': 5},
            'JU': {'name': 'Jura', 'ev_tax_discount': 70, 'ev_tax_discount_years': None},
            'VS': {'name': 'Wallis', 'ev_tax_discount': 60, 'ev_tax_discount_years': None}
        }
        
        for canton_code, info in canton_data.items():
            canton_full_info = _get_canton_data(canton_code)
            
            incentive_info = {
                'canton': canton_code,
                'name': info['name'],
                'ev_tax_discount_percent': info['ev_tax_discount'],
                'ev_tax_discount_years': info['ev_tax_discount_years'],
                'discount_type': 'permanent' if info['ev_tax_discount_years'] is None else 'temporary',
                'additional_benefits': [],
                'registration_fee': canton_full_info.get('registration_fee', 50) if canton_full_info else 50,
                'attractiveness_score': _calculate_attractiveness_score(info)
            }
            
            # Add additional benefits based on canton
            if canton_code in ['ZH', 'BS', 'GE']:
                incentive_info['additional_benefits'].append('Free public parking in some areas')
            if canton_code in ['ZH', 'BE', 'BS']:
                incentive_info['additional_benefits'].append('Access to bus lanes')
            if canton_code in ['GE', 'VD']:
                incentive_info['additional_benefits'].append('Reduced highway vignette fees')
                
            cantons_incentives.append(incentive_info)
        
        # Sort by attractiveness score
        cantons_incentives.sort(key=lambda x: x['attractiveness_score'], reverse=True)
        
        return jsonify({
            'success': True,
            'cantons': cantons_incentives,
            'total_cantons': len(cantons_incentives),
            'last_updated': datetime.now().isoformat(),
            'summary': {
                'best_incentives': cantons_incentives[:3],
                'average_discount': sum(c['ev_tax_discount_percent'] for c in cantons_incentives) / len(cantons_incentives)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _get_canton_data(canton_code):
    """Get detailed canton data"""
    canton_data = {
        'ZH': {'name': 'Zürich', 'vehicle_tax_calculation_method': 'COMBINED', 'vehicle_tax_factor_power': 1.5,
               'vehicle_tax_factor_weight': 0.05, 'ev_tax_discount': 100, 'ev_tax_discount_years': 8,
               'registration_fee': 50, 'license_plate_fee': 25, 'average_electricity_price_per_kwh': 0.21},
        'BE': {'name': 'Bern', 'vehicle_tax_calculation_method': 'WEIGHT', 'vehicle_tax_factor_weight': 0.11,
               'ev_tax_discount': 90, 'ev_tax_discount_years': 5, 'registration_fee': 45, 'license_plate_fee': 30,
               'average_electricity_price_per_kwh': 0.19},
        'BS': {'name': 'Basel-Stadt', 'vehicle_tax_calculation_method': 'COMBINED', 'vehicle_tax_factor_power': 1.5,
               'vehicle_tax_factor_weight': 0.05, 'ev_tax_discount': 100, 'ev_tax_discount_years': 5,
               'registration_fee': 55, 'license_plate_fee': 35, 'average_electricity_price_per_kwh': 0.22},
        'GE': {'name': 'Genf', 'vehicle_tax_calculation_method': 'COMBINED', 'vehicle_tax_factor_power': 1.2,
               'vehicle_tax_factor_weight': 0.08, 'ev_tax_discount': 75, 'ev_tax_discount_years': None,
               'registration_fee': 60, 'license_plate_fee': 40, 'average_electricity_price_per_kwh': 0.20}
    }
    return canton_data.get(canton_code)

def _calculate_comprehensive_ev_costs(canton_info, vehicle_data, customer_data, 
                                    purchase_price, power_kw, weight_kg, 
                                    annual_mileage, years_ownership):
    """Calculate comprehensive EV costs and incentives"""
    
    # Base vehicle tax calculation
    base_annual_tax = _calculate_base_vehicle_tax(canton_info, power_kw, weight_kg)
    
    # Apply EV discount
    ev_discount_percent = canton_info.get('ev_tax_discount', 0)
    ev_discount_years = canton_info.get('ev_tax_discount_years')
    
    # Calculate tax savings
    annual_tax_saving = base_annual_tax * (ev_discount_percent / 100)
    
    if ev_discount_years:
        total_tax_savings = annual_tax_saving * min(years_ownership, ev_discount_years)
        # After discount period, pay full tax
        remaining_years = max(0, years_ownership - ev_discount_years)
        total_tax_cost = remaining_years * base_annual_tax
    else:
        # Permanent discount
        total_tax_savings = annual_tax_saving * years_ownership
        total_tax_cost = (base_annual_tax - annual_tax_saving) * years_ownership
    
    # Registration and license costs
    registration_cost = canton_info.get('registration_fee', 50)
    license_plate_cost = canton_info.get('license_plate_fee', 25)
    
    # Energy costs
    efficiency = vehicle_data.get('efficiency_kwh_100km', 22)
    electricity_price = canton_info.get('average_electricity_price_per_kwh', 0.20)
    annual_energy_kwh = (annual_mileage / 100) * efficiency
    annual_energy_cost = annual_energy_kwh * electricity_price
    total_energy_cost = annual_energy_cost * years_ownership
    
    # Total cost calculation
    total_cost_5_years = (purchase_price + registration_cost + license_plate_cost + 
                         total_tax_cost + total_energy_cost)
    
    # Savings compared to paying full tax
    total_savings_vs_ice = total_tax_savings
    
    return {
        'purchase_costs': {
            'vehicle_price': purchase_price,
            'registration_fee': registration_cost,
            'license_plate_fee': license_plate_cost,
            'total_initial': purchase_price + registration_cost + license_plate_cost
        },
        'annual_costs': {
            'vehicle_tax_without_discount': base_annual_tax,
            'vehicle_tax_with_discount': base_annual_tax - annual_tax_saving,
            'energy_cost': annual_energy_cost,
            'total_annual_operating': (base_annual_tax - annual_tax_saving) + annual_energy_cost
        },
        'tax_benefits': {
            'discount_percent': ev_discount_percent,
            'discount_years': ev_discount_years,
            'annual_tax_saving': annual_tax_saving,
            'total_tax_savings': total_tax_savings
        },
        'total_cost_5_years': total_cost_5_years,
        'annual_savings': total_tax_savings / years_ownership,
        'energy_analysis': {
            'annual_consumption_kwh': annual_energy_kwh,
            'electricity_price_per_kwh': electricity_price,
            'total_energy_cost_5_years': total_energy_cost,
            'cost_per_100km': (efficiency * electricity_price)
        },
        'incentive_summary': {
            'has_tax_discount': ev_discount_percent > 0,
            'discount_type': 'permanent' if not ev_discount_years else f'{ev_discount_years} years',
            'total_savings': total_savings_vs_ice,
            'canton_rank': 'high' if ev_discount_percent >= 80 else 'medium' if ev_discount_percent >= 50 else 'low'
        }
    }

def _calculate_base_vehicle_tax(canton_info, power_kw, weight_kg):
    """Calculate base vehicle tax before EV discounts"""
    method = canton_info.get('vehicle_tax_calculation_method', 'COMBINED')
    
    if method == 'POWER':
        factor = canton_info.get('vehicle_tax_factor_power', 2.0)
        return power_kw * factor
    elif method == 'WEIGHT':
        factor = canton_info.get('vehicle_tax_factor_weight', 0.1)
        return weight_kg * factor
    elif method == 'COMBINED':
        power_factor = canton_info.get('vehicle_tax_factor_power', 1.5)
        weight_factor = canton_info.get('vehicle_tax_factor_weight', 0.05)
        return (power_kw * power_factor) + (weight_kg * weight_factor)
    else:
        # Flat rate
        return canton_info.get('vehicle_tax_base_fee', 300)

def _calculate_attractiveness_score(canton_info):
    """Calculate attractiveness score for EV incentives"""
    discount = canton_info.get('ev_tax_discount', 0)
    years = canton_info.get('ev_tax_discount_years')
    
    score = discount
    if years is None:  # Permanent discount gets bonus
        score += 20
    elif years >= 5:   # Long-term discount gets smaller bonus
        score += 10
    
    return min(score, 100)

