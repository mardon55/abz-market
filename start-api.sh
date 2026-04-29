#!/bin/bash
set -e

# Port 8002 band bo'lsa, tozalash
fuser -k 8002/tcp 2>/dev/null || true
sleep 1

# PostgreSQL va DB ni avtomatik sozlash
bash /app/ABZ_MARKET/setup-db.sh

# Environment variables
set -a
source /app/ABZ_MARKET/artifacts/api-server/.env
set +a

# API serverini ishga tushirish
echo "API server ishga tushmoqda..."
cd /app/ABZ_MARKET/artifacts/api-server
exec node --enable-source-maps ./dist/index.mjs
