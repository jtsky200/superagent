from flask import Blueprint, request, jsonify
from datetime import datetime
import math

tco_bp = Blueprint('tco_calculator', __name__)

# Swiss-specific constants
SWISS_CONSTANTS = {
    'electricity_price_per_kwh': 0.21,  # CHF per kWh (average Swiss price)
    'gasoline_price_per_liter': 1.65,   # CHF per liter
    'co2_tax_per_liter': 0.096,         # CHF per liter CO2 tax
    'road_tax_ice': 300,                # CHF per year for ICE vehicles
    'road_tax_ev': 0,                   # CHF per year for EVs (most cantons)
    'insurance_factor_ev': 0.95,        # EVs typically 5% cheaper to insure
    'maintenance_factor_ev': 0.6,       # EVs need 40% less maintenance
    'depreciation_rate_ev': 0.15,       # 15% per year
    'depreciation_rate_ice': 0.18,      # 18% per year
}

@tco_bp.route('/calculate', methods=['POST'])
def calculate_tco():
    """
    Calculate Total Cost of Ownership for CADILLAC EVs vs ICE vehicles
    """
    try:
        data = request.get_json()
        
        # Vehicle configuration
        vehicle = data.get('vehicle', {})
        comparison_vehicle = data.get('comparison_vehicle', {})
        
        # Usage parameters
        annual_mileage = data.get('annual_mileage', 15000)
        calculation_period = data.get('calculation_period_years', 5)
        canton = data.get('canton', 'ZH')
        
        # Financial parameters
        purchase_price = vehicle.get('purchase_price', 85200)
        down_payment = data.get('down_payment', 20000)
        financing_rate = data.get('financing_rate', 0.039)
        
        # Calculate EV costs
        ev_costs = calculate_ev_costs(
            purchase_price, annual_mileage, calculation_period, 
            canton, down_payment, financing_rate, vehicle
        )
        
        # Calculate ICE comparison if provided
        ice_costs = None
        if comparison_vehicle:
            ice_costs = calculate_ice_costs(
                comparison_vehicle.get('purchase_price', 75000),
                annual_mileage, calculation_period, canton,
                down_payment, financing_rate, comparison_vehicle
            )
        
        # Calculate savings
        savings = None
        if ice_costs:
            savings = {
                'total_savings': ice_costs['total_cost'] - ev_costs['total_cost'],
                'annual_savings': (ice_costs['total_cost'] - ev_costs['total_cost']) / calculation_period,
                'fuel_savings': ice_costs['fuel_costs']['total'] - ev_costs['energy_costs']['total'],
                'maintenance_savings': ice_costs['maintenance_costs']['total'] - ev_costs['maintenance_costs']['total'],
                'tax_savings': ice_costs['taxes_fees']['total'] - ev_costs['taxes_fees']['total']
            }
        
        result = {
            'calculation_id': f"TCO-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'parameters': {
                'annual_mileage': annual_mileage,
                'calculation_period_years': calculation_period,
                'canton': canton,
                'purchase_price': purchase_price,
                'down_payment': down_payment,
                'financing_rate': financing_rate
            },
            'ev_costs': ev_costs,
            'ice_costs': ice_costs,
            'savings': savings,
            'calculated_at': datetime.now().isoformat(),
            'currency': 'CHF'
        }
        
        return jsonify({
            'success': True,
            'tco_calculation': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_ev_costs(purchase_price, annual_mileage, years, canton, down_payment, rate, vehicle):
    """Calculate EV-specific costs"""
    
    # Vehicle specifications
    consumption_kwh_100km = vehicle.get('consumption', 18.5)  # LYRIQ average
    battery_capacity = vehicle.get('battery_capacity', 102)   # kWh
    
    # Financing costs
    loan_amount = purchase_price - down_payment
    monthly_payment = calculate_monthly_payment(loan_amount, rate, years)
    total_financing = monthly_payment * 12 * years
    
    # Energy costs
    annual_energy_consumption = (annual_mileage / 100) * consumption_kwh_100km
    annual_energy_cost = annual_energy_consumption * SWISS_CONSTANTS['electricity_price_per_kwh']
    total_energy_cost = annual_energy_cost * years
    
    # Charging infrastructure (home charger installation)
    home_charger_cost = 2500  # CHF for installation
    
    # Maintenance costs (EVs need less maintenance)
    annual_maintenance = 800  # CHF per year for EV
    total_maintenance = annual_maintenance * years
    
    # Insurance (slightly cheaper for EVs)
    annual_insurance = 1200 * SWISS_CONSTANTS['insurance_factor_ev']
    total_insurance = annual_insurance * years
    
    # Taxes and fees
    annual_road_tax = SWISS_CONSTANTS['road_tax_ev']
    total_road_tax = annual_road_tax * years
    
    # Depreciation
    residual_value = purchase_price * math.pow(1 - SWISS_CONSTANTS['depreciation_rate_ev'], years)
    depreciation = purchase_price - residual_value
    
    # Total costs
    total_cost = (
        total_financing + total_energy_cost + home_charger_cost +
        total_maintenance + total_insurance + total_road_tax
    )
    
    return {
        'purchase_price': purchase_price,
        'financing_costs': {
            'down_payment': down_payment,
            'monthly_payment': monthly_payment,
            'total_financing': total_financing,
            'interest_paid': total_financing - loan_amount
        },
        'energy_costs': {
            'annual_consumption_kwh': annual_energy_consumption,
            'annual_cost': annual_energy_cost,
            'total': total_energy_cost,
            'cost_per_km': annual_energy_cost / annual_mileage
        },
        'infrastructure_costs': {
            'home_charger': home_charger_cost
        },
        'maintenance_costs': {
            'annual': annual_maintenance,
            'total': total_maintenance
        },
        'insurance_costs': {
            'annual': annual_insurance,
            'total': total_insurance
        },
        'taxes_fees': {
            'annual_road_tax': annual_road_tax,
            'total': total_road_tax
        },
        'depreciation': {
            'total_depreciation': depreciation,
            'residual_value': residual_value
        },
        'total_cost': total_cost,
        'cost_per_km': total_cost / (annual_mileage * years),
        'annual_cost': total_cost / years
    }

def calculate_ice_costs(purchase_price, annual_mileage, years, canton, down_payment, rate, vehicle):
    """Calculate ICE vehicle costs for comparison"""
    
    # Vehicle specifications
    fuel_consumption_l_100km = vehicle.get('consumption', 8.5)  # liters per 100km
    
    # Financing costs
    loan_amount = purchase_price - down_payment
    monthly_payment = calculate_monthly_payment(loan_amount, rate, years)
    total_financing = monthly_payment * 12 * years
    
    # Fuel costs
    annual_fuel_consumption = (annual_mileage / 100) * fuel_consumption_l_100km
    fuel_price_with_tax = SWISS_CONSTANTS['gasoline_price_per_liter'] + SWISS_CONSTANTS['co2_tax_per_liter']
    annual_fuel_cost = annual_fuel_consumption * fuel_price_with_tax
    total_fuel_cost = annual_fuel_cost * years
    
    # Maintenance costs (ICE vehicles need more maintenance)
    annual_maintenance = 1200  # CHF per year for ICE
    total_maintenance = annual_maintenance * years
    
    # Insurance
    annual_insurance = 1200
    total_insurance = annual_insurance * years
    
    # Taxes and fees
    annual_road_tax = SWISS_CONSTANTS['road_tax_ice']
    total_road_tax = annual_road_tax * years
    
    # Depreciation
    residual_value = purchase_price * math.pow(1 - SWISS_CONSTANTS['depreciation_rate_ice'], years)
    depreciation = purchase_price - residual_value
    
    # Total costs
    total_cost = (
        total_financing + total_fuel_cost + total_maintenance + 
        total_insurance + total_road_tax
    )
    
    return {
        'purchase_price': purchase_price,
        'financing_costs': {
            'down_payment': down_payment,
            'monthly_payment': monthly_payment,
            'total_financing': total_financing,
            'interest_paid': total_financing - loan_amount
        },
        'fuel_costs': {
            'annual_consumption_liters': annual_fuel_consumption,
            'annual_cost': annual_fuel_cost,
            'total': total_fuel_cost,
            'cost_per_km': annual_fuel_cost / annual_mileage
        },
        'maintenance_costs': {
            'annual': annual_maintenance,
            'total': total_maintenance
        },
        'insurance_costs': {
            'annual': annual_insurance,
            'total': total_insurance
        },
        'taxes_fees': {
            'annual_road_tax': annual_road_tax,
            'total': total_road_tax
        },
        'depreciation': {
            'total_depreciation': depreciation,
            'residual_value': residual_value
        },
        'total_cost': total_cost,
        'cost_per_km': total_cost / (annual_mileage * years),
        'annual_cost': total_cost / years
    }

def calculate_monthly_payment(principal, annual_rate, years):
    """Calculate monthly loan payment"""
    if annual_rate == 0:
        return principal / (years * 12)
    
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    
    monthly_payment = principal * (monthly_rate * math.pow(1 + monthly_rate, num_payments)) / (math.pow(1 + monthly_rate, num_payments) - 1)
    return round(monthly_payment, 2)

@tco_bp.route('/scenarios', methods=['POST'])
def calculate_scenarios():
    """
    Calculate multiple TCO scenarios for comparison
    """
    try:
        data = request.get_json()
        base_params = data.get('base_parameters', {})
        scenarios = data.get('scenarios', [])
        
        results = []
        
        for scenario in scenarios:
            # Merge base parameters with scenario-specific parameters
            scenario_params = {**base_params, **scenario}
            
            # Calculate TCO for this scenario
            tco_result = calculate_tco_internal(scenario_params)
            
            results.append({
                'scenario_name': scenario.get('name', 'Unnamed Scenario'),
                'parameters': scenario_params,
                'tco_result': tco_result
            })
        
        return jsonify({
            'success': True,
            'scenarios': results,
            'calculated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_tco_internal(params):
    """Internal TCO calculation function"""
    # This would contain the same logic as the main calculate_tco function
    # but structured to work with internal calls
    pass

@tco_bp.route('/incentives', methods=['GET'])
def get_swiss_incentives():
    """
    Get current Swiss EV incentives by canton
    """
    try:
        canton = request.args.get('canton', '')
        
        # Mock Swiss EV incentives data
        incentives = {
            'ZH': {
                'purchase_rebate': 0,
                'tax_exemptions': ['road_tax_5_years'],
                'charging_incentives': ['home_charger_subsidy_500'],
                'parking_benefits': ['free_public_parking_2_years']
            },
            'BE': {
                'purchase_rebate': 2000,
                'tax_exemptions': ['road_tax_3_years'],
                'charging_incentives': ['home_charger_subsidy_1000'],
                'parking_benefits': ['reduced_parking_fees']
            },
            'GE': {
                'purchase_rebate': 3000,
                'tax_exemptions': ['road_tax_permanent'],
                'charging_incentives': ['free_public_charging_1_year'],
                'parking_benefits': ['free_public_parking_permanent']
            }
        }
        
        if canton and canton in incentives:
            result = {canton: incentives[canton]}
        else:
            result = incentives
        
        return jsonify({
            'success': True,
            'incentives': result,
            'last_updated': '2024-01-01'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

