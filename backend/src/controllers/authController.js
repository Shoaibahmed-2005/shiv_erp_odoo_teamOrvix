import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await query(
    "INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'pending') RETURNING id,name,email,role,is_active",
    [name, email, hash]
  );
  res.status(201).json({ user: rows[0], token: sign(rows[0]) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.is_active) return res.status(403).json({ message: "Account inactive" });
  delete user.password_hash;
  res.json({ user, token: sign(user) });
}

export async function me(req, res) {
  const permissions = await query("SELECT module, can_view, can_create, can_edit, can_delete FROM role_permissions WHERE role = $1", [req.user.role]);
  res.json({ user: req.user, permissions: permissions.rows });
}
