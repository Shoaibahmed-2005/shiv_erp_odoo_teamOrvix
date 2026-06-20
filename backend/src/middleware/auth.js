import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Missing token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query("SELECT id, name, email, role, is_active FROM users WHERE id = $1", [payload.id]);
    if (!rows.length || !rows[0].is_active) return res.status(401).json({ message: "Inactive account" });
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
