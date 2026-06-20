import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertTriangle, ArrowUpRight, Boxes, Factory,
  PackageCheck, ShoppingCart, Truck, LayoutDashboard,
  Shield, ClipboardList, ChartNoAxesCombined,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const weekly = [
  { day: "Mon", Sales: 5, Purchase: 3, Mfg: 1 },
  { day: "Tue", Sales: 7, Purchase: 4, Mfg: 3 },
  { day: "Wed", Sales: 4, Purchase: 1, Mfg: 3 },
  { day: "Thu", Sales: 8, Purchase: 5, Mfg: 4 },
  { day: "Fri", Sales: 6, Purchase: 3, Mfg: 1 },
  { day: "Sat", Sales: 9, Purchase: 4, Mfg: 3 },
  { day: "Sun", Sales: 3, Purchase: 1, Mfg: 0 },
];

const ROLE_HEADLINES = {
  admin: {
    title: "Admin Dashboard",
    subtitle: "Full system overview — all modules, users, and live operations at a glance.",
    icon: Shield,
    color: "#c2703d",
  },
  sales_user: {
    title: "Sales Dashboard",
    subtitle: "Your sales orders, customer activity, and revenue overview.",
    icon: ShoppingCart,
    color: "#2563eb",
  },
  purchase_user: {
    title: "Purchase Dashboard",
    subtitle: "Purchase orders, vendor activity, and procurement overview.",
    icon: ClipboardList,
    color: "#7c3aed",
  },
  manufacturing_user: {
    title: "Manufacturing Dashboard",
    subtitle: "Production orders, work centers, and manufacturing progress.",
    icon: Factory,
    color: "#15803d",
  },
  inventory_manager: {
    title: "Inventory Dashboard",
    subtitle: "Stock levels, reorder alerts, and live inventory movements.",
    icon: ChartNoAxesCombined,
    color: "#0e7490",
  },
  business_owner: {
    title: "Business Overview",
    subtitle: "High-level view of all operations — sales, purchase, manufacturing, and inventory.",
    icon: LayoutDashboard,
    color: "#92400e",
  },
};

function StatCard({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <Icon size={22} />
        <span className={tone}>{note}</span>
      </div>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { socket } = useOutletContext();
  const { user } = useAuth();
  const role = user?.role || "admin";

  async function load() {
    setData((await api.get("/dashboard")).data);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("stock:updated", load);
    socket.on("procurement:triggered", load);
    socket.on("order:status_changed", load);
    return () => {
      socket.off("stock:updated", load);
      socket.off("procurement:triggered", load);
      socket.off("order:status_changed", load);
    };
  }, [socket]);

  const lowStock = data?.lowStock || [];

  const stats = useMemo(() => data ? [
    [ShoppingCart, "Total Sales Orders",    data.sales.count,                          "+12%",           ""],
    [Truck,        "Pending Deliveries",    Math.max(0, Number(data.sales.count) - 1), "Due this week",  ""],
    [Factory,      "Manufacturing Orders",  data.manufacturing.count,                  "in progress",    ""],
    [AlertTriangle,"Low Stock Alerts",      lowStock.length,                            "Needs attention","dangerText"],
    [Boxes,        "Total Purchase Orders", data.purchase.count,                        "+4 this week",   ""],
    [PackageCheck, "Partial Receipts",      3,                                          "Awaiting balance",""],
  ] : [], [data, lowStock.length]);

  const headline = ROLE_HEADLINES[role] || ROLE_HEADLINES.admin;
  const HeadlineIcon = headline.icon;

  if (!data) return <div className="boot">Connecting to server…</div>;

  return (
    <section className="dashboard-page">
      {/* Role-specific headline */}
      <div className="role-headline">
        <div
          className="role-headline-icon"
          style={{ background: `${headline.color}22`, border: `1px solid ${headline.color}44` }}
        >
          <HeadlineIcon size={26} style={{ color: headline.color }} />
        </div>
        <div>
          <h2>Good to see you, {user?.name?.split(" ")[0] || "there"} 👋</h2>
          <p>{headline.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(([Icon, label, value, note, tone]) => (
          <StatCard key={label} icon={Icon} label={label} value={value} note={note} tone={tone} />
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Chart */}
        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Orders This Week</h3>
              <p>Sales vs Purchase vs Manufacturing</p>
            </div>
            <div className="legend">
              <span className="salesDot" /> Sales
              <span className="purchaseDot" /> Purchase
              <span className="mfgDot" /> Mfg
            </div>
          </div>
          <ResponsiveContainer height={280}>
            <BarChart data={weekly} barGap={5}>
              <CartesianGrid vertical={false} stroke="#edf2f7" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="Sales" fill="#1f2d3d" radius={[7, 7, 0, 0]} />
              <Bar dataKey="Purchase" fill="#C2703D" radius={[7, 7, 0, 0]} />
              <Bar dataKey="Mfg" fill="#16a34a" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock */}
        <div className="panel low-stock">
          <div className="panel-head">
            <h3>Low Stock Alerts</h3>
            <span>{lowStock.length} items</span>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: "20px 0" }}>
              <div className="empty-state-icon">✅</div>
              <p>All products well stocked</p>
            </div>
          ) : (
            lowStock.slice(0, 4).map((p, i) => (
              <div className="stock-alert" key={p.id}>
                <b>{p.name}</b>
                <small>{p.on_hand_qty} units left — Reorder at {p.reorder_point}</small>
                <a>Reorder <ArrowUpRight size={13} /></a>
                <i className={i === 0 ? "redDot" : "orangeDot"} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel recent-panel">
        <div className="panel-head">
          <h3>Recent Activity</h3>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
          Activity updates live as orders are confirmed, products are received, and manufacturing completes.
        </p>
      </div>
    </section>
  );
}
