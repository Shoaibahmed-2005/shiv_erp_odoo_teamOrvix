import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { migrateAndSeed } from "./config/db.js";
import { initSocket } from "./config/socket.js";

const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: frontendUrl, credentials: true } });
initSocket(io);

await migrateAndSeed();
server.listen(port, () => console.log(`Shiv Furniture ERP API running on ${port}`));
