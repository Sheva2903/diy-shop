#!/bin/bash
set -e

echo "🚀 Starting DIY Shop Local Dev..."

# 1. Start Docker containers
echo "📦 Starting PostgreSQL..."
docker-compose up -d
sleep 15

# 2. Seed data
echo "🌱 Seeding mock data..."
psql -U diyshop -d diyshop -h localhost -f seed-data.sql 2>/dev/null || echo "⚠️ Seed data load skipped"

# 3. Generate seller credentials
echo "🔑 Generating seller credentials..."
cd frontend
npm run generate:seller > /dev/null 2>&1
cd ..

# 4. Load env vars
if [ -f .seller-dev.env ]; then
  source .seller-dev.env
  echo "✅ Seller credentials loaded"
fi

# 5. Set bank transfer env vars
export BANK_TRANSFER_BANK_NAME='Vietcombank'
export BANK_TRANSFER_BANK_CODE='vietcombank'
export BANK_TRANSFER_BANK_BIN='970436'
export BANK_TRANSFER_ACCOUNT_NUMBER='0123456789'
export BANK_TRANSFER_ACCOUNT_NAME='DIY SHOP'

echo "✅ Environment configured"
echo ""
echo "🔥 Starting Spring Boot backend @ localhost:8081..."
echo "   Frontend will run @ localhost:5173 (npm run dev)"
echo ""

./mvnw clean spring-boot:run
