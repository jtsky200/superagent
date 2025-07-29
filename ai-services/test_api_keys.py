#!/usr/bin/env python3
"""
API Keys Test Script
===================

Test all provided API keys and validate AI services functionality.
"""

import os
import sys
import asyncio
import json
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import config
from src.services.ai_provider import ai_provider

def test_configuration():
    """Test configuration loading and validation"""
    print("🔧 Testing Configuration...")
    print("=" * 50)
    
    validation = config.validate_config()
    
    for service, checks in validation.items():
        print(f"\n📋 {service.upper()}:")
        for check, status in checks.items():
            status_icon = "✅" if status else "❌"
            print(f"  {status_icon} {check}: {status}")
    
    available_providers = config.get_available_ai_providers()
    print(f"\n🤖 Available AI Providers: {', '.join(available_providers) if available_providers else 'None'}")
    
    return validation

async def test_ai_providers():
    """Test AI providers with sample data"""
    print("\n🧠 Testing AI Providers...")
    print("=" * 50)
    
    # Sample customer data
    customer_data = {
        "firstName": "Hans",
        "lastName": "Müller",
        "customerType": "private",
        "city": "Zürich",
        "canton": "ZH",
        "age": 42,
        "email": "hans.mueller@example.com",
        "phone": "+41 79 123 45 67"
    }
    
    vehicle_preferences = {
        "budget_min": 80000,
        "budget_max": 120000,
        "usage": "family_daily",
        "features": ["safety", "comfort", "technology"],
        "timeline": "3_months"
    }
    
    print(f"👤 Testing with customer: {customer_data['firstName']} {customer_data['lastName']}")
    print(f"🚗 Vehicle preferences: {vehicle_preferences['budget_min']}-{vehicle_preferences['budget_max']} CHF")
    
    try:
        result = await ai_provider.analyze_customer_with_ai(customer_data, vehicle_preferences)
        
        if result.get('success'):
            analysis = result.get('analysis', {})
            metadata = result.get('metadata', {})
            
            print(f"\n✅ Analysis successful using {metadata.get('provider', 'unknown')}")
            print(f"📊 Recommended model: {analysis.get('recommended_model', 'N/A')}")
            print(f"🎯 Confidence score: {analysis.get('confidence_score', 'N/A')}")
            
            if 'recommendations' in analysis:
                recs = analysis['recommendations']
                print(f"💡 Key selling points: {len(recs.get('key_selling_points', []))} points")
                print(f"🔧 Suggested options: {len(recs.get('suggested_options', []))} options")
            
            if 'next_steps' in analysis:
                print(f"📋 Next steps: {len(analysis['next_steps'])} actions")
            
            return True
        else:
            print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error during AI analysis: {str(e)}")
        return False

def test_web_search_apis():
    """Test web search and data extraction APIs"""
    print("\n🌐 Testing Web Search APIs...")
    print("=" * 50)
    
    import httpx
    
    # Test Serper API
    print("🔍 Testing Serper API...")
    try:
        headers = {
            "X-API-KEY": config.web_search.serper_api_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "q": "CADILLAC LYRIQ Switzerland price",
            "num": 3
        }
        
        with httpx.Client() as client:
            response = client.post(
                "https://google.serper.dev/search",
                headers=headers,
                json=data,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                organic_results = result.get('organic', [])
                print(f"✅ Serper API working - Found {len(organic_results)} results")
                if organic_results:
                    print(f"   First result: {organic_results[0].get('title', 'N/A')}")
            else:
                print(f"❌ Serper API error: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Serper API test failed: {str(e)}")
    
    # Test Firecrawl API
    print("\n🕷️ Testing Firecrawl API...")
    try:
        headers = {
            "Authorization": f"Bearer {config.web_search.firecrawl_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "url": "https://www.cadillac.ch/vehicles/lyriq",
            "format": "text"
        }
        
        with httpx.Client() as client:
            response = client.post(
                "https://api.firecrawl.dev/scrape",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Firecrawl API working - Content length: {len(result.get('data', {}).get('content', ''))}")
            else:
                print(f"❌ Firecrawl API error: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Firecrawl API test failed: {str(e)}")

def test_qdrant():
    """Test Qdrant vector database connection"""
    print("\n🗄️ Testing Qdrant Vector Database...")
    print("=" * 50)
    
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Distance, VectorParams
        
        client = QdrantClient(
            url=config.qdrant.url,
            api_key=config.qdrant.api_key
        )
        
        # Test connection by getting collections
        collections = client.get_collections()
        print(f"✅ Qdrant connection successful")
        print(f"📊 Available collections: {len(collections.collections)}")
        
        for collection in collections.collections:
            print(f"   - {collection.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Qdrant test failed: {str(e)}")
        return False

def generate_test_report():
    """Generate comprehensive test report"""
    print("\n📊 Generating Test Report...")
    print("=" * 50)
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "configuration": config.validate_config(),
        "available_providers": config.get_available_ai_providers(),
        "test_results": {}
    }
    
    # Save report
    with open("test_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("✅ Test report saved to test_report.json")
    
    # Summary
    total_checks = sum(len(checks) for checks in report["configuration"].values())
    passed_checks = sum(
        sum(1 for check in checks.values() if check)
        for checks in report["configuration"].values()
    )
    
    print(f"\n📈 Summary:")
    print(f"   Total checks: {total_checks}")
    print(f"   Passed: {passed_checks}")
    print(f"   Failed: {total_checks - passed_checks}")
    print(f"   Success rate: {(passed_checks/total_checks)*100:.1f}%")

async def main():
    """Main test function"""
    print("🚗 CADILLAC EV CIS - API Keys Test Suite")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test configuration
    config_ok = test_configuration()
    
    # Test AI providers
    ai_ok = await test_ai_providers()
    
    # Test web search APIs
    test_web_search_apis()
    
    # Test Qdrant
    qdrant_ok = test_qdrant()
    
    # Generate report
    generate_test_report()
    
    print("\n" + "=" * 60)
    print("🏁 Test Suite Completed!")
    
    if config_ok and ai_ok and qdrant_ok:
        print("🎉 All critical tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed. Check the report above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 