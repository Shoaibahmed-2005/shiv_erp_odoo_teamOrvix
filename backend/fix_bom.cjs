const pg = require('pg');
const pool = new pg.Pool({connectionString: 'postgresql://postgres:ShoaibAhmed@localhost:5432/shiv_erp_db'});

async function fix() {
  // Check what BoMs exist
  const boms = await pool.query('SELECT b.id, b.product_id, p.name FROM boms b LEFT JOIN products p ON p.id=b.product_id ORDER BY b.id');
  console.log('Existing BoMs:');
  console.table(boms.rows);

  // Check Dining Table's current state
  const dt = await pool.query("SELECT id, name, default_bom_id, procurement_type FROM products WHERE name LIKE '%Dining%'");
  console.log('Dining Table:');
  console.table(dt.rows);

  if (boms.rows.length > 0) {
    // Find BoM for Dining Table (product_id=1) or use the first BoM
    const bomForDining = boms.rows.find(b => b.product_id === 1) || boms.rows[0];
    const r = await pool.query(
      "UPDATE products SET default_bom_id=$1 WHERE name LIKE '%Dining%' RETURNING id, name, default_bom_id",
      [bomForDining.id]
    );
    console.log('Fixed! Linked BoM #' + bomForDining.id + ' to:', r.rows[0]);
  } else {
    console.log('No BoMs found — creating one...');
    const diningId = dt.rows[0]?.id;
    if (diningId) {
      const newBom = await pool.query('INSERT INTO boms (product_id) VALUES ($1) RETURNING id', [diningId]);
      await pool.query('UPDATE products SET default_bom_id=$1 WHERE id=$2', [newBom.rows[0].id, diningId]);
      // Add components
      const legs = await pool.query("SELECT id FROM products WHERE name LIKE '%Leg%' LIMIT 1");
      const top = await pool.query("SELECT id FROM products WHERE name LIKE '%Top%' LIMIT 1");
      const screws = await pool.query("SELECT id FROM products WHERE name LIKE '%Screw%' LIMIT 1");
      if (legs.rows[0]) await pool.query('INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES ($1,$2,4)', [newBom.rows[0].id, legs.rows[0].id]);
      if (top.rows[0]) await pool.query('INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES ($1,$2,1)', [newBom.rows[0].id, top.rows[0].id]);
      if (screws.rows[0]) await pool.query('INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES ($1,$2,12)', [newBom.rows[0].id, screws.rows[0].id]);
      console.log('Created new BoM #' + newBom.rows[0].id + ' with components');
    }
  }
  process.exit(0);
}
fix().catch(e => { console.error(e); process.exit(1); });
