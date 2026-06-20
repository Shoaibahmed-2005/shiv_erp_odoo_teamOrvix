import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useOutletContext } from "react-router-dom";

const EMPTY_FORM = {
  name: "", category: "Finished Goods", sales_price: 0, cost_price: 0,
  on_hand_qty: 0, reorder_point: 10, uom: "unit",
  procurement_strategy: "mts", procure_on_demand: false,
  procurement_type: "purchase", default_vendor_id: "",
};

export default function Products() {
  const [rows, setRows]           = useState([]);
  const [vendors, setVendors]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { can }                   = useAuth();
  const { socket }                = useOutletContext() || {};

  const canCreate = can("Products", "create");
  const canEdit   = can("Products", "edit");
  const canDelete = can("Products", "delete");

  async function load() {
    const [prodRes, vendRes] = await Promise.all([
      api.get("/products"),
      api.get("/vendors")
    ]);
    setRows(prodRes.data);
    setVendors(vendRes.data);
    applySearch(prodRes.data, sessionStorage.getItem("erp_search") || "");
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((p) =>
      p.name?.toLowerCase().includes(lq) ||
      p.category?.toLowerCase().includes(lq) ||
      p.vendor_name?.toLowerCase().includes(lq)
    ));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onSearch(e) {
      setSearchVal(e.detail);
      applySearch(rows, e.detail);
    }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, [rows]);

  useEffect(() => {
    if (!socket) return;
    socket.on("stock:updated", load);
    return () => socket.off("stock:updated", load);
  }, [socket]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(p) {
    setForm({
      name: p.name, category: p.category, sales_price: p.sales_price,
      cost_price: p.cost_price, on_hand_qty: p.on_hand_qty,
      reorder_point: p.reorder_point, uom: p.uom || "unit",
      procurement_strategy: p.procurement_strategy || "mts",
      procure_on_demand: !!p.procure_on_demand,
      procurement_type: p.procurement_type || "purchase",
      default_vendor_id: p.default_vendor_id || "",
    });
    setEditId(p.id);
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        sales_price: Number(form.sales_price),
        cost_price: Number(form.cost_price),
        on_hand_qty: Number(form.on_hand_qty),
        reorder_point: Number(form.reorder_point),
        default_vendor_id: form.default_vendor_id || null,
      };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  }

  const display = searchVal ? filtered : rows;

  return (
    <section>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Products</h2>
          {searchVal && (
            <p className="search-results-hint">
              {display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Product
          </button>
        )}
      </div>

      {/* Table / Empty */}
      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>{searchVal ? "No products match your search" : "No products yet"}</h3>
          <p>{searchVal ? "Try a different keyword" : canCreate ? "Click 'Add Product' to get started" : "Products will appear here once added"}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Free</th>
              <th>Strategy</th>
              <th>Sales Price</th>
              <th>Cost Price</th>
              {(canEdit || canDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {display.map((p) => (
              <tr key={p.id} className={p.on_hand_qty <= p.reorder_point ? "dangerRow" : ""}>
                <td><strong>{p.name}</strong></td>
                <td>{p.category}</td>
                <td>{p.on_hand_qty}</td>
                <td>{p.reserved_qty}</td>
                <td><strong>{p.on_hand_qty - p.reserved_qty}</strong></td>
                <td>
                  <span className={p.procurement_strategy === "mto" ? "pill-mto" : "pill-mts"}>
                    {p.procurement_strategy?.toUpperCase()}
                  </span>
                </td>
                <td>₹{Number(p.sales_price).toLocaleString("en-IN")}</td>
                <td>₹{Number(p.cost_price).toLocaleString("en-IN")}</td>
                {(canEdit || canDelete) && (
                  <td>
                    <div className="actions">
                      {canEdit && (
                        <button className="btn-action btn-edit" onClick={() => openEdit(p)}>
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn-action btn-delete" onClick={() => setDeleteTarget(p)}>
                          <Trash2 size={13} /> Delete
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

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
              <button className="iconButton ghost" onClick={() => setShowModal(false)}><X size={17} /></button>
            </div>

            <form onSubmit={save}>
              <div className="form-grid-2">
                <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Wooden Dining Table"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Finished Goods"
                  />
                </div>

                <div className="form-field">
                  <label>Unit of Measure</label>
                  <input
                    value={form.uom}
                    onChange={(e) => setForm({ ...form, uom: e.target.value })}
                    placeholder="unit"
                  />
                </div>

                <div className="form-field">
                  <label>Sales Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sales_price}
                    onChange={(e) => setForm({ ...form, sales_price: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Cost Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>On Hand Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={form.on_hand_qty}
                    onChange={(e) => setForm({ ...form, on_hand_qty: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Reorder Point</label>
                  <input
                    type="number"
                    min={0}
                    value={form.reorder_point}
                    onChange={(e) => setForm({ ...form, reorder_point: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Procurement Strategy</label>
                  <select
                    value={form.procurement_strategy}
                    onChange={(e) => setForm({ ...form, procurement_strategy: e.target.value })}
                  >
                    <option value="mts">MTS — Make to Stock</option>
                    <option value="mto">MTO — Make to Order</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Procurement Type</label>
                  <select
                    value={form.procurement_type || ""}
                    onChange={(e) => setForm({ ...form, procurement_type: e.target.value || null })}
                  >
                    <option value="">— None —</option>
                    <option value="purchase">Purchase (from vendor)</option>
                    <option value="manufacturing">Manufacturing (produce)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Default Vendor</label>
                  <select
                    value={form.default_vendor_id || ""}
                    onChange={(e) => setForm({ ...form, default_vendor_id: e.target.value || null })}
                  >
                    <option value="">— Select Vendor —</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id="pod"
                    checked={form.procure_on_demand}
                    onChange={(e) => setForm({ ...form, procure_on_demand: e.target.checked })}
                    style={{ width: "auto", padding: 0 }}
                  />
                  <label htmlFor="pod" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Procure on Demand (auto-trigger PO/MO on shortage)
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p style={{ color: "#64748b", margin: 0, lineHeight: 1.65 }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This will archive it (it won't appear in lists anymore).
            </p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
