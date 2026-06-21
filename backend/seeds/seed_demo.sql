-- =============================================================
-- Shiv Furniture ERP — Full Demo Seed  (seed_demo.sql)
-- 300+ rows across all pages. IDs resolved by name (safe).
-- Run via:  node seeds/run_demo_seed.js
-- =============================================================

-- ─────────────────────────────────────────────
-- 1. VENDORS (adds up to 30 total)
-- ─────────────────────────────────────────────
INSERT INTO vendors (name, email, phone, address) VALUES
('Timber Traders',        'timber@example.com',     '9000000001', 'Plot 12, Industrial Area, Pune')    ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Hardware Hub',          'hardware@example.com',    '9000000002', 'Market Road, Nashik')               ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Foam & Fabric Co',      'foam@example.com',        '9000000003', 'Warehouse Lane, Surat')             ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Steel Craft Supplies',  'steel@example.com',       '9000000004', 'MIDC Phase 2, Mumbai')              ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('WoodMart India',        'woodmart@example.com',    '9000000005', 'Timber Yard, Nagpur')               ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Sunrise Metals',        'sunrisem@example.com',    '9000000006', 'Ring Road, Ahmedabad')              ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Royal Upholstery',      'royalup@example.com',     '9000000007', 'Textile Hub, Surat')                ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Greenwood Sawmill',     'greenwood@example.com',   '9000000008', 'Forest Road, Belgaum')              ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('National Ply Depot',    'natply@example.com',      '9000000009', 'Old Market, Hyderabad')             ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Lakshmi Hardware',      'lakshmi@example.com',     '9000000010', 'Station Road, Coimbatore')          ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('AluFab Industries',     'alufab@example.com',      '9000000011', 'SEZ Zone, Chennai')                 ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Krishna Timber Mart',   'krishna@example.com',     '9000000012', 'NH-48, Mysore')                     ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Shree Veneers Pvt Ltd', 'shreev@example.com',      '9000000013', 'Andheri East, Mumbai')              ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Prakash Glass Works',   'prakash@example.com',     '9000000014', 'Glass Colony, Firozabad')           ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Bharat Screw Works',    'bscrews@example.com',     '9000000015', 'GIDC Estate, Vadodara')             ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Mehta Finishing Store', 'mftstore@example.com',    '9000000016', 'Laxmi Nagar, Delhi')                ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Cosmos Laminates',      'cosmos@example.com',      '9000000017', 'Kasba, Kolkata')                    ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Fine Foam Factory',     'finefm@example.com',      '9000000018', 'Sector 15, Gurgaon')                ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Swift Logistics',       'swift@example.com',       '9000000019', 'Cargo Hub, Pune')                   ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Annapurna Varnish Co',  'annavrnsh@example.com',   '9000000020', 'Old City, Jaipur')                  ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Decor Direct',          'decor@example.com',       '9000000021', 'Whitefield, Bengaluru')             ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('TimberCraft Exports',   'tce@example.com',         '9000000022', 'Port Area, Kochi')                  ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Reliable Hinges Ltd',   'hinges@example.com',      '9000000023', 'MIDC, Aurangabad')                  ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Om Steel Furniture',    'omsteel@example.com',     '9000000024', 'Krishi Nagar, Ludhiana')            ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Premier Plywood House', 'premierpw@example.com',   '9000000025', 'Yeshwantpur, Bengaluru')            ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Khandelwal Timber',     'khandelwal@example.com',  '9000000026', 'Tonk Road, Jaipur')                 ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Perfect Paints Ltd',    'paints@example.com',      '9000000027', 'Industrial Estate, Vapi')           ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Shakti Hardware Store', 'shakti@example.com',      '9000000028', 'Bapunagar, Ahmedabad')              ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Artisan Wood Products', 'artisan@example.com',     '9000000029', 'Furniture Park, Jodhpur')           ON CONFLICT DO NOTHING;
INSERT INTO vendors (name, email, phone, address) VALUES
('Regal Casters Co',      'regal@example.com',       '9000000030', 'Auto Nagar, Vijayawada')            ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. CUSTOMERS (40 rows)
-- ─────────────────────────────────────────────
INSERT INTO customers (name, email, phone, address) VALUES
('Aarav Homes',            'aarav@cust.com',          '9111111111', 'Pune'),
('Mehta Office Interiors', 'moffice@cust.com',        '9222222222', 'Mumbai'),
('Royal Residency Hotel',  'royalres@cust.com',       '9333333333', 'Surat'),
('Sunrise Apartments',     'sunriseapt@cust.com',     '9444444444', 'Ahmedabad'),
('Green Park Villa',       'greenpark@cust.com',      '9555555555', 'Bengaluru'),
('Lotus Corporate HQ',     'lotus@cust.com',          '9666666666', 'Chennai'),
('Blue Ridge Resorts',     'blueridge@cust.com',      '9777777777', 'Ooty'),
('Metro Mall Pvt Ltd',     'metromall@cust.com',      '9888888888', 'Hyderabad'),
('Pinnacle Hotels',        'pinnacle@cust.com',       '9000100001', 'Delhi'),
('City Mart Retail',       'citymart@cust.com',       '9000100002', 'Jaipur'),
('Skyline Builders',       'skyline@cust.com',        '9000100003', 'Noida'),
('Heritage Resort',        'heritage@cust.com',       '9000100004', 'Udaipur'),
('Orbit Co-Working Space', 'orbit@cust.com',          '9000100005', 'Bengaluru'),
('Kalyan Furniture World', 'kalyan@cust.com',         '9000100006', 'Kolkata'),
('The Grand Suites',       'grand@cust.com',          '9000100007', 'Goa'),
('Bright Future Schools',  'bfschool@cust.com',       '9000100008', 'Nashik'),
('Diamond Homes',          'diamond@cust.com',        '9000100009', 'Nagpur'),
('Sterling Offices',       'sterling@cust.com',       '9000100010', 'Chandigarh'),
('Vijay Home Decorators',  'vijayhd@cust.com',        '9000100011', 'Coimbatore'),
('Platinum Interiors',     'platinum@cust.com',       '9000100012', 'Kochi'),
('TechSpace Pvt Ltd',      'techspace@cust.com',      '9000100013', 'Pune'),
('Shree Ram Enterprises',  'shreeram@cust.com',       '9000100014', 'Varanasi'),
('Modern Living Studios',  'modernlv@cust.com',       '9000100015', 'Lucknow'),
('Oak Olive Interiors',    'oakolive@cust.com',       '9000100016', 'Bhopal'),
('Horizon Hospitality',    'horizon@cust.com',        '9000100017', 'Indore'),
('Pearl Palace Hotel',     'pearl@cust.com',          '9000100018', 'Agra'),
('Sunrise Cafe Chain',     'sunrisecafe@cust.com',    '9000100019', 'Patna'),
('Galaxy Furniture Mart',  'galaxy@cust.com',         '9000100020', 'Raipur'),
('Amber Homes',            'amber@cust.com',          '9000100021', 'Bhubaneswar'),
('Crystal Decor Pvt Ltd',  'crystal@cust.com',        '9000100022', 'Guwahati'),
('Sapphire Offices',       'sapphire@cust.com',       '9000100023', 'Ranchi'),
('Emerald Estates',        'emerald@cust.com',        '9000100024', 'Dehradun'),
('Ivory Tower Properties', 'ivory@cust.com',          '9000100025', 'Shimla'),
('Ruby Retail Chain',      'ruby@cust.com',           '9000100026', 'Amritsar'),
('Coral Bay Resort',       'coral@cust.com',          '9000100027', 'Vizag'),
('Jade Gardens Township',  'jade@cust.com',           '9000100028', 'Mysore'),
('Onyx Furnishing Hub',    'onyx@cust.com',           '9000100029', 'Mangalore'),
('Silver Oak Residency',   'silveroak@cust.com',      '9000100030', 'Thiruvananthapuram'),
('Golden Age Homes',       'goldenage@cust.com',      '9000100031', 'Madurai'),
('Prime Living Spaces',    'primelv@cust.com',        '9000100032', 'Tiruchirappalli')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. WORK CENTERS (adds up to 8 total)
-- ─────────────────────────────────────────────
INSERT INTO work_centers (name) VALUES ('Assembly Line')    ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Paint Floor')      ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Packaging Unit')   ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Cutting Station')  ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Welding Bay')      ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Quality Check')    ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Polish & Finish')  ON CONFLICT DO NOTHING;
INSERT INTO work_centers (name) VALUES ('Upholstery Unit')  ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 4. PRODUCTS — resolved by vendor name in PL/pgSQL
-- ─────────────────────────────────────────────
DO $$
DECLARE
  v_timber    INTEGER; v_hardware  INTEGER; v_foam      INTEGER;
  v_steel     INTEGER; v_woodmart  INTEGER; v_sunrise   INTEGER;
  v_royal     INTEGER; v_greenwood INTEGER; v_natply    INTEGER;
  v_lakshmi   INTEGER; v_alufab    INTEGER; v_prakash   INTEGER;
  v_bharat    INTEGER; v_mehta     INTEGER; v_cosmos    INTEGER;
  v_annapurna INTEGER; v_hinges    INTEGER; v_om        INTEGER;
  v_perfect   INTEGER; v_regal     INTEGER;
BEGIN
  SELECT id INTO v_timber    FROM vendors WHERE name = 'Timber Traders'        LIMIT 1;
  SELECT id INTO v_hardware  FROM vendors WHERE name = 'Hardware Hub'          LIMIT 1;
  SELECT id INTO v_foam      FROM vendors WHERE name = 'Foam & Fabric Co'      LIMIT 1;
  SELECT id INTO v_steel     FROM vendors WHERE name = 'Steel Craft Supplies'  LIMIT 1;
  SELECT id INTO v_woodmart  FROM vendors WHERE name = 'WoodMart India'        LIMIT 1;
  SELECT id INTO v_sunrise   FROM vendors WHERE name = 'Sunrise Metals'        LIMIT 1;
  SELECT id INTO v_royal     FROM vendors WHERE name = 'Royal Upholstery'      LIMIT 1;
  SELECT id INTO v_greenwood FROM vendors WHERE name = 'Greenwood Sawmill'     LIMIT 1;
  SELECT id INTO v_natply    FROM vendors WHERE name = 'National Ply Depot'    LIMIT 1;
  SELECT id INTO v_lakshmi   FROM vendors WHERE name = 'Lakshmi Hardware'      LIMIT 1;
  SELECT id INTO v_alufab    FROM vendors WHERE name = 'AluFab Industries'     LIMIT 1;
  SELECT id INTO v_prakash   FROM vendors WHERE name = 'Prakash Glass Works'   LIMIT 1;
  SELECT id INTO v_bharat    FROM vendors WHERE name = 'Bharat Screw Works'    LIMIT 1;
  SELECT id INTO v_mehta     FROM vendors WHERE name = 'Mehta Finishing Store' LIMIT 1;
  SELECT id INTO v_cosmos    FROM vendors WHERE name = 'Cosmos Laminates'      LIMIT 1;
  SELECT id INTO v_annapurna FROM vendors WHERE name = 'Annapurna Varnish Co'  LIMIT 1;
  SELECT id INTO v_hinges    FROM vendors WHERE name = 'Reliable Hinges Ltd'   LIMIT 1;
  SELECT id INTO v_om        FROM vendors WHERE name = 'Om Steel Furniture'    LIMIT 1;
  SELECT id INTO v_perfect   FROM vendors WHERE name = 'Perfect Paints Ltd'    LIMIT 1;
  SELECT id INTO v_regal     FROM vendors WHERE name = 'Regal Casters Co'      LIMIT 1;

  -- Finished Goods (25 products)
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Wooden Dining Table',     'Finished Goods',32000,21000,'unit', 35, 4, 2,'mto',true, 'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Office Chair',            'Finished Goods', 4500, 2800,'unit', 80,12, 8,'mts',false,'purchase',     v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Bookshelf',               'Finished Goods',12000, 7800,'unit', 45, 5, 3,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Sofa Set',                'Finished Goods',42000,30000,'unit', 18, 2, 1,'mto',true, 'manufacturing',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Study Table',             'Finished Goods', 8500, 5200,'unit', 60, 8, 5,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Wardrobe',                'Finished Goods',22000,14000,'unit', 25, 3, 2,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Coffee Table',            'Finished Goods', 6500, 4000,'unit', 40, 6, 4,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('TV Cabinet',              'Finished Goods',14000, 9000,'unit', 30, 4, 3,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Bed Frame King',          'Finished Goods',28000,18500,'unit', 20, 2, 2,'mto',true, 'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Bed Frame Queen',         'Finished Goods',22000,14000,'unit', 22, 3, 2,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Recliner Chair',          'Finished Goods',18000,11000,'unit', 15, 2, 2,'mto',true, 'manufacturing',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Dressing Table',          'Finished Goods',11500, 7200,'unit', 28, 4, 3,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Lounge Chair',            'Finished Goods', 9500, 6000,'unit', 32, 5, 4,'mts',false,'manufacturing',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Outdoor Bench',           'Finished Goods', 5500, 3400,'unit', 50,10, 8,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Filing Cabinet 3-Drawer', 'Finished Goods', 7800, 4900,'unit', 35, 5, 5,'mts',false,'purchase',     v_steel)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Bar Stool',               'Finished Goods', 3200, 1900,'unit', 55, 8,10,'mts',false,'purchase',     v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Shoe Rack',               'Finished Goods', 2800, 1600,'unit', 70,10,12,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Side Table',              'Finished Goods', 3800, 2200,'unit', 48, 7, 6,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Corner Shelf Unit',       'Finished Goods', 4200, 2600,'unit', 42, 6, 5,'mts',false,'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Kids Bed',                'Finished Goods',15000, 9500,'unit', 18, 2, 2,'mto',true, 'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Garden Chair',            'Finished Goods', 2500, 1500,'unit', 65, 8,10,'mts',false,'purchase',     v_royal)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Folding Table',           'Finished Goods', 4000, 2400,'unit', 38, 5, 5,'mts',false,'purchase',     v_steel)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Executive Desk',          'Finished Goods',25000,16000,'unit', 12, 1, 2,'mto',true, 'manufacturing',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Sectional Sofa',          'Finished Goods',55000,38000,'unit',  8, 1, 1,'mto',true, 'manufacturing',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Dining Chair',            'Finished Goods', 3500, 2100,'unit', 90,12,15,'mts',false,'purchase',     v_foam)     ON CONFLICT DO NOTHING;

  -- Raw Materials (25 products)
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Wooden Legs',             'Raw Material',  550,  300,'unit',150,0, 30,'mts',false,'purchase',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Wooden Top',              'Raw Material', 1800, 1100,'unit', 80,0, 20,'mts',false,'purchase',v_timber)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Screws Pack',             'Raw Material',  120,   60,'pack',200,0, 50,'mts',false,'purchase',v_hardware) ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Foam Sheet 2-inch',       'Raw Material',  450,  280,'unit',100,0, 30,'mts',false,'purchase',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Fabric Upholstery mtr',   'Raw Material',  380,  220,'mtr', 120,0, 40,'mts',false,'purchase',v_royal)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Plywood Sheet 6mm',       'Raw Material',  850,  520,'unit', 90,0, 20,'mts',false,'purchase',v_natply)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Plywood Sheet 12mm',      'Raw Material', 1200,  720,'unit', 70,0, 15,'mts',false,'purchase',v_natply)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Steel Pipe 1-inch',       'Raw Material',  280,  160,'mtr', 160,0, 50,'mts',false,'purchase',v_steel)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Paint Walnut 1L',         'Raw Material',  480,  290,'unit', 60,0, 15,'mts',false,'purchase',v_perfect)  ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Hinges pair',             'Raw Material',   80,   45,'pair',250,0, 80,'mts',false,'purchase',v_hinges)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Drawer Slides pair',      'Raw Material',  220,  130,'pair',180,0, 50,'mts',false,'purchase',v_hinges)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Glass Sheet 5mm',         'Raw Material',  650,  400,'unit', 45,0, 10,'mts',false,'purchase',v_prakash)  ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Varnish 1L',              'Raw Material',  320,  190,'unit', 55,0, 15,'mts',false,'purchase',v_annapurna) ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Nails Box',               'Raw Material',   90,   50,'box', 180,0, 60,'mts',false,'purchase',v_hardware) ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Sandpaper Sheet',         'Raw Material',   25,   12,'unit',300,0,100,'mts',false,'purchase',v_mehta)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Wood Glue 500ml',         'Raw Material',  150,   85,'unit', 80,0, 25,'mts',false,'purchase',v_mehta)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Casters Wheel set',       'Raw Material',  350,  200,'set', 100,0, 30,'mts',false,'purchase',v_regal)    ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Aluminium Strip mtr',     'Raw Material',  180,  100,'mtr', 120,0, 40,'mts',false,'purchase',v_alufab)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Door Handle',             'Raw Material',  120,   70,'unit',160,0, 50,'mts',false,'purchase',v_om)       ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Mirror 12x18 inch',       'Raw Material',  320,  190,'unit', 40,0, 10,'mts',false,'purchase',v_prakash)  ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Spring Coil Set',         'Raw Material',  750,  440,'set',  65,0, 20,'mts',false,'purchase',v_foam)     ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Rubber Stopper set',      'Raw Material',   55,   30,'set', 200,0, 60,'mts',false,'purchase',v_hardware) ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Edgeband Tape 25mtr',     'Raw Material',  280,  160,'roll', 75,0, 20,'mts',false,'purchase',v_cosmos)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Laminate Sheet',          'Raw Material',  450,  270,'unit', 60,0, 15,'mts',false,'purchase',v_cosmos)   ON CONFLICT DO NOTHING;
  INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
  ('Cotton Padding kg',       'Raw Material',  220,  130,'kg',   90,0, 25,'mts',false,'purchase',v_foam)     ON CONFLICT DO NOTHING;
END $$;

-- ─────────────────────────────────────────────
-- 5. BOMs + Components + Operations
-- ─────────────────────────────────────────────
DO $$
DECLARE
  bom_id      INTEGER;
  p_dining    INTEGER; p_bookshelf INTEGER; p_sofa     INTEGER;
  p_study     INTEGER; p_wardrobe  INTEGER;
  c_legs      INTEGER; c_top       INTEGER; c_screws   INTEGER;
  c_paint     INTEGER; c_varnish   INTEGER; c_ply12    INTEGER;
  c_edge      INTEGER; c_lam       INTEGER; c_foam     INTEGER;
  c_fabric    INTEGER; c_spring    INTEGER; c_cotton   INTEGER;
  c_hinges    INTEGER; c_handle    INTEGER; c_slides   INTEGER;
  wc_assem    INTEGER; wc_paint    INTEGER; wc_pack    INTEGER;
  wc_cut      INTEGER; wc_qc       INTEGER; wc_polish  INTEGER;
  wc_uphol    INTEGER;
BEGIN
  SELECT id INTO p_dining    FROM products WHERE name = 'Wooden Dining Table' LIMIT 1;
  SELECT id INTO p_bookshelf FROM products WHERE name = 'Bookshelf'           LIMIT 1;
  SELECT id INTO p_sofa      FROM products WHERE name = 'Sofa Set'            LIMIT 1;
  SELECT id INTO p_study     FROM products WHERE name = 'Study Table'         LIMIT 1;
  SELECT id INTO p_wardrobe  FROM products WHERE name = 'Wardrobe'            LIMIT 1;

  SELECT id INTO c_legs    FROM products WHERE name = 'Wooden Legs'         LIMIT 1;
  SELECT id INTO c_top     FROM products WHERE name = 'Wooden Top'          LIMIT 1;
  SELECT id INTO c_screws  FROM products WHERE name = 'Screws Pack'         LIMIT 1;
  SELECT id INTO c_paint   FROM products WHERE name = 'Paint Walnut 1L'     LIMIT 1;
  SELECT id INTO c_varnish FROM products WHERE name = 'Varnish 1L'          LIMIT 1;
  SELECT id INTO c_ply12   FROM products WHERE name = 'Plywood Sheet 12mm'  LIMIT 1;
  SELECT id INTO c_edge    FROM products WHERE name = 'Edgeband Tape 25mtr' LIMIT 1;
  SELECT id INTO c_lam     FROM products WHERE name = 'Laminate Sheet'      LIMIT 1;
  SELECT id INTO c_foam    FROM products WHERE name = 'Foam Sheet 2-inch'   LIMIT 1;
  SELECT id INTO c_fabric  FROM products WHERE name = 'Fabric Upholstery mtr' LIMIT 1;
  SELECT id INTO c_spring  FROM products WHERE name = 'Spring Coil Set'     LIMIT 1;
  SELECT id INTO c_cotton  FROM products WHERE name = 'Cotton Padding kg'   LIMIT 1;
  SELECT id INTO c_hinges  FROM products WHERE name = 'Hinges pair'         LIMIT 1;
  SELECT id INTO c_handle  FROM products WHERE name = 'Door Handle'         LIMIT 1;
  SELECT id INTO c_slides  FROM products WHERE name = 'Drawer Slides pair'  LIMIT 1;

  SELECT id INTO wc_assem  FROM work_centers WHERE name = 'Assembly Line'   LIMIT 1;
  SELECT id INTO wc_paint  FROM work_centers WHERE name = 'Paint Floor'     LIMIT 1;
  SELECT id INTO wc_pack   FROM work_centers WHERE name = 'Packaging Unit'  LIMIT 1;
  SELECT id INTO wc_cut    FROM work_centers WHERE name = 'Cutting Station' LIMIT 1;
  SELECT id INTO wc_qc     FROM work_centers WHERE name = 'Quality Check'   LIMIT 1;
  SELECT id INTO wc_polish FROM work_centers WHERE name = 'Polish & Finish' LIMIT 1;
  SELECT id INTO wc_uphol  FROM work_centers WHERE name = 'Upholstery Unit' LIMIT 1;

  -- BOM 1: Wooden Dining Table
  IF NOT EXISTS (SELECT 1 FROM boms WHERE product_id = p_dining) THEN
    INSERT INTO boms (product_id) VALUES (p_dining) RETURNING id INTO bom_id;
    UPDATE products SET default_bom_id = bom_id WHERE id = p_dining;
    INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES
      (bom_id,c_legs,4),(bom_id,c_top,1),(bom_id,c_screws,2),(bom_id,c_paint,1),(bom_id,c_varnish,1);
    INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES
      (bom_id,'Cutting & Shaping',90,wc_cut,1),(bom_id,'Assembly',60,wc_assem,2),
      (bom_id,'Sanding',30,wc_polish,3),(bom_id,'Painting',40,wc_paint,4),(bom_id,'Packing',20,wc_pack,5);
  END IF;

  -- BOM 2: Bookshelf
  IF NOT EXISTS (SELECT 1 FROM boms WHERE product_id = p_bookshelf) THEN
    INSERT INTO boms (product_id) VALUES (p_bookshelf) RETURNING id INTO bom_id;
    UPDATE products SET default_bom_id = bom_id WHERE id = p_bookshelf;
    INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES
      (bom_id,c_ply12,3),(bom_id,c_screws,2),(bom_id,c_edge,1),(bom_id,c_lam,2);
    INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES
      (bom_id,'Cutting',60,wc_cut,1),(bom_id,'Assembly',45,wc_assem,2),
      (bom_id,'Laminating',30,wc_polish,3),(bom_id,'Packing',15,wc_pack,4);
  END IF;

  -- BOM 3: Sofa Set
  IF NOT EXISTS (SELECT 1 FROM boms WHERE product_id = p_sofa) THEN
    INSERT INTO boms (product_id) VALUES (p_sofa) RETURNING id INTO bom_id;
    UPDATE products SET default_bom_id = bom_id WHERE id = p_sofa;
    INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES
      (bom_id,c_foam,6),(bom_id,c_fabric,12),(bom_id,c_legs,6),(bom_id,c_spring,3),(bom_id,c_cotton,4);
    INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES
      (bom_id,'Frame Assembly',90,wc_assem,1),(bom_id,'Foam Fitting',60,wc_uphol,2),
      (bom_id,'Upholstery',120,wc_uphol,3),(bom_id,'Quality Check',30,wc_qc,4),(bom_id,'Packing',25,wc_pack,5);
  END IF;

  -- BOM 4: Study Table
  IF NOT EXISTS (SELECT 1 FROM boms WHERE product_id = p_study) THEN
    INSERT INTO boms (product_id) VALUES (p_study) RETURNING id INTO bom_id;
    UPDATE products SET default_bom_id = bom_id WHERE id = p_study;
    INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES
      (bom_id,c_ply12,2),(bom_id,c_legs,4),(bom_id,c_screws,1),(bom_id,c_lam,1);
    INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES
      (bom_id,'Cutting',45,wc_cut,1),(bom_id,'Assembly',40,wc_assem,2),
      (bom_id,'Finishing',25,wc_polish,3),(bom_id,'Packing',15,wc_pack,4);
  END IF;

  -- BOM 5: Wardrobe
  IF NOT EXISTS (SELECT 1 FROM boms WHERE product_id = p_wardrobe) THEN
    INSERT INTO boms (product_id) VALUES (p_wardrobe) RETURNING id INTO bom_id;
    UPDATE products SET default_bom_id = bom_id WHERE id = p_wardrobe;
    INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES
      (bom_id,c_ply12,6),(bom_id,c_hinges,4),(bom_id,c_handle,3),
      (bom_id,c_slides,2),(bom_id,c_lam,4),(bom_id,c_screws,2);
    INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES
      (bom_id,'Cutting',90,wc_cut,1),(bom_id,'Assembly',120,wc_assem,2),
      (bom_id,'Hardware Fitting',45,wc_assem,3),(bom_id,'Finishing',30,wc_polish,4),
      (bom_id,'QC',20,wc_qc,5),(bom_id,'Packing',30,wc_pack,6);
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 6. SALES ORDERS (60 orders)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  sales_uid   INTEGER;
  so_id       INTEGER;
  cust_ids    INTEGER[];
  prod_ids    INTEGER[];
  prod_prices DECIMAL[];
  statuses    TEXT[];
  i           INTEGER;
  c_id        INTEGER;
  p1_id       INTEGER; p2_id    INTEGER;
  p1_price    DECIMAL; p2_price DECIMAL;
  qty1        INTEGER; qty2     INTEGER;
  subtotal    DECIMAL; tax      DECIMAL;
  so_num      TEXT;
  ord_stat    TEXT; pay_stat TEXT;
  pay_req     BOOLEAN;
BEGIN
  SELECT id INTO sales_uid FROM users WHERE role = 'sales_user' LIMIT 1;
  SELECT ARRAY(SELECT id FROM customers ORDER BY id) INTO cust_ids;
  SELECT ARRAY(SELECT id FROM products WHERE category = 'Finished Goods' ORDER BY id) INTO prod_ids;
  SELECT ARRAY(SELECT sales_price FROM products WHERE category = 'Finished Goods' ORDER BY id) INTO prod_prices;
  statuses := ARRAY['draft','confirmed','confirmed','confirmed','partially_delivered','fully_delivered','fully_delivered'];

  FOR i IN 1..60 LOOP
    so_num   := 'SO-' || LPAD(i::text, 5, '0');
    ord_stat := statuses[1 + (i % array_length(statuses,1))];
    pay_req  := (i % 3 = 0);
    pay_stat := CASE WHEN pay_req AND ord_stat IN ('confirmed','fully_delivered','partially_delivered')
                     THEN 'paid' WHEN pay_req THEN 'pending' ELSE 'not_applicable' END;
    c_id     := cust_ids[1 + ((i-1) % array_length(cust_ids,1))];
    p1_id    := prod_ids[1 + ((i-1) % array_length(prod_ids,1))];
    p2_id    := prod_ids[1 + (i % array_length(prod_ids,1))];
    p1_price := prod_prices[1 + ((i-1) % array_length(prod_prices,1))];
    p2_price := prod_prices[1 + (i % array_length(prod_prices,1))];
    qty1     := 1 + (i % 4); qty2 := 1 + (i % 3);
    subtotal := qty1*p1_price + qty2*p2_price;
    tax      := ROUND(subtotal*0.18,2);
    BEGIN
      INSERT INTO sales_orders
        (order_number,customer_id,sales_user_id,status,payment_required,payment_status,subtotal,tax_total,total,created_at)
      VALUES (so_num,c_id,sales_uid,ord_stat,pay_req,pay_stat,subtotal,tax,subtotal+tax,
              NOW()-((61-i)||' days')::INTERVAL) RETURNING id INTO so_id;
      INSERT INTO sales_order_items (sales_order_id,product_id,quantity,unit_price,line_total,delivered_qty) VALUES
        (so_id,p1_id,qty1,p1_price,qty1*p1_price,
         CASE WHEN ord_stat='fully_delivered' THEN qty1
              WHEN ord_stat='partially_delivered' THEN GREATEST(1,qty1/2) ELSE 0 END),
        (so_id,p2_id,qty2,p2_price,qty2*p2_price,
         CASE WHEN ord_stat='fully_delivered' THEN qty2
              WHEN ord_stat='partially_delivered' THEN GREATEST(1,qty2/2) ELSE 0 END);
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 7. PURCHASE ORDERS (50 orders)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  purch_uid  INTEGER;
  po_id      INTEGER;
  vend_ids   INTEGER[];
  raw_prod   INTEGER[];
  raw_prices DECIMAL[];
  statuses   TEXT[];
  i          INTEGER;
  v_id       INTEGER;
  p1_id      INTEGER; p2_id   INTEGER;
  p1_cost    DECIMAL; p2_cost DECIMAL;
  qty1       INTEGER; qty2    INTEGER;
  total      DECIMAL;
  po_num     TEXT; ord_stat TEXT;
BEGIN
  SELECT id INTO purch_uid FROM users WHERE role = 'purchase_user' LIMIT 1;
  SELECT ARRAY(SELECT id FROM vendors ORDER BY id) INTO vend_ids;
  SELECT ARRAY(SELECT id FROM products WHERE category='Raw Material' ORDER BY id) INTO raw_prod;
  SELECT ARRAY(SELECT cost_price FROM products WHERE category='Raw Material' ORDER BY id) INTO raw_prices;
  statuses := ARRAY['draft','confirmed','confirmed','fully_received','fully_received','partially_received'];

  FOR i IN 1..50 LOOP
    po_num   := 'PO-' || LPAD(i::text, 5, '0');
    ord_stat := statuses[1 + (i % array_length(statuses,1))];
    v_id     := vend_ids[1 + ((i-1) % array_length(vend_ids,1))];
    p1_id    := raw_prod[1 + ((i-1) % array_length(raw_prod,1))];
    p2_id    := raw_prod[1 + (i % array_length(raw_prod,1))];
    p1_cost  := raw_prices[1 + ((i-1) % array_length(raw_prices,1))];
    p2_cost  := raw_prices[1 + (i % array_length(raw_prices,1))];
    qty1     := 10 + (i % 40); qty2 := 5 + (i % 20);
    total    := qty1*p1_cost + qty2*p2_cost;
    BEGIN
      INSERT INTO purchase_orders (order_number,vendor_id,purchase_user_id,status,total,created_at)
      VALUES (po_num,v_id,purch_uid,ord_stat,total,NOW()-((51-i)||' days')::INTERVAL)
      RETURNING id INTO po_id;
      INSERT INTO purchase_order_items (purchase_order_id,product_id,quantity,unit_price,line_total,received_qty) VALUES
        (po_id,p1_id,qty1,p1_cost,qty1*p1_cost,
         CASE WHEN ord_stat='fully_received' THEN qty1
              WHEN ord_stat='partially_received' THEN GREATEST(1,qty1/2) ELSE 0 END),
        (po_id,p2_id,qty2,p2_cost,qty2*p2_cost,
         CASE WHEN ord_stat='fully_received' THEN qty2
              WHEN ord_stat='partially_received' THEN GREATEST(1,qty2/2) ELSE 0 END);
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 8. MANUFACTURING ORDERS + WORK ORDERS (40 orders)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  mfg_uid  INTEGER;
  mo_id    INTEGER;
  bom_rec  RECORD;
  statuses TEXT[];
  i        INTEGER := 0;
  j        INTEGER;
  mo_num   TEXT; ord_stat TEXT; qty INTEGER;
BEGIN
  SELECT id INTO mfg_uid FROM users WHERE role = 'manufacturing_user' LIMIT 1;
  statuses := ARRAY['draft','in_progress','in_progress','quality_check','completed','completed','completed'];

  FOR bom_rec IN SELECT b.id AS bom_id, b.product_id FROM boms b ORDER BY b.id LOOP
    FOR j IN 1..8 LOOP
      i := i + 1;
      EXIT WHEN i > 40;
      mo_num   := 'MO-' || LPAD(i::text, 5, '0');
      ord_stat := statuses[1 + (i % array_length(statuses,1))];
      qty      := 1 + (i % 5);
      BEGIN
        INSERT INTO manufacturing_orders
          (mo_number,product_id,quantity,bom_id,assignee_id,status,created_at,completed_at)
        VALUES (mo_num,bom_rec.product_id,qty,bom_rec.bom_id,mfg_uid,ord_stat,
                NOW()-((41-i)||' days')::INTERVAL,
                CASE WHEN ord_stat='completed' THEN NOW()-((40-i)||' days')::INTERVAL ELSE NULL END)
        RETURNING id INTO mo_id;
        INSERT INTO work_orders (manufacturing_order_id,operation_name,work_center_id,duration_minutes,sequence,status)
        SELECT mo_id,op.name,op.work_center_id,op.duration_minutes,op.sequence,
          CASE WHEN ord_stat='completed' THEN 'done'
               WHEN ord_stat='in_progress' THEN
                 CASE WHEN op.sequence=1 THEN 'done' WHEN op.sequence=2 THEN 'in_progress' ELSE 'pending' END
               WHEN ord_stat='quality_check' THEN
                 CASE WHEN op.sequence<=3 THEN 'done' ELSE 'in_progress' END
               ELSE 'pending' END
        FROM bom_operations op WHERE op.bom_id = bom_rec.bom_id ORDER BY op.sequence;
      EXCEPTION WHEN unique_violation THEN NULL;
      END;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 9. STOCK LEDGER (3 entries per product)
-- ─────────────────────────────────────────────
DO $$
DECLARE prod RECORD; bal INTEGER;
BEGIN
  FOR prod IN SELECT id, on_hand_qty FROM products LOOP
    bal := prod.on_hand_qty;
    INSERT INTO stock_ledger (product_id,change_qty,reason,reference_type,reference_id,balance_after,created_at) VALUES
      (prod.id,bal,'Initial stock','manual_adjustment',NULL,bal,NOW()-'90 days'::INTERVAL),
      (prod.id, 20,'Purchase receipt','purchase_order',1,bal+20,NOW()-'60 days'::INTERVAL),
      (prod.id, -5,'Sales delivery','sales_order',1,bal+15,NOW()-'30 days'::INTERVAL);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 10. AUDIT LOGS (50 entries)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  user_ids INTEGER[];
  actions  TEXT[];
  entities TEXT[];
  i        INTEGER;
BEGIN
  SELECT ARRAY(SELECT id FROM users ORDER BY id) INTO user_ids;
  actions  := ARRAY['created','updated','deleted','confirmed','delivered','received','completed','quick_reorder'];
  entities := ARRAY['product','sales_order','purchase_order','manufacturing_order','customer','vendor','bom'];
  FOR i IN 1..50 LOOP
    INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value,created_at) VALUES
      (user_ids[1+(i%array_length(user_ids,1))],
       actions[1+(i%array_length(actions,1))],
       entities[1+(i%array_length(entities,1))],
       i, jsonb_build_object('demo',true,'entry',i),
       NOW()-((50-i)||' hours')::INTERVAL);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 11. NOTIFICATIONS (30 entries)
-- ─────────────────────────────────────────────
INSERT INTO notifications (role,title,message,type,is_read,created_at) VALUES
('inventory_manager', 'Low stock: Wooden Legs',          'Wooden Legs qty below reorder point',                   'low_stock',        false, NOW()-'2 hours'::INTERVAL),
('inventory_manager', 'Low stock: Wooden Top',           'Wooden Top qty below reorder point',                    'low_stock',        false, NOW()-'3 hours'::INTERVAL),
('purchase_user',     'PO-00001 confirmed',              'Purchase order PO-00001 has been confirmed',            'order_status',     true,  NOW()-'1 day'::INTERVAL),
('purchase_user',     'PO-00002 fully received',         'All items in PO-00002 received into stock',             'order_status',     true,  NOW()-'2 days'::INTERVAL),
('sales_user',        'SO-00001 confirmed',              'SO-00001 confirmed, procurement triggered',             'order_status',     false, NOW()-'4 hours'::INTERVAL),
('sales_user',        'SO-00005 fully delivered',        'SO-00005 has been fully delivered',                     'order_status',     true,  NOW()-'5 days'::INTERVAL),
('business_owner',    'Demo data loaded',                'Shiv ERP is seeded with full demo data (300+ rows)',    'system',           false, NOW()-'10 minutes'::INTERVAL),
('business_owner',    'MO-00001 completed',              'MO-00001 completed — 2 units added to stock',           'order_status',     false, NOW()-'6 hours'::INTERVAL),
('manufacturing_user','MO-00003 assigned',               'You have been assigned Manufacturing Order MO-00003',  'order_status',     false, NOW()-'1 hour'::INTERVAL),
('inventory_manager', 'Reorder: Office Chair',           'Auto PO created for Office Chair',                      'shortage_trigger', false, NOW()-'30 minutes'::INTERVAL),
('business_owner',    'Payment received: SO-00003',      'Simulated payment received for SO-00003',               'payment',          true,  NOW()-'3 days'::INTERVAL),
('admin',             'New user registered',              'A new user registered and is pending approval',         'system',           false, NOW()-'2 hours'::INTERVAL),
('purchase_user',     'Quick reorder: Screws Pack',      'PO auto-generated for Screws Pack',                     'shortage_trigger', false, NOW()-'45 minutes'::INTERVAL),
('sales_user',        'Payment pending: SO-00010',       'Payment for SO-00010 is still pending',                 'payment',          false, NOW()-'1 day'::INTERVAL),
('business_owner',    'Weekly sales summary',             '15 sales orders confirmed this week',                  'system',           true,  NOW()-'7 days'::INTERVAL),
('inventory_manager', 'Low stock: Foam Sheet',           'Foam Sheet qty approaching reorder point',              'low_stock',        false, NOW()-'5 hours'::INTERVAL),
('manufacturing_user','BOM updated: Sofa Set',           'Bill of Materials for Sofa Set has been updated',       'system',           true,  NOW()-'2 days'::INTERVAL),
('purchase_user',     'PO-00015 draft created',          'Auto-generated PO for Fabric Upholstery pending confirm','order_status',    false, NOW()-'20 minutes'::INTERVAL),
('business_owner',    'MO-00010 quality check',          'MO-00010 is pending quality check',                     'order_status',     false, NOW()-'3 hours'::INTERVAL),
('admin',             'Permission updated',               'Role permissions for inventory_manager updated',        'system',           true,  NOW()-'4 days'::INTERVAL),
('sales_user',        'SO-00025 partially delivered',    'SO-00025 is partially delivered',                       'order_status',     false, NOW()-'6 hours'::INTERVAL),
('inventory_manager', 'Stock adjustment completed',      'Manual stock adjustment applied for 5 products',        'system',           true,  NOW()-'3 days'::INTERVAL),
('purchase_user',     'PO-00020 confirmed',              'PO-00020 confirmed with vendor',                        'order_status',     false, NOW()-'2 hours'::INTERVAL),
('business_owner',    'SO-00030 payment due',            'Payment for SO-00030 is overdue',                       'payment',          false, NOW()-'1 day'::INTERVAL),
('manufacturing_user','MO-00005 in progress',            'Work has started on MO-00005',                          'order_status',     false, NOW()-'4 hours'::INTERVAL),
('inventory_manager', 'Critical: Wooden Top low',        'Wooden Top stock critically low — only 12 units left',  'low_stock',        false, NOW()-'1 hour'::INTERVAL),
('sales_user',        'New customer added',              'New customer Emerald Estates added to the system',      'system',           true,  NOW()-'5 days'::INTERVAL),
('purchase_user',     'Vendor added: Artisan Wood',      'New vendor Artisan Wood Products added successfully',   'system',           true,  NOW()-'6 days'::INTERVAL),
('business_owner',    'Monthly revenue milestone',       'Total confirmed sales revenue for the month is strong', 'system',           false, NOW()-'1 day'::INTERVAL),
('admin',             'System seed complete',             'Full demo data with 300+ rows loaded successfully',     'system',           false, NOW())
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 12. PAYMENTS (for paid sales orders)
-- ─────────────────────────────────────────────
INSERT INTO payments (sales_order_id,gateway_order_id,gateway_payment_id,amount,status,created_at)
SELECT so.id,'sim_order_demo_'||so.id,'sim_pay_demo_'||so.id,so.total,'success',so.created_at+'1 hour'::INTERVAL
FROM sales_orders so
WHERE so.payment_required=true AND so.payment_status='paid'
  AND so.id NOT IN (SELECT COALESCE(sales_order_id,0) FROM payments) LIMIT 25;

-- Final audit log
INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value)
SELECT id,'seeded','system',1,'{"message":"Full demo seed v3 loaded — 300+ rows"}'::jsonb
FROM users WHERE role='admin' LIMIT 1;
