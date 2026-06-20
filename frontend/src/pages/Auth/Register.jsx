import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const auth = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.register(form.name, form.email, form.password);
      nav("/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      {/* LEFT — Hero Panel */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-hero-logo">
            <img
              src="/logo.png"
              alt="Shiv Furniture Works"
              className="hero-logo-img"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "grid"; }}
            />
            <div className="hero-logo-fallback" style={{ display: "none" }}>SF</div>
          </div>
          <h1 className="login-hero-title">Join Shiv Furniture ERP</h1>
          <p className="login-hero-tagline">
            Request access to the operations platform.<br />
            Your account will be activated by the admin.
          </p>
          <div className="login-hero-note">
            <div className="hero-note-icon">🔒</div>
            <p>
              All new accounts start as <strong>Pending</strong> and require admin approval
              before any system access is granted. This keeps the system secure and controlled.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Register Form */}
      <div className="login-form-panel">
        <form className="login-card-v2" onSubmit={submit} autoComplete="off">
          <div className="login-card-header">
            <h2>Request Account Access</h2>
            <p>Fill in your details — an admin will assign your role</p>
          </div>

          <div className="form-field-v2">
            <label>Full Name</label>
            <div className="input-icon-v2">
              <User size={17} className="field-icon" />
              <input
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-field-v2">
            <label>Email address</label>
            <div className="input-icon-v2">
              <Mail size={17} className="field-icon" />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-field-v2">
            <label>Password</label>
            <div className="input-icon-v2">
              <Lock size={17} className="field-icon" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Choose a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="form-error-box">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Submit Access Request"}
          </button>

          <Link to="/login" className="login-register-link">
            <ArrowLeft size={14} /> <strong>Back to Login</strong>
          </Link>
        </form>
      </div>
    </div>
  );
}
