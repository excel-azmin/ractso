# Post Recommendation System REST API

A production-ready REST API service built with **FastAPI** that provides **real-time, incremental learning** for post recommendations based on user viewing behavior.

## 🎯 How It Works

1. **Real-Time Learning**: Every time a user views a post, the system learns from it
2. **Similarity-Based Recommendations**: Suggests posts similar to what the user has viewed
3. **No Batch Training**: Updates happen incrementally as users interact with posts

## 🚀 Features

- **Real-Time Learning**: Model updates instantly when users view posts
- **Similarity-Based**: Uses co-viewing patterns to find similar posts
- **FastAPI Framework**: Modern, fast, async-first web framework
- **Production Ready**: Proper folder structure, dependency injection, error handling
- **Async/Await**: Full async support for database operations
- **Type Safety**: Pydantic schemas for request/response validation
- **Auto Documentation**: Interactive API docs at `/docs` and `/redoc`

## 📁 Project Structure

```
recommendation/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection pool
│   ├── services/
│   │   └── recommendation_service.py  # Core recommendation logic
│   ├── api/
│   │   ├── dependencies.py
│   │   └── v1/
│   │       ├── routes.py    # API endpoints
│   │       └── schemas.py   # Request/response schemas
│   └── utils/
│       └── exceptions.py
├── requirements.txt
├── .env.example
├── README.md
├── INTEGRATION.md          # NestJS integration guide
└── QUICKSTART.md
```

## 🛠️ Setup

### Prerequisites

- Python 3.10+
- PostgreSQL database (same as your backend)
- Virtual environment (venv)

### Installation

1. **Activate virtual environment**:

```bash
cd recommendation
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Configure environment variables**:

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

4. **Create models directory**:

```bash
mkdir -p models
```

## 🚀 Usage

### Start the API Server

**Development mode**:

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Production mode**:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use the run script:

```bash
./run.sh
```

### API Documentation

Once the server is running, visit:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### 1. Health Check

```http
GET /health
```

**Response**:

```json
{
  "status": "healthy",
  "service": "post-recommendation-api",
  "model_loaded": true
}
```

### 2. Track View (Real-Time Learning)

**This is the key endpoint** - call this every time a user views a post:

```http
POST /api/v1/track-view
Content-Type: application/json

{
  "user_id": "user123",
  "post_id": "post456",
  "post_content": "Optional post content",
  "post_author_id": "author789"
}
```

**Response**:

```json
{
  "status": "success",
  "message": "View tracked and model updated",
  "user_id": "user123",
  "post_id": "post456"
}
```

### 3. Get Recommendations

```http
GET /api/v1/recommendations/{user_id}?page=1&limit=10
```

**Response**:

```json
{
  "status": "success",
  "user_id": "user123",
  "recommendations": [
    {
      "id": "post789",
      "authorId": "author123",
      "content": "Recommended post content...",
      "images": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "username": "author_username",
      "firstName": "John",
      "lastName": "Doe",
      "like_count": 10,
      "comment_count": 5,
      "similarity_score": 0.85
    }
  ],
  "count": 10,
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 57,
    "totalPages": 6,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 4. Model Status

```http
GET /api/v1/model/status
```

**Response**:

```json
{
  "status": "success",
  "model_loaded": true,
  "total_users": 150,
  "total_posts": 500,
  "total_interactions": 2500
}
```

## 🔄 Workflow

### Step 1: Track Views

Every time a user views a post, call the track-view endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "post_id": "post456"
  }'
```

### Step 2: Get Recommendations

After the user has viewed some posts, get recommendations:

```bash
curl http://localhost:8000/api/v1/recommendations/user123?limit=10
```

## 🔌 Integration with NestJS Backend

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration instructions.

**Quick Integration**:

1. Create a `RecommendationService` in your NestJS backend
2. Call `trackView()` when a user views a post (in `getSinglePost` handler)
3. Add a recommendations endpoint that calls the recommendation API

Example:

```typescript
// In your post controller
@Get(':id')
async getSinglePost(@Param('id') id: string, @Req() req: any) {
  const post = await this.queryBus.execute(new GetSinglePostQuery(id));

  // Track view asynchronously
  if (req.user?.id) {
    this.recommendationService.trackView(
      req.user.id,
      id,
      post?.content,
      post?.authorId
    );
  }

  return post;
}
```

## 🧠 How Recommendations Work

1. **Co-Viewing Pattern**: If User A viewed Post 1 and Post 2, and User B viewed Post 1, then Post 2 is recommended to User B
2. **Similarity Matrix**: The system builds a similarity matrix based on which posts are viewed together
3. **Scoring**: Posts get higher scores if they're similar to multiple posts the user has viewed
4. **Fallback**: If user has no viewing history, returns popular posts

## 📊 Performance

- **Real-Time Updates**: View tracking is instant (no batch processing)
- **In-Memory Learning**: Fast similarity calculations
- **Persistent Storage**: Interactions saved to disk for persistence
- **Scalable**: Can handle thousands of concurrent requests

## 🐛 Troubleshooting

### No Recommendations

- Ensure users have viewed some posts first
- Check that track-view endpoint is being called
- Verify user_id exists in the system

### Database Connection Issues

- Verify DATABASE_URL in .env file
- Ensure PostgreSQL is running and accessible
- Check database credentials

## 🔧 Development

### Testing Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Track a view
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user1", "post_id": "post1"}'

# Get recommendations
curl http://localhost:8000/api/v1/recommendations/user1

# Check model status
curl http://localhost:8000/api/v1/model/status
```

## 📝 Notes

- **No Training Required**: System learns incrementally from views
- **Non-Blocking**: View tracking doesn't slow down post retrieval
- **Memory Efficient**: Uses efficient data structures for similarity calculations
- **Persistent**: Interactions are saved to disk and loaded on startup

## 🚀 Future Enhancements

- Content-based filtering using post text/image features
- Hybrid recommendation combining viewing patterns and content
- User preference learning from time spent on posts
- Graph-based recommendations using user follow relationships
- A/B testing framework for recommendation algorithms
