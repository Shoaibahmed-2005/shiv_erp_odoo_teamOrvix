import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Inventory() {
  const [rows, setRows]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading]   = useState(true);
  const [reordering, setReordering] = useState({});
  const [toast, setToast]       = useState(null);
  const { socket }              = useOutletContext() || {};
  const { can }                 = useAuth();

  async function load() {
    try {
      const { data } = await api.get("/inventory");
      setRows(data);
      applySearch(data, sessionStorage.getItem("erp_search") || "");
    } finally {
      setLoading(false);
    }
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((p) =>
      p.name?.toLowerCase().includes(lq) ||
      p.category?.toLowerCase().includes(lq)
    ));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onSearch(e) { setSearchVal(e.detail); applySearch(rows, e.detail); }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, [rows]);

  useEffect(() => {
    if (!socket) return;
    socket.on("stock:updated", load);
    socket.on("procurement:triggered", load);
    return () => { socket.off("stock:updated", load); socket.off("procurement:triggered", load); };
  }, [socket]);

  async function reorder(product) {
    if (reordering[product.id]) return;
    setReordering((r) => ({ ...r, [product.id]: true }));
    try {
      const { data } = await api.post(`/inventory/reorder/${product.id}`);
      showToast(`✅ PO ${data.order_number} created for ${data.reorder_qty}× ${product.name}`);
      load();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || "Reorder failed"}`, "error");
    } finally {
      setReordering((r) => ({ ...r, [product.id]: false }));
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const display  = searchVal ? filtered : rows;
  const lowCount = display.filter((p) => p.on_hand_qty <= p.reorder_point).length;

  if (loading) return <div className="boot">Loading inventory…</div>;

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 28, zIndex: 999,
          background: toast.type === "error" ? "#fef2f2" : "#dcfce7",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          borderRadius: 12, padding: "12px 20px",
          color: toast.type === "error" ? "#dc2626" : "#15803d",
          fontWeight: 600, fontSize: 14,
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          animation: "popIn 0.2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Inventory</h2>
          {searchVal && <p className="search-results-hint">{display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"</p>}
        </div>
        {lowCount > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "8px 16px", color: "#dc2626", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
            <AlertTriangle size={15} /> {lowCount} item{lowCount !== 1 ? "s" : ""} below reorder point
          </div>
        )}
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>{searchVal ? "No products match your search" : "No inventory records found"}</h3>
          <p>{searchVal ? "Try a different keyword" : "Products appear here once added to the system"}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Free to Use</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {display.map((p) => {
              const isLow  = p.on_hand_qty <= p.reorder_point;
              const freeQty = p.free_qty ?? (p.on_hand_qty - p.reserved_qty);
              return (
                <tr key={p.id} className={isLow ? "dangerRow" : ""}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>{p.name}</strong>
                      {p.procure_on_demand && (
                        <span title="Procurement on Demand enabled" style={{ fontSize: 10, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 999, padding: "1px 7px", fontWeight: 700 }}>
                          POD
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td><strong style={{ color: isLow ? "#dc2626" : "inherit" }}>{p.on_hand_qty}</strong></td>
                  <td>{p.reserved_qty}</td>
                  <td><strong>{freeQty}</strong></td>
                  <td>{p.reorder_point}</td>
                  <td>
                    {isLow
                      ? <span className="pill-cancelled"><AlertTriangle size={11} style={{ display: "inline", marginRight: 3 }} />Low Stock</span>
                      : <span className="pill-confirmed"><CheckCircle size={11} style={{ display: "inline", marginRight: 3 }} />OK</span>}
                  </td>
                  <td>
                    {isLow && can("Inventory", "edit") && (
                      <button
                        className="btn-action btn-confirm"
                        onClick={() => reorder(p)}
                        disabled={!!reordering[p.id]}
                        title="Create a Purchase Order to restock this product"
                      >
                        {reordering[p.id]
                          ? <span style={{ width: 11, height: 11, border: "2px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                          : <ShoppingCart size={12} />}
                        {reordering[p.id] ? "…" : "Reorder"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
