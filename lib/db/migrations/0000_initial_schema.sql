-- ============================================================
-- ABZ Market — Initial schema migration
-- Creates all tables if they do not already exist
-- ============================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "telegram_id"  TEXT UNIQUE,
  "first_name"   TEXT NOT NULL,
  "last_name"    TEXT,
  "phone"        TEXT,
  "avatar"       TEXT,
  "created_at"   TIMESTAMP DEFAULT NOW(),
  "updated_at"   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"          TEXT NOT NULL,
  "icon"          TEXT,
  "image"         TEXT,
  "product_count" INTEGER DEFAULT 0,
  "parent_id"     UUID,
  "sort_order"    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "stores" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"              TEXT NOT NULL,
  "owner_telegram_id" TEXT,
  "logo"              TEXT,
  "cover_image"       TEXT,
  "description"       TEXT,
  "type"              TEXT NOT NULL DEFAULT 'partner',
  "rating"            NUMERIC(3,2) DEFAULT 0,
  "review_count"      INTEGER DEFAULT 0,
  "product_count"     INTEGER DEFAULT 0,
  "sales_count"       INTEGER DEFAULT 0,
  "delivery_rate"     NUMERIC(5,2),
  "location"          TEXT,
  "phone"             TEXT,
  "stir"              TEXT,
  "activity_type"     TEXT,
  "is_verified"       BOOLEAN DEFAULT false,
  "created_at"        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "products" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"             TEXT NOT NULL,
  "price"            NUMERIC(15,2) NOT NULL,
  "old_price"        NUMERIC(15,2),
  "description"      TEXT,
  "images"           TEXT[],
  "category_id"      UUID REFERENCES "categories"("id"),
  "store_id"         UUID NOT NULL REFERENCES "stores"("id"),
  "rating"           NUMERIC(3,2) DEFAULT 0,
  "review_count"     INTEGER DEFAULT 0,
  "colors"           TEXT[],
  "sizes"            TEXT[],
  "dimensions"       TEXT,
  "warranty"         TEXT,
  "delivery_days"    INTEGER DEFAULT 3,
  "is_top_selling"   BOOLEAN DEFAULT false,
  "is_featured"      BOOLEAN DEFAULT false,
  "discount"         INTEGER,
  "sales_count"      INTEGER DEFAULT 0,
  "quantity"         INTEGER DEFAULT 1,
  "status"           TEXT NOT NULL DEFAULT 'approved',
  "rejection_reason" TEXT,
  "created_at"       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number"    TEXT NOT NULL UNIQUE,
  "status"          TEXT NOT NULL DEFAULT 'new',
  "customer_name"   TEXT NOT NULL,
  "customer_phone"  TEXT NOT NULL,
  "address"         TEXT NOT NULL,
  "comment"         TEXT,
  "payment_method"  TEXT NOT NULL DEFAULT 'cash',
  "total_price"     NUMERIC(15,2) NOT NULL,
  "store_id"        UUID REFERENCES "stores"("id"),
  "telegram_id"     TEXT,
  "created_at"      TIMESTAMP DEFAULT NOW(),
  "cancel_reason"   TEXT,
  "return_reason"   TEXT,
  "delivered_at"    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"      UUID NOT NULL REFERENCES "orders"("id"),
  "product_id"    UUID NOT NULL REFERENCES "products"("id"),
  "product_name"  TEXT NOT NULL,
  "product_image" TEXT,
  "quantity"      INTEGER NOT NULL DEFAULT 1,
  "price"         NUMERIC(15,2) NOT NULL,
  "color"         TEXT
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"      UUID NOT NULL REFERENCES "orders"("id"),
  "product_id"    UUID NOT NULL REFERENCES "products"("id"),
  "store_id"      UUID REFERENCES "stores"("id"),
  "telegram_id"   TEXT,
  "customer_name" TEXT NOT NULL,
  "rating"        INTEGER NOT NULL,
  "comment"       TEXT,
  "images"        TEXT[],
  "created_at"    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "banners" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"       TEXT NOT NULL,
  "subtitle"    TEXT,
  "badge"       TEXT,
  "image"       TEXT,
  "gradient"    TEXT DEFAULT 'from-violet-600 via-purple-600 to-fuchsia-500',
  "link"        TEXT DEFAULT '/catalog',
  "category_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "store_id"    UUID REFERENCES "stores"("id") ON DELETE SET NULL,
  "product_id"  UUID REFERENCES "products"("id") ON DELETE SET NULL,
  "is_active"   BOOLEAN DEFAULT true,
  "sort_order"  INTEGER DEFAULT 0,
  "created_at"  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "flash_sales" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"       TEXT NOT NULL,
  "ends_at"     TIMESTAMP NOT NULL,
  "is_active"   BOOLEAN DEFAULT true,
  "product_ids" TEXT[] DEFAULT '{}',
  "created_at"  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "addresses" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "telegram_id" TEXT NOT NULL,
  "label"       TEXT NOT NULL DEFAULT 'Uy',
  "address"     TEXT NOT NULL,
  "city"        TEXT,
  "region"      TEXT,
  "is_default"  BOOLEAN DEFAULT false,
  "created_at"  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "telegram_id" TEXT,
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "is_read"     BOOLEAN DEFAULT false,
  "meta"        TEXT,
  "created_at"  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "pickup_points" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"          TEXT NOT NULL,
  "address"       TEXT NOT NULL,
  "city"          TEXT NOT NULL,
  "phone"         TEXT,
  "working_hours" TEXT,
  "is_active"     BOOLEAN DEFAULT true,
  "created_at"    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "delivery_zones" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "region"     TEXT NOT NULL,
  "district"   TEXT,
  "price"      INTEGER NOT NULL DEFAULT 0,
  "is_active"  BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW()
);
