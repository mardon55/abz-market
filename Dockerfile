FROM node:20-slim

# PostgreSQL client
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# pnpm o'rnatish
RUN npm install -g pnpm@9

WORKDIR /app

# Barcha loyiha fayllarini ko'chirish
COPY . .

# Dependencylarni o'rnatish
RUN pnpm install --no-frozen-lockfile

# Backend build
RUN cd artifacts/api-server && pnpm run build

# User frontend build
RUN cd artifacts/abz-market && pnpm run build

# Admin frontend build
RUN cd artifacts/admin && pnpm run build

RUN chmod +x /app/railway-start.sh

ENV NODE_ENV=production

EXPOSE 8080

CMD ["/bin/bash", "/app/railway-start.sh"]
