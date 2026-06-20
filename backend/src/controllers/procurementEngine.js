import { nextNumber } from "../utils/orderNumberGenerator.js";
import { reserveStock } from "../utils/stockLedger.js";
import { notifyRoles } from "../utils/notifications.js";
import { emitToAll } from "../config/socket.js";

/**
 * runProcurementForSalesOrder
 *
 * Called when a Sales Order is confirmed.
 * For each line item:
 *  1. Reserve available stock.
 *  2. Calculate shortage (ordered - reserved).
 *  3. If shortage > 0 AND procure_on_demand = true:
 *       • procurement_type = "purchase"  → auto-create PO
 *       • procurement_type = "manufacturing" → auto-create MO
 *  4. If shortage > 0 AND procure_on_demand = false:
 *       → Notify "Insufficient stock" but do NOT block order.
 */
export async function runProcurementForSalesOrder(client, salesOrderId, userId) {
  const items = await client.query(
    `SELECT soi.*, p.name, p.on_hand_qty, p.reserved_qty, p.procurement_strategy,
            p.procure_on_demand, p.procurement_type, p.default_vendor_id,
            p.default_bom_id, p.cost_price, p.reorder_point
     FROM sales_order_items soi
     JOIN products p ON p.id = soi.product_id
     WHERE soi.sales_order_id = $1`,
    [salesOrderId]
  );

  for (const item of items.rows) {
    const freeToUse = Math.max(0, Number(item.on_hand_qty) - Number(item.reserved_qty));
    const reserveQty = Math.min(freeToUse, Number(item.quantity));

    // Reserve available stock
    if (reserveQty > 0) {
      await reserveStock(client, item.product_id, reserveQty);
    }

    const shortage = Number(item.quantity) - reserveQty;

    // ── CASE 1: Sufficient stock ──────────────────────────────────────────
    if (shortage <= 0) continue;

    // ── CASE 2: Shortage, but procure_on_demand = false ───────────────────
    if (!item.procure_on_demand) {
      await notifyRoles(client, ["sales_user", "inventory_manager", "admin", "business_owner"], {
        title: "Insufficient stock — manual restock needed",
        message: `Sales Order #${salesOrderId}: ${item.name} is short by ${shortage} unit(s). Procure on Demand is OFF — manual restock required.`,
        type: "shortage_trigger",
      });
      await client.query(
        "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'insufficient_stock_warning','sales_order',$2,$3)",
        [userId, salesOrderId, JSON.stringify({ product: item.name, shortage, procure_on_demand: false })]
      );
      continue;
    }

    // ── CASE 3: Shortage + procure_on_demand = true ───────────────────────
    let createdNumber = null;
    let createdType = null;

    if (item.procurement_type === "purchase") {
      if (!item.default_vendor_id) {
        // No vendor → notify and skip
        await notifyRoles(client, ["purchase_user", "admin"], {
          title: "Cannot auto-procure — no default vendor",
          message: `${item.name} needs a vendor configured to auto-create a Purchase Order. Shortage: ${shortage} units.`,
          type: "shortage_trigger",
        });
        continue;
      }

      const poNumber = await nextNumber(client, "PO", "purchase_orders", "order_number");
      const po = await client.query(
        `INSERT INTO purchase_orders (order_number, vendor_id, status, total, auto_generated, triggered_by_sales_order_id)
         VALUES ($1, $2, 'draft', $3, true, $4) RETURNING id, order_number`,
        [poNumber, item.default_vendor_id, shortage * Number(item.cost_price || 0), salesOrderId]
      );
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [po.rows[0].id, item.product_id, shortage, item.cost_price || 0, shortage * Number(item.cost_price || 0)]
      );
      createdNumber = po.rows[0].order_number;
      createdType = "purchase_order";

      await notifyRoles(client, ["purchase_user", "admin", "business_owner"], {
        title: "Auto Purchase Order created",
        message: `Shortage of ${shortage}× ${item.name} (SO #${salesOrderId}) → ${createdNumber} created automatically.`,
        type: "shortage_trigger",
      });
      emitToAll("procurement:triggered", { salesOrderId, productId: item.product_id, shortage, createdNumber, type: "PO" });
    }

    if (item.procurement_type === "manufacturing") {
      if (!item.default_bom_id) {
        // No BoM → notify and skip
        await notifyRoles(client, ["manufacturing_user", "admin"], {
          title: "Cannot auto-manufacture — no default BoM",
          message: `${item.name} needs a Bill of Materials to auto-create a Manufacturing Order. Shortage: ${shortage} units.`,
          type: "shortage_trigger",
        });
        continue;
      }

      const moNumber = await nextNumber(client, "MO", "manufacturing_orders", "mo_number");
      const mo = await client.query(
        `INSERT INTO manufacturing_orders (mo_number, product_id, quantity, bom_id, status, auto_generated, triggered_by_sales_order_id)
         VALUES ($1, $2, $3, $4, 'draft', true, $5) RETURNING id, mo_number`,
        [moNumber, item.product_id, shortage, item.default_bom_id, salesOrderId]
      );

      // Copy BoM work orders
      const operations = await client.query(
        "SELECT * FROM bom_operations WHERE bom_id = $1 ORDER BY sequence",
        [item.default_bom_id]
      );
      for (const op of operations.rows) {
        await client.query(
          `INSERT INTO work_orders (manufacturing_order_id, operation_name, work_center_id, duration_minutes, sequence)
           VALUES ($1, $2, $3, $4, $5)`,
          [mo.rows[0].id, op.name, op.work_center_id, op.duration_minutes, op.sequence]
        );
      }

      createdNumber = mo.rows[0].mo_number;
      createdType = "manufacturing_order";

      await notifyRoles(client, ["manufacturing_user", "admin", "business_owner"], {
        title: "Auto Manufacturing Order created",
        message: `Shortage of ${shortage}× ${item.name} (SO #${salesOrderId}) → ${createdNumber} created automatically.`,
        type: "shortage_trigger",
      });
      emitToAll("procurement:triggered", { salesOrderId, productId: item.product_id, shortage, createdNumber, type: "MO" });
    }

    // Audit: procurement triggered
    if (createdNumber) {
      await client.query(
        "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'auto_procurement_triggered','sales_order',$2,$3)",
        [userId, salesOrderId, JSON.stringify({ product: item.name, shortage, createdNumber, createdType })]
      );
    }
  }
}
