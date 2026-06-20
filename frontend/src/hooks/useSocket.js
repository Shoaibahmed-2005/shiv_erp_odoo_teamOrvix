import { useEffect, useState } from "react";
import { connectSocket } from "../sockets/socketClient";

export function useSocket(user) {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    if (!user || user.role === "pending") return undefined;
    const s = connectSocket(user);
    setSocket(s);
    return () => s.disconnect();
  }, [user]);
  return socket;
}
