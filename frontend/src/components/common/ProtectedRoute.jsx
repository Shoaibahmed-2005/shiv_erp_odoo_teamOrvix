import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontSize: 16,
        color: "#64748b",
        fontFamily: "Inter, sans-serif",
        gap: 14,
      }}>
        <div style={{
          width: 22,
          height: 22,
          border: "2.5px solid #e2e8f0",
          borderTopColor: "#c2703d",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        Loading Shiv ERP...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "pending") return <Navigate to="/pending" replace />;

  return children;
}
