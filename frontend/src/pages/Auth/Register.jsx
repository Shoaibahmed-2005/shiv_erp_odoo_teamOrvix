import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/* Password rules: ≥8 chars, uppercase, lowercase, special char */
function checkPassword(p) {
  return {
    length:    p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    lowercase: /[a-z]/.test(p),
    special:   /[^A-Za-z0-9]/.test(p),
  };
}

function RuleRow({ ok, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
      {ok ? <CheckCircle2 size={13} color="#16a34a" /> : <XCircle size={13} color="#dc2626" />}
      <span style={{ color: ok ? "#15803d" : "#dc2626" }}>{text}</span>
    </div>
  );
}

export default function Register() {
  const auth = useAuth();
  const nav  = useNavigate();
  const [form, setForm] = useState({ loginId: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwRules = checkPassword(form.password);
  const pwValid = Object.values(pwRules).every(Boolean);

  async function submit(e) {
    e.preventDefault();
    setError("");

    // Validate login ID (6-12 chars, unique enforced server-side)
    if (form.loginId.length < 6 || form.loginId.length > 12) {
      return setError("Login ID must be between 6 and 12 characters.");
    }
    if (!pwValid) {
      return setError("Password does not meet the security requirements.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await auth.register(form.loginId, form.email, form.password);
      nav("/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <div style={styles.bg} />

      <div style={styles.cardWrap}>
        <form style={styles.card} onSubmit={submit} autoComplete="off">
          <h2 style={styles.title}>Sign Up</h2>
          <p style={styles.subtitle}>Create your Shiv Furniture ERP account</p>

          {/* Login ID (6-12 chars) */}
          <Field label="Login ID (6–12 characters)">
            <InputRow icon={<User size={15} color="#94a3b8" />}>
              <input
                placeholder="e.g. john123"
                style={inputStyle}
                value={form.loginId}
                maxLength={12}
                onChange={(e) => setForm({ ...form, loginId: e.target.value.trim() })}
                required
              />
            </InputRow>
            {form.loginId.length > 0 && (form.loginId.length < 6 || form.loginId.length > 12) && (
              <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>Must be 6–12 characters</div>
            )}
          </Field>

          {/* Email */}
          <Field label="Email address">
            <InputRow icon={<Mail size={15} color="#94a3b8" />}>
              <input
                type="email"
                placeholder="you@company.com"
                style={inputStyle}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </InputRow>
          </Field>

          {/* Password */}
          <Field label="Password">
            <InputRow icon={<Lock size={15} color="#94a3b8" />} extra={
              <button type="button" style={eyeStyle} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff size={14} color="#94a3b8" /> : <Eye size={14} color="#94a3b8" />}
              </button>
            }>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Create a strong password"
                style={inputStyle}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </InputRow>
            {form.password.length > 0 && (
              <div style={{ display: "grid", gap: 3, marginTop: 6 }}>
                <RuleRow ok={pwRules.length}    text="At least 8 characters" />
                <RuleRow ok={pwRules.uppercase} text="At least one uppercase letter" />
                <RuleRow ok={pwRules.lowercase} text="At least one lowercase letter" />
                <RuleRow ok={pwRules.special}   text="At least one special character" />
              </div>
            )}
          </Field>

          {/* Re-enter Password */}
          <Field label="Re-enter Password">
            <InputRow icon={<Lock size={15} color="#94a3b8" />} extra={
              <button type="button" style={eyeStyle} onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? <EyeOff size={14} color="#94a3b8" /> : <Eye size={14} color="#94a3b8" />}
              </button>
            }>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                style={inputStyle}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </InputRow>
            {form.confirm.length > 0 && form.confirm !== form.password && (
              <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>Passwords do not match</div>
            )}
          </Field>

          {error && <div style={errBox}>{error}</div>}

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading ? <span style={spinner} /> : "SIGN UP"}
          </button>

          <Link to="/login" style={backLink}>
            <ArrowLeft size={13} /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );
}

function InputRow({ icon, extra, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "0 12px", background: "#f8fafc" }}>
      {icon}
      {children}
      {extra}
    </div>
  );
}

const inputStyle = { border: 0, outline: 0, background: "transparent", padding: "11px 0", fontSize: 14, color: "#0f172a", width: "100%", fontFamily: "inherit" };
const eyeStyle   = { background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" };
const errBox     = { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 12px", color: "#dc2626", fontSize: 13, marginBottom: 10 };
const submitBtn  = { width: "100%", height: 46, background: "linear-gradient(135deg, #c2703d 0%, #a35929 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, boxShadow: "0 4px 14px rgba(194,112,61,0.38)", fontFamily: "inherit" };
const spinner    = { width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" };
const backLink   = { textAlign: "center", color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, textDecoration: "none" };

const styles = {
  root: { minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", fontFamily: "'Inter', system-ui, Arial, sans-serif" },
  bg:   { position: "fixed", inset: 0, backgroundImage: "url('/furniture-bg.png')", backgroundSize: "cover", backgroundPosition: "center left", backgroundRepeat: "no-repeat", zIndex: 0 },
  cardWrap: { position: "relative", zIndex: 10, padding: "40px 80px 40px 0", display: "flex", alignItems: "center" },
  card: { width: 380, background: "rgba(255,255,255,0.97)", borderRadius: 18, padding: "30px 28px 24px", boxShadow: "0 20px 70px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", backdropFilter: "blur(12px)", maxHeight: "90vh", overflowY: "auto" },
  title: { margin: "0 0 3px", fontSize: 24, fontWeight: 800, color: "#0f172a" },
  subtitle: { margin: "0 0 20px", fontSize: 13, color: "#64748b" },
};
