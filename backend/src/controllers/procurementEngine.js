import { nextNumber } from "../utils/orderNumberGenerator.js";
import { reserveStock } from "../utils/stockLedger.js";
import { notifyRoles } from "../utils/notifications.js";
import { emitToAll } from "../config/socket.js";

export async function runProcurementForSalesOrder(client, salesOrderId, userId) {
  const items = await client.query(
    `SELECT soi.*, p.name, p.on_hand_qty, p.reserved_qty, p.procurement_strategy, p.procure_on_demand,
            p.procurement_type, p.default_vendor_id, p.default_bom_id, p.cost_price
     FROM sales_order_items soi JOIN products p ON p.id = soi.product_id WHERE soi.sales_order_id = $1`,
    [salesOrderId]
  );

  for (const item of items.rows) {
    const freeToUse = Math.max(0, Number(item.on_hand_qty) - Number(item.reserved_qty));
    const reserveQty = Math.min(freeToUse, Number(item.quantity));
    await reserveStock(client, item.product_id, reserveQty);
    await client.query(
      `INSERT INTO stock_ledger (product_id, change_qty, reason, reference_type, reference_id, balance_after)
       VALUES ($1,$2,$3,'sales_order',$4,$5)`,
      [item.product_id, 0, `Reserved ${reserveQty} for sales order`, salesOrderId, item.on_hand_qty]
    );

    const shortage = Number(item.quantity) - reserveQty;
    if (shortage <= 0) continue;
    if (item.procurement_strategy !== "mto" || !item.procure_on_demand) continue;

    let createdNumber = null;
    if (item.procurement_type === "purchase") {
      if (!item.default_vendor_id) throw new Error(`${item.name} has no default vendor`);
      const poNumber = await nextNumber(client, "PO", "purchase_orders", "order_number");
      const po = await client.query(
        `INSERT INTO purchase_orders (order_number,vendor_id,status,total,auto_generated,triggered_by_sales_order_id)
         VALUES ($1,$2,'draft',$3,true,$4) RETURNING id, order_number`,
        [poNumber, item.default_vendor_id, shortage * Number(item.cost_price || 0), salesOrderId]
      );
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id,product_id,quantity,unit_price,line_total) VALUES ($1,$2,$3,$4,$5)`,
        [po.rows[0].id, item.product_id, shortage, item.cost_price || 0, shortage * Number(item.cost_price || 0)]
      );
      createdNumber = po.rows[0].order_number;
      await notifyRoles(client, ["purchase_user", "admin", "business_owner"], { title: "Auto purchase order created", message: `Shortage of ${shortage} units of ${item.name}: ${createdNumber}`, type: "shortage_trigger" });
    }

    if (item.procurement_type === "manufacturing") {
      if (!item.default_bom_id) throw new Error(`${item.name} has no default BoM`);
      const moNumber = await nextNumber(client, "MO", "manufacturing_orders", "mo_number");
      const mo = await client.query(
        `INSERT INTO manufacturing_orders (mo_number,product_id,quantity,bom_id,status,auto_generated,triggered_by_sales_order_id)
         VALUES ($1,$2,$3,$4,'draft',true,$5) RETURNING id, mo_number`,
        [moNumber, item.product_id, shortage, item.default_bom_id, salesOrderId]
      );
      const operations = await client.query("SELECT * FROM bom_operations WHERE bom_id = $1 ORDER BY sequence", [item.default_bom_id]);
      for (const op of operations.rows) {
        await client.query(
          `INSERT INTO work_orders (manufacturing_order_id,operation_name,work_center_id,duration_minutes,sequence) VALUES ($1,$2,$3,$4,$5)`,
          [mo.rows[0].id, op.name, op.work_center_id, op.duration_minutes, op.sequence]
        );
      }
      createdNumber = mo.rows[0].mo_number;
      await notifyRoles(client, ["manufacturing_user", "admin", "business_owner"], { title: "Auto manufacturing order created", message: `Shortage of ${shortage} units of ${item.name}: ${createdNumber}`, type: "shortage_trigger" });
    }

    await client.query(
      "INSERT INTO audit_logs (user_id,action,entity,entity_id,new_value) VALUES ($1,'auto_procurement_triggered','sales_order',$2,$3)",
      [userId, salesOrderId, JSON.stringify({ product_id: item.product_id, shortage, createdNumber })]
    );
    emitToAll("procurement:triggered", { salesOrderId, productId: item.product_id, shortage, createdNumber });
  }
}
