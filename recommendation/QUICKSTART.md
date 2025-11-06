# Quick Start Guide

## Setup (5 minutes)

1. **Activate virtual environment**:

```bash
cd recommendation
source venv/bin/activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Configure database**:

```bash
# Copy .env.example to .env (if not exists)
cp .env.example .env

# Edit .env and set your DATABASE_URL
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

4. **Create models directory**:

```bash
mkdir -p models
```

## Run the API

**Development mode**:

```bash
python -m app.main
```

Or using uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the run script:

```bash
chmod +x run.sh
./run.sh
```

The API will start on `http://localhost:8000`

## How It Works

### 1. Track Views (Real-Time Learning)

Every time a user views a post, send the interaction:

```bash
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "post_id": "post456"
  }'
```

### 2. Get Recommendations

After users have viewed some posts, get recommendations:

```bash
curl "http://localhost:8000/api/v1/recommendations/user123?page=1&limit=10"
```

## View API Documentation

Once the server is running, visit:

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Integration with NestJS

See [INTEGRATION.md](./INTEGRATION.md) for detailed instructions.

**Quick Integration**:

1. In your NestJS `getSinglePost` handler, call the track-view endpoint
2. Add a recommendations endpoint that queries the recommendation API

Example:

```typescript
// When user views a post
@Get(':id')
async getSinglePost(@Param('id') id: string, @Req() req: any) {
  const post = await this.queryBus.execute(new GetSinglePostQuery(id));

  // Track view (non-blocking)
  if (req.user?.id) {
    this.recommendationService.trackView(
      req.user.id,
      id,
      post?.content
    );
  }

  return post;
}
```

## Testing

1. **Track a view**:

```bash
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user1", "post_id": "post1"}'
```

2. **Track more views** (to build similarity):

```bash
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user1", "post_id": "post2"}'
```

3. **Get recommendations**:

```bash
curl http://localhost:8000/api/v1/recommendations/user1?limit=5
```

## Troubleshooting

**Issue**: "No recommendations"

- **Solution**: Users need to view some posts first. Track a few views, then get recommendations.

**Issue**: "Database connection error"

- **Solution**: Check DATABASE_URL in .env file matches your database

**Issue**: Recommendations not improving

- **Solution**: The system needs more user interactions. More views = better recommendations.

## Key Points

- ✅ **No training required** - learns incrementally from views
- ✅ **Real-time updates** - model updates instantly
- ✅ **Simple integration** - just call track-view when user views a post
- ✅ **Automatic fallback** - returns popular posts if no viewing history
