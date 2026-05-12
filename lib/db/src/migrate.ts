/**
 * Drizzle migration runner.
 * Runs all pending SQL migrations from the ./migrations folder.
 *
 * Usage:
 *   pnpm --filter @workspace/db migrate
 *   # or directly:
 *   DATABASE_URL=... tsx lib/db/src/migrate.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../migrations");

console.log("Running migrations from:", migrationsFolder);

await migrate(db, { migrationsFolder });

console.log("✅ Migrations completed successfully");

await pool.end();
