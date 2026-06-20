import crypto from "crypto";
import Razorpay from "razorpay";
import { query, withTransaction } from "../config/db.js";
import { emitToAll } from "../config/socket.js";
import { nextNumber } from "../utils/orderNumberGenerator.js";
import { moveStock } from "../utils/stockLedger.js";
import { createNotification } from "../utils/notifications.js";
import { runProcurementForSalesOrder } from "./procurementEngine.js";

const listSql = {
  products: "SELECT p.*, v.name AS vendor_name FROM products p LEFT JOIN vendors v ON v.id=p.default_vendor_id WHERE p.is_active=true ORDER BY p.id",
  customers: "SELECT * FROM customers ORDER BY id",
  vendors: "SELECT * FROM vendors ORDER BY id",
  workCenters: "SELECT * FROM work_centers ORDER BY id",
  salesOrders: `SELECT so.*, c.name AS customer_name,
    (SELECT po.order_number FROM purchase_orders po WHERE po.triggered_by_sales_order_id = so.id AND po.auto_generated = true ORDER BY po.id LIMIT 1) AS linked_po_number,
    (SELECT mo.mo_number FROM manufacturing_orders mo WHERE mo.triggered_by_sales_order_id = so.id AND mo.auto_generated = true ORDER BY mo.id LIMIT 1) AS linked_mo_number
    FROM sales_orders so LEFT JOIN customers c ON c.id=so.customer_id ORDER BY so.id DESC`,
  purchaseOrders: `SELECT po.*, v.name AS vendor_name FROM purchase_orders po LEFT JOIN vendors v ON v.id=po.vendor_id ORDER BY po.id DESC`,
  manufacturingOrders: `SELECT mo.*, p.name AS product_name FROM manufacturing_orders mo LEFT JOIN products p ON p.id=mo.product_id ORDER BY mo.id DESC`,
  boms: `SELECT b.*, p.name AS product_name FROM boms b LEFT JOIN products p ON p.id=b.product_id ORDER BY b.id DESC`,
  auditLogs: "SELECT a.*, u.name AS user_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 200"
};

export const list = (key) => async (_req, res) => res.json((await query(listSql[key])).rows);
export const getUsers = async (_req, res) => res.json((await query("SELECT id,name,email,role,is_active,created_at FROM users ORDER BY id")).rows);
export const assignRole = async (req, res) => res.json((await query("UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,role,is_active", [req.body.role, req.params.id])).rows[0]);
export const toggleActive = async (req, res) => res.json((await query("UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING id,name,email,role,is_active", [req.params.id])).rows[0]);
export const getPermissions = async (_req, res) => res.json((await query("SELECT * FROM role_permissions ORDER BY role,module")).rows);
export const updatePermission = async (req, res) => {
  const { can_view, can_create, can_edit, can_delete } = req.body;
  res.json((await query("UPDATE role_permissions SET can_view=$1, can_create=$2, can_edit=$3, can_delete=$4 WHERE id=$5 RETURNING *", [can_view, can_create, can_edit, can_delete, req.params.id])).rows[0]);
};

export const createProduct = async (req, res) => {
  const product = (await query(
    `INSERT INTO products (name,category,sales_price,cost_price,uom,on_hand_qty,reorder_point,procurement_strategy,procure_on_demand,procurement_type,default_vendor_id,default_bom_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [req.body.name, req.body.category, req.body.sales_price || 0, req.body.cost_price || 0, req.body.uom || "unit", req.body.on_hand_qty || 0, req.body.reorder_point || 10, req.body.procurement_strategy || "mts", !!req.body.procure_on_demand, req.body.procurement_type || null, req.body.default_vendor_id || null, req.body.default_bom_id || null]
  )).rows[0];
  await query("INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'created','product',$2,$3)", [req.user.id, product.id, JSON.stringify({ name: product.name, category: product.category })]);
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = (await query(
    `UPDATE products SET name=$1, category=$2, sales_price=$3, cost_price=$4, uom=$5, on_hand_qty=$6, reorder_point=$7,
     procurement_strategy=$8, procure_on_demand=$9, procurement_type=$10, default_vendor_id=$11, default_bom_id=$12 WHERE id=$13 RETURNING *`,
    [req.body.name, req.body.category, req.body.sales_price || 0, req.body.cost_price || 0, req.body.uom || "unit", req.body.on_hand_qty || 0, req.body.reorder_point || 10, req.body.procurement_strategy || "mts", !!req.body.procure_on_demand, req.body.procurement_type || null, req.body.default_vendor_id || null, req.body.default_bom_id || null, req.params.id]
  )).rows[0];
  await query("INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'updated','product',$2,$3)", [req.user.id, product.id, JSON.stringify({ name: product.name })]);
  res.json(product);
};
export const removeProduct = async (req, res) => {
  await query("UPDATE products SET is_active=false WHERE id=$1", [req.params.id]);
  await query("INSERT INTO audit_logs (user_id,action,entity,entity_id) VALUES ($1,'deleted','product',$2)", [req.user.id, req.params.id]);
  res.status(204).end();
};
export const stockHistory = async (req, res) => res.json((await query("SELECT * FROM stock_ledger WHERE product_id=$1 ORDER BY id DESC", [req.params.id])).rows);

export const createSimple = (table, columns) => async (req, res) => {
  const values = columns.map((c) => req.body[c] ?? null);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(",");
  res.status(201).json((await query(`INSERT INTO ${table} (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`, values)).rows[0]);
};
export const updateSimple = (table, columns) => async (req, res) => {
  const sets = columns.map((c, i) => `${c}=$${i + 1}`).join(",");
  const values = columns.map((c) => req.body[c] ?? null);
  res.json((await query(`UPDATE ${table} SET ${sets} WHERE id=$${columns.length + 1} RETURNING *`, [...values, req.params.id])).rows[0]);
};
export const deleteSimple = (table) => async (req, res) => { await query(`DELETE FROM ${table} WHERE id=$1`, [req.params.id]); res.status(204).end(); };

export async function createSalesOrder(req, res) {
  const result = await withTransaction(async (client) => {
    const orderNumber = await nextNumber(client, "SO", "sales_orders", "order_number");
    const subtotal = req.body.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
    const tax = Math.round(subtotal * 18) / 100;
    const so = await client.query(
      `INSERT INTO sales_orders (order_number,customer_id,sales_user_id,payment_required,payment_status,subtotal,tax_total,total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [orderNumber, req.body.customer_id, req.user.id, !!req.body.payment_required, req.body.payment_required ? "pending" : "not_applicable", subtotal, tax, subtotal + tax]
    );
    for (const item of req.body.items) {
      await client.query("INSERT INTO sales_order_items (sales_order_id,product_id,quantity,unit_price,line_total) VALUES ($1,$2,$3,$4,$5)", [so.rows[0].id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
    }
    return so.rows[0];
  });
  res.status(201).json(result);
}

export async function salesOrderDetail(req, res) {
  const order = (await query("SELECT * FROM sales_orders WHERE id=$1", [req.params.id])).rows[0];
  const items = (await query("SELECT soi.*, p.name AS product_name FROM sales_order_items soi JOIN products p ON p.id=soi.product_id WHERE sales_order_id=$1", [req.params.id])).rows;
  res.json({ ...order, items });
}

export async function confirmSalesOrder(req, res) {
  const order = await withTransaction(async (client) => {
    const current = (await client.query("SELECT * FROM sales_orders WHERE id=$1 FOR UPDATE", [req.params.id])).rows[0];
    if (!current) throw new Error("Sales order not found");
    if (current.payment_required && current.payment_status !== "paid") throw new Error("Payment must be completed before confirmation");
    await runProcurementForSalesOrder(client, current.id, req.user.id);
    const updated = (await client.query("UPDATE sales_orders SET status='confirmed', updated_at=NOW() WHERE id=$1 RETURNING *", [current.id])).rows[0];
    await createNotification(client, { role: "business_owner", title: "Sales order confirmed", message: `${updated.order_number} is confirmed`, type: "order_status" });
    return updated;
  });
  emitToAll("order:status_changed", { type: "sales", id: order.id, status: order.status });
  res.json(order);
}

export async function deliverSalesOrder(req, res) {
  const updated = await withTransaction(async (client) => {
    const items = await client.query("SELECT * FROM sales_order_items WHERE sales_order_id=$1", [req.params.id]);
    let totalDelivered = 0;
    for (const item of items.rows) {
      // If no specific items passed, deliver all outstanding quantities
      const outstanding = Number(item.quantity) - Number(item.delivered_qty || 0);
      const qty = req.body.items?.length
        ? Number(req.body.items?.find((i) => Number(i.id) === Number(item.id))?.quantity || 0)
        : outstanding;
      if (qty > 0) {
        await moveStock(client, { productId: item.product_id, changeQty: -qty, reason: "Sales delivery", referenceType: "sales_order", referenceId: req.params.id });
        await client.query("UPDATE sales_order_items SET delivered_qty = delivered_qty + $1 WHERE id=$2", [qty, item.id]);
        await client.query("UPDATE products SET reserved_qty = GREATEST(0, reserved_qty - $1) WHERE id=$2", [qty, item.product_id]);
        totalDelivered += qty;
      }
    }
    const status = (await client.query("SELECT bool_and(delivered_qty >= quantity) AS done FROM sales_order_items WHERE sales_order_id=$1", [req.params.id])).rows[0].done ? "fully_delivered" : "partially_delivered";
    const so = (await client.query("UPDATE sales_orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, req.params.id])).rows[0];
    await client.query(
      "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'delivered','sales_order',$2,$3)",
      [req.user.id, req.params.id, JSON.stringify({ status, total_delivered: totalDelivered })]
    );
    await createNotification(client, { role: "business_owner", title: `Sales Order ${so.order_number} ${status.replace(/_/g, ' ')}`, message: `${totalDelivered} units delivered. Status: ${status.replace(/_/g, ' ')}`, type: "order_status" });
    return so;
  });
  emitToAll("order:status_changed", { type: "sales", id: updated.id, status: updated.status });
  res.json(updated);
}

export async function createPurchaseOrder(req, res) {
  const result = await withTransaction(async (client) => {
    const orderNumber = await nextNumber(client, "PO", "purchase_orders", "order_number");
    const total = req.body.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
    const po = await client.query("INSERT INTO purchase_orders (order_number,vendor_id,purchase_user_id,total) VALUES ($1,$2,$3,$4) RETURNING *", [orderNumber, req.body.vendor_id, req.user.id, total]);
    for (const item of req.body.items) await client.query("INSERT INTO purchase_order_items (purchase_order_id,product_id,quantity,unit_price,line_total) VALUES ($1,$2,$3,$4,$5)", [po.rows[0].id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
    return po.rows[0];
  });
  res.status(201).json(result);
}
export async function confirmPurchaseOrder(req, res) {
  const updated = await withTransaction(async (client) => {
    const po = (await client.query("UPDATE purchase_orders SET status='confirmed', updated_at=NOW() WHERE id=$1 RETURNING *", [req.params.id])).rows[0];
    if (!po) throw new Error("Purchase order not found");
    await client.query(
      "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'confirmed','purchase_order',$2,$3)",
      [req.user.id, req.params.id, JSON.stringify({ status: 'confirmed' })]
    );
    return po;
  });
  emitToAll("order:status_changed", { type: "purchase", id: updated.id, status: updated.status });
  res.json(updated);
}
export async function receivePurchaseOrder(req, res) {
  const updated = await withTransaction(async (client) => {
    const items = await client.query("SELECT * FROM purchase_order_items WHERE purchase_order_id=$1", [req.params.id]);
    let totalReceived = 0;
    for (const item of items.rows) {
      // If no specific items passed, receive ALL outstanding quantities
      const outstanding = Number(item.quantity) - Number(item.received_qty || 0);
      const qty = req.body.items?.length
        ? Number(req.body.items?.find((i) => Number(i.id) === Number(item.id))?.quantity || 0)
        : outstanding;
      if (qty > 0) {
        await moveStock(client, { productId: item.product_id, changeQty: qty, reason: "Purchase receipt", referenceType: "purchase_order", referenceId: req.params.id });
        await client.query("UPDATE purchase_order_items SET received_qty = received_qty + $1 WHERE id=$2", [qty, item.id]);
        totalReceived += qty;
      }
    }
    const status = (await client.query("SELECT bool_and(received_qty >= quantity) AS done FROM purchase_order_items WHERE purchase_order_id=$1", [req.params.id])).rows[0].done ? "fully_received" : "partially_received";
    const po = (await client.query("UPDATE purchase_orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [status, req.params.id])).rows[0];
    await client.query(
      "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'received','purchase_order',$2,$3)",
      [req.user.id, req.params.id, JSON.stringify({ status, total_received: totalReceived })]
    );
    await createNotification(client, { role: "inventory_manager", title: `Purchase ${po.order_number} ${status.replace(/_/g, ' ')}`, message: `${totalReceived} units received into inventory. Status: ${status.replace(/_/g, ' ')}`, type: "order_status" });
    return po;
  });
  emitToAll("order:status_changed", { type: "purchase", id: updated.id, status: updated.status });
  emitToAll("stock:updated", {});
  res.json(updated);
}

export async function completeManufacturingOrder(req, res) {
  const updated = await withTransaction(async (client) => {
    const mo = (await client.query("SELECT * FROM manufacturing_orders WHERE id=$1 FOR UPDATE", [req.params.id])).rows[0];
    if (!mo) throw new Error("Manufacturing order not found");
    if (mo.status === 'completed') throw new Error("Already completed");
    // Consume components
    if (mo.bom_id) {
      const components = await client.query("SELECT * FROM bom_components WHERE bom_id=$1", [mo.bom_id]);
      for (const c of components.rows) {
        await moveStock(client, { productId: c.component_product_id, changeQty: -Number(c.quantity) * Number(mo.quantity), reason: "Manufacturing consumption", referenceType: "manufacturing_order", referenceId: mo.id });
      }
    }
    // Produce finished goods
    await moveStock(client, { productId: mo.product_id, changeQty: mo.quantity, reason: "Manufacturing output", referenceType: "manufacturing_order", referenceId: mo.id });
    const result = (await client.query("UPDATE manufacturing_orders SET status='completed', completed_at=NOW() WHERE id=$1 RETURNING *", [mo.id])).rows[0];
    // Audit
    await client.query(
      "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'completed','manufacturing_order',$2,$3)",
      [req.user.id, mo.id, JSON.stringify({ mo_number: mo.mo_number, product_id: mo.product_id, quantity: mo.quantity })]
    );
    // Notify
    await createNotification(client, { role: "business_owner", title: `MO ${mo.mo_number} completed`, message: `${mo.quantity} unit(s) of product #${mo.product_id} produced and added to inventory.`, type: "order_status" });
    if (mo.triggered_by_sales_order_id) {
      await createNotification(client, { role: "sales_user", title: `Production complete — check Sales Order`, message: `Manufacturing for SO #${mo.triggered_by_sales_order_id} is done. ${mo.quantity} units now in stock.`, type: "order_status" });
    }
    return result;
  });
  emitToAll("order:status_changed", { type: "manufacturing", id: updated.id, status: updated.status });
  emitToAll("stock:updated", { productId: updated.product_id });
  res.json(updated);
}
export const updateWorkOrder = async (req, res) => res.json((await query("UPDATE work_orders SET status=$1 WHERE id=$2 AND manufacturing_order_id=$3 RETURNING *", [req.body.status, req.params.woId, req.params.id])).rows[0]);

export async function createBom(req, res) {
  const bom = await withTransaction(async (client) => {
    const b = (await client.query("INSERT INTO boms (product_id) VALUES ($1) RETURNING *", [req.body.product_id])).rows[0];
    for (const c of req.body.components || []) await client.query("INSERT INTO bom_components (bom_id,component_product_id,quantity) VALUES ($1,$2,$3)", [b.id, c.component_product_id, c.quantity]);
    for (const o of req.body.operations || []) await client.query("INSERT INTO bom_operations (bom_id,name,duration_minutes,work_center_id,sequence) VALUES ($1,$2,$3,$4,$5)", [b.id, o.name, o.duration_minutes, o.work_center_id, o.sequence || 0]);
    return b;
  });
  res.status(201).json(bom);
}

export const inventory = async (_req, res) => res.json((await query("SELECT id,name,category,on_hand_qty,reserved_qty,(on_hand_qty-reserved_qty) AS free_qty,reorder_point,procure_on_demand,procurement_type,default_vendor_id FROM products WHERE is_active=true ORDER BY name")).rows);
export const stockFlow = async (_req, res) => res.json((await query("SELECT reference_type, SUM(change_qty) AS quantity FROM stock_ledger GROUP BY reference_type ORDER BY reference_type")).rows);

export async function quickReorder(req, res) {
  try {
    const productId = req.params.id;
    const result = await withTransaction(async (client) => {
      const product = (await client.query("SELECT * FROM products WHERE id=$1", [productId])).rows[0];
      if (!product) throw new Error("Product not found");
      if (!product.default_vendor_id) throw new Error(`No default vendor set for ${product.name}. Please edit the product and set a Default Vendor first.`);

      const reorderQty = Math.max(1, Number(product.reorder_point) - Number(product.on_hand_qty) + Number(product.reorder_point));
      const poNumber = await nextNumber(client, "PO", "purchase_orders", "order_number");
      const total = reorderQty * Number(product.cost_price || 0);

      const po = (await client.query(
        `INSERT INTO purchase_orders (order_number, vendor_id, status, total, auto_generated)
         VALUES ($1, $2, 'draft', $3, true) RETURNING *`,
        [poNumber, product.default_vendor_id, total]
      )).rows[0];

      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [po.id, productId, reorderQty, product.cost_price || 0, total]
      );

      await client.query(
        "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'quick_reorder','product',$2,$3)",
        [req.user.id, productId, JSON.stringify({ po_number: poNumber, reorder_qty: reorderQty })]
      );

      await createNotification(client, { role: "purchase_user", title: `Quick reorder: ${poNumber}`, message: `PO created for ${reorderQty}× ${product.name} (below reorder point)`, type: "order_status" });

      return { ...po, product_name: product.name, reorder_qty: reorderQty };
    });

    emitToAll("procurement:triggered", { type: "quick_reorder", ...result });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message || "Reorder failed" });
  }
}

export const notifications = async (req, res) => res.json((await query("SELECT * FROM notifications WHERE user_id=$1 OR role=$2 OR role IN ('admin','business_owner') ORDER BY id DESC LIMIT 50", [req.user.id, req.user.role])).rows);
export const readNotification = async (req, res) => res.json((await query("UPDATE notifications SET is_read=true WHERE id=$1 RETURNING *", [req.params.id])).rows[0]);
export const readAllNotifications = async (req, res) => { await query("UPDATE notifications SET is_read=true WHERE user_id=$1 OR role=$2", [req.user.id, req.user.role]); res.json({ ok: true }); };

export async function createPaymentOrder(req, res) {
  try {
    const so = (await query("SELECT * FROM sales_orders WHERE id=$1", [req.body.sales_order_id])).rows[0];
    if (!so) return res.status(404).json({ message: "Sales order not found" });

    // Guard: Razorpay keys must be configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "your_test_key_id_here") {
      return res.status(503).json({ message: "Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend .env" });
    }

    const amountInPaise = Math.round(Number(so.total) * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({ message: "Order total must be at least ₹1 to process payment" });
    }

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const gateway = await razorpay.orders.create({ amount: amountInPaise, currency: "INR", receipt: so.order_number });
    const payment = (await query(
      "INSERT INTO payments (sales_order_id,gateway_order_id,amount,status) VALUES ($1,$2,$3,'created') RETURNING *",
      [so.id, gateway.id, so.total]
    )).rows[0];

    res.json({ ...payment, key_id: process.env.RAZORPAY_KEY_ID, gateway_order_id: gateway.id });
  } catch (err) {
    console.error("Payment create error:", err);
    res.status(500).json({ message: err.error?.description || err.message || "Payment creation failed" });
  }
}
export async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ message: "Invalid payment signature" });
  const result = await withTransaction(async (client) => {
    const payment = (await client.query("UPDATE payments SET status='success', gateway_payment_id=$1, updated_at=NOW() WHERE gateway_order_id=$2 RETURNING *", [razorpay_payment_id, razorpay_order_id])).rows[0];
    await client.query("UPDATE sales_orders SET payment_status='paid' WHERE id=$1", [payment.sales_order_id]);
    await runProcurementForSalesOrder(client, payment.sales_order_id, req.user.id);
    const so = (await client.query("UPDATE sales_orders SET status='confirmed', updated_at=NOW() WHERE id=$1 RETURNING *", [payment.sales_order_id])).rows[0];
    await createNotification(client, { role: "business_owner", title: "Payment received", message: `${so.order_number} payment succeeded`, type: "payment" });
    return { payment, sales_order: so };
  });
  emitToAll("payment:status_changed", result);
  res.json(result);
}
export async function cancelPayment(req, res) {
  const status = req.body.status === "failed" ? "failed" : "cancelled";
  const payment = (await query("UPDATE payments SET status=$1, updated_at=NOW() WHERE gateway_order_id=$2 RETURNING *", [status, req.body.gateway_order_id])).rows[0];
  if (payment) await query("UPDATE sales_orders SET payment_status=$1 WHERE id=$2", [status, payment.sales_order_id]);
  emitToAll("payment:status_changed", { payment });
  res.json(payment);
}

/**
 * simulatePayment — bypasses Razorpay for test/demo environments.
 * Directly marks the sales order as paid + confirmed and runs procurement.
 * Body: { sales_order_id }
 */
export async function simulatePayment(req, res) {
  try {
    const { sales_order_id } = req.body;
    if (!sales_order_id) return res.status(400).json({ message: "sales_order_id is required" });

    const so = (await query("SELECT * FROM sales_orders WHERE id=$1", [sales_order_id])).rows[0];
    if (!so) return res.status(404).json({ message: "Sales order not found" });

    if (so.payment_status === "paid") {
      return res.status(400).json({ message: "This order is already marked as paid." });
    }

    const result = await withTransaction(async (client) => {
      // Insert a simulated payment record
      const fakeGatewayId = `sim_order_${Date.now()}`;
      const fakePaymentId = `sim_pay_${Date.now()}`;

      const payment = (await client.query(
        `INSERT INTO payments (sales_order_id, gateway_order_id, gateway_payment_id, amount, status)
         VALUES ($1, $2, $3, $4, 'success') RETURNING *`,
        [so.id, fakeGatewayId, fakePaymentId, so.total]
      )).rows[0];

      // Mark order paid
      await client.query(
        "UPDATE sales_orders SET payment_status='paid', updated_at=NOW() WHERE id=$1",
        [so.id]
      );

      // Run procurement (triggers PO/MO if MTO or below reorder point)
      await runProcurementForSalesOrder(client, so.id, req.user.id);

      // Confirm the order
      const updated = (await client.query(
        "UPDATE sales_orders SET status='confirmed', updated_at=NOW() WHERE id=$1 RETURNING *",
        [so.id]
      )).rows[0];

      await createNotification(client, {
        role: "business_owner",
        title: "Simulated Payment Received",
        message: `${so.order_number} — test payment of ₹${Number(so.total).toLocaleString("en-IN")} marked as paid.`,
        type: "payment",
      });

      return { payment, sales_order: updated };
    });

    emitToAll("payment:status_changed", result);
    res.json(result);
  } catch (err) {
    console.error("Simulate payment error:", err);
    res.status(500).json({ message: err.message || "Simulate payment failed" });
  }
}


export async function dashboard(_req, res) {
  const [sales, purchase, manufacturing, lowStock, stockFlowRows, recentActivity] = await Promise.all([
    query("SELECT COUNT(*)::int AS count, COALESCE(SUM(total),0)::numeric AS total FROM sales_orders"),
    query("SELECT COUNT(*)::int AS count FROM purchase_orders"),
    query("SELECT COUNT(*)::int AS count FROM manufacturing_orders WHERE status <> 'completed'"),
    query("SELECT id,name,on_hand_qty,reorder_point FROM products WHERE is_active=true AND on_hand_qty <= reorder_point ORDER BY on_hand_qty"),
    query("SELECT reference_type, SUM(change_qty)::int AS quantity FROM stock_ledger GROUP BY reference_type"),
    query("SELECT a.*, u.name AS user_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 10")
  ]);
  res.json({ sales: sales.rows[0], purchase: purchase.rows[0], manufacturing: manufacturing.rows[0], lowStock: lowStock.rows, stockFlow: stockFlowRows.rows, recentActivity: recentActivity.rows });
}
