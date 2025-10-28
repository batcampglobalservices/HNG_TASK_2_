#!/bin/bash
# Startup script - runs migrations then starts the server

echo "🚀 Starting application..."

# Create cache directory if it doesn't exist
mkdir -p cache

# Run migrations
echo "📊 Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully"
  # Start the server
  echo "🌐 Starting server..."
  npm start
else
  echo "✗ Migrations failed"
  exit 1
fi
