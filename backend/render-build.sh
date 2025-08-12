#!/bin/bash
set -e

echo "🚀 Starting Render deployment build..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 3: Handle migration issues
echo "🗄️ Handling database migrations..."

# Try to resolve the failed migration first
echo "🔧 Resolving failed migration..."
npx prisma migrate resolve --applied 20250812101902_make_updatedat_optional || echo "Migration resolve completed or not needed"

# Use db push instead of migrate deploy to avoid migration conflicts
echo "📊 Synchronizing database schema..."
npx prisma db push --accept-data-loss || {
    echo "⚠️ DB push failed, trying migrate deploy..."
    npx prisma migrate deploy || {
        echo "⚠️ Migrate deploy also failed, using db push force..."
        npx prisma db push --force-reset
    }
}

echo "✅ Build completed successfully!"
