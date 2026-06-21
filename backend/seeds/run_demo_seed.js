/**
 * run_demo_seed.js
 * Connects to PostgreSQL and runs the full demo seed.
 * Usage:  node seeds/run_demo_seed.js
 */
import "dotenv/config";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg   from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : false,
});

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT COUNT(*)::int AS count FROM products");
    const existing = rows[0].count;

    if (existing >= 50) {
      console.log(
        `⚠  Demo seed already applied (${existing} products found). Skipping.\n` +
        `   To re-seed, run:  node seeds/reset_and_reseed.js`
      );
      return;
    }

    console.log(`🌱  Running Shiv Furniture ERP demo seed (currently ${existing} products)…`);

    const sql = fs.readFileSync(
      path.resolve(__dirname, "seed_demo.sql"), "utf8"
    );

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    const tables = [
      "vendors","customers","work_centers","products",
      "boms","bom_components","bom_operations",
      "sales_orders","purchase_orders","manufacturing_orders",
      "work_orders","stock_ledger","audit_logs","notifications","payments"
    ];

    console.log("\n✅  Seed complete! Row counts:");
    console.log("─".repeat(42));
    for (const t of tables) {
      const { rows: r } = await client.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
      console.log(`  ${t.padEnd(28)} ${r[0].n}`);
    }
    console.log("─".repeat(42));
    console.log("\n🎉  ERP demo ready — restart the backend to serve the data!\n");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("\n❌  Seed failed:\n", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
