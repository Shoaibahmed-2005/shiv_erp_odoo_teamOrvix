import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Admin",     email: "admin@shivfurniture.com",         password: "Admin@123" },
  { label: "Sales",     email: "sales@shivfurniture.com",         password: "Sales@123" },
  { label: "Purchase",  email: "purchase@shivfurniture.com",      password: "Purchase@123" },
  { label: "Mfg",       email: "manufacturing@shivfurniture.com", password: "Manufacturing@123" },
  { label: "Inventory", email: "inventory@shivfurniture.com",     password: "Inventory@123" },
  { label: "Owner",     email: "owner@shivfurniture.com",         password: "Owner@123" },
];

export default function Login() {
  const auth = useAuth();
  const nav  = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login(form.email, form.password);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Login Id or Password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      {/* Full-bleed background */}
      <div style={styles.bg} />

      {/* Floating login card — right side */}
      <div style={styles.cardWrap}>
        <form style={styles.card} onSubmit={submit} autoComplete="off">
          {/* Logo — prominent centered brand mark */}
          <div style={styles.logoBadge}>
            <img
              src="/logo.png"
              alt="Shiv Furniture ERP"
              style={styles.logoImg}
            />
          </div>

          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <h2 style={styles.title}>Welcome back</h2>
            <p style={styles.subtitle}>Sign in to your ERP account</p>
          </div>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputRow}>
              <Mail size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                type="email"
                placeholder="you@shivfurniture.com"
                style={styles.input}
                value={form.email}
                autoComplete="username"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputRow}>
              <Lock size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                style={{ ...styles.input, flex: 1 }}
                value={form.password}
                autoComplete="current-password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>⚠ {error}</div>
          )}

          {/* Sign In Button */}
          <button type="submit" style={styles.signInBtn} disabled={loading}>
            {loading
              ? <span style={styles.spinner} />
              : <><ArrowRight size={16} /> Sign In</>
            }
          </button>

          {/* Divider */}
          <div style={styles.divider}><span style={styles.dividerText}>or</span></div>

          {/* Forget Password | Sign Up */}
          <div style={styles.linksRow}>
            <span style={styles.forgotLink} onClick={() => alert("Contact your admin to reset password.")}>
              Forget Password ?
            </span>
            <span style={{ color: "#94a3b8" }}>|</span>
            <Link to="/register" style={styles.signupLink}>Sign Up</Link>
          </div>

          {/* Demo chips */}
          <div style={styles.demoBox}>
            <p style={styles.demoLabel}>QUICK DEMO LOGIN — CLICK TO FILL</p>
            <div style={styles.chipsRow}>
              {DEMO_ACCOUNTS.map((a) => (
                <div
                  key={a.label}
                  style={styles.chip}
                  onClick={() => setForm({ email: a.email, password: a.password })}
                >
                  {a.label}
                </div>
              ))}
            </div>
            <p style={styles.chipHint}>Click a chip to auto-fill, then Sign In</p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Inline styles to match the reference image exactly ─── */
const styles = {
  root: {
    minHeight: "100vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontFamily: "'Inter', system-ui, Arial, sans-serif",
  },
  bg: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url('/furniture-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center left",
    backgroundRepeat: "no-repeat",
    zIndex: 0,
  },
  cardWrap: {
    position: "relative",
    zIndex: 10,
    padding: "40px 80px 40px 0",
    display: "flex",
    alignItems: "center",
  },
  card: {
    width: 360,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 18,
    padding: "30px 28px 24px",
    boxShadow: "0 20px 70px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    backdropFilter: "blur(12px)",
  },
  logoBadge: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: 130,
    height: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 2px 8px rgba(194,112,61,0.18))",
    borderRadius: 12,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 12px",
    background: "#f8fafc",
    transition: "border-color 0.2s",
  },
  input: {
    border: 0,
    outline: 0,
    background: "transparent",
    padding: "11px 0",
    fontSize: 14,
    color: "#0f172a",
    width: "100%",
    fontFamily: "inherit",
  },
  eyeBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 10,
  },
  signInBtn: {
    width: "100%",
    height: 46,
    background: "linear-gradient(135deg, #c2703d 0%, #a35929 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    boxShadow: "0 4px 14px rgba(194,112,61,0.38)",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  },
  spinner: {
    width: 18,
    height: 18,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  dividerText: {
    fontSize: 12,
    color: "#94a3b8",
    padding: "0 4px",
    background: "rgba(255,255,255,0.97)",
    margin: "0 auto",
  },
  linksRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
    marginBottom: 16,
    color: "#475569",
  },
  forgotLink: {
    color: "#475569",
    cursor: "pointer",
    textDecoration: "underline",
  },
  signupLink: {
    color: "#c2703d",
    fontWeight: 700,
    textDecoration: "none",
  },
  demoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 14px 10px",
  },
  demoLabel: {
    margin: "0 0 9px",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 8,
  },
  chip: {
    padding: "5px 13px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: 12,
    fontWeight: 600,
    color: "#1e293b",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.15s",
  },
  chipHint: {
    margin: 0,
    fontSize: 10,
    color: "#94a3b8",
  },
};
