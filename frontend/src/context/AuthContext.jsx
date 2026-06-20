import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("shiv_token");
    if (!token) return setLoading(false);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setPermissions(data.permissions || []);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("shiv_token", data.token);
    await refresh();
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("shiv_token", data.token);
    await refresh();
  }

  function logout() {
    localStorage.removeItem("shiv_token");
    setUser(null);
    setPermissions([]);
  }

  function can(module, action = "view") {
    return permissions.find((p) => p.module === module)?.[`can_${action}`] || false;
  }

  useEffect(() => { refresh(); }, []);
  const value = useMemo(() => ({ user, permissions, loading, login, register, logout, can, refresh }), [user, permissions, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
