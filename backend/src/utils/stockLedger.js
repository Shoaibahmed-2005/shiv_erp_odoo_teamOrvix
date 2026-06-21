import { emitToAll } from "../config/socket.js";
import { createNotification } from "./notifications.js";

export async function moveStock(client, { productId, changeQty, reason, referenceType, referenceId }) {
  const { rows } = await client.query("SELECT id, name, on_hand_qty, reorder_point FROM products WHERE id = $1 FOR UPDATE", [productId]);
  if (!rows.length) throw new Error("Product not found");
  const product = rows[0];
  const balance = Number(product.on_hand_qty) + Number(changeQty);
  if (balance < 0) throw new Error(`Insufficient stock for ${product.name}`);
  await client.query("UPDATE products SET on_hand_qty = $1 WHERE id = $2", [balance, productId]);
  const ledger = await client.query(
    `INSERT INTO stock_ledger (product_id, change_qty, reason, reference_type, reference_id, balance_after)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [productId, changeQty, reason, referenceType, referenceId, balance]
  );
  if (balance <= Number(product.reorder_point)) {
    await createNotification(client, {
      role: "inventory_manager",
      title: "Low stock alert",
      message: `${product.name} is at ${balance}, below reorder point ${product.reorder_point}`,
      type: "low_stock"
    });
  }
  emitToAll("stock:updated", { productId, balance });
  return ledger.rows[0];
}

export async function reserveStock(client, productId, qty) {
  if (qty <= 0) return;
  // NOTE: Do NOT emit stock:updated here — this runs inside a transaction.
  // The caller emits AFTER commit to avoid the frontend reading stale data.
  await client.query("UPDATE products SET reserved_qty = reserved_qty + $1 WHERE id = $2", [qty, productId]);
}
