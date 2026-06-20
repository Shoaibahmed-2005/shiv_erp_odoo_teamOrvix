import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useOutletContext } from "react-router-dom";

const STATUS_CLASS = {
  draft:         "pill-draft",
  in_progress:   "pill-in_progress",
  quality_check: "pill-pending",
  completed:     "pill-confirmed",
  cancelled:     "pill-cancelled",
};

export default function ManufacturingBoard() {
  const [rows, setRows]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const { socket }                = useOutletContext() || {};
  const { can }                   = useAuth();

  async function load() {
    const { data } = await api.get("/manufacturing-orders");
    setRows(data);
    applySearch(data, sessionStorage.getItem("erp_search") || "");
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((o) =>
      o.mo_number?.toLowerCase().includes(lq) ||
      o.product_name?.toLowerCase().includes(lq) ||
      o.status?.includes(lq)
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
    socket.on("order:status_changed", load);
    socket.on("procurement:triggered", load);
    return () => { socket.off("order:status_changed", load); socket.off("procurement:triggered", load); };
  }, [socket]);

  async function complete(id) {
    try { await api.post(`/manufacturing-orders/${id}/complete`); load(); }
    catch (err) { alert(err.response?.data?.message || "Cannot complete — check BoM components."); }
  }

  const display = searchVal ? filtered : rows;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Manufacturing Orders</h2>
          {searchVal && (
            <p className="search-results-hint">
              {display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
        </div>
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏭</div>
          <h3>{searchVal ? "No MOs match your search" : "No manufacturing orders yet"}</h3>
          <p>Manufacturing orders are auto-created when sales orders trigger MTO procurement</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>MO #</th><th>Product</th><th>Qty</th>
              <th>Status</th><th>Source</th><th>Created</th>
              {can("Manufacturing", "edit") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {display.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.mo_number}</strong></td>
                <td>{o.product_name}</td>
                <td>{o.quantity}</td>
                <td><span className={STATUS_CLASS[o.status] || "pill"}>{o.status?.replace(/_/g, " ")}</span></td>
                <td>
                  {o.auto_generated
                    ? <span className="pill-pending">Auto</span>
                    : <span className="pill-draft">Manual</span>}
                </td>
                <td style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </td>
                {can("Manufacturing", "edit") && (
                  <td>
                    <div className="actions">
                      {o.status !== "completed" && o.status !== "cancelled" && (
                        <button className="btn-action btn-confirm" onClick={() => complete(o.id)}>
                          <Check size={13} /> Complete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
