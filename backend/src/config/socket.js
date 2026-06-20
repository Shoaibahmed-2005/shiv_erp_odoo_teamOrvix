let ioInstance;

export function initSocket(io) {
  ioInstance = io;
  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.auth || {};
    if (userId) socket.join(`user:${userId}`);
    if (role) socket.join(`role:${role}`);
  });
}

export const emitToAll = (event, payload) => ioInstance?.emit(event, payload);

export function emitNotification(notification) {
  if (!ioInstance) return;
  if (notification.user_id) ioInstance.to(`user:${notification.user_id}`).emit("notification:new", notification);
  if (notification.role) {
    ioInstance.to(`role:${notification.role}`).emit("notification:new", notification);
    if (notification.role !== 'admin' && notification.role !== 'business_owner') {
      ioInstance.to(`role:admin`).emit("notification:new", notification);
      ioInstance.to(`role:business_owner`).emit("notification:new", notification);
    }
  }
}
