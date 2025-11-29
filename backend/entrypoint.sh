#!/bin/bash

# Exit on error
set -e

echo "Creating database tables..."
python create_db.py

echo "Starting server..."
exec "$@"
