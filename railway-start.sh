#!/bin/bash

echo "=== ABZ Market Railway Startup ==="
echo "PORT: ${PORT:-8080}"

# 1. DB jadvallar mavjudmi?
echo "[1/3] DB jadvallar tekshirilmoqda..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
  2>/dev/null | tr -d ' \n' || echo "0")

echo "Mavjud jadvallar: $TABLE_COUNT ta"

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
    echo "Jadvallar yo'q — schema yaratilmoqda..."
    cd /app/lib/db
    DATABASE_URL="$DATABASE_URL" /usr/local/bin/pnpm run push 2>&1 || echo "Schema push xato (davom etamiz)"
    echo "Schema bosqichi tugadi"
    cd /app
else
    echo "Jadvallar mavjud — schema o'ZGARTIRILMAYDI"
fi

# 2. Seed — DOIM ishga tushadi (xatolar e'tiborsiz)
echo "[2/3] Seed ma'lumotlari kiritilmoqda..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=0 -f /app/seed.sql 2>&1 | tail -15 || echo "Seed xatolar bilan tugadi (davom etamiz)"

CAT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | tr -d ' \n' || echo "0")
echo "Kategoriyalar DB da: $CAT_COUNT ta"

# 3. Server
echo "[3/3] Server ishga tushmoqda (PORT: ${PORT:-8080})..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
