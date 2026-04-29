#!/bin/bash
# PostgreSQL va DB ni avtomatik o'rnatish va sozlash skripti
# Har safar yangi muhitda bajariladi

set -e

# 1. PostgreSQL o'rnatilganligini tekshirish
if ! command -v psql &> /dev/null; then
    echo "[setup] PostgreSQL o'rnatilmoqda..."
    apt-get install -y postgresql postgresql-contrib 2>&1 | tail -3
fi

# 2. PostgreSQL ishga tushirish
service postgresql start 2>/dev/null || true
sleep 3

# 3. User va DB yaratish (agar yo'q bo'lsa)
su -s /bin/bash postgres -c "psql -c \"CREATE USER abz WITH PASSWORD 'abz123';\"" 2>/dev/null || true
su -s /bin/bash postgres -c "psql -c \"CREATE DATABASE abz_market OWNER abz;\"" 2>/dev/null || true
su -s /bin/bash postgres -c "psql abz_market -c \"GRANT ALL ON SCHEMA public TO abz; GRANT CREATE ON SCHEMA public TO abz;\"" 2>/dev/null || true

# 4. Schema migration
echo "[setup] Drizzle schema push (--force YO'Q, ma'lumotlar saqlanadi)..."
PNPM_BIN=$(which pnpm 2>/dev/null || echo "/usr/lib/node_modules/corepack/shims/pnpm")
cd /app/ABZ_MARKET && DATABASE_URL=postgresql://abz:abz123@localhost/abz_market "$PNPM_BIN" --filter @workspace/db push 2>&1 | tail -3

# 5. Jadvallar bo'shmi tekshirish (kategoriyalar soni bo'yicha)
CAT_COUNT=$(PGPASSWORD=abz123 psql -U abz -d abz_market -h 127.0.0.1 -t -c "SELECT COUNT(*) FROM categories WHERE parent_id IS NULL;" 2>/dev/null | tr -d ' ')
if [ -z "$CAT_COUNT" ] || [ "$CAT_COUNT" -lt "15" ]; then
    echo "[setup] Asosiy kategoriyalar yetarli emas ($CAT_COUNT) — seed kiritilmoqda..."
    PGPASSWORD=abz123 psql -U abz -d abz_market -h 127.0.0.1 -f /app/ABZ_MARKET/seed.sql 2>&1 | grep -E "INSERT|UPDATE|ERROR" | head -20
else
    echo "[setup] Kategoriyalar mavjud ($CAT_COUNT asosiy) — seed SKIP, barcha ma'lumotlar SAQLANADI"
fi

echo "[setup] PostgreSQL DB muvaffaqiyatli sozlandi!"
