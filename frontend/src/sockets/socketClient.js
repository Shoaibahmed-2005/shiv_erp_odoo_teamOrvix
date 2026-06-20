import { io } from "socket.io-client";

export function connectSocket(user) {
  const url = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  return io(url, { auth: { userId: user?.id, role: user?.role } });
}
