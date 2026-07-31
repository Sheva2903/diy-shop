#!/bin/bash
set -e

cd "$(dirname "$0")"

BACKEND_LOG=backend.log
backend_pid=""

# Ctrl+C in the foreground frontend has to take the backend down with it,
# otherwise port 8081 stays occupied and the next run fails.
cleanup() {
  if [ -n "$backend_pid" ] && kill -0 "$backend_pid" 2>/dev/null; then
    echo ""
    echo "🛑 Stopping backend..."
    kill "$backend_pid" 2>/dev/null || true
    wait "$backend_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "🚀 Starting DIY Shop Local Dev..."

# 1. Java 17 — the build targets 17 and a newer default JDK is common on macOS.
if [ -x /usr/libexec/java_home ]; then
  JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null)" || {
    echo "❌ Java 17 not found. Install it (e.g. brew install --cask zulu@17)."
    exit 1
  }
  export JAVA_HOME
fi
echo "☕ Java: $("${JAVA_HOME:-/usr}/bin/java" -version 2>&1 | head -1)"

# 2. PostgreSQL
echo "📦 Starting PostgreSQL..."
docker compose up -d postgres

echo -n "   waiting for the database"
until docker compose exec -T postgres pg_isready -U diyshop >/dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo " ready"

# 3. Seller credentials (seller / seller123), written to the git-ignored .seller-dev.env
echo "🔑 Generating seller credentials..."
npm --prefix frontend run generate:seller >/dev/null 2>&1
source .seller-dev.env
echo "✅ Seller credentials loaded"

# 4. Frontend dependencies
if [ ! -d frontend/node_modules ]; then
  echo "📥 Installing frontend dependencies..."
  npm --prefix frontend install
fi

# 5. Backend, in the background so the frontend can hold the terminal
echo "🔥 Starting Spring Boot backend @ localhost:8081 (logging to $BACKEND_LOG)..."
./mvnw spring-boot:run >"$BACKEND_LOG" 2>&1 &
backend_pid=$!

echo -n "   waiting for the API"
until curl -sf -o /dev/null http://localhost:8081/api/settings; do
  if ! kill -0 "$backend_pid" 2>/dev/null; then
    echo ""
    echo "❌ Backend failed to start. Last lines of $BACKEND_LOG:"
    tail -30 "$BACKEND_LOG"
    exit 1
  fi
  echo -n "."
  sleep 2
done
echo " ready"

echo ""
echo "✅ Backend   http://localhost:8081"
echo "✅ Frontend  http://localhost:5173"
echo "   Seller login: seller / seller123"
echo "   Ctrl+C stops both."
echo ""

# 6. Frontend in the foreground
npm --prefix frontend run dev
