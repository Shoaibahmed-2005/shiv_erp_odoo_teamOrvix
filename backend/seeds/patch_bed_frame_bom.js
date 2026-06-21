/**
 * patch_bed_frame_bom.js
 * Adds a BOM for "Bed Frame Queen" and "Bed Frame King",
 * sets procure_on_demand=true and procurement_type='manufacturing'
 * on all finished-goods products that have manufacturing type.
 *
 * Run: node seeds/patch_bed_frame_bom.js
 */
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.co") ? { rejectUnauthorized: false } : false,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── 1. Fix all finished-goods products that should procure on demand ──
    await client.query(`
      UPDATE products
      SET procure_on_demand = true
      WHERE category = 'Finished Goods'
        AND procurement_type = 'manufacturing'
        AND procure_on_demand = false
    `);
    console.log("✅  Set procure_on_demand=true for all manufacturing finished goods");

    // ── 2. Resolve IDs we need ──
    const resolveId = async (table, col, val) => {
      const { rows } = await client.query(`SELECT id FROM ${table} WHERE ${col}=$1 LIMIT 1`, [val]);
      return rows[0]?.id ?? null;
    };

    const p_bedQueen  = await resolveId("products",     "name", "Bed Frame Queen");
    const p_bedKing   = await resolveId("products",     "name", "Bed Frame King");
    const p_coffeeT   = await resolveId("products",     "name", "Coffee Table");
    const p_tvCab     = await resolveId("products",     "name", "TV Cabinet");
    const p_dressingT = await resolveId("products",     "name", "Dressing Table");

    const c_ply12  = await resolveId("products", "name", "Plywood Sheet 12mm");
    const c_ply6   = await resolveId("products", "name", "Plywood Sheet 6mm");
    const c_legs   = await resolveId("products", "name", "Wooden Legs");
    const c_screws = await resolveId("products", "name", "Screws Pack");
    const c_lam    = await resolveId("products", "name", "Laminate Sheet");
    const c_hinges = await resolveId("products", "name", "Hinges pair");
    const c_slides = await resolveId("products", "name", "Drawer Slides pair");
    const c_handle = await resolveId("products", "name", "Door Handle");
    const c_mirror = await resolveId("products", "name", "Mirror 12x18 inch");
    const c_varnish= await resolveId("products", "name", "Varnish 1L");
    const c_top    = await resolveId("products", "name", "Wooden Top");
    const c_edge   = await resolveId("products", "name", "Edgeband Tape 25mtr");

    const wc_assem = await resolveId("work_centers", "name", "Assembly Line");
    const wc_cut   = await resolveId("work_centers", "name", "Cutting Station");
    const wc_pack  = await resolveId("work_centers", "name", "Packaging Unit");
    const wc_paint = await resolveId("work_centers", "name", "Paint Floor");
    const wc_polish= await resolveId("work_centers", "name", "Polish & Finish");
    const wc_qc    = await resolveId("work_centers", "name", "Quality Check");

    // Helper: create BOM if not exists
    async function createBom(productId, productName, components, operations) {
      const existing = (await client.query("SELECT id FROM boms WHERE product_id=$1 LIMIT 1", [productId])).rows[0];
      if (existing) {
        console.log(`  ⏭  BOM already exists for ${productName} (id=${existing.id})`);
        return existing.id;
      }
      const { rows: [bom] } = await client.query("INSERT INTO boms (product_id) VALUES ($1) RETURNING id", [productId]);
      for (const [compId, qty] of components) {
        if (!compId) continue;
        await client.query("INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES ($1,$2,$3)", [bom.id, compId, qty]);
      }
      for (const [name, mins, wcId, seq] of operations) {
        if (!wcId) continue;
        await client.query("INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES ($1,$2,$3,$4,$5)", [bom.id, name, mins, wcId, seq]);
      }
      await client.query("UPDATE products SET default_bom_id=$1, procure_on_demand=true, procurement_type='manufacturing' WHERE id=$2", [bom.id, productId]);
      console.log(`  ✅  BOM created for ${productName} (bom_id=${bom.id})`);
      return bom.id;
    }

    // ── 3. BOM: Bed Frame Queen ──
    if (p_bedQueen) {
      await createBom(p_bedQueen, "Bed Frame Queen", [
        [c_ply12, 4], [c_legs, 4], [c_screws, 2],
        [c_lam, 2], [c_varnish, 1],
      ], [
        ["Cutting",   60, wc_cut,   1],
        ["Assembly",  90, wc_assem, 2],
        ["Finishing", 30, wc_polish,3],
        ["QC",        20, wc_qc,    4],
        ["Packing",   25, wc_pack,  5],
      ]);
    }

    // ── 4. BOM: Bed Frame King ──
    if (p_bedKing) {
      await createBom(p_bedKing, "Bed Frame King", [
        [c_ply12, 5], [c_legs, 4], [c_screws, 3],
        [c_lam, 3], [c_varnish, 1],
      ], [
        ["Cutting",   75, wc_cut,   1],
        ["Assembly", 100, wc_assem, 2],
        ["Finishing", 35, wc_polish,3],
        ["QC",        20, wc_qc,    4],
        ["Packing",   30, wc_pack,  5],
      ]);
    }

    // ── 5. BOM: Coffee Table ──
    if (p_coffeeT) {
      await createBom(p_coffeeT, "Coffee Table", [
        [c_top, 1], [c_legs, 4], [c_screws, 1], [c_varnish, 1],
      ], [
        ["Assembly",  40, wc_assem, 1],
        ["Finishing", 20, wc_polish,2],
        ["Packing",   15, wc_pack,  3],
      ]);
    }

    // ── 6. BOM: TV Cabinet ──
    if (p_tvCab) {
      await createBom(p_tvCab, "TV Cabinet", [
        [c_ply12, 3], [c_hinges, 2], [c_handle, 2],
        [c_slides, 1], [c_lam, 2], [c_screws, 1],
      ], [
        ["Cutting",          50, wc_cut,   1],
        ["Assembly",         60, wc_assem, 2],
        ["Hardware Fitting", 30, wc_assem, 3],
        ["Finishing",        20, wc_polish,4],
        ["Packing",          15, wc_pack,  5],
      ]);
    }

    // ── 7. BOM: Dressing Table ──
    if (p_dressingT) {
      await createBom(p_dressingT, "Dressing Table", [
        [c_ply12, 2], [c_mirror, 1], [c_hinges, 2],
        [c_handle, 1], [c_lam, 2], [c_screws, 1],
      ], [
        ["Cutting",    45, wc_cut,   1],
        ["Assembly",   55, wc_assem, 2],
        ["Mirror Fit", 20, wc_assem, 3],
        ["Finishing",  20, wc_polish,4],
        ["Packing",    15, wc_pack,  5],
      ]);
    }

    await client.query("COMMIT");
    console.log("\n🎉  Patch complete! BOMs added and procure_on_demand fixed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌  Patch failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
