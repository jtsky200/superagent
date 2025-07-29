"""
CADILLAC EV CIS AI Services Configuration
=========================================

Centralized configuration management for all AI services including
OpenAI, DeepSeek, Gemini, and Swiss data APIs.
"""

import os
from typing import Optional
from dataclasses import dataclass

@dataclass
class OpenAIConfig:
    """OpenAI API configuration"""
    api_key: str
    assistant_id: str
    model: str = "gpt-4-turbo-preview"
    max_tokens: int = 4000
    temperature: float = 0.7

@dataclass
class DeepSeekConfig:
    """DeepSeek API configuration"""
    api_key: str
    backup_api_key: str
    model: str = "deepseek-chat"
    max_tokens: int = 4000
    temperature: float = 0.7

@dataclass
class GeminiConfig:
    """Google Gemini API configuration"""
    api_key: str
    model: str = "gemini-pro"
    max_tokens: int = 4000
    temperature: float = 0.7

@dataclass
class WebSearchConfig:
    """Web search and data extraction configuration"""
    serper_api_key: str
    firecrawl_api_key: str

@dataclass
class QdrantConfig:
    """Qdrant vector database configuration"""
    url: str
    api_key: str
    collection_name: str = "cadillac_ev_knowledge"

@dataclass
class SwissDataConfig:
    """Swiss data APIs configuration"""
    handelsregister_api_key: Optional[str] = None
    zek_api_key: Optional[str] = None
    astra_api_key: Optional[str] = None

@dataclass
class DatabaseConfig:
    """Database configuration"""
    url: str = "sqlite:///database/app.db"
    redis_url: str = "redis://localhost:6379"

@dataclass
class AppConfig:
    """Main application configuration"""
    secret_key: str = "cadillac-ev-cis-ai-services-secret-key-2024"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 5000
    cors_origins: list = None
    
    def __post_init__(self):
        if self.cors_origins is None:
            self.cors_origins = ["http://localhost:3000", "http://localhost:3001"]

class Config:
    """Main configuration class"""
    
    def __init__(self):
        # OpenAI Configuration
        self.openai = OpenAIConfig(
            api_key=os.getenv('OPENAI_API_KEY', ''),
            assistant_id=os.getenv('OPENAI_ASSISTANT_ID', '')
        )
        
        # DeepSeek Configuration
        self.deepseek = DeepSeekConfig(
            api_key=os.getenv('DEEPSEEK_API_KEY', ''),
            backup_api_key=os.getenv('DEEPSEEK_BACKUP_API_KEY', '')
        )
        
        # Gemini Configuration
        self.gemini = GeminiConfig(
            api_key=os.getenv('GEMINI_API_KEY', '')
        )
        
        # Web Search Configuration
        self.web_search = WebSearchConfig(
            serper_api_key=os.getenv('SERPER_API_KEY', ''),
            firecrawl_api_key=os.getenv('FIRECRAWL_API_KEY', '')
        )
        
        # Qdrant Configuration
        self.qdrant = QdrantConfig(
            url=os.getenv('QDRANT_URL', ''),
            api_key=os.getenv('QDRANT_API_KEY', '')
        )
        
        # Swiss Data Configuration
        self.swiss_data = SwissDataConfig(
            handelsregister_api_key=os.getenv('HANDELSREGISTER_API_KEY'),
            zek_api_key=os.getenv('ZEK_API_KEY'),
            astra_api_key=os.getenv('ASTRA_API_KEY')
        )
        
        # Database Configuration
        self.database = DatabaseConfig(
            url=os.getenv('DATABASE_URL', 'sqlite:///database/app.db'),
            redis_url=os.getenv('REDIS_URL', 'redis://localhost:6379')
        )
        
        # App Configuration
        self.app = AppConfig(
            secret_key=os.getenv('FLASK_SECRET_KEY', 'cadillac-ev-cis-ai-services-secret-key-2024'),
            debug=os.getenv('DEBUG', 'True').lower() == 'true',
            host=os.getenv('FLASK_HOST', '0.0.0.0'),
            port=int(os.getenv('FLASK_PORT', '5000'))
        )
    
    def validate_config(self) -> dict:
        """Validate configuration and return status"""
        validation_results = {
            'openai': {
                'api_key_valid': bool(self.openai.api_key and self.openai.api_key != ''),
                'assistant_id_valid': bool(self.openai.assistant_id)
            },
            'deepseek': {
                'api_key_valid': bool(self.deepseek.api_key),
                'backup_api_key_valid': bool(self.deepseek.backup_api_key)
            },
            'gemini': {
                'api_key_valid': bool(self.gemini.api_key)
            },
            'web_search': {
                'serper_api_key_valid': bool(self.web_search.serper_api_key),
                'firecrawl_api_key_valid': bool(self.web_search.firecrawl_api_key)
            },
            'qdrant': {
                'url_valid': bool(self.qdrant.url),
                'api_key_valid': bool(self.qdrant.api_key)
            },
            'swiss_data': {
                'handelsregister_configured': bool(self.swiss_data.handelsregister_api_key),
                'zek_configured': bool(self.swiss_data.zek_api_key),
                'astra_configured': bool(self.swiss_data.astra_api_key)
            }
        }
        
        return validation_results
    
    def get_available_ai_providers(self) -> list:
        """Get list of available AI providers"""
        providers = []
        
        if self.openai.api_key and self.openai.api_key != '':
            providers.append('openai')
        
        if self.deepseek.api_key:
            providers.append('deepseek')
        
        if self.gemini.api_key:
            providers.append('gemini')
        
        return providers

# Global configuration instance
config = Config() 