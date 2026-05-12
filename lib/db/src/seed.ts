/**
 * Seed runner — inserts default categories and other reference data.
 * Uses ON CONFLICT DO NOTHING so it is safe to run multiple times.
 *
 * Usage:
 *   pnpm --filter @workspace/db seed
 *   # or directly:
 *   DATABASE_URL=... tsx lib/db/src/seed.ts
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.join(__dirname, "../../../seed.sql");

if (!fs.existsSync(seedFile)) {
  console.error("❌ seed.sql not found at:", seedFile);
  process.exit(1);
}

const sql = fs.readFileSync(seedFile, "utf-8");

console.log("🌱 Running seed from:", seedFile);

const client = await pool.connect();
try {
  await client.query(sql);
  console.log("✅ Seed completed successfully");
} catch (err) {
  console.error("❌ Seed error:", err);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
