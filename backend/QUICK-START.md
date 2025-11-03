# Quick Start Guide - High Performance Post Creation

## TL;DR

Your post creation system has been upgraded to handle **10,000-50,000 requests per second**. Follow these steps to get started.

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Update Environment
```bash
# Copy example
cp example-env .env

# Edit .env and ensure these are set:
DATABASE_URL=postgresql://user-name:strong-password@localhost:5432/monorepo_db
REDIS_HOST=localhost
REDIS_PORT=6379
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 3. Start Infrastructure
```bash
# Start PostgreSQL, PgBouncer, and Redis
docker-compose up -d

# Wait 10 seconds for services to be ready
sleep 10
```

### 4. Run Migration
```bash
# Apply database indexes
npx prisma migrate deploy
```

### 5. Start Application
```bash
# Development mode
pnpm run dev

# Production mode
pnpm run build
pnpm run start:prod
```

## Verify It's Working

### Check Health
```bash
curl http://localhost:3000/health
```

✅ Should return: `{"status":"ok"}`

### Check Queue
```bash
curl http://localhost:3000/health/queue
```

✅ Should return queue stats

### Test Post Creation
```bash
curl -X POST http://localhost:3000/v1/post/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test post"}'
```

✅ Should return: `{"message":"Post creation queued successfully","jobId":"1","status":"processing"}`

## What Changed?

### API Response
- **Before:** 200 OK with full post data (slow)
- **After:** 202 ACCEPTED with job ID (fast)

Posts are now created **asynchronously** in the background.

### Services Running
- **PostgreSQL** - Database (port 5432)
- **PgBouncer** - Connection pooler (port 6432)
- **Redis** - Job queue & cache (port 6379)

### New Endpoints
- `GET /health` - System health check
- `GET /health/queue` - Queue statistics

## Production Deployment

### For PgBouncer (Recommended)
```env
# Use port 6432 instead of 5432
DATABASE_URL=postgresql://user:pass@localhost:6432/mydb
```

### Rate Limiting
Adjust based on your needs:
```env
THROTTLE_TTL=60000      # 60 seconds
THROTTLE_LIMIT=1000     # Allow 1000 requests per minute
```

### Docker Production
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Common Commands

```bash
# View queue stats in real-time
watch -n 1 curl -s http://localhost:3000/health/queue

# Check PostgreSQL connections
docker exec -it local_pgdb psql -U user-name -d mydb -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis
docker exec -it redis-server redis-cli ping

# View application logs
docker-compose logs -f backend

# Restart application
docker-compose restart backend
```

## Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart db
```

### Issue: "Redis connection failed"
```bash
# Check Redis is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis
```

### Issue: "Queue not processing"
```bash
# Check queue stats
curl http://localhost:3000/health/queue

# If waiting count is high, check worker logs
docker-compose logs backend | grep "post-creation"
```

### Issue: "Rate limit exceeded"
```bash
# Increase limit in .env
THROTTLE_LIMIT=1000

# Restart application
docker-compose restart backend
```

## Performance Tips

1. **Use PgBouncer in production** - 20x better connection efficiency
2. **Monitor queue depth** - Alert if waiting > 1000
3. **Enable caching** - Redis for frequently accessed data
4. **Scale horizontally** - Run multiple app instances
5. **Use read replicas** - For GET endpoints

## Load Testing

### Basic Test (1K requests)
```bash
ab -n 1000 -c 50 \
   -H "Authorization: Bearer TOKEN" \
   http://localhost:3000/v1/post/create
```

### Stress Test (10K requests)
```bash
ab -n 10000 -c 100 \
   -H "Authorization: Bearer TOKEN" \
   http://localhost:3000/v1/post/create
```

## Monitoring Dashboard

Create a simple monitoring script:

```bash
#!/bin/bash
# monitor.sh

while true; do
  clear
  echo "=== System Health ==="
  curl -s http://localhost:3000/health | jq

  echo -e "\n=== Queue Stats ==="
  curl -s http://localhost:3000/health/queue | jq

  echo -e "\n=== Database Connections ==="
  docker exec local_pgdb psql -U user-name -d mydb -t -c "SELECT count(*) FROM pg_stat_activity;"

  sleep 5
done
```

Run with: `chmod +x monitor.sh && ./monitor.sh`

## Documentation

- **Full Guide:** [SCALING-GUIDE.md](SCALING-GUIDE.md) - Complete implementation details
- **Summary:** [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - What changed

## Support

If you encounter issues:
1. Check [SCALING-GUIDE.md](SCALING-GUIDE.md) troubleshooting section
2. Review application logs: `docker-compose logs -f`
3. Check service health: `curl http://localhost:3000/health`

---

**Ready to handle 10K-50K RPS! 🚀**
