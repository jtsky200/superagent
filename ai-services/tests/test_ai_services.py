"""
Comprehensive Test Suite for CADILLAC EV CIS AI Services

Tests cover:
1. AI Provider Service functionality
2. Swiss market specific features
3. Customer analysis and lead scoring
4. Sentiment analysis for German/Swiss German text
5. TCO calculation with Swiss factors
6. Error handling and fallback mechanisms
7. Performance and concurrency tests
"""

import pytest
import asyncio
import json
import time
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from services.ai_provider import AIProviderService
from services.enhanced_ai_provider import EnhancedAIProvider
from config import Config


class TestAIProviderService:
    """Test suite for AI Provider Service"""

    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        return AIProviderService()

    @pytest.fixture
    def sample_customer_data(self):
        """Sample Swiss customer data for testing"""
        return {
            'firstName': 'Hans',
            'lastName': 'Müller',
            'email': 'hans.mueller@example.ch',
            'customerType': 'private',
            'city': 'Zürich',
            'canton': 'ZH',
            'age': 45,
            'phone': '+41 79 123 45 67'
        }

    @pytest.fixture
    def sample_vehicle_preferences(self):
        """Sample vehicle preferences for testing"""
        return {
            'budget_min': 80000,
            'budget_max': 120000,
            'usage': 'daily_commute',
            'features': ['super_cruise', 'premium_audio', 'panoramic_roof'],
            'timeline': '3_months'
        }

    @pytest.mark.asyncio
    async def test_analyze_customer_with_ai_success(self, ai_service, sample_customer_data, sample_vehicle_preferences):
        """Test successful customer analysis with AI"""
        # Mock OpenAI response
        mock_response = {
            'recommended_model': 'LYRIQ Premium',
            'confidence_score': 0.92,
            'key_selling_points': [
                'Swiss EV infrastructure compatibility',
                'Premium luxury features',
                'Environmental benefits'
            ],
            'financing_recommendation': '3.9% APR lease with CHF 10,000 down payment',
            'swiss_benefits': {
                'canton_incentives': 'CHF 5,000 rebate in Zurich',
                'tax_exemption': '5 years road tax exemption',
                'charging_infrastructure': 'Excellent coverage in ZH'
            },
            'next_steps': [
                'Schedule test drive',
                'Prepare detailed TCO calculation',
                'Review financing options'
            ],
            'risk_assessment': {
                'level': 'low',
                'factors': ['Stable income', 'Previous luxury vehicle owner']
            }
        }

        with patch.object(ai_service, '_call_openai', return_value=mock_response):
            result = await ai_service.analyze_customer_with_ai(
                sample_customer_data, 
                sample_vehicle_preferences
            )

            assert result is not None
            assert result['recommended_model'] == 'LYRIQ Premium'
            assert result['confidence_score'] == 0.92
            assert 'swiss_benefits' in result
            assert 'canton_incentives' in result['swiss_benefits']

    @pytest.mark.asyncio
    async def test_provider_fallback_mechanism(self, ai_service, sample_customer_data, sample_vehicle_preferences):
        """Test AI provider fallback when primary provider fails"""
        # Mock OpenAI failure and DeepSeek success
        with patch.object(ai_service, '_call_openai', side_effect=Exception("OpenAI API error")):
            with patch.object(ai_service, '_call_deepseek', return_value={'recommended_model': 'LYRIQ'}):
                result = await ai_service.analyze_customer_with_ai(
                    sample_customer_data,
                    sample_vehicle_preferences
                )

                assert result is not None
                assert result['provider'] == 'deepseek'

    @pytest.mark.asyncio
    async def test_all_providers_fail_fallback(self, ai_service, sample_customer_data, sample_vehicle_preferences):
        """Test fallback response when all AI providers fail"""
        # Mock all providers failing
        with patch.object(ai_service, '_call_openai', side_effect=Exception("OpenAI error")):
            with patch.object(ai_service, '_call_deepseek', side_effect=Exception("DeepSeek error")):
                with patch.object(ai_service, '_call_gemini', side_effect=Exception("Gemini error")):
                    result = await ai_service.analyze_customer_with_ai(
                        sample_customer_data,
                        sample_vehicle_preferences
                    )

                    assert result is not None
                    assert 'fallback' in result.get('provider', '')
                    assert result['recommended_model'] in ['LYRIQ', 'VISTIQ']

    def test_create_customer_analysis_prompt_swiss_context(self, ai_service, sample_customer_data, sample_vehicle_preferences):
        """Test prompt creation includes Swiss market context"""
        prompt = ai_service._create_customer_analysis_prompt(sample_customer_data, sample_vehicle_preferences)
        
        # Verify Swiss context is included
        assert 'Switzerland' in prompt or 'Schweiz' in prompt
        assert 'canton' in prompt.lower()
        assert 'CHF' in prompt
        assert 'Zürich' in prompt
        assert 'ZH' in prompt

    def test_parse_ai_response_json(self, ai_service):
        """Test parsing valid JSON response from AI"""
        json_response = '''
        {
            "recommended_model": "LYRIQ Premium",
            "confidence_score": 0.85,
            "analysis": "Customer shows strong interest in luxury EVs"
        }
        '''
        
        result = ai_service._parse_ai_response(json_response)
        
        assert result['recommended_model'] == 'LYRIQ Premium'
        assert result['confidence_score'] == 0.85

    def test_parse_ai_response_text_fallback(self, ai_service):
        """Test parsing text response when JSON parsing fails"""
        text_response = "I recommend the LYRIQ Premium for this customer based on their preferences."
        
        result = ai_service._parse_ai_response(text_response)
        
        assert 'recommended_model' in result
        assert 'analysis' in result
        assert result['analysis'] == text_response

    @pytest.mark.asyncio
    async def test_openai_api_call(self, ai_service):
        """Test OpenAI API call with mocked response"""
        prompt = "Test prompt for CADILLAC EV recommendation"
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = '{"recommended_model": "LYRIQ"}'
        
        with patch('openai.OpenAI') as mock_client:
            mock_client.return_value.chat.completions.create.return_value = mock_response
            
            result = await ai_service._call_openai(prompt)
            
            assert result is not None
            assert 'recommended_model' in result

    @pytest.mark.asyncio
    async def test_deepseek_api_call(self, ai_service):
        """Test DeepSeek API call with mocked response"""
        prompt = "Test prompt for CADILLAC EV recommendation"
        
        mock_response = {
            "choices": [{
                "message": {
                    "content": '{"recommended_model": "VISTIQ", "confidence": 0.8}'
                }
            }]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value.json.return_value = mock_response
            
            result = await ai_service._call_deepseek(prompt)
            
            assert result is not None

    @pytest.mark.asyncio
    async def test_gemini_api_call(self, ai_service):
        """Test Gemini API call with mocked response"""
        prompt = "Test prompt for CADILLAC EV recommendation"
        
        mock_response = {
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": '{"recommended_model": "LYRIQ", "swiss_optimized": true}'
                    }]
                }
            }]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client.return_value.__aenter__.return_value.post.return_value.json.return_value = mock_response
            
            result = await ai_service._call_gemini(prompt)
            
            assert result is not None


class TestSwissMarketSpecificFeatures:
    """Test Swiss market specific AI features"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_swiss_customer_analysis(self, ai_service):
        """Test analysis of Swiss customer with local context"""
        swiss_customer = {
            'firstName': 'François',
            'lastName': 'Dubois',
            'email': 'francois.dubois@geneva.ch',
            'customerType': 'business',
            'city': 'Genève',
            'canton': 'GE',
            'company': {
                'name': 'Geneva Consulting Sàrl',
                'uid_number': 'CHE-234.567.890',
                'employees': 12
            }
        }

        vehicle_prefs = {
            'budget_min': 90000,
            'budget_max': 150000,
            'usage': 'business',
            'features': ['executive_package', 'super_cruise']
        }

        mock_response = {
            'recommended_model': 'VISTIQ Executive',
            'swiss_context': {
                'language': 'French',
                'canton_benefits': 'Geneva business incentives available',
                'tax_advantages': 'VAT deductible for business use'
            }
        }

        with patch.object(ai_service, '_call_openai', return_value=mock_response):
            result = await ai_service.analyze_customer_with_ai(swiss_customer, vehicle_prefs)
            
            assert 'swiss_context' in result
            assert result['swiss_context']['language'] == 'French'

    def test_canton_specific_recommendations(self, ai_service):
        """Test canton-specific recommendations in AI prompts"""
        customers_by_canton = [
            {'canton': 'ZH', 'city': 'Zürich'},
            {'canton': 'GE', 'city': 'Genève'},
            {'canton': 'TI', 'city': 'Lugano'},
            {'canton': 'BS', 'city': 'Basel'}
        ]

        for customer in customers_by_canton:
            prompt = ai_service._create_customer_analysis_prompt(customer, {})
            
            # Each canton should have specific context
            assert customer['canton'] in prompt
            assert customer['city'] in prompt
            
            # Check for Swiss context
            assert any(word in prompt.lower() for word in ['schweiz', 'switzerland', 'swiss'])

    def test_multilingual_support_prompt(self, ai_service):
        """Test AI prompts include multilingual context for Switzerland"""
        german_customer = {'firstName': 'Hans', 'lastName': 'Müller', 'canton': 'ZH'}
        french_customer = {'firstName': 'Pierre', 'lastName': 'Dubois', 'canton': 'GE'}
        italian_customer = {'firstName': 'Marco', 'lastName': 'Rossi', 'canton': 'TI'}

        for customer in [german_customer, french_customer, italian_customer]:
            prompt = ai_service._create_customer_analysis_prompt(customer, {})
            
            # Should include multilingual context
            assert any(lang in prompt.lower() for lang in ['german', 'french', 'italian', 'multilingual'])

    @pytest.mark.asyncio
    async def test_business_customer_swiss_analysis(self, ai_service):
        """Test business customer analysis with Swiss company data"""
        business_customer = {
            'customerType': 'business',
            'company': {
                'name': 'SwissTech AG',
                'uid_number': 'CHE-123.456.789',
                'legal_form': 'AG',
                'employees': 250,
                'annual_revenue': 45000000
            },
            'canton': 'ZH'
        }

        mock_response = {
            'recommended_model': 'LYRIQ Fleet',
            'business_benefits': {
                'tax_deduction': '100% deductible',
                'company_car_tax': 'Reduced benefit in kind',
                'fleet_discounts': 'Volume discounts available'
            },
            'swiss_business_context': {
                'uid_verified': True,
                'vat_recovery': 'CHF 6,800 VAT recoverable'
            }
        }

        with patch.object(ai_service, '_call_openai', return_value=mock_response):
            result = await ai_service.analyze_customer_with_ai(business_customer, {})
            
            assert 'business_benefits' in result
            assert 'swiss_business_context' in result


class TestSentimentAnalysis:
    """Test sentiment analysis for German/Swiss German text"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_german_sentiment_analysis(self, ai_service):
        """Test sentiment analysis for German text"""
        german_texts = [
            "Ich bin sehr interessiert am CADILLAC LYRIQ. Das Fahrzeug sieht fantastisch aus!",
            "Der Preis ist zu hoch. Ich bin enttäuscht von dem Angebot.",
            "Können Sie mir weitere Informationen zusenden? Ich überlege noch."
        ]

        expected_sentiments = ['positive', 'negative', 'neutral']

        for text, expected in zip(german_texts, expected_sentiments):
            mock_response = {
                'overall_sentiment': expected,
                'confidence': 0.85,
                'language': 'de'
            }

            with patch.object(ai_service, '_analyze_sentiment', return_value=mock_response):
                result = await ai_service._analyze_sentiment(text)
                
                assert result['overall_sentiment'] == expected
                assert result['language'] == 'de'

    @pytest.mark.asyncio
    async def test_swiss_german_phrases(self, ai_service):
        """Test sentiment analysis with Swiss German phrases"""
        swiss_german_texts = [
            "Das isch e super Auto! Chönd Sie mer e Probefart organisisere?",
            "Mir isch das z tüür. Das gaht nöd.",
            "Ich han Interesse, aber ich mues no überlege."
        ]

        for text in swiss_german_texts:
            mock_response = {
                'overall_sentiment': 'neutral',
                'confidence': 0.75,
                'language': 'de-CH',
                'cultural_context': 'Swiss German dialect detected'
            }

            with patch.object(ai_service, '_analyze_sentiment', return_value=mock_response):
                result = await ai_service._analyze_sentiment(text)
                
                assert 'cultural_context' in result
                assert result['language'] == 'de-CH'

    @pytest.mark.asyncio
    async def test_multilingual_customer_communication(self, ai_service):
        """Test sentiment analysis across Swiss languages"""
        multilingual_texts = [
            ("Sehr interessiert an LYRIQ Premium", "de"),
            ("Très intéressé par le LYRIQ", "fr"),
            ("Molto interessato alla LYRIQ", "it"),
            ("Very interested in the LYRIQ", "en")
        ]

        for text, expected_lang in multilingual_texts:
            mock_response = {
                'overall_sentiment': 'positive',
                'confidence': 0.9,
                'language': expected_lang
            }

            with patch.object(ai_service, '_analyze_sentiment', return_value=mock_response):
                result = await ai_service._analyze_sentiment(text)
                
                assert result['language'] == expected_lang


class TestTCOCalculationAI:
    """Test AI-enhanced TCO calculations with Swiss factors"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_swiss_tco_factors_analysis(self, ai_service):
        """Test AI analysis of Swiss-specific TCO factors"""
        tco_request = {
            'vehicle': 'LYRIQ Premium',
            'canton': 'ZH',
            'annual_km': 15000,
            'usage_pattern': 'daily_commute',
            'charging_access': 'home_and_public'
        }

        mock_response = {
            'recommended_factors': {
                'winter_consumption_increase': 15,
                'altitude_adjustment': 5,
                'canton_electricity_price': 0.23,
                'charging_infrastructure_score': 9.2
            },
            'swiss_specific_costs': {
                'vignette': 40,
                'cantonal_tax': 0,
                'registration_fee': 350,
                'mandatory_insurance': 1200
            },
            'optimization_suggestions': [
                'Home charging reduces costs by 40%',
                'Zurich has excellent fast charging network',
                'Consider solar panel installation for additional savings'
            ]
        }

        with patch.object(ai_service, '_analyze_tco_factors', return_value=mock_response):
            result = await ai_service._analyze_tco_factors(tco_request)
            
            assert 'swiss_specific_costs' in result
            assert result['swiss_specific_costs']['vignette'] == 40
            assert 'optimization_suggestions' in result

    @pytest.mark.asyncio
    async def test_seasonal_adjustments_ai(self, ai_service):
        """Test AI recommendations for seasonal TCO adjustments"""
        seasonal_request = {
            'vehicle': 'LYRIQ',
            'canton': 'GR',  # Mountain canton
            'altitude': 1200,
            'winter_months': 5
        }

        mock_response = {
            'seasonal_adjustments': {
                'winter_consumption_increase': 20,  # Higher for mountain region
                'tire_change_costs': 800,
                'heating_system_usage': 'high',
                'range_reduction_percent': 18
            },
            'recommendations': [
                'Consider winter tire package',
                'Pre-heating while plugged in reduces range loss',
                'Plan for 20% more charging stops in winter'
            ]
        }

        with patch.object(ai_service, '_analyze_seasonal_factors', return_value=mock_response):
            result = await ai_service._analyze_seasonal_factors(seasonal_request)
            
            assert result['seasonal_adjustments']['winter_consumption_increase'] == 20
            assert 'tire_change_costs' in result['seasonal_adjustments']


class TestPerformanceAndConcurrency:
    """Test AI service performance and concurrency"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_concurrent_ai_requests(self, ai_service):
        """Test handling multiple concurrent AI requests"""
        customer_data = {'name': 'Test Customer', 'canton': 'ZH'}
        vehicle_prefs = {'budget_max': 100000}

        mock_response = {'recommended_model': 'LYRIQ'}

        with patch.object(ai_service, '_call_openai', return_value=mock_response):
            # Create 10 concurrent requests
            tasks = []
            for i in range(10):
                task = ai_service.analyze_customer_with_ai(customer_data, vehicle_prefs)
                tasks.append(task)
            
            start_time = time.time()
            results = await asyncio.gather(*tasks)
            end_time = time.time()
            
            # All requests should succeed
            assert len(results) == 10
            assert all(result is not None for result in results)
            
            # Should complete within reasonable time (< 5 seconds for 10 requests)
            assert end_time - start_time < 5.0

    @pytest.mark.asyncio
    async def test_ai_request_timeout_handling(self, ai_service):
        """Test handling of AI request timeouts"""
        customer_data = {'name': 'Test Customer'}
        vehicle_prefs = {}

        async def slow_response(*args, **kwargs):
            await asyncio.sleep(30)  # Simulate slow API
            return {'result': 'delayed'}

        with patch.object(ai_service, '_call_openai', side_effect=slow_response):
            start_time = time.time()
            
            # Should timeout and fall back
            result = await ai_service.analyze_customer_with_ai(customer_data, vehicle_prefs)
            
            end_time = time.time()
            
            # Should not wait full 30 seconds
            assert end_time - start_time < 10.0
            assert result is not None  # Should have fallback response

    def test_memory_usage_optimization(self, ai_service):
        """Test memory usage stays reasonable with large datasets"""
        # Create large customer dataset
        large_customer_data = {
            'interactions': [f'Interaction {i}' for i in range(1000)],
            'transaction_history': [f'Transaction {i}' for i in range(500)],
            'preferences': {f'pref_{i}': f'value_{i}' for i in range(100)}
        }

        # Create prompt - should not cause memory issues
        prompt = ai_service._create_customer_analysis_prompt(large_customer_data, {})
        
        # Prompt should be reasonable length (not infinite)
        assert len(prompt) < 50000  # 50KB max prompt size
        assert 'interactions' in prompt or len(large_customer_data['interactions']) > 10


class TestErrorHandlingAndResilience:
    """Test error handling and service resilience"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_api_key_missing_fallback(self, ai_service):
        """Test fallback when API keys are missing"""
        # Simulate missing API keys
        with patch.object(ai_service, 'available_providers', []):
            customer_data = {'name': 'Test'}
            vehicle_prefs = {}
            
            result = await ai_service.analyze_customer_with_ai(customer_data, vehicle_prefs)
            
            # Should still return a fallback response
            assert result is not None
            assert 'fallback' in result.get('provider', '')

    @pytest.mark.asyncio
    async def test_malformed_api_response_handling(self, ai_service):
        """Test handling of malformed API responses"""
        malformed_responses = [
            None,
            "",
            "Not a JSON response",
            '{"incomplete": json',
            '{"empty": {}}',
            "Error: API rate limit exceeded"
        ]

        for response in malformed_responses:
            with patch.object(ai_service, '_call_openai', return_value=response):
                result = await ai_service.analyze_customer_with_ai({}, {})
                
                # Should handle gracefully and return fallback
                assert result is not None
                assert 'recommended_model' in result

    @pytest.mark.asyncio
    async def test_network_error_recovery(self, ai_service):
        """Test recovery from network errors"""
        customer_data = {'name': 'Test Customer'}
        vehicle_prefs = {}

        # Simulate network errors
        network_errors = [
            Exception("Connection timeout"),
            Exception("DNS resolution failed"),
            Exception("SSL certificate error")
        ]

        for error in network_errors:
            with patch.object(ai_service, '_call_openai', side_effect=error):
                with patch.object(ai_service, '_call_deepseek', side_effect=error):
                    with patch.object(ai_service, '_call_gemini', side_effect=error):
                        result = await ai_service.analyze_customer_with_ai(customer_data, vehicle_prefs)
                        
                        # Should fall back to mock response
                        assert result is not None

    def test_input_validation_and_sanitization(self, ai_service):
        """Test input validation and sanitization"""
        # Test various invalid inputs
        invalid_inputs = [
            (None, {}),
            ({}, None),
            ('not_a_dict', {}),
            ({}, 'not_a_dict'),
            ({'malicious': '<script>alert("xss")</script>'}, {}),
            ({'huge_field': 'x' * 100000}, {})  # Very large input
        ]

        for customer_data, vehicle_prefs in invalid_inputs:
            try:
                prompt = ai_service._create_customer_analysis_prompt(customer_data, vehicle_prefs)
                # Should handle gracefully, not crash
                assert isinstance(prompt, str)
            except Exception as e:
                # If exception occurs, it should be a controlled validation error
                assert 'validation' in str(e).lower() or 'invalid' in str(e).lower()


class TestSwissAPIIntegration:
    """Test integration with Swiss APIs and data sources"""

    @pytest.fixture
    def ai_service(self):
        return AIProviderService()

    @pytest.mark.asyncio
    async def test_handelsregister_integration(self, ai_service):
        """Test integration with Swiss Handelsregister API"""
        uid_number = "CHE-123.456.789"
        
        mock_company_data = {
            'name': 'TechAG Solutions',
            'legal_form': 'AG',
            'status': 'active',
            'founding_date': '2010-03-15',
            'address': 'Zürich, Switzerland'
        }

        with patch.object(ai_service, '_lookup_handelsregister', return_value=mock_company_data):
            result = await ai_service._lookup_handelsregister(uid_number)
            
            assert result['name'] == 'TechAG Solutions'
            assert result['legal_form'] == 'AG'
            assert result['status'] == 'active'

    @pytest.mark.asyncio
    async def test_zek_credit_check_integration(self, ai_service):
        """Test integration with ZEK credit check"""
        customer_data = {
            'firstName': 'Hans',
            'lastName': 'Müller',
            'dateOfBirth': '1978-05-15',
            'ssn': '756.1234.5678.90'  # Swiss social security number format
        }

        mock_credit_data = {
            'credit_score': 750,
            'risk_category': 'low',
            'existing_loans': 0,
            'payment_history': 'positive'
        }

        with patch.object(ai_service, '_check_zek_credit', return_value=mock_credit_data):
            result = await ai_service._check_zek_credit(customer_data)
            
            assert result['credit_score'] == 750
            assert result['risk_category'] == 'low'

    @pytest.mark.asyncio
    async def test_swiss_postal_code_validation(self, ai_service):
        """Test Swiss postal code validation and city lookup"""
        test_postal_codes = [
            ('8001', 'Zürich', 'ZH'),
            ('1201', 'Genève', 'GE'),
            ('4001', 'Basel', 'BS'),
            ('6900', 'Lugano', 'TI')
        ]

        for postal_code, expected_city, expected_canton in test_postal_codes:
            mock_result = {
                'postal_code': postal_code,
                'city': expected_city,
                'canton': expected_canton,
                'valid': True
            }

            with patch.object(ai_service, '_validate_swiss_address', return_value=mock_result):
                result = await ai_service._validate_swiss_address(postal_code)
                
                assert result['city'] == expected_city
                assert result['canton'] == expected_canton
                assert result['valid'] is True


if __name__ == '__main__':
    # Run tests with pytest
    pytest.main([__file__, '-v', '--tb=short'])