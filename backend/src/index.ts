import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { startCronJobs } from "./cron.service.js";
import itemRoutes from "./routes/item.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY CONFIGURATION ---

// 1. Trust the proxy (Required if you deploy to Render, Railway, or Vercel)
app.set("trust proxy", 1);

// 2. Helmet: Secure HTTP headers and hide Express identity
app.use(helmet());

// 3. CORS: Restrict API access to your frontend ONLY
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// 4. Rate Limiting: Prevent brute-force and DDoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP address to 100 requests per 15 minutes
  message: { error: "Too many requests from this IP. Please try again in 15 minutes." },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Apply the rate limiter strictly to all /api routes
app.use("/api", apiLimiter);

// 5. Body Parser
app.use(express.json());

// ------------------------------------

// 1. Root Endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "GIT Lost and Found API is online",
    healthCheck: "/api/health",
  });
});

// 2. Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// 3. Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// 4. Start Server (single call)
app.listen(PORT, () => {
  console.log(`🚀 GIT Lost & Found API running on http://localhost:${PORT}`);
});

// 5. Start background automation
startCronJobs();