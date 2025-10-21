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

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Serve uploaded files statically
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Test endpoint to verify file serving
app.get("/test-uploads", (_req, res) => {
  const fs = require('fs');
  const uploadsDir = join(process.cwd(), 'uploads');

  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      status: "ok",
      uploadsDir,
      files: files.slice(0, 10),
      totalFiles: files.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.json({
      status: "error",
      uploadsDir,
      error: message
    });
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/providers", providersRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/uploads", uploadRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/bookings", bookingsRouter);
app.use("/api/v1/otp", otpRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

(async () => {
  if (process.env.MONGO_URI) {
    await connectDatabase(process.env.MONGO_URI);
    await ensureAdminSeed();
  } else {
    console.warn("MONGO_URI not set. Server will run without DB connection.");
  }

  server.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
    console.log(`WebSocket server ready on ws://localhost:${PORT}`);
  });
})();

export default app;
