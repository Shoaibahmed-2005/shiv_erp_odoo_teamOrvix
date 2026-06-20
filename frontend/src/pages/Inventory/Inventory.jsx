import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../api/client";

export default function Inventory() {
  const [rows, setRows]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading]   = useState(true);
  const { socket }              = useOutletContext() || {};

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
    return () => socket.off("stock:updated", load);
  }, [socket]);

  const display = searchVal ? filtered : rows;
  const lowCount = display.filter((p) => p.on_hand_qty <= p.reorder_point).length;

  if (loading) return <div className="boot">Loading inventory…</div>;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Inventory</h2>
          {searchVal && (
            <p className="search-results-hint">
              {display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
        </div>
        {lowCount > 0 && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "8px 16px", color: "#dc2626", fontSize: 14, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            ⚠ {lowCount} item{lowCount !== 1 ? "s" : ""} below reorder point
          </div>
        )}
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>{searchVal ? "No products match your search" : "No inventory records found"}</h3>
          <p>
            {searchVal
              ? "Try a different keyword"
              : "Products will appear here once they are added to the system"}
          </p>
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
            </tr>
          </thead>
          <tbody>
            {display.map((p) => (
              <tr key={p.id} className={p.on_hand_qty <= p.reorder_point ? "dangerRow" : ""}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{p.on_hand_qty}</td>
                <td>{p.reserved_qty}</td>
                <td><strong>{p.free_qty ?? (p.on_hand_qty - p.reserved_qty)}</strong></td>
                <td>{p.reorder_point}</td>
                <td>
                  {p.on_hand_qty <= p.reorder_point
                    ? <span className="pill-cancelled">Low Stock</span>
                    : <span className="pill-confirmed">OK</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
