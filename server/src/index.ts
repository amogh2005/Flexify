import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { join } from "path";
import { connectDatabase } from "./config/db";
import { authRouter, providersRouter, adminRouter, uploadRouter, paymentsRouter, bookingsRouter, otpRouter } from "./routes";
import { ensureAdminSeed } from "./utils/seedAdmin";
import { SocketService } from "./services/socket";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize WebSocket service
const socketService = new SocketService(server);
(global as any).socketService = socketService;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Serve uploaded files statically
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/providers", providersRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/uploads", uploadRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/bookings", bookingsRouter);
app.use("/api/v1/otp", otpRouter);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = join(process.cwd(), "client/build");
  app.use(express.static(clientBuildPath));

  // Redirect all unknown routes to React
  app.get("*", (_req, res) => {
    res.sendFile(join(clientBuildPath, "index.html"));
  });
}

// Health check endpoint
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

(async () => {
  if (process.env.MONGO_URI) {
    await connectDatabase(process.env.MONGO_URI);
    await ensureAdminSeed();
  } else {
    console.warn("MONGO_URI not set. Server will run without DB connection.");
  }

  server.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
    console.log(`WebSocket server ready on ws://localhost:${PORT}`);
  });
})();

export default app;
