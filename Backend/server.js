import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

// Custom Imports
import apiRoutes from "./api/routes/index.js";
import { setupSocket } from "./Socket/socket.js";
import { connectDB } from "./config/db.js";
import { seedMenu } from "./config/seed.js";
import { seedTables } from "./config/seedTables.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
// ✅ CORS: Allow requests from localhost and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://stunner-cafe-kol.netlify.app",
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve images from the public folder
app.use("/images", express.static(path.join(__dirname, "public/images")));

// 2. Socket.io Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  // ✅ Socket CORS: Allow connections from localhost and production
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 5000,
});

app.set("io", io);
setupSocket(io);

// 3. API Routes
app.use("/api", apiRoutes);

// Global Error Handler (Must be last)
app.use((err, req, res, next) => {
  // Import ApiResponse here or use inline response format
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send structured JSON response in ApiResponse format
  const response = {
    statuscode: statusCode,
    data: null,
    message: message,
    success: statusCode < 400,
  };

  // Only show stack trace in development mode
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// 4. Serve Frontend (Production Build - Uncomment when ready)
// app.use(express.static(path.join(__dirname, "dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

// 5. Initialize Database and Start Server
connectDB()
  .then(async () => {
    // Run seed logic safely
    await seedMenu();
    await seedTables();

    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Stunner Cafe Backend running on http://localhost:${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Critical Failure: Could not start server.", err);
    process.exit(1);
  });
