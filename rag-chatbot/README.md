# Ractso RAG Chatbot

A Retrieval-Augmented Generation (RAG) chatbot system that reads from the Ractso database, vectorizes the content using embeddings, stores it in Qdrant, and uses Ollama LLM to answer user questions based on the database context.

## Architecture

- **Database**: PostgreSQL (Ractso app database)
- **Vector Database**: Qdrant (local instance)
- **Embeddings**: FastEmbed (sentence-transformers/all-MiniLM-L6-v2)
- **LLM**: Ollama (llama3.2 or any compatible model)
- **API Framework**: FastAPI
- **Language**: Python 3.10+

## Features

- Ingests data from multiple database tables:
  - Posts (with author information)
  - Comments (with post and author context)
  - User profiles (bio, location, website)
- Automatic text chunking for optimal retrieval
- Semantic search using vector embeddings
- Context-aware answer generation using Ollama
- RESTful API with automatic documentation

## Prerequisites

1. **Python 3.10+**
2. **PostgreSQL** (Ractso database running)
3. **Qdrant** (vector database)
4. **Ollama** (LLM runtime)

## Setup Instructions

### 1. Install Qdrant

```bash
# Using Docker (recommended)
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

Or install locally: https://qdrant.tech/documentation/quick-start/

### 2. Install Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

### 3. Pull Ollama Model

```bash
# Pull llama3.2 (or any other model you prefer)
ollama pull llama3.2

# Other recommended models:
# ollama pull llama3.1
# ollama pull mistral
# ollama pull phi3
```

### 4. Install Python Dependencies

```bash
cd rag-chatbot
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Edit `.env` file with your settings:

```env
DEBUG=True
HOST=0.0.0.0
PORT=8080

# Qdrant Settings
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
RAG_COLLECTION=ractso_rag

# Embedding Model
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Database Connection (update with your actual credentials)
DATABASE_URL=postgresql://username:password@localhost:5432/monorepo_db

# Ollama LLM Settings
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 6. Start Services

Make sure all services are running:

```bash
# 1. Start Qdrant (if using Docker)
docker start <qdrant-container-id>

# 2. Start Ollama (if not already running)
ollama serve

# 3. Start the RAG Chatbot API
./run.sh
# Or manually:
# source venv/bin/activate
# uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## API Usage

### 1. Ingest Data

First, ingest data from your database into Qdrant:

```bash
curl -X POST http://localhost:8080/api/v1/rag/ingest
```

Response:
```json
{
  "ingested": 150,
  "posts": 100,
  "comments": 45,
  "profiles": 5
}
```

### 2. Ask Questions

Query the RAG system with a question:

```bash
curl -X POST http://localhost:8080/api/v1/rag/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are people discussing about Python?",
    "top_k": 5
  }'
```

Response:
```json
{
  "answer": "Based on the posts and comments in the database, users are discussing various Python topics including...",
  "sources": [
    {
      "id": "123",
      "score": 0.87,
      "text": "Python is great for data science...",
      "meta": {
        "type": "post",
        "username": "john_doe",
        "post_id": "abc123"
      }
    }
  ]
}
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

## Project Structure

```
rag-chatbot/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── api/
│   │   └── routes.py           # API endpoints
│   └── services/
│       ├── db.py               # Database connection
│       ├── embeddings.py       # Embedding generation
│       ├── qdrant_client.py    # Qdrant operations
│       ├── ollama_client.py    # Ollama LLM integration
│       └── ingest.py           # Data ingestion logic
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
├── run.sh                      # Startup script
└── README.md                   # This file
```

## How It Works

1. **Ingestion Phase**:
   - Fetches posts, comments, and user profiles from PostgreSQL
   - Chunks long texts into manageable pieces (300-400 characters)
   - Generates embeddings using FastEmbed
   - Stores vectors and metadata in Qdrant

2. **Query Phase**:
   - User asks a question
   - Question is embedded using the same model
   - Semantic search finds top-k most relevant documents from Qdrant
   - Retrieved context is sent to Ollama with the question
   - Ollama generates a contextual answer based on the database content

## Customization

### Change LLM Model

Edit `.env`:
```env
OLLAMA_MODEL=mistral  # or llama3.1, phi3, etc.
```

### Adjust Chunk Size

Edit `app/services/ingest.py`:
```python
chunks = _chunk_text(content, max_len=500)  # Increase/decrease as needed
```

### Add More Data Sources

Add new fetch functions in `app/services/ingest.py`:
```python
async def fetch_new_table() -> List[Dict[str, Any]]:
    rows = await db.query("SELECT * FROM new_table")
    # Process and return documents
```

Then update `fetch_corpus()` to include the new source.

### Modify Search Results

Edit `app/api/routes.py`:
```python
results = search_vector(vec, top_k=req.top_k)  # Adjust top_k
```

## Troubleshooting

### Qdrant Connection Error
- Ensure Qdrant is running: `curl http://localhost:6333/collections`
- Check QDRANT_URL in `.env`

### Ollama Timeout
- Increase timeout in `app/services/ollama_client.py`
- Use a smaller/faster model

### Database Connection Error
- Verify DATABASE_URL credentials
- Ensure PostgreSQL is running and accessible

### Embedding Dimension Mismatch
- Delete the Qdrant collection and re-ingest
- Ensure EMBEDDING_MODEL hasn't changed

## Performance Tips

1. **Batch Ingestion**: For large datasets, process in batches
2. **Incremental Updates**: Only ingest new/modified documents
3. **Caching**: Enable Qdrant's payload caching
4. **Model Selection**: Balance between accuracy and speed

## License

Part of the Ractso project.
