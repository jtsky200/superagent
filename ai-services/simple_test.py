#!/usr/bin/env python3
"""
Simple Test Script
=================

Basic dependency and configuration test for AI services.
"""

import os
import sys
import json
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test if all required modules can be imported"""
    print("🔧 Testing Imports...")
    print("=" * 50)
    
    try:
        from config import config
        print("✅ Config module imported successfully")
    except Exception as e:
        print(f"❌ Config import failed: {str(e)}")
        return False
    
    try:
        import openai
        print("✅ OpenAI module imported successfully")
    except Exception as e:
        print(f"❌ OpenAI import failed: {str(e)}")
        return False
    
    try:
        import httpx
        print("✅ HTTPX module imported successfully")
    except Exception as e:
        print(f"❌ HTTPX import failed: {str(e)}")
        return False
    
    try:
        from qdrant_client import QdrantClient
        print("✅ Qdrant client imported successfully")
    except Exception as e:
        print(f"❌ Qdrant import failed: {str(e)}")
        return False
    
    return True

def test_config():
    """Test configuration loading"""
    print("\n📋 Testing Configuration...")
    print("=" * 50)
    
    try:
        from config import config
        
        # Test OpenAI config
        print(f"OpenAI API Key: {'✅ Set' if config.openai.api_key else '❌ Not set'}")
        print(f"OpenAI Assistant ID: {'✅ Set' if config.openai.assistant_id else '❌ Not set'}")
        
        # Test DeepSeek config
        print(f"DeepSeek API Key: {'✅ Set' if config.deepseek.api_key else '❌ Not set'}")
        print(f"DeepSeek Backup Key: {'✅ Set' if config.deepseek.backup_api_key else '❌ Not set'}")
        
        # Test Gemini config
        print(f"Gemini API Key: {'✅ Set' if config.gemini.api_key else '❌ Not set'}")
        
        # Test Web Search config
        print(f"Serper API Key: {'✅ Set' if config.web_search.serper_api_key else '❌ Not set'}")
        print(f"Firecrawl API Key: {'✅ Set' if config.web_search.firecrawl_api_key else '❌ Not set'}")
        
        # Test Qdrant config
        print(f"Qdrant URL: {'✅ Set' if config.qdrant.url else '❌ Not set'}")
        print(f"Qdrant API Key: {'✅ Set' if config.qdrant.api_key else '❌ Not set'}")
        
        available_providers = config.get_available_ai_providers()
        print(f"\n🤖 Available AI Providers: {', '.join(available_providers) if available_providers else 'None'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration test failed: {str(e)}")
        return False

def test_openai_connection():
    """Test OpenAI API connection"""
    print("\n🧠 Testing OpenAI Connection...")
    print("=" * 50)
    
    try:
        from openai import OpenAI
        from config import config
        
        if not config.openai.api_key:
            print("❌ OpenAI API key not configured")
            return False
        
        client = OpenAI(api_key=config.openai.api_key)
        
        # Simple test call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say 'Hello from CADILLAC EV CIS' in one word."}
            ],
            max_tokens=10
        )
        
        content = response.choices[0].message.content
        print(f"✅ OpenAI API working - Response: {content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI connection failed: {str(e)}")
        return False

def test_deepseek_connection():
    """Test DeepSeek API connection"""
    print("\n🔍 Testing DeepSeek Connection...")
    print("=" * 50)
    
    try:
        import httpx
        from config import config
        
        if not config.deepseek.api_key:
            print("❌ DeepSeek API key not configured")
            return False
        
        headers = {
            "Authorization": f"Bearer {config.deepseek.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "user", "content": "Say 'Hello from CADILLAC EV CIS' in one word."}
            ],
            "max_tokens": 10
        }
        
        with httpx.Client() as client:
            response = client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print(f"✅ DeepSeek API working - Response: {content}")
                return True
            else:
                print(f"❌ DeepSeek API error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ DeepSeek connection failed: {str(e)}")
        return False

def test_qdrant_connection():
    """Test Qdrant connection"""
    print("\n🗄️ Testing Qdrant Connection...")
    print("=" * 50)
    
    try:
        from qdrant_client import QdrantClient
        from config import config
        
        if not config.qdrant.url or not config.qdrant.api_key:
            print("❌ Qdrant configuration not complete")
            return False
        
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
        print(f"❌ Qdrant connection failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚗 CADILLAC EV CIS - Simple Test Suite")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Test imports
    results.append(("Imports", test_imports()))
    
    # Test configuration
    results.append(("Configuration", test_config()))
    
    # Test OpenAI
    results.append(("OpenAI", test_openai_connection()))
    
    # Test DeepSeek
    results.append(("DeepSeek", test_deepseek_connection()))
    
    # Test Qdrant
    results.append(("Qdrant", test_qdrant_connection()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    success_rate = (passed / total) * 100
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed! Ready to run full test suite.")
        return 0
    else:
        print("⚠️ Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 