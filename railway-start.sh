#!/bin/bash

echo "=== ABZ Market Railway Startup ==="
echo "PORT: ${PORT:-8080}"

# 1. Migration — DOIM ishga tushadi (yangi jadvallar va o'zgarishlarni qo'shadi)
echo "[1/3] DB migration ishga tushmoqda..."
cd /app/lib/db
DATABASE_URL="$DATABASE_URL" /usr/local/bin/pnpm run migrate 2>&1 || {
  echo "Migration xato — push bilan urinib ko'rilmoqda..."
  DATABASE_URL="$DATABASE_URL" /usr/local/bin/pnpm run push-force 2>&1 || echo "Push ham xato (davom etamiz)"
}
echo "Migration bosqichi tugadi"
cd /app

# 2. Seed — DOIM ishga tushadi (ON CONFLICT DO NOTHING — xavfsiz)
echo "[2/3] Seed ma'lumotlari kiritilmoqda..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=0 -f /app/seed.sql 2>&1 | tail -15 || echo "Seed xatolar bilan tugadi (davom etamiz)"

CAT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | tr -d ' \n' || echo "0")
echo "Kategoriyalar DB da: $CAT_COUNT ta"

# 3. Server
echo "[3/3] Server ishga tushmoqda (PORT: ${PORT:-8080})..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
