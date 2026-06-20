import { useEffect, useState } from "react";
import { Save, Bell, BellOff, Users, Shield, BookUser, CheckCheck } from "lucide-react";
import { api } from "../../api/client";

const ROLES = ["pending","admin","sales_user","purchase_user","manufacturing_user","inventory_manager","business_owner"];

const ROLE_COLORS = {
  admin: "#c2703d", sales_user: "#2563eb", purchase_user: "#7c3aed",
  manufacturing_user: "#15803d", inventory_manager: "#0e7490",
  business_owner: "#92400e", pending: "#64748b",
};

export default function UsersRoles() {
  const [tab, setTab]                   = useState("users");
  const [users, setUsers]               = useState([]);
  const [perms, setPerms]               = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers]       = useState([]);
  const [searchVal, setSearchVal]       = useState("");

  async function loadAll() {
    const [u, p] = await Promise.all([api.get("/users"), api.get("/permissions")]);
    setUsers(u.data);
    setPerms(p.data);
    loadNotifs();
    api.get("/customers").then((r) => setCustomers(r.data)).catch(() => {});
  }

  async function loadNotifs() {
    try { setNotifications((await api.get("/notifications")).data); } catch (_) {}
  }

  useEffect(() => { loadAll(); }, []);

  /* Listen to global search */
  useEffect(() => {
    function onSearch(e) { setSearchVal(e.detail); }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, []);

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    loadNotifs();
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    loadNotifs();
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  const filteredUsers = searchVal
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchVal.toLowerCase())
      )
    : users;

  const TABS = [
    { id: "users",     icon: <Users size={15} />,   label: "Users" },
    { id: "perms",     icon: <Shield size={15} />,  label: "Permissions" },
    { id: "notifs",    icon: <Bell size={15} />,    label: `Notifications${unread > 0 ? ` (${unread})` : ""}` },
    { id: "customers", icon: <BookUser size={15} />,label: "Customer Book" },
  ];

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Admin Panel</h2>
        {unread > 0 && (
          <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "7px 16px", color: "#c2703d", fontSize: 14, fontWeight: 700 }}>
            🔔 {unread} unread notification{unread !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map(({ id, icon, label }) => (
          <button
            key={id}
            className={`admin-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <>
          {searchVal && (
            <p className="search-results-hint">
              {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: ROLE_COLORS[u.role] || "#64748b",
                        display: "grid", placeItems: "center",
                        fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0,
                      }}>
                        {(u.name || "U")[0].toUpperCase()}
                      </div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        await api.patch(`/users/${u.id}/assign-role`, { role: e.target.value });
                        loadAll();
                      }}
                      style={{ fontWeight: 600, color: ROLE_COLORS[u.role] || "#64748b", minWidth: 160 }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={u.is_active ? "pill-confirmed" : "pill-cancelled"}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-action ${u.is_active ? "btn-delete" : "btn-confirm"}`}
                      onClick={async () => { await api.patch(`/users/${u.id}/toggle-active`); loadAll(); }}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── PERMISSIONS TAB ── */}
      {tab === "perms" && (
        <table>
          <thead>
            <tr>
              <th>Role</th><th>Module</th>
              <th style={{ textAlign: "center" }}>View</th>
              <th style={{ textAlign: "center" }}>Create</th>
              <th style={{ textAlign: "center" }}>Edit</th>
              <th style={{ textAlign: "center" }}>Delete</th>
              <th>Save</th>
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p.id}>
                <td>
                  <span style={{ fontWeight: 700, color: ROLE_COLORS[p.role] || "#64748b", textTransform: "capitalize" }}>
                    {p.role.replace(/_/g, " ")}
                  </span>
                </td>
                <td>{p.module}</td>
                {["can_view","can_create","can_edit","can_delete"].map((k) => (
                  <td key={k} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={!!p[k]}
                      onChange={(e) =>
                        setPerms(perms.map((x) => x.id === p.id ? { ...x, [k]: e.target.checked } : x))
                      }
                      style={{ accentColor: "#c2703d", width: 16, height: 16 }}
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="btn-action btn-confirm"
                    onClick={async () => { await api.patch(`/permissions/${p.id}`, p); loadAll(); }}
                  >
                    <Save size={13} /> Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === "notifs" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 15 }}>{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</strong>
            {unread > 0 && (
              <button className="btn-action btn-confirm" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h3>No notifications yet</h3>
              <p>System notifications appear here as events happen</p>
            </div>
          ) : notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.is_read ? "white" : "#fff7ed",
                border: `1px solid ${n.is_read ? "#e2e8f0" : "#fed7aa"}`,
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{n.title}</div>
                <div style={{ fontSize: 14, color: "#64748b" }}>{n.message}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  {new Date(n.created_at).toLocaleString("en-IN")}
                </div>
              </div>
              {!n.is_read && (
                <button className="btn-action btn-edit" onClick={() => markRead(n.id)} style={{ flexShrink: 0 }}>
                  <Bell size={13} /> Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CUSTOMERS TAB ── */}
      {tab === "customers" && (
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No customers yet</h3>
                    <p>Customers are added when creating sales orders</p>
                  </div>
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td style={{ color: "#64748b" }}>{c.email || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td style={{ color: "#64748b", fontSize: 13 }}>{c.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
