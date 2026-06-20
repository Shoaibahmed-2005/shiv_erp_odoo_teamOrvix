import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function BillOfMaterials() {
  const [rows, setRows]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [products, setProducts]   = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    product_id: "",
    components: [{ component_product_id: "", quantity: 1 }],
    operations: [],
  });
  const { can } = useAuth();

  async function load() {
    const { data } = await api.get("/boms");
    setRows(data);
    applySearch(data, sessionStorage.getItem("erp_search") || "");
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }

  function applySearch(data, q) {
    if (!q) { setFiltered(data); return; }
    const lq = q.toLowerCase();
    setFiltered(data.filter((b) => b.product_name?.toLowerCase().includes(lq)));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    function onSearch(e) { setSearchVal(e.detail); applySearch(rows, e.detail); }
    window.addEventListener("erp:search", onSearch);
    return () => window.removeEventListener("erp:search", onSearch);
  }, [rows]);

  function addComponent() {
    setForm((f) => ({ ...f, components: [...f.components, { component_product_id: "", quantity: 1 }] }));
  }
  function removeComponent(i) {
    setForm((f) => ({ ...f, components: f.components.filter((_, idx) => idx !== i) }));
  }
  function setComp(i, field, val) {
    setForm((f) => {
      const components = [...f.components];
      components[i] = { ...components[i], [field]: val };
      return { ...f, components };
    });
  }

  async function createBom(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/boms", {
        product_id: Number(form.product_id),
        components: form.components.map((c) => ({
          component_product_id: Number(c.component_product_id),
          quantity: Number(c.quantity),
        })),
        operations: [],
      });
      setShowCreate(false);
      setForm({ product_id: "", components: [{ component_product_id: "", quantity: 1 }], operations: [] });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBom(id) {
    if (!window.confirm("Delete this Bill of Materials?")) return;
    try {
      await api.delete(`/boms/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  }

  const display = searchVal ? filtered : rows;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Bill of Materials</h2>
          {searchVal && (
            <p className="search-results-hint">
              {display.length} result{display.length !== 1 ? "s" : ""} for "{searchVal}"
            </p>
          )}
        </div>
        {can("BoM", "create") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Add BoM
          </button>
        )}
      </div>

      {display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <h3>{searchVal ? "No BoMs match your search" : "No Bills of Materials yet"}</h3>
          <p>Create a BoM to define components required to manufacture a product</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Created</th>
              {can("BoM", "delete") && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {display.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.product_name}</strong></td>
                <td style={{ fontSize: 13, color: "#64748b" }}>
                  {new Date(b.created_at).toLocaleDateString("en-IN")}
                </td>
                {can("BoM", "delete") && (
                  <td>
                    <button className="btn-action btn-delete" onClick={() => deleteBom(b.id)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Create Bill of Materials</h3>
              <button className="iconButton ghost" onClick={() => setShowCreate(false)}><X size={17} /></button>
            </div>

            <form onSubmit={createBom} style={{ display: "grid", gap: 16 }}>
              <div className="form-field">
                <label>Finished Product *</label>
                <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
                  <option value="">— Select Product —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>Components (raw materials)</strong>
                  <button type="button" className="btn-action btn-edit" onClick={addComponent}><Plus size={13} /> Add</button>
                </div>
                {form.components.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 100px auto", gap: 8, marginBottom: 8, alignItems: "end" }}>
                    <div className="form-field">
                      {i === 0 && <label>Component</label>}
                      <select
                        value={c.component_product_id}
                        onChange={(e) => setComp(i, "component_product_id", e.target.value)}
                        required
                      >
                        <option value="">— Select —</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      {i === 0 && <label>Qty</label>}
                      <input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={c.quantity}
                        onChange={(e) => setComp(i, "quantity", e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ paddingBottom: 2 }}>
                      {form.components.length > 1 && (
                        <button type="button" className="btn-action btn-delete" onClick={() => removeComponent(i)} style={{ height: 42 }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Create BoM"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
