import { query } from "../config/db.js";

export function checkPermission(module, action = "view") {
  return async (req, res, next) => {
    if (!req.user || req.user.role === "pending") return res.status(403).json({ message: "Awaiting admin approval" });
    const column = `can_${action}`;
    if (!["can_view", "can_create", "can_edit", "can_delete"].includes(column)) return res.status(400).json({ message: "Invalid permission action" });
    const { rows } = await query(`SELECT ${column} AS allowed FROM role_permissions WHERE role = $1 AND module = $2`, [req.user.role, module]);
    if (!rows[0]?.allowed) return res.status(403).json({ message: "Permission denied" });
    next();
  };
}
