#!/bin/bash
set -e

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
