from flask import Blueprint, request, jsonify
import asyncio
from datetime import datetime
import json
from src.services.ai_provider import ai_provider
from config import config

ai_bp = Blueprint('ai_services', __name__)

@ai_bp.route('/analyze-customer', methods=['POST'])
def analyze_customer():
    """
    Analyze customer data and provide insights using AI
    """
    try:
        data = request.get_json()
        
        customer_data = data.get('customer', {})
        vehicle_preferences = data.get('vehicle_preferences', {})
        
        # Use async AI provider service
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                ai_provider.analyze_customer_with_ai(customer_data, vehicle_preferences)
            )
        finally:
            loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/generate-proposal', methods=['POST'])
def generate_proposal():
    """
    Generate a personalized vehicle proposal using AI
    """
    try:
        data = request.get_json()
        
        customer = data.get('customer', {})
        vehicle_config = data.get('vehicle_configuration', {})
        tco_data = data.get('tco_calculation', {})
        
        # Mock proposal generation
        proposal = {
            "proposal_id": f"PROP-{datetime.now().strftime('%Y%m%d')}-{customer.get('lastName', 'CUSTOMER')[:3].upper()}",
            "customer_name": f"{customer.get('firstName', '')} {customer.get('lastName', '')}",
            "vehicle_summary": {
                "model": vehicle_config.get('model', 'LYRIQ'),
                "variant": vehicle_config.get('variant', 'Luxury'),
                "total_price": vehicle_config.get('total_price', 85200),
                "currency": "CHF"
            },
            "tco_summary": {
                "total_cost_5_years": tco_data.get('total_cost', 120000),
                "cost_per_km": tco_data.get('cost_per_km', 0.65),
                "monthly_cost": tco_data.get('monthly_cost', 2000)
            },
            "personalized_benefits": [
                "Save CHF 15,000 in fuel costs over 5 years",
                "Reduce CO2 emissions by 12 tons annually",
                "Enjoy premium luxury with cutting-edge technology",
                "Benefit from excellent Swiss EV infrastructure"
            ],
            "financing_options": [
                {
                    "type": "lease",
                    "monthly_payment": 899,
                    "down_payment": 10000,
                    "term_months": 48
                },
                {
                    "type": "purchase",
                    "monthly_payment": 1250,
                    "down_payment": 20000,
                    "term_months": 60
                }
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'proposal': proposal
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/sentiment-analysis', methods=['POST'])
def sentiment_analysis():
    """
    Analyze customer sentiment from interactions
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        # Mock sentiment analysis
        sentiment_result = {
            "sentiment": "positive",
            "confidence": 0.78,
            "emotions": {
                "excitement": 0.6,
                "interest": 0.8,
                "concern": 0.2,
                "satisfaction": 0.7
            },
            "key_topics": [
                "range anxiety",
                "charging infrastructure",
                "luxury features",
                "price value"
            ],
            "recommendations": [
                "Address range concerns with real-world examples",
                "Highlight charging network partnerships",
                "Emphasize luxury and technology features"
            ]
        }
        
        return jsonify({
            'success': True,
            'sentiment_analysis': sentiment_result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/market-insights', methods=['GET'])
def market_insights():
    """
    Get AI-powered market insights for Swiss EV market
    """
    try:
        insights = {
            "market_trends": {
                "ev_adoption_rate": "32% year-over-year growth in Switzerland",
                "luxury_ev_segment": "Growing 45% annually",
                "key_drivers": [
                    "Government incentives",
                    "Charging infrastructure expansion",
                    "Environmental consciousness"
                ]
            },
            "competitive_analysis": {
                "cadillac_position": "Premium luxury EV segment leader",
                "key_competitors": ["BMW iX", "Mercedes EQS", "Audi e-tron GT"],
                "competitive_advantages": [
                    "Superior range (530km LYRIQ)",
                    "Advanced technology integration",
                    "Competitive pricing in luxury segment"
                ]
            },
            "customer_segments": {
                "primary_target": "High-income professionals 35-55",
                "secondary_target": "Luxury car enthusiasts",
                "emerging_segment": "Environmentally conscious executives"
            },
            "recommendations": [
                "Focus on technology and range messaging",
                "Emphasize Swiss-specific benefits",
                "Leverage luxury positioning"
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'insights': insights
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/provider-status', methods=['GET'])
def get_provider_status():
    """
    Get status of all AI providers and configuration
    """
    try:
        status = ai_provider.get_provider_status()
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

