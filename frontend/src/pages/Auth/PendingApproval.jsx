import { useNavigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PendingApproval() {
  const auth = useAuth();
  const nav = useNavigate();

  function logout() {
    auth.logout();
    nav("/login");
  }

  return (
    <div className="pending-page">
      <div className="pending-card">
        <div className="pending-icon">
          <Clock size={44} />
        </div>
        <h2>Account Pending Approval</h2>
        <p>
          Your account has been created successfully. An administrator needs to
          assign you a role before you can access the system.
        </p>
        <p className="pending-sub">
          This usually happens within a few hours. Please check back later or
          contact your system admin directly.
        </p>
        <button onClick={logout} className="login-submit-btn" style={{ maxWidth: 220, margin: "8px auto 0" }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
