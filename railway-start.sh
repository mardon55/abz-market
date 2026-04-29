#!/bin/bash
set -e

echo "=== ABZ Market Railway Startup ==="
echo "PORT: ${PORT:-8080}"

# 1. DB jadvallar mavjudmi? (HECH QACHON --force ishlatilmaydi)
echo "[1/3] DB jadvallar tekshirilmoqda..."
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
  2>/dev/null | tr -d ' \n' || echo "0")

echo "Mavjud jadvallar: $TABLE_COUNT ta"

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
    echo "Jadvallar yo'q — xavfsiz schema yaratilmoqda (push, --force YO'Q)..."
    cd /app/lib/db
    DATABASE_URL="$DATABASE_URL" /usr/local/bin/pnpm run push 2>&1
    echo "Schema yaratildi"
else
    echo "Jadvallar mavjud — schema o'ZGARTIRILMAYDI, ma'lumotlar SAQLANADI"
fi

# 2. Kategoriyalar bo'shmi? (faqat shu holda seed)
echo "[2/3] Kategoriyalar tekshirilmoqda..."
CAT_COUNT=$(psql "$DATABASE_URL" -t -c \
  "SELECT COUNT(*) FROM categories;" \
  2>/dev/null | tr -d ' \n' || echo "0")

echo "Kategoriyalar: $CAT_COUNT ta"

if [ -z "$CAT_COUNT" ] || [ "$CAT_COUNT" = "0" ]; then
    echo "Kategoriyalar yo'q — seed ma'lumotlari kiritilmoqda..."
    psql "$DATABASE_URL" -f /app/seed.sql 2>&1 | tail -5
    echo "Seed tugadi"
else
    echo "Kategoriyalar mavjud ($CAT_COUNT) — seed O'TKAZIB YUBORILDI"
fi

# 3. Server
echo "[3/3] Server ishga tushmoqda (PORT: ${PORT:-8080})..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
