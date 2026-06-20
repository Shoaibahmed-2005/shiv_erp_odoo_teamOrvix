const pg = require('pg');
const pool = new pg.Pool({connectionString: 'postgresql://postgres:ShoaibAhmed@localhost:5432/shiv_erp_db'});
pool.query("UPDATE users SET role='admin' WHERE id=1").then(() => console.log('Fixed')).finally(() => process.exit(0));
