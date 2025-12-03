#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Blog App Backend..."

# MySQL connection parameters from environment
DB_HOST="${DB_HOST:-blogapp_mysql}"
DB_PORT="${DB_PORT:-3306}"
MAX_RETRIES=30
RETRY_COUNT=0
WAIT_TIME=2

echo "📊 Waiting for MySQL to be ready..."
echo "   Host: $DB_HOST:$DB_PORT"

# Function to test MySQL connection
test_mysql_connection() {
    python3 << 'EOF'
import sys
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test_connection():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set")
        sys.exit(1)
    
    try:
        engine = create_async_engine(database_url, echo=False)
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        print("✅ MySQL connection successful")
        sys.exit(0)
    except Exception as e:
        print(f"⚠️  MySQL not ready: {str(e)}")
        sys.exit(1)

# Import text for SQL execution
from sqlalchemy import text
asyncio.run(test_connection())
EOF
}

# Retry loop with exponential backoff
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if test_mysql_connection; then
        echo "✅ MySQL is ready!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo "❌ Failed to connect to MySQL after $MAX_RETRIES attempts"
            echo "   Please check:"
            echo "   1. MySQL container is running"
            echo "   2. DATABASE_URL is correct"
            echo "   3. MySQL user has proper permissions"
            exit 1
        fi
        
        echo "⏳ Attempt $RETRY_COUNT/$MAX_RETRIES - Retrying in ${WAIT_TIME}s..."
        sleep $WAIT_TIME
        
        # Exponential backoff (max 10 seconds)
        WAIT_TIME=$((WAIT_TIME < 10 ? WAIT_TIME + 1 : 10))
    fi
done

echo "📦 Creating database tables..."
python create_db.py

echo "🎉 Database initialization complete!"
echo "🚀 Starting application server..."
exec "$@"
