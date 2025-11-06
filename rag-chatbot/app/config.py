import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "RAG Chatbot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PORT', 8080))

    # Qdrant / Embeddings
    QDRANT_URL: str = os.getenv('QDRANT_URL', 'http://localhost:6333')
    QDRANT_API_KEY: str = os.getenv('QDRANT_API_KEY', '')
    RAG_COLLECTION: str = os.getenv('RAG_COLLECTION', 'ractso_rag')
    EMBEDDING_MODEL: str = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')

    # Database (optional, for ingestion)
    DATABASE_URL: str = os.getenv('DATABASE_URL', '')

    # Ollama LLM
    OLLAMA_URL: str = os.getenv('OLLAMA_URL', 'http://localhost:11434')
    OLLAMA_MODEL: str = os.getenv('OLLAMA_MODEL', 'llama3.2')

    class Config:
        env_file = '.env'
        case_sensitive = True


settings = Settings()


