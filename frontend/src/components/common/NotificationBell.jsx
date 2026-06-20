import { useEffect, useRef, useState } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { api } from "../../api/client";

export default function NotificationBell({ socket }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]     = useState(false);
  const ref                 = useRef();

  async function load() {
    try { setNotifs((await api.get("/notifications")).data); } catch (_) {}
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification:new", load);
    socket.on("order:status_changed", load);
    socket.on("procurement:triggered", load);
    socket.on("payment:status_changed", load);
    return () => {
      socket.off("notification:new", load);
      socket.off("order:status_changed", load);
      socket.off("procurement:triggered", load);
      socket.off("payment:status_changed", load);
    };
  }, [socket]);

  /* Close on outside click */
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }

  async function markAll() {
    await api.patch("/notifications/read-all");
    load();
  }

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="bell" ref={ref}>
      <button
        className="iconButton"
        onClick={() => setOpen((o) => !o)}
        title={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        style={{ position: "relative" }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            background: "#dc2626", color: "white",
            borderRadius: "999px", fontSize: 11,
            padding: "2px 5px", fontWeight: 700, lineHeight: 1,
            minWidth: 18, textAlign: "center",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="menu">
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 8px 10px", borderBottom: "1px solid #e2e8f0", marginBottom: 6,
          }}>
            <strong style={{ fontSize: 14 }}>
              Notifications {unread > 0 && <span style={{ color: "#c2703d" }}>({unread})</span>}
            </strong>
            <div style={{ display: "flex", gap: 6 }}>
              {unread > 0 && (
                <button className="btn-action btn-confirm" onClick={markAll} style={{ fontSize: 12, padding: "4px 10px" }}>
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button className="iconButton ghost" onClick={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 8 }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          {notifs.length === 0 ? (
            <div style={{ padding: "28px 12px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              No notifications yet
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  padding: "11px 10px",
                  borderRadius: 10,
                  marginBottom: 4,
                  background: n.is_read ? "transparent" : "#fff7ed",
                  border: n.is_read ? "1px solid transparent" : "1px solid #fed7aa",
                  cursor: n.is_read ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                  {new Date(n.created_at).toLocaleString("en-IN")}
                  {!n.is_read && <span style={{ color: "#c2703d", marginLeft: 8, fontWeight: 600 }}>● Unread</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
