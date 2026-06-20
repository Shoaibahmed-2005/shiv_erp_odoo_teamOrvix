import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@shivfurniture.com", password: "Admin@123" },
  { label: "Sales", email: "sales@shivfurniture.com", password: "Sales@123" },
  { label: "Purchase", email: "purchase@shivfurniture.com", password: "Purchase@123" },
  { label: "Mfg", email: "manufacturing@shivfurniture.com", password: "Manufacturing@123" },
  { label: "Inventory", email: "inventory@shivfurniture.com", password: "Inventory@123" },
  { label: "Owner", email: "owner@shivfurniture.com", password: "Owner@123" },
];

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
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
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
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

          <h1 className="login-hero-title">Shiv Furniture Works</h1>
          <p className="login-hero-tagline">
            Crafting excellence since decades.<br />
            Your complete operations command centre.
          </p>

          <div className="login-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">6</span>
              <span className="hero-stat-label">User Roles</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">9</span>
              <span className="hero-stat-label">Modules</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">Live</span>
              <span className="hero-stat-label">Real-time ERP</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="login-form-panel">
        <form className="login-card-v2" onSubmit={submit} autoComplete="off">
          <div className="login-card-header">
            <div className="login-brand-v2">
              <img
                src="/logo.png"
                alt="Logo"
                className="login-logo-sm"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "grid"; }}
              />
              <div className="login-logo-sm-fallback" style={{ display: "none" }}>SF</div>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your ERP account</p>
          </div>

          <div className="form-field-v2">
            <label>Email address</label>
            <div className="input-icon-v2">
              <Mail size={17} className="field-icon" />
              <input
                type="email"
                autoComplete="username"
                placeholder="you@shivfurniture.com"
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
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
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
            {loading ? <span className="btn-spinner" /> : <><ArrowRight size={17} /> Sign In</>}
          </button>

          <div className="login-divider"><span>or</span></div>

          <Link to="/register" className="login-register-link">
            New to Shiv ERP? <strong>Request Access →</strong>
          </Link>

          <div className="login-demo-box">
            <p className="demo-title">Quick Demo Login — Click to fill</p>
            <div className="demo-accounts">
              {DEMO_ACCOUNTS.map((a) => (
                <div
                  key={a.label}
                  className="demo-chip"
                  onClick={() => setForm({ email: a.email, password: a.password })}
                >
                  {a.label}
                </div>
              ))}
            </div>
            <p className="demo-hint">Click a chip to auto-fill, then Sign In</p>
          </div>
        </form>
      </div>
    </div>
  );
}
