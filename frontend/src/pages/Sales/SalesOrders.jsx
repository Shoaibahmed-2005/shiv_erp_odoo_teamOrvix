import { useEffect, useState } from "react";
import { Plus, Check, Truck, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useOutletContext } from "react-router-dom";
import RazorpayCheckoutButton from "../../components/payments/RazorpayCheckoutButton";

const STATUS_CLASS = {
  draft:               "pill-draft",
  confirmed:           "pill-confirmed",
  partially_delivered: "pill-partial",
  fully_delivered:     "pill-fully_delivered",
  cancelled:           "pill-cancelled",
};

const PAY_CLASS = {
  not_applicable: "pill-draft",
  pending:        "pill-pending",
  paid:           "pill-confirmed",
  failed:         "pill-cancelled",
  cancelled:      "pill-cancelled",
};

export default function SalesOrders() {
  const [rows, setRows]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts]   = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    customer_id: "", payment_required: false,
    items: [{ product_id: "", quantity: 1, unit_price: 0 }],
  });
  const { can } = useAuth();
  const { socket } = useOutletContext() || {};

  async function load() {
    const { data } = await api.get("/sales-orders");
    setRows(data);
    applySearch(data, sessionStorage.getItem("erp_search") || "");
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((o) =>
      o.order_number?.toLowerCase().includes(lq) ||
      o.customer_name?.toLowerCase().includes(lq) ||
      o.status?.includes(lq)
    ));
  }

  useEffect(() => {
    load();
    api.get("/customers").then((r) => setCustomers(r.data)).catch(() => {});
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
    socket.on("payment:status_changed", load);
    socket.on("procurement:triggered", load);
    return () => { socket.off("order:status_changed", load); socket.off("payment:status_changed", load); socket.off("procurement:triggered", load); };
  }, [socket]);

  async function confirm(id) {
    try { await api.post(`/sales-orders/${id}/confirm`); load(); }
    catch (err) { alert(err.response?.data?.message || "Cannot confirm — payment may be required first."); }
  }

  async function deliver(id) {
    try {
      // Deliver all undelivered quantities
      const detail = await api.get(`/sales-orders/${id}`);
      const items = (detail.data.items || []).map((i) => ({
        id: i.id,
        quantity: Math.max(0, i.quantity - (i.delivered_qty || 0)),
      })).filter((i) => i.quantity > 0);
      await api.post(`/sales-orders/${id}/deliver`, { items });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Deliver failed.");
    }
  }

  /* Item helpers */
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
    if (p) setItem(i, "unit_price", p.sales_price);
  }

  async function createOrder(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/sales-orders", {
        customer_id: form.customer_id,
        payment_required: form.payment_required,
        items: form.items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      });
      setShowCreate(false);
      setForm({ customer_id: "", payment_required: false, items: [{ product_id: "", quantity: 1, unit_price: 0 }] });
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
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Sales Orders</h2>
          {searchVal && <p className="search-results-hint">{display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"</p>}
        </div>
        {can("Sales", "create") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Sales Order
          </button>
        )}
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>{searchVal ? "No orders match your search" : "No sales orders yet"}</h3>
          <p>{searchVal ? "Try a different keyword" : "Create your first sales order to get started"}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order #</th><th>Customer</th><th>Status</th>
              <th>Payment</th><th>Total</th><th>Linked PO/MO</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {display.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.order_number}</strong></td>
                <td>{o.customer_name}</td>
                <td><span className={STATUS_CLASS[o.status] || "pill"}>{o.status?.replace(/_/g, " ")}</span></td>
                <td>
                  {o.payment_required
                    ? <span className={PAY_CLASS[o.payment_status] || "pill"}>{o.payment_status}</span>
                    : <span className="pill-draft">N/A</span>}
                </td>
                <td><strong>₹{Number(o.total).toLocaleString("en-IN")}</strong></td>
                <td>
                  {o.linked_po_number && (
                    <span className="pill-pending" title="Auto-created Purchase Order">PO: {o.linked_po_number}</span>
                  )}
                  {o.linked_mo_number && (
                    <span className="pill-in_progress" title="Auto-created Manufacturing Order">MO: {o.linked_mo_number}</span>
                  )}
                  {!o.linked_po_number && !o.linked_mo_number && <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                </td>
                <td>
                  <div className="actions">
                    {o.payment_required && o.payment_status !== "paid" && (
                      <RazorpayCheckoutButton order={o} onDone={load} />
                    )}
                    {can("Sales", "edit") && o.status === "draft" && (!o.payment_required || o.payment_status === "paid") && (
                      <button className="btn-action btn-confirm" onClick={() => confirm(o.id)}>
                        <Check size={13} /> Confirm
                      </button>
                    )}
                    {can("Sales", "edit") && o.status === "confirmed" && (
                      <button className="btn-action btn-deliver" onClick={() => deliver(o.id)}>
                        <Truck size={13} /> Deliver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>New Sales Order</h3>
              <button className="iconButton ghost" onClick={() => setShowCreate(false)}><X size={17} /></button>
            </div>

            <form onSubmit={createOrder} style={{ display: "grid", gap: 16 }}>
              <div className="form-field">
                <label>Customer *</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">— Select Customer —</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.payment_required}
                  onChange={(e) => setForm({ ...form, payment_required: e.target.checked })}
                  style={{ width: "auto", padding: 0, accentColor: "#c2703d" }}
                />
                Require Razorpay payment before confirmation
              </label>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>Order Items</strong>
                  <button type="button" className="btn-action btn-edit" onClick={addItem}><Plus size={13} /> Add Item</button>
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
                      {i === 0 && <label>Unit Price (₹)</label>}
                      <input type="number" min={0} value={item.unit_price} onChange={(e) => setItem(i, "unit_price", e.target.value)} required />
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                      {form.items.length > 1 && (
                        <button type="button" className="btn-action btn-delete" onClick={() => removeItem(i)} style={{ height: 42 }}><X size={13} /></button>
                      )}
                    </div>
                  </div>
                ))}
                {form.items.length > 0 && (
                  <p style={{ fontSize: 13, color: "#64748b", margin: "8px 0 0", textAlign: "right" }}>
                    Est. Total: ₹{form.items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0), 0).toLocaleString("en-IN")}
                    {" "}+ 18% GST
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Creating…" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
