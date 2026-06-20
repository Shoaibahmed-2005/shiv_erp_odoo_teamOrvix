import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function AuditLogs() {
  const [rows, setRows]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading]     = useState(true);

  async function load() {
    try {
      const { data } = await api.get("/audit-logs");
      setRows(data);
      applySearch(data, sessionStorage.getItem("erp_search") || "");
    } finally {
      setLoading(false);
    }
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((a) =>
      a.action?.toLowerCase().includes(lq) ||
      a.entity?.toLowerCase().includes(lq) ||
      a.user_name?.toLowerCase().includes(lq)
    ));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onSearch(e) { setSearchVal(e.detail); applySearch(rows, e.detail); }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, [rows]);

  const display = searchVal ? filtered : rows;

  if (loading) return <div className="boot">Loading audit logs…</div>;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Audit Logs</h2>
          {searchVal && (
            <p className="search-results-hint">
              {display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", padding: "8px 0" }}>Last 200 entries</div>
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{searchVal ? "No logs match your search" : "No audit logs yet"}</h3>
          <p>System changes are automatically logged here</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>ID</th>
            </tr>
          </thead>
          <tbody>
            {display.map((a) => (
              <tr key={a.id}>
                <td style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                  {new Date(a.created_at).toLocaleString("en-IN")}
                </td>
                <td><strong>{a.user_name || "System"}</strong></td>
                <td>
                  <span style={{
                    fontFamily: "monospace",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                  }}>
                    {a.action}
                  </span>
                </td>
                <td style={{ textTransform: "capitalize" }}>{a.entity}</td>
                <td style={{ color: "#94a3b8", fontSize: 13 }}>#{a.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
