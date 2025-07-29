"""
AI Provider Service
==================

Multi-provider AI service with fallback mechanisms for OpenAI, DeepSeek, and Gemini.
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import openai
import httpx
from config import config

logger = logging.getLogger(__name__)

class AIProviderService:
    """Multi-provider AI service with intelligent fallback"""
    
    def __init__(self):
        self.openai_client = None
        self.available_providers = config.get_available_ai_providers()
        self.provider_priority = ['openai', 'deepseek', 'gemini']
        
        # Initialize OpenAI client if available
        if 'openai' in self.available_providers:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=config.openai.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {str(e)}")
                # Remove openai from available providers if initialization fails
                if 'openai' in self.available_providers:
                    self.available_providers.remove('openai')
    
    async def analyze_customer_with_ai(self, customer_data: Dict, vehicle_preferences: Dict) -> Dict:
        """
        Analyze customer data using available AI providers
        """
        prompt = self._create_customer_analysis_prompt(customer_data, vehicle_preferences)
        
        # Try providers in priority order
        for provider in self.provider_priority:
            if provider in self.available_providers:
                try:
                    result = await self._call_ai_provider(provider, prompt)
                    if result:
                        return self._format_analysis_result(result, provider)
                except Exception as e:
                    logger.warning(f"Provider {provider} failed: {str(e)}")
                    continue
        
        # Fallback to mock response if all providers fail
        return self._generate_mock_analysis(customer_data, vehicle_preferences)
    
    async def _call_ai_provider(self, provider: str, prompt: str) -> Optional[Dict]:
        """Call specific AI provider"""
        if provider == 'openai':
            return await self._call_openai(prompt)
        elif provider == 'deepseek':
            return await self._call_deepseek(prompt)
        elif provider == 'gemini':
            return await self._call_gemini(prompt)
        return None
    
    async def _call_openai(self, prompt: str) -> Optional[Dict]:
        """Call OpenAI API"""
        try:
            from openai import OpenAI
            
            client = OpenAI(api_key=config.openai.api_key)
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[
                    {"role": "system", "content": "You are a CADILLAC EV sales consultant expert in the Swiss market. Provide detailed, professional analysis and recommendations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=config.openai.max_tokens,
                temperature=config.openai.temperature
            )
            
            content = response.choices[0].message.content
            return self._parse_ai_response(content)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return None
    
    async def _call_deepseek(self, prompt: str) -> Optional[Dict]:
        """Call DeepSeek API"""
        try:
            headers = {
                "Authorization": f"Bearer {config.deepseek.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": config.deepseek.model,
                "messages": [
                    {"role": "system", "content": "You are a CADILLAC EV sales consultant expert in the Swiss market. Provide detailed, professional analysis and recommendations."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": config.deepseek.max_tokens,
                "temperature": config.deepseek.temperature
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    return self._parse_ai_response(content)
                else:
                    logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"DeepSeek API error: {str(e)}")
            return None
    
    async def _call_gemini(self, prompt: str) -> Optional[Dict]:
        """Call Google Gemini API"""
        try:
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "contents": [
                    {
                        "parts": [
                            {"text": "You are a CADILLAC EV sales consultant expert in the Swiss market. Provide detailed, professional analysis and recommendations."},
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "maxOutputTokens": config.gemini.max_tokens,
                    "temperature": config.gemini.temperature
                }
            }
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{config.gemini.model}:generateContent?key={config.gemini.api_key}"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json=data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    return self._parse_ai_response(content)
                else:
                    logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return None
    
    def _create_customer_analysis_prompt(self, customer_data: Dict, vehicle_preferences: Dict) -> str:
        """Create comprehensive prompt for customer analysis"""
        return f"""
        Analyze this customer profile for CADILLAC EV recommendations in Switzerland:
        
        CUSTOMER PROFILE:
        - Name: {customer_data.get('firstName', '')} {customer_data.get('lastName', '')}
        - Type: {customer_data.get('customerType', '')}
        - Location: {customer_data.get('city', '')}, {customer_data.get('canton', '')}
        - Age: {customer_data.get('age', 'N/A')}
        - Email: {customer_data.get('email', '')}
        - Phone: {customer_data.get('phone', '')}
        
        VEHICLE PREFERENCES:
        - Budget Range: {vehicle_preferences.get('budget_min', 'N/A')} - {vehicle_preferences.get('budget_max', 'N/A')} CHF
        - Usage: {vehicle_preferences.get('usage', 'N/A')}
        - Features: {vehicle_preferences.get('features', [])}
        - Timeline: {vehicle_preferences.get('timeline', 'N/A')}
        
        SWISS MARKET CONTEXT:
        - EV adoption rate: 32% year-over-year growth
        - Luxury EV segment: Growing 45% annually
        - Government incentives available
        - Excellent charging infrastructure
        
        CADILLAC EV MODELS:
        - LYRIQ: 100kWh battery, 502km range, CHF 82,900-96,900
        - VISTIQ: New luxury SUV, premium features, CHF 120,000+
        
        Please provide a detailed analysis in JSON format with:
        1. Recommended CADILLAC EV model with confidence score
        2. Key selling points for this specific customer
        3. Suggested options and packages
        4. Financing recommendations
        5. Competitive advantages vs. BMW iX, Mercedes EQS
        6. Swiss-specific benefits (taxes, incentives, infrastructure)
        7. Next best actions for sales team
        8. Risk assessment and mitigation strategies
        
        Format the response as valid JSON with clear structure.
        """
    
    def _parse_ai_response(self, content: str) -> Dict:
        """Parse AI response and extract structured data"""
        try:
            # Try to extract JSON from response
            if '{' in content and '}' in content:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                return json.loads(json_str)
            else:
                # If no JSON found, create structured response from text
                return self._structure_text_response(content)
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from AI response, structuring text")
            return self._structure_text_response(content)
    
    def _structure_text_response(self, content: str) -> Dict:
        """Structure text response into JSON format"""
        return {
            "recommended_model": "LYRIQ" if "LYRIQ" in content.upper() else "VISTIQ",
            "confidence_score": 0.75,
            "analysis": content,
            "recommendations": {
                "model_rationale": "Based on AI analysis",
                "suggested_options": ["Premium Package", "Technology Package"],
                "financing_suggestion": "3.9% APR lease with CHF 10,000 down payment",
                "key_selling_points": [
                    "Swiss EV infrastructure",
                    "Luxury and technology",
                    "Environmental benefits"
                ]
            },
            "next_steps": [
                "Schedule test drive",
                "Prepare TCO calculation",
                "Review financing options"
            ]
        }
    
    def _format_analysis_result(self, result: Dict, provider: str) -> Dict:
        """Format analysis result with metadata"""
        return {
            "success": True,
            "analysis": result,
            "metadata": {
                "provider": provider,
                "timestamp": datetime.now().isoformat(),
                "model_used": getattr(config, provider).model if hasattr(config, provider) else "unknown"
            }
        }
    
    def _generate_mock_analysis(self, customer_data: Dict, vehicle_preferences: Dict) -> Dict:
        """Generate mock analysis as fallback"""
        customer_type = customer_data.get('customerType', 'private')
        canton = customer_data.get('canton', 'ZH')
        
        return {
            "success": True,
            "analysis": {
                "recommended_model": "LYRIQ" if customer_type == 'private' else "VISTIQ",
                "confidence_score": 0.85,
                "recommendations": {
                    "model_rationale": f"Based on customer profile, {'LYRIQ' if customer_type == 'private' else 'VISTIQ'} offers the perfect balance for {customer_type} customers in {canton}",
                    "suggested_options": [
                        "Premium Package",
                        "Advanced Driver Assistance",
                        "Panoramic Sunroof"
                    ],
                    "financing_suggestion": "3.9% APR lease with CHF 10,000 down payment",
                    "key_selling_points": [
                        "530km range perfect for Swiss driving",
                        "Award-winning design",
                        "Advanced technology features",
                        "Excellent resale value"
                    ]
                },
                "swiss_benefits": [
                    f"Kanton {canton} EV incentives available",
                    "Swiss charging network compatibility",
                    "Tax advantages for business customers",
                    "Environmental consciousness alignment"
                ],
                "next_steps": [
                    "Schedule test drive",
                    "Prepare detailed TCO calculation",
                    "Review financing options"
                ]
            },
            "metadata": {
                "provider": "mock",
                "timestamp": datetime.now().isoformat(),
                "note": "Mock response - AI providers unavailable"
            }
        }
    
    def get_provider_status(self) -> Dict:
        """Get status of all AI providers"""
        return {
            "available_providers": self.available_providers,
            "provider_priority": self.provider_priority,
            "config_validation": config.validate_config()
        }

# Global AI provider service instance
ai_provider = AIProviderService() 