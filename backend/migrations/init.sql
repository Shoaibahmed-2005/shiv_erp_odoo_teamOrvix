CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'pending' CHECK (role IN ('pending','admin','sales_user','purchase_user','manufacturing_user','inventory_manager','business_owner')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(30) NOT NULL,
  module VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role, module)
);

CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(255), phone VARCHAR(20), address TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS vendors (id SERIAL PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(255), phone VARCHAR(20), address TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS work_centers (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  sales_price DECIMAL(10,2) DEFAULT 0,
  cost_price DECIMAL(10,2) DEFAULT 0,
  uom VARCHAR(30) DEFAULT 'unit',
  on_hand_qty INTEGER DEFAULT 0,
  reserved_qty INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  procurement_strategy VARCHAR(10) DEFAULT 'mts' CHECK (procurement_strategy IN ('mts','mto')),
  procure_on_demand BOOLEAN DEFAULT false,
  procurement_type VARCHAR(20) CHECK (procurement_type IN ('purchase','manufacturing')),
  default_vendor_id INTEGER REFERENCES vendors(id),
  default_bom_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boms (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW());
DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT fk_default_bom FOREIGN KEY (default_bom_id) REFERENCES boms(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS bom_components (id SERIAL PRIMARY KEY, bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE, component_product_id INTEGER REFERENCES products(id), quantity DECIMAL(10,2) NOT NULL);
CREATE TABLE IF NOT EXISTS bom_operations (id SERIAL PRIMARY KEY, bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, duration_minutes INTEGER NOT NULL, work_center_id INTEGER REFERENCES work_centers(id), sequence INTEGER DEFAULT 0);

CREATE TABLE IF NOT EXISTS sales_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  sales_user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','confirmed','partially_delivered','fully_delivered','cancelled')),
  payment_required BOOLEAN DEFAULT false,
  payment_status VARCHAR(20) DEFAULT 'not_applicable' CHECK (payment_status IN ('not_applicable','pending','paid','failed','cancelled')),
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_total DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sales_order_items (id SERIAL PRIMARY KEY, sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), quantity INTEGER NOT NULL, unit_price DECIMAL(10,2) NOT NULL, delivered_qty INTEGER DEFAULT 0, line_total DECIMAL(12,2) NOT NULL);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  vendor_id INTEGER REFERENCES vendors(id),
  purchase_user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','confirmed','partially_received','fully_received','cancelled')),
  total DECIMAL(12,2) DEFAULT 0,
  auto_generated BOOLEAN DEFAULT false,
  triggered_by_sales_order_id INTEGER REFERENCES sales_orders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS purchase_order_items (id SERIAL PRIMARY KEY, purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), quantity INTEGER NOT NULL, unit_price DECIMAL(10,2) NOT NULL, received_qty INTEGER DEFAULT 0, line_total DECIMAL(12,2) NOT NULL);

CREATE TABLE IF NOT EXISTS manufacturing_orders (
  id SERIAL PRIMARY KEY,
  mo_number VARCHAR(30) UNIQUE NOT NULL,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  bom_id INTEGER REFERENCES boms(id),
  assignee_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','in_progress','quality_check','completed','cancelled')),
  auto_generated BOOLEAN DEFAULT false,
  triggered_by_sales_order_id INTEGER REFERENCES sales_orders(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS work_orders (id SERIAL PRIMARY KEY, manufacturing_order_id INTEGER REFERENCES manufacturing_orders(id) ON DELETE CASCADE, operation_name VARCHAR(100) NOT NULL, work_center_id INTEGER REFERENCES work_centers(id), duration_minutes INTEGER, sequence INTEGER DEFAULT 0, status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')));

CREATE TABLE IF NOT EXISTS stock_ledger (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id), change_qty INTEGER NOT NULL, reason VARCHAR(200), reference_type VARCHAR(30) CHECK (reference_type IN ('sales_order','purchase_order','manufacturing_order','manual_adjustment')), reference_id INTEGER, balance_after INTEGER NOT NULL, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS audit_logs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), action VARCHAR(150) NOT NULL, entity VARCHAR(100) NOT NULL, entity_id INTEGER, old_value JSONB, new_value JSONB, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), role VARCHAR(30), title VARCHAR(200) NOT NULL, message TEXT NOT NULL, type VARCHAR(30) CHECK (type IN ('low_stock','shortage_trigger','order_status','delay','payment','system')), is_read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, sales_order_id INTEGER REFERENCES sales_orders(id), gateway VARCHAR(20) DEFAULT 'razorpay', gateway_order_id VARCHAR(150), gateway_payment_id VARCHAR(150), amount DECIMAL(12,2) NOT NULL, status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created','success','failed','cancelled')), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_status ON manufacturing_orders(status);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_sales_order ON payments(sales_order_id);
