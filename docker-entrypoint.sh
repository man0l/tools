#!/bin/bash
set -e

# Wait for database to be ready (if using PostgreSQL)
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database..."
    while ! curl -s "$DATABASE_URL" >/dev/null; do
        sleep 1
    done
    echo "Database is ready!"
fi

# Run migrations
echo "Running database migrations..."
flask db upgrade

# Start Gunicorn
echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:5001 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    app:app
