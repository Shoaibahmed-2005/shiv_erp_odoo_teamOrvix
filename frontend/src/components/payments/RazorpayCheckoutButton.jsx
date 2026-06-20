import { useState } from "react";
import { CreditCard, FlaskConical, X } from "lucide-react";
import { api } from "../../api/client";

/**
 * Razorpay Checkout Button
 *
 * Shows two buttons:
 *  • "Pay with Razorpay" – real Razorpay gateway flow
 *  • "Simulate Payment"  – test-mode bypass (no Razorpay limit hit)
 *
 * The simulate option is shown when the gateway key looks like a test key
 * (starts with "rzp_test_") OR when no key is configured at all.
 */
export default function RazorpayCheckoutButton({ order, onDone }) {
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Real Razorpay payment ── */
  async function pay() {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/payments/create-order", {
        sales_order_id: order.id,
      });

      if (!window.Razorpay) {
        setError("Razorpay checkout.js is not loaded.");
        return;
      }

      const options = {
        key: data.key_id,
        amount: Math.round(Number(data.amount) * 100),
        currency: "INR",
        name: "Shiv Furniture Works",
        description: order.order_number,
        order_id: data.gateway_order_id,
        theme: { color: "#c2703d" },
        handler: async (res) => {
          try {
            await api.post("/payments/verify", res);
            onDone?.();
          } catch (e) {
            setError("Payment verified but server update failed. Contact admin.");
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await api.post("/payments/cancel", {
                gateway_order_id: data.gateway_order_id,
                status: "cancelled",
              });
              onDone?.();
            } catch (_) {}
          },
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Payment init failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ── Simulate (bypass Razorpay) ── */
  async function simulate() {
    if (!window.confirm(
      `Simulate payment of ₹${Number(order.total).toLocaleString("en-IN")} for ${order.order_number}?\n\nThis marks the order as paid WITHOUT going through Razorpay — for testing only.`
    )) return;

    setError("");
    setSimLoading(true);
    try {
      await api.post("/payments/simulate", { sales_order_id: order.id });
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || "Simulate failed");
    } finally {
      setSimLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 5 }}>
      {/* Razorpay button */}
      <button
        className="btn-action btn-confirm"
        onClick={pay}
        disabled={loading || simLoading}
        title="Pay via Razorpay gateway"
      >
        {loading ? (
          <span style={{ width: 12, height: 12, border: "2px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
        ) : (
          <CreditCard size={13} />
        )}
        {loading ? "Opening…" : "Pay"}
      </button>

      {/* Simulate button — always visible for test/demo convenience */}
      <button
        className="btn-action"
        onClick={simulate}
        disabled={loading || simLoading}
        title="Skip Razorpay — mark as paid immediately (test mode)"
        style={{ background: "#f1f5f9", color: "#475569", border: "1px dashed #cbd5e1", fontSize: 11, padding: "4px 9px", borderRadius: 8, cursor: "pointer" }}
      >
        {simLoading ? (
          <span style={{ width: 10, height: 10, border: "2px solid #94a3b8", borderTopColor: "#475569", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
        ) : (
          <FlaskConical size={11} />
        )}
        {simLoading ? "…" : "Simulate"}
      </button>

      {/* Inline error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 5,
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, padding: "6px 9px", fontSize: 12, color: "#dc2626",
          maxWidth: 220,
        }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError("")}
            style={{ background: "transparent", border: "none", color: "#dc2626", padding: 0, cursor: "pointer", lineHeight: 1 }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
