import { useEffect, useState } from "react";
import { Plus, Check, PackageCheck, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useOutletContext } from "react-router-dom";

const STATUS_CLASS = {
  draft:             "pill-draft",
  confirmed:         "pill-confirmed",
  partially_received:"pill-partial",
  fully_received:    "pill-fully_received",
  cancelled:         "pill-cancelled",
};

export default function PurchaseOrders() {
  const [rows, setRows]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [vendors, setVendors]     = useState([]);
  const [products, setProducts]   = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    vendor_id: "",
    items: [{ product_id: "", quantity: 1, unit_price: 0 }],
  });
  const { can } = useAuth();
  const { socket } = useOutletContext() || {};

  async function load() {
    const { data } = await api.get("/purchase-orders");
    setRows(data);
    applySearch(data, sessionStorage.getItem("erp_search") || "");
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((o) =>
      o.order_number?.toLowerCase().includes(lq) ||
      o.vendor_name?.toLowerCase().includes(lq) ||
      o.status?.includes(lq)
    ));
  }

  useEffect(() => {
    load();
    api.get("/vendors").then((r) => setVendors(r.data)).catch(() => {});
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    function onSearch(e) { setSearchVal(e.detail); applySearch(rows, e.detail); }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, [rows]);

  useEffect(() => {
    if (!socket) return;
    socket.on("order:status_changed", load);
    return () => socket.off("order:status_changed", load);
  }, [socket]);

  async function confirmPO(id) {
    try { await api.post(`/purchase-orders/${id}/confirm`); load(); }
    catch (err) { alert(err.response?.data?.message || "Confirm failed."); }
  }

  async function receivePO(id) {
    try {
      // Get items for this PO and receive outstanding quantity
      const allRows = rows.find((r) => r.id === id);
      await api.post(`/purchase-orders/${id}/receive`, { items: [] });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Receive failed.");
    }
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { product_id: "", quantity: 1, unit_price: 0 }] }));
  }
  function removeItem(i) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  function setItem(i, field, val) {
    setForm((f) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });
  }
  function pickProduct(i, productId) {
    const p = products.find((p) => String(p.id) === String(productId));
    setItem(i, "product_id", productId);
    if (p) setItem(i, "unit_price", p.cost_price || 0);
  }

  async function createPO(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/purchase-orders", {
        vendor_id: form.vendor_id,
        items: form.items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      });
      setShowCreate(false);
      setForm({ vendor_id: "", items: [{ product_id: "", quantity: 1, unit_price: 0 }] });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  const display = searchVal ? filtered : rows;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Purchase Orders</h2>
          {searchVal && <p className="search-results-hint">{display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"</p>}
        </div>
        {can("Purchase", "create") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Purchase Order
          </button>
        )}
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{searchVal ? "No orders match your search" : "No purchase orders yet"}</h3>
          <p>{searchVal ? "Try a different keyword" : "Create or auto-generate purchase orders through the procurement engine"}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr><th>Order #</th><th>Vendor</th><th>Status</th><th>Total</th><th>Source</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {display.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.order_number}</strong></td>
                <td>{o.vendor_name || "—"}</td>
                <td><span className={STATUS_CLASS[o.status] || "pill"}>{o.status?.replace(/_/g, " ")}</span></td>
                <td><strong>₹{Number(o.total).toLocaleString("en-IN")}</strong></td>
                <td>
                  {o.auto_generated
                    ? <span className="pill-pending">Auto</span>
                    : <span className="pill-draft">Manual</span>}
                </td>
                <td>
                  <div className="actions">
                    {can("Purchase", "edit") && o.status === "draft" && (
                      <button className="btn-action btn-confirm" onClick={() => confirmPO(o.id)}>
                        <Check size={13} /> Confirm
                      </button>
                    )}
                    {can("Purchase", "edit") && o.status === "confirmed" && (
                      <button className="btn-action btn-deliver" onClick={() => receivePO(o.id)}>
                        <PackageCheck size={13} /> Receive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>New Purchase Order</h3>
              <button className="iconButton ghost" onClick={() => setShowCreate(false)}><X size={17} /></button>
            </div>

            <form onSubmit={createPO} style={{ display: "grid", gap: 16 }}>
              <div className="form-field">
                <label>Vendor *</label>
                <select value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} required>
                  <option value="">— Select Vendor —</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>Items</strong>
                  <button type="button" className="btn-action btn-edit" onClick={addItem}><Plus size={13} /> Add</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 80px 120px auto", gap: 8, marginBottom: 8, alignItems: "end" }}>
                    <div className="form-field">
                      {i === 0 && <label>Product</label>}
                      <select value={item.product_id} onChange={(e) => pickProduct(i, e.target.value)} required>
                        <option value="">— Product —</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      {i === 0 && <label>Qty</label>}
                      <input type="number" min={1} value={item.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)} required />
                    </div>
                    <div className="form-field">
                      {i === 0 && <label>Unit Cost (₹)</label>}
                      <input type="number" min={0} value={item.unit_price} onChange={(e) => setItem(i, "unit_price", e.target.value)} required />
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                      {form.items.length > 1 && (
                        <button type="button" className="btn-action btn-delete" onClick={() => removeItem(i)} style={{ height: 42 }}><X size={13} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Creating…" : "Create PO"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
