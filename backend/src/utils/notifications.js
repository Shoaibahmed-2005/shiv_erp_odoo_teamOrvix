import { emitNotification } from "../config/socket.js";

export async function createNotification(client, { userId = null, role = null, title, message, type = "system" }) {
  const { rows } = await client.query(
    `INSERT INTO notifications (user_id, role, title, message, type) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, role, title, message, type]
  );
  emitNotification(rows[0]);
  return rows[0];
}

export async function notifyRoles(client, roles, payload) {
  for (const role of roles) await createNotification(client, { ...payload, role });
}
