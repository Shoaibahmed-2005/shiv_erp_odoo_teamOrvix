INSERT INTO users (name,email,password_hash,role) VALUES
('Admin','admin@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','admin'),
('Sales User','sales@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','sales_user'),
('Purchase User','purchase@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','purchase_user'),
('Manufacturing User','manufacturing@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','manufacturing_user'),
('Inventory Manager','inventory@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','inventory_manager'),
('Business Owner','owner@shivfurniture.com','$2a$12$wTvpFzVdLl/PChx8bVEkNOhWWSpSl.hVdkK29GNSqIK.yxmQbpPNK','business_owner');

INSERT INTO role_permissions (role,module,can_view,can_create,can_edit,can_delete) VALUES
('admin','Products',true,true,true,true),('admin','Sales',true,true,true,true),('admin','Purchase',true,true,true,true),('admin','Manufacturing',true,true,true,true),('admin','BoM',true,true,true,true),('admin','Inventory',true,true,true,true),('admin','Audit Logs',true,true,true,true),('admin','Users',true,true,true,true),
('sales_user','Products',true,false,false,false),('sales_user','Sales',true,true,true,true),('sales_user','Inventory',true,false,false,false),
('purchase_user','Products',true,false,false,false),('purchase_user','Purchase',true,true,true,true),('purchase_user','Inventory',true,false,false,false),
('manufacturing_user','Products',true,false,false,false),('manufacturing_user','Manufacturing',true,true,true,true),('manufacturing_user','BoM',true,true,true,true),('manufacturing_user','Inventory',true,false,false,false),
('inventory_manager','Products',true,false,true,false),('inventory_manager','Sales',true,false,false,false),('inventory_manager','Purchase',true,false,false,false),('inventory_manager','Manufacturing',true,false,false,false),('inventory_manager','BoM',true,false,false,false),('inventory_manager','Inventory',true,true,true,true),
('business_owner','Products',true,true,true,true),('business_owner','Sales',true,false,false,false),('business_owner','Purchase',true,false,false,false),('business_owner','Manufacturing',true,false,false,false),('business_owner','BoM',true,false,false,false),('business_owner','Inventory',true,false,false,false),('business_owner','Audit Logs',true,false,false,false)
ON CONFLICT (role,module) DO NOTHING;

INSERT INTO vendors (name,email,phone,address) VALUES
('Timber Traders','timber@example.com','9000000001','Industrial Area'),('Hardware Hub','hardware@example.com','9000000002','Market Road'),('Foam & Fabric Co','foam@example.com','9000000003','Warehouse Lane');
INSERT INTO customers (name,email,phone,address) VALUES
('Aarav Homes','aarav@example.com','9111111111','Pune'),('Mehta Office','mehta@example.com','9222222222','Mumbai'),('Royal Residency','royal@example.com','9333333333','Surat');
INSERT INTO work_centers (name) VALUES ('Assembly Line'),('Paint Floor'),('Packaging Unit');

INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reserved_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id) VALUES
('Wooden Dining Table','Finished Goods',32000,21000,'unit',0,0,2,'mto',true,'manufacturing',1),
('Office Chair','Finished Goods',4500,2800,'unit',24,4,8,'mts',false,'purchase',3),
('Wooden Legs','Raw Material',550,300,'unit',8,0,10,'mts',false,'purchase',1),
('Wooden Top','Raw Material',1800,1100,'unit',12,0,5,'mts',false,'purchase',1),
('Screws Pack','Raw Material',120,60,'pack',45,0,30,'mts',false,'purchase',2),
('Bookshelf','Finished Goods',12000,7800,'unit',7,1,3,'mts',false,'manufacturing',1),
('Sofa Set','Finished Goods',42000,30000,'unit',0,0,1,'mto',true,'manufacturing',3);

INSERT INTO boms (product_id) VALUES (1);
UPDATE products SET default_bom_id = 1 WHERE id = 1;
INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES (1,3,4),(1,4,1),(1,5,12);
INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES (1,'Assembly',60,1,1),(1,'Painting',30,2,2),(1,'Packing',20,3,3);

INSERT INTO sales_orders (order_number,customer_id,sales_user_id,status,payment_required,payment_status,subtotal,tax_total,total) VALUES
('SO-00001',1,2,'confirmed',false,'not_applicable',9000,1620,10620),('SO-00002',2,2,'draft',true,'pending',32000,5760,37760);
INSERT INTO sales_order_items (sales_order_id,product_id,quantity,unit_price,line_total) VALUES (1,2,2,4500,9000),(2,1,1,32000,32000);
INSERT INTO purchase_orders (order_number,vendor_id,purchase_user_id,status,total) VALUES ('PO-00001',1,3,'confirmed',3000);
INSERT INTO purchase_order_items (purchase_order_id,product_id,quantity,unit_price,line_total) VALUES (1,3,10,300,3000);
INSERT INTO manufacturing_orders (mo_number,product_id,quantity,bom_id,assignee_id,status) VALUES ('MO-00001',1,1,1,4,'in_progress');
INSERT INTO work_orders (manufacturing_order_id,operation_name,work_center_id,duration_minutes,sequence,status) VALUES (1,'Assembly',1,60,1,'done'),(1,'Painting',2,30,2,'in_progress'),(1,'Packing',3,20,3,'pending');
INSERT INTO notifications (role,title,message,type) VALUES ('inventory_manager','Low stock alert','Wooden Legs are near reorder point','low_stock'),('business_owner','Demo data ready','Shiv ERP is seeded with orders and stock','system');
INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES (1,'seeded','system',1,'{"message":"Initial seed loaded"}'::jsonb);
