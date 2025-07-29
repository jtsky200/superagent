from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import random
import json

insights_bp = Blueprint('customer_insights', __name__)

@insights_bp.route('/profile-analysis', methods=['POST'])
def analyze_customer_profile():
    """
    Analyze customer profile and provide insights
    """
    try:
        data = request.get_json()
        customer = data.get('customer', {})
        
        # Extract customer characteristics
        age = customer.get('age', 0)
        canton = customer.get('canton', '')
        customer_type = customer.get('customerType', 'private')
        income_bracket = data.get('income_bracket', 'medium')
        
        # Generate insights based on customer profile
        insights = generate_customer_insights(customer, income_bracket)
        
        return jsonify({
            'success': True,
            'customer_insights': insights
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_customer_insights(customer, income_bracket):
    """Generate AI-powered customer insights"""
    
    age = customer.get('age', 35)
    canton = customer.get('canton', 'ZH')
    customer_type = customer.get('customerType', 'private')
    
    # Demographic insights
    demographic_insights = {
        'age_group': get_age_group(age),
        'regional_preferences': get_regional_preferences(canton),
        'customer_segment': get_customer_segment(customer_type, income_bracket, age)
    }
    
    # Vehicle preferences prediction
    vehicle_preferences = predict_vehicle_preferences(demographic_insights)
    
    # Financial profile
    financial_profile = generate_financial_profile(income_bracket, age, customer_type)
    
    # Engagement strategy
    engagement_strategy = generate_engagement_strategy(demographic_insights, vehicle_preferences)
    
    return {
        'demographic_insights': demographic_insights,
        'vehicle_preferences': vehicle_preferences,
        'financial_profile': financial_profile,
        'engagement_strategy': engagement_strategy,
        'risk_assessment': generate_risk_assessment(financial_profile),
        'next_best_actions': generate_next_best_actions(demographic_insights, vehicle_preferences),
        'generated_at': datetime.now().isoformat()
    }

def get_age_group(age):
    """Categorize customer by age group"""
    if age < 30:
        return {
            'category': 'young_professional',
            'characteristics': ['tech_savvy', 'environmentally_conscious', 'budget_conscious'],
            'preferences': ['connectivity', 'efficiency', 'modern_design']
        }
    elif age < 45:
        return {
            'category': 'established_professional',
            'characteristics': ['career_focused', 'family_oriented', 'quality_conscious'],
            'preferences': ['safety', 'comfort', 'reliability']
        }
    elif age < 60:
        return {
            'category': 'senior_professional',
            'characteristics': ['high_income', 'luxury_oriented', 'brand_loyal'],
            'preferences': ['luxury', 'prestige', 'advanced_features']
        }
    else:
        return {
            'category': 'retiree',
            'characteristics': ['comfort_focused', 'traditional', 'value_conscious'],
            'preferences': ['ease_of_use', 'comfort', 'service_quality']
        }

def get_regional_preferences(canton):
    """Get regional preferences based on Swiss canton"""
    regional_data = {
        'ZH': {
            'urban_density': 'high',
            'charging_infrastructure': 'excellent',
            'environmental_consciousness': 'high',
            'luxury_market': 'strong',
            'preferences': ['technology', 'efficiency', 'urban_mobility']
        },
        'GE': {
            'urban_density': 'high',
            'charging_infrastructure': 'excellent',
            'environmental_consciousness': 'very_high',
            'luxury_market': 'very_strong',
            'preferences': ['luxury', 'environmental_impact', 'international_appeal']
        },
        'BE': {
            'urban_density': 'medium',
            'charging_infrastructure': 'good',
            'environmental_consciousness': 'high',
            'luxury_market': 'medium',
            'preferences': ['reliability', 'practicality', 'value']
        }
    }
    
    return regional_data.get(canton, {
        'urban_density': 'medium',
        'charging_infrastructure': 'good',
        'environmental_consciousness': 'medium',
        'luxury_market': 'medium',
        'preferences': ['reliability', 'value', 'practicality']
    })

def get_customer_segment(customer_type, income_bracket, age):
    """Determine customer segment"""
    if customer_type == 'business':
        return {
            'segment': 'business_fleet',
            'characteristics': ['cost_efficiency', 'tax_benefits', 'corporate_image'],
            'decision_factors': ['tco', 'tax_advantages', 'brand_reputation']
        }
    
    if income_bracket == 'high' and age > 40:
        return {
            'segment': 'luxury_enthusiast',
            'characteristics': ['premium_features', 'brand_prestige', 'latest_technology'],
            'decision_factors': ['luxury_features', 'brand_status', 'performance']
        }
    
    if age < 35:
        return {
            'segment': 'tech_early_adopter',
            'characteristics': ['innovation', 'sustainability', 'connectivity'],
            'decision_factors': ['technology', 'environmental_impact', 'connectivity']
        }
    
    return {
        'segment': 'mainstream_adopter',
        'characteristics': ['practical', 'value_conscious', 'family_oriented'],
        'decision_factors': ['value', 'reliability', 'practicality']
    }

def predict_vehicle_preferences(demographic_insights):
    """Predict vehicle preferences based on demographics"""
    segment = demographic_insights['customer_segment']['segment']
    
    if segment == 'luxury_enthusiast':
        return {
            'recommended_model': 'VISTIQ',
            'confidence': 0.85,
            'key_features': ['premium_interior', 'advanced_technology', 'performance'],
            'package_recommendations': ['Platinum Package', 'Technology Package'],
            'color_preferences': ['Stellar Black', 'Radiant Silver']
        }
    elif segment == 'tech_early_adopter':
        return {
            'recommended_model': 'LYRIQ',
            'confidence': 0.90,
            'key_features': ['connectivity', 'efficiency', 'modern_design'],
            'package_recommendations': ['Technology Package', 'Driver Assistance Package'],
            'color_preferences': ['Electric Blue', 'Summit White']
        }
    else:
        return {
            'recommended_model': 'LYRIQ',
            'confidence': 0.75,
            'key_features': ['reliability', 'safety', 'value'],
            'package_recommendations': ['Comfort Package', 'Safety Package'],
            'color_preferences': ['Summit White', 'Stellar Black']
        }

def generate_financial_profile(income_bracket, age, customer_type):
    """Generate financial profile and recommendations"""
    
    income_ranges = {
        'low': (50000, 80000),
        'medium': (80000, 120000),
        'high': (120000, 200000),
        'very_high': (200000, 500000)
    }
    
    estimated_income = random.randint(*income_ranges.get(income_bracket, (80000, 120000)))
    
    # Calculate affordability
    max_monthly_payment = estimated_income * 0.15 / 12  # 15% of gross income
    recommended_down_payment = max(10000, estimated_income * 0.1)  # 10% of income or 10k minimum
    
    financing_options = []
    
    # Lease option
    financing_options.append({
        'type': 'lease',
        'monthly_payment': random.randint(600, 1200),
        'down_payment': random.randint(5000, 15000),
        'term_months': 48,
        'mileage_limit': 15000,
        'suitability_score': 0.8 if customer_type == 'business' else 0.6
    })
    
    # Purchase with financing
    financing_options.append({
        'type': 'finance',
        'monthly_payment': random.randint(800, 1500),
        'down_payment': recommended_down_payment,
        'term_months': 60,
        'interest_rate': 3.9,
        'suitability_score': 0.7
    })
    
    # Cash purchase
    if income_bracket in ['high', 'very_high']:
        financing_options.append({
            'type': 'cash',
            'total_payment': random.randint(85000, 120000),
            'tax_benefits': 'immediate_depreciation' if customer_type == 'business' else None,
            'suitability_score': 0.9 if customer_type == 'business' else 0.5
        })
    
    return {
        'estimated_income_range': income_ranges[income_bracket],
        'affordability': {
            'max_monthly_payment': max_monthly_payment,
            'recommended_down_payment': recommended_down_payment,
            'debt_to_income_ratio': random.uniform(0.2, 0.4)
        },
        'financing_options': financing_options,
        'credit_profile': {
            'estimated_score': random.choice(['A', 'B', 'C']),
            'risk_level': random.choice(['low', 'medium']),
            'approval_probability': random.uniform(0.7, 0.95)
        }
    }

def generate_engagement_strategy(demographic_insights, vehicle_preferences):
    """Generate personalized engagement strategy"""
    
    segment = demographic_insights['customer_segment']['segment']
    
    strategies = {
        'luxury_enthusiast': {
            'communication_style': 'premium_personal',
            'preferred_channels': ['personal_consultation', 'exclusive_events', 'phone'],
            'messaging_focus': ['luxury_features', 'exclusivity', 'prestige'],
            'follow_up_frequency': 'weekly',
            'decision_timeline': '2-4 weeks'
        },
        'tech_early_adopter': {
            'communication_style': 'informative_digital',
            'preferred_channels': ['email', 'digital_brochures', 'virtual_demos'],
            'messaging_focus': ['technology', 'innovation', 'environmental_benefits'],
            'follow_up_frequency': 'bi_weekly',
            'decision_timeline': '1-3 weeks'
        },
        'business_fleet': {
            'communication_style': 'professional_analytical',
            'preferred_channels': ['business_presentation', 'detailed_proposals', 'meetings'],
            'messaging_focus': ['tco_benefits', 'tax_advantages', 'fleet_efficiency'],
            'follow_up_frequency': 'monthly',
            'decision_timeline': '4-8 weeks'
        },
        'mainstream_adopter': {
            'communication_style': 'friendly_informative',
            'preferred_channels': ['phone', 'email', 'showroom_visits'],
            'messaging_focus': ['value', 'reliability', 'family_benefits'],
            'follow_up_frequency': 'bi_weekly',
            'decision_timeline': '3-6 weeks'
        }
    }
    
    return strategies.get(segment, strategies['mainstream_adopter'])

def generate_risk_assessment(financial_profile):
    """Generate risk assessment for the customer"""
    
    credit_score = financial_profile['credit_profile']['estimated_score']
    debt_ratio = financial_profile['affordability']['debt_to_income_ratio']
    
    risk_factors = []
    risk_level = 'low'
    
    if credit_score in ['D', 'E']:
        risk_factors.append('poor_credit_history')
        risk_level = 'high'
    elif credit_score == 'C':
        risk_factors.append('average_credit_history')
        risk_level = 'medium'
    
    if debt_ratio > 0.35:
        risk_factors.append('high_debt_ratio')
        risk_level = 'medium' if risk_level == 'low' else 'high'
    
    return {
        'overall_risk': risk_level,
        'risk_factors': risk_factors,
        'mitigation_strategies': get_risk_mitigation_strategies(risk_factors),
        'approval_recommendations': get_approval_recommendations(risk_level)
    }

def get_risk_mitigation_strategies(risk_factors):
    """Get strategies to mitigate identified risks"""
    strategies = []
    
    if 'poor_credit_history' in risk_factors:
        strategies.extend([
            'require_larger_down_payment',
            'consider_co_signer',
            'offer_shorter_term_financing'
        ])
    
    if 'high_debt_ratio' in risk_factors:
        strategies.extend([
            'verify_income_documentation',
            'consider_lease_option',
            'recommend_lower_priced_model'
        ])
    
    return strategies

def get_approval_recommendations(risk_level):
    """Get approval recommendations based on risk level"""
    recommendations = {
        'low': {
            'approval_action': 'auto_approve',
            'required_documentation': ['id', 'income_verification'],
            'special_conditions': []
        },
        'medium': {
            'approval_action': 'manual_review',
            'required_documentation': ['id', 'income_verification', 'credit_report'],
            'special_conditions': ['verify_employment', 'check_references']
        },
        'high': {
            'approval_action': 'detailed_review',
            'required_documentation': ['id', 'income_verification', 'credit_report', 'bank_statements'],
            'special_conditions': ['manager_approval', 'additional_security', 'co_signer_required']
        }
    }
    
    return recommendations.get(risk_level, recommendations['medium'])

def generate_next_best_actions(demographic_insights, vehicle_preferences):
    """Generate recommended next actions"""
    
    segment = demographic_insights['customer_segment']['segment']
    model = vehicle_preferences['recommended_model']
    
    actions = [
        {
            'action': 'schedule_test_drive',
            'priority': 'high',
            'timeline': 'within_1_week',
            'description': f'Schedule test drive for {model}',
            'expected_outcome': 'increase_purchase_intent'
        },
        {
            'action': 'prepare_tco_calculation',
            'priority': 'high',
            'timeline': 'within_3_days',
            'description': 'Prepare detailed TCO analysis',
            'expected_outcome': 'address_financial_concerns'
        },
        {
            'action': 'send_personalized_brochure',
            'priority': 'medium',
            'timeline': 'within_2_days',
            'description': 'Send customized vehicle information',
            'expected_outcome': 'maintain_engagement'
        }
    ]
    
    if segment == 'business_fleet':
        actions.append({
            'action': 'prepare_fleet_proposal',
            'priority': 'high',
            'timeline': 'within_1_week',
            'description': 'Prepare comprehensive fleet proposal',
            'expected_outcome': 'advance_to_negotiation'
        })
    
    return actions

@insights_bp.route('/lead-scoring', methods=['POST'])
def calculate_lead_score():
    """
    Calculate lead score based on customer data and interactions
    """
    try:
        data = request.get_json()
        
        customer = data.get('customer', {})
        interactions = data.get('interactions', [])
        financial_data = data.get('financial_data', {})
        
        # Calculate lead score
        score_components = {
            'demographic_score': calculate_demographic_score(customer),
            'financial_score': calculate_financial_score(financial_data),
            'engagement_score': calculate_engagement_score(interactions),
            'intent_score': calculate_intent_score(interactions)
        }
        
        # Weighted total score
        weights = {'demographic_score': 0.2, 'financial_score': 0.3, 'engagement_score': 0.3, 'intent_score': 0.2}
        total_score = sum(score_components[key] * weights[key] for key in weights)
        
        # Determine lead quality
        if total_score >= 80:
            quality = 'hot'
        elif total_score >= 60:
            quality = 'warm'
        elif total_score >= 40:
            quality = 'cold'
        else:
            quality = 'unqualified'
        
        return jsonify({
            'success': True,
            'lead_score': {
                'total_score': round(total_score, 1),
                'quality': quality,
                'score_components': score_components,
                'recommendations': get_lead_recommendations(quality, score_components),
                'calculated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_demographic_score(customer):
    """Calculate score based on demographic factors"""
    score = 50  # Base score
    
    # Age factor
    age = customer.get('age', 0)
    if 30 <= age <= 60:
        score += 20
    elif 25 <= age <= 70:
        score += 10
    
    # Income factor (if available)
    income = customer.get('estimated_income', 0)
    if income > 120000:
        score += 20
    elif income > 80000:
        score += 10
    
    # Location factor
    canton = customer.get('canton', '')
    if canton in ['ZH', 'GE', 'BS']:  # High-income cantons
        score += 10
    
    return min(score, 100)

def calculate_financial_score(financial_data):
    """Calculate score based on financial factors"""
    score = 50  # Base score
    
    # Credit score
    credit_score = financial_data.get('credit_score', 'C')
    credit_points = {'A': 30, 'B': 20, 'C': 10, 'D': 0, 'E': -10}
    score += credit_points.get(credit_score, 0)
    
    # Debt-to-income ratio
    debt_ratio = financial_data.get('debt_to_income_ratio', 0.3)
    if debt_ratio < 0.2:
        score += 20
    elif debt_ratio < 0.3:
        score += 10
    elif debt_ratio > 0.4:
        score -= 10
    
    return max(0, min(score, 100))

def calculate_engagement_score(interactions):
    """Calculate score based on customer engagement"""
    score = 0
    
    # Number of interactions
    interaction_count = len(interactions)
    score += min(interaction_count * 5, 30)
    
    # Recent activity
    recent_interactions = [i for i in interactions if 
                          datetime.fromisoformat(i.get('timestamp', '2024-01-01')) > 
                          datetime.now() - timedelta(days=7)]
    score += len(recent_interactions) * 10
    
    # Interaction types
    interaction_types = [i.get('type', '') for i in interactions]
    if 'test_drive_request' in interaction_types:
        score += 30
    if 'brochure_download' in interaction_types:
        score += 15
    if 'website_visit' in interaction_types:
        score += 5
    
    return min(score, 100)

def calculate_intent_score(interactions):
    """Calculate score based on purchase intent indicators"""
    score = 0
    
    # High-intent actions
    high_intent_actions = ['test_drive_request', 'financing_inquiry', 'trade_in_valuation']
    medium_intent_actions = ['brochure_download', 'spec_comparison', 'dealer_contact']
    
    for interaction in interactions:
        action_type = interaction.get('type', '')
        if action_type in high_intent_actions:
            score += 25
        elif action_type in medium_intent_actions:
            score += 10
    
    return min(score, 100)

def get_lead_recommendations(quality, score_components):
    """Get recommendations based on lead quality"""
    recommendations = {
        'hot': [
            'immediate_personal_contact',
            'schedule_test_drive_within_24h',
            'prepare_financing_options',
            'assign_senior_sales_consultant'
        ],
        'warm': [
            'contact_within_48h',
            'send_personalized_information',
            'schedule_showroom_visit',
            'follow_up_weekly'
        ],
        'cold': [
            'nurture_with_educational_content',
            'monthly_follow_up',
            'invite_to_events',
            'build_relationship_gradually'
        ],
        'unqualified': [
            'qualify_further',
            'determine_timeline',
            'assess_budget',
            'minimal_resource_allocation'
        ]
    }
    
    return recommendations.get(quality, recommendations['cold'])

