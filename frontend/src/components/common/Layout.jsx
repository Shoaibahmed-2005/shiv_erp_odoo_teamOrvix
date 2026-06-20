import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes, ChartNoAxesCombined, ClipboardList, Factory,
  FileClock, LayoutDashboard, LogOut, Package,
  Search, Settings, Shield, ShoppingCart, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useSocket } from "../../hooks/useSocket";

/* Which roles can see each nav item */
const ALL_LINKS = [
  ["/",             "Dashboard",         "Dashboard",       LayoutDashboard,       ["admin","sales_user","purchase_user","manufacturing_user","inventory_manager","business_owner"]],
  ["/products",     "Products",          "Products",        Package,               ["admin","sales_user","purchase_user","manufacturing_user","inventory_manager","business_owner"]],
  ["/sales",        "Sales Orders",      "Sales",           ShoppingCart,          ["admin","sales_user","business_owner"]],
  ["/purchase",     "Purchase Orders",   "Purchase",        ClipboardList,         ["admin","purchase_user","business_owner","inventory_manager"]],
  ["/manufacturing","Manufacturing",     "Manufacturing",   Factory,               ["admin","manufacturing_user","business_owner"]],
  ["/boms",         "Bill of Materials", "BoM",             Boxes,                 ["admin","manufacturing_user","business_owner"]],
  ["/inventory",    "Inventory",         "Inventory",       ChartNoAxesCombined,   ["admin","inventory_manager","business_owner","sales_user","purchase_user","manufacturing_user"]],
  ["/audit",        "Audit Logs",        "Audit Logs",      FileClock,             ["admin","business_owner"]],
  ["/admin",        "Users & Roles",     "Users",           Shield,                ["admin"]],
];

const PAGE_META = {
  "/":              ["Dashboard",         "Live snapshot of all operations"],
  "/products":      ["Products",          "Catalog, pricing, stock, and procurement strategy"],
  "/sales":         ["Sales Orders",      "Customer orders, payments, and deliveries"],
  "/purchase":      ["Purchase Orders",   "Vendor ordering, receipts, and follow-up"],
  "/manufacturing": ["Manufacturing",     "Work orders and production progress"],
  "/boms":          ["Bill of Materials", "Components and operations for manufactured products"],
  "/inventory":     ["Inventory",         "On-hand, reserved, and reorder alerts"],
  "/audit":         ["Audit Logs",        "Traceable business changes and history"],
  "/admin":         ["Users & Roles",     "Approvals, roles, and access rights"],
};

const ROLE_COLORS = {
  admin: "#c2703d",
  sales_user: "#2563eb",
  purchase_user: "#7c3aed",
  manufacturing_user: "#15803d",
  inventory_manager: "#0e7490",
  business_owner: "#92400e",
  pending: "#64748b",
};

export default function Layout() {
  const auth = useAuth();
  const socket = useSocket(auth.user);
  const location = useLocation();
  const nav = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const role = auth.user?.role || "pending";
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const roleColor = ROLE_COLORS[role] || "#64748b";
  const initial = (auth.user?.name || "U")[0].toUpperCase();

  const [title, subtitle] = PAGE_META[location.pathname] || PAGE_META["/"];

  /* Only show links the current role is allowed to see */
  const visibleLinks = ALL_LINKS.filter(([, , , , roles]) => roles.includes(role));

  /* Broadcast search to all pages via CustomEvent */
  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchVal(val);
    sessionStorage.setItem("erp_search", val);
    window.dispatchEvent(new CustomEvent("erp:search", { detail: val }));
  }

  function clearSearch() {
    setSearchVal("");
    sessionStorage.removeItem("erp_search");
    window.dispatchEvent(new CustomEvent("erp:search", { detail: "" }));
  }

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <img
            src="/logo.png"
            alt="Shiv Furniture"
            style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 10, background: "rgba(255,255,255,0.1)", padding: 4, flexShrink: 0 }}
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "grid"; }}
          />
          <span style={{ display: "none", width: 38, height: 38, borderRadius: 10, background: "var(--color-secondary)", color: "white", fontWeight: 800, fontSize: 16, placeItems: "center", flexShrink: 0 }}>SF</span>
          <div>
            <strong>Shiv Furniture</strong>
            <small>ERP v1.0</small>
          </div>
        </div>

        {/* User badge */}
        <div style={{ margin: "0 8px 18px", padding: "10px 13px", background: "rgba(255,255,255,0.07)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: roleColor, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auth.user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{roleLabel}</div>
          </div>
        </div>

        {/* Nav */}
        <nav>
          {visibleLinks.map(([to, label, , Icon]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div className="sidebar-foot" onClick={() => setSettingsOpen(true)}>
          <Settings size={17} /> Settings
        </div>
        <div className="sidebar-logout" onClick={() => { auth.logout(); nav("/login"); }}>
          <LogOut size={17} /> Logout
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="workspace">
        <header className="topbar">
          <div className="page-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="top-actions">
            <div className="searchBox">
              <Search size={17} />
              <input
                placeholder="Search orders, products, vendors…"
                value={searchVal}
                onChange={handleSearchChange}
              />
              {searchVal && (
                <button
                  onClick={clearSearch}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", padding: 0, width: "auto", height: "auto", cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <NotificationBell socket={socket} />

            {/* User chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 13px", borderRadius: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", cursor: "default" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: roleColor, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {initial}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{auth.user?.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{roleLabel}</div>
              </div>
            </div>
          </div>
        </header>

        <Outlet context={{ socket, searchVal }} />
      </main>

      {/* ── SETTINGS DRAWER ── */}
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>⚙️ Settings</h2>
              <button className="iconButton ghost" onClick={() => setSettingsOpen(false)}>
                <X size={17} />
              </button>
            </div>

            <div className="settings-section">
              <h4>Account</h4>
              <p>Name: <strong>{auth.user?.name}</strong></p>
              <p>Email: <strong>{auth.user?.email}</strong></p>
              <p>Role: <strong style={{ textTransform: "capitalize" }}>{roleLabel}</strong></p>
            </div>

            <div className="settings-section">
              <h4>System Info</h4>
              <p>Shiv Furniture ERP — v1.0</p>
              <p>All times shown in IST (Asia/Kolkata)</p>
              <p>Real-time updates via Socket.io</p>
            </div>

            {role === "admin" && (
              <div className="settings-section">
                <h4>Admin Quick Links</h4>
                <button
                  className="btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => { nav("/admin"); setSettingsOpen(false); }}
                >
                  Manage Users & Roles
                </button>
              </div>
            )}

            <button
              className="btn-ghost"
              style={{ width: "100%", marginTop: 8, gap: 8 }}
              onClick={() => { auth.logout(); nav("/login"); }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
