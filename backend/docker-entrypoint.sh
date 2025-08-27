#!/bin/sh
set -e

# Wait for database to be available (important for Docker Compose)
if [ -n "$DATABASE_HOST" ] && [ -n "$DATABASE_PORT" ]; then
  echo "Waiting for database to be ready..."
  while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
    sleep 1
  done
  echo "Database is ready!"
fi

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec "$@"