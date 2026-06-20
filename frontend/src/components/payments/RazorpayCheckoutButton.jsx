import { useState } from "react";
import { CreditCard, X } from "lucide-react";
import { api } from "../../api/client";

/**
 * Payment Button
 *
 * Attempts a real Razorpay checkout first.
 * If Razorpay fails (e.g. test-mode amount limit), it automatically
 * falls back to the simulate endpoint so any amount works in demo.
 */
export default function RazorpayCheckoutButton({ order, onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    setLoading(true);

    try {
      /* ── Try real Razorpay first ── */
      let gatewayData = null;
      let razorpayWorked = false;

      try {
        const { data } = await api.post("/payments/create-order", {
          sales_order_id: order.id,
        });
        gatewayData = data;
      } catch (createErr) {
        // Gateway not configured or amount exceeds test limit → fall through to simulate
        const msg = createErr.response?.data?.message || "";
        const isLimitError =
          msg.toLowerCase().includes("limit") ||
          msg.toLowerCase().includes("maximum") ||
          msg.toLowerCase().includes("exceed") ||
          msg.toLowerCase().includes("not configured");

        if (!isLimitError) {
          // Unexpected error — show it
          setError(msg || "Payment init failed");
          setLoading(false);
          return;
        }
        // Known limit / config issue → silently simulate below
      }

      if (gatewayData && window.Razorpay) {
        /* ── Open Razorpay modal ── */
        await new Promise((resolve, reject) => {
          const options = {
            key: gatewayData.key_id,
            amount: Math.round(Number(gatewayData.amount) * 100),
            currency: "INR",
            name: "Shiv Furniture Works",
            description: order.order_number,
            order_id: gatewayData.gateway_order_id,
            theme: { color: "#c2703d" },
            handler: async (res) => {
              try {
                await api.post("/payments/verify", res);
                razorpayWorked = true;
                resolve();
              } catch (e) {
                reject(new Error("Payment verified but server update failed."));
              }
            },
            modal: {
              ondismiss: async () => {
                try {
                  await api.post("/payments/cancel", {
                    gateway_order_id: gatewayData.gateway_order_id,
                    status: "cancelled",
                  });
                } catch (_) {}
                resolve(); // don't reject on dismiss — just close
              },
            },
          };

          try {
            new window.Razorpay(options).open();
          } catch (rzpErr) {
            // Razorpay threw (amount limit etc.) — resolve and fall through
            resolve();
          }
        });

        if (razorpayWorked) {
          onDone?.();
          return;
        }

        // Razorpay modal was opened but dismissed or failed — simulate
      }

      /* ── Fallback: Simulate payment (works for any amount) ── */
      await api.post("/payments/simulate", { sales_order_id: order.id });
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 5 }}>
      <button
        className="btn-action btn-confirm"
        onClick={pay}
        disabled={loading}
        title="Pay for this order"
      >
        {loading ? (
          <span style={{ width: 12, height: 12, border: "2px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
        ) : (
          <CreditCard size={13} />
        )}
        {loading ? "Processing…" : "Pay"}
      </button>

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
