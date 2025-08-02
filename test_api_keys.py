#!/usr/bin/env python3
"""
CADILLAC EV CIS - API Keys Test Script
Tests all configured API keys and services
"""

import os
import sys
import requests
import json
from datetime import datetime

# Add the ai-services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-services', 'src'))

def test_openai_api():
    """Test OpenAI API"""
    print("🔍 Testing OpenAI API...")
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("❌ OpenAI API key not found")
            return False
            
        client = OpenAI(api_key=api_key)
        
        # Simple test
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'Hello from CADILLAC EV CIS!'"}],
            max_tokens=10
        )
        
        print(f"✅ OpenAI API working: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        return False

def test_deepseek_api():
    """Test DeepSeek API"""
    print("🔍 Testing DeepSeek API...")
    try:
        from openai import OpenAI
        
        api_key = os.getenv('DEEPSEEK_API_KEY')
        if not api_key:
            print("❌ DeepSeek API key not found")
            return False
            
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com/v1")
        
        # Simple test
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": "Say 'Hello from CADILLAC EV CIS!'"}],
            max_tokens=10
        )
        
        print(f"✅ DeepSeek API working: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ DeepSeek API error: {e}")
        return False

def test_gemini_api():
    """Test Google Gemini API"""
    print("🔍 Testing Google Gemini API...")
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ Gemini API key not found")
            return False
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content("Say 'Hello from CADILLAC EV CIS!'")
        
        print(f"✅ Gemini API working: {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False

def test_serper_api():
    """Test Serper API"""
    print("🔍 Testing Serper API...")
    try:
        api_key = os.getenv('SERPER_API_KEY')
        if not api_key:
            print("❌ Serper API key not found")
            return False
            
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": api_key,
            "Content-Type": "application/json"
        }
        data = {
            "q": "CADILLAC EV Switzerland",
            "num": 1
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Serper API working: Found {len(result.get('organic', []))} results")
        return True
        
    except Exception as e:
        print(f"❌ Serper API error: {e}")
        return False

def test_firecrawl_api():
    """Test Firecrawl API"""
    print("🔍 Testing Firecrawl API...")
    try:
        api_key = os.getenv('FIRECRAWL_API_KEY')
        if not api_key:
            print("❌ Firecrawl API key not found")
            return False
            
        url = "https://api.firecrawl.dev/scrape"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "url": "https://www.cadillac.com"
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Firecrawl API working: Scraped {result.get('url', 'N/A')}")
        return True
        
    except Exception as e:
        print(f"❌ Firecrawl API error: {e}")
        return False

def test_qdrant_api():
    """Test Qdrant API"""
    print("🔍 Testing Qdrant API...")
    try:
        from qdrant_client import QdrantClient
        
        url = os.getenv('QDRANT_URL')
        api_key = os.getenv('QDRANT_API_KEY')
        
        if not url or not api_key:
            print("❌ Qdrant configuration not found")
            return False
            
        client = QdrantClient(url=url, api_key=api_key)
        
        # Test connection
        collections = client.get_collections()
        print(f"✅ Qdrant API working: Found {len(collections.collections)} collections")
        return True
        
    except Exception as e:
        print(f"❌ Qdrant API error: {e}")
        return False

def test_local_services():
    """Test local services"""
    print("🔍 Testing local services...")
    
    services = [
        ("Frontend", "http://localhost:3000"),
        ("AI Services", "http://localhost:5000/health"),
        ("Backend", "http://localhost:3001/health")
    ]
    
    results = []
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} is running")
                results.append(True)
            else:
                print(f"⚠️ {name} responded with status {response.status_code}")
                results.append(False)
        except requests.exceptions.RequestException as e:
            print(f"❌ {name} is not responding: {e}")
            results.append(False)
    
    return results

def test_firebase_functions():
    """Test Firebase Functions"""
    print("🔍 Testing Firebase Functions...")
    try:
        url = "https://us-central1-superagent-ff2fe.cloudfunctions.net/api/health"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Firebase Functions working: {result.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Firebase Functions error: Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Firebase Functions error: {e}")
        return False

def main():
    """Main test function"""
    print("🚗 CADILLAC EV CIS - API Keys Test")
    print("=" * 50)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Test results
    results = {
        "openai": test_openai_api(),
        "deepseek": test_deepseek_api(),
        "gemini": test_gemini_api(),
        "serper": test_serper_api(),
        "firecrawl": test_firecrawl_api(),
        "qdrant": test_qdrant_api(),
        "firebase": test_firebase_functions()
    }
    
    print()
    print("🔍 Testing local services...")
    local_results = test_local_services()
    
    # Summary
    print()
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    working_apis = sum(results.values())
    total_apis = len(results)
    
    print(f"API Services: {working_apis}/{total_apis} working")
    print(f"Local Services: {sum(local_results)}/{len(local_results)} running")
    
    print()
    print("✅ Working APIs:")
    for api, working in results.items():
        if working:
            print(f"  - {api.upper()}")
    
    print()
    print("❌ Failed APIs:")
    for api, working in results.items():
        if not working:
            print(f"  - {api.upper()}")
    
    print()
    if working_apis == total_apis:
        print("🎉 All API keys are working correctly!")
    else:
        print("⚠️ Some API keys need attention")
    
    print()
    print("🚀 Next steps:")
    print("1. Start all services: npm run dev")
    print("2. Access frontend: http://localhost:3000")
    print("3. Test AI services: http://localhost:5000")
    print("4. Check Firebase: https://superagent-ff2fe.web.app")

if __name__ == "__main__":
    main() 