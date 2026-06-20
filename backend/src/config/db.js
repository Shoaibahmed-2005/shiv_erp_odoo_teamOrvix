import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes("postgres:password@host") || databaseUrl.includes("YOUR_POSTGRES_PASSWORD")) {
  console.error("Missing real DATABASE_URL. Update backend/.env with your local PostgreSQL connection string before starting the backend.");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("supabase.co") ? { rejectUnauthorized: false } : false
});

export const query = (text, params = []) => pool.query(text, params);

export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function runSqlFile(relativePath) {
  const file = path.resolve(__dirname, "..", "..", relativePath);
  await pool.query(fs.readFileSync(file, "utf8"));
}

async function normalizeSeedPasswords() {
  const accounts = [
    ["admin@shivfurniture.com", "Admin@123"],
    ["sales@shivfurniture.com", "Sales@123"],
    ["purchase@shivfurniture.com", "Purchase@123"],
    ["manufacturing@shivfurniture.com", "Manufacturing@123"],
    ["inventory@shivfurniture.com", "Inventory@123"],
    ["owner@shivfurniture.com", "Owner@123"]
  ];
  for (const [email, password] of accounts) {
    const hash = await bcrypt.hash(password, 12);
    await query("UPDATE users SET password_hash = $1 WHERE email = $2", [hash, email]);
  }
}

export async function migrateAndSeed() {
  await runSqlFile("migrations/init.sql");
  const { rows } = await query("SELECT COUNT(*)::int AS count FROM products");
  if (rows[0].count === 0) {
    await runSqlFile("seeds/seed.sql");
  }
  await normalizeSeedPasswords();
}
