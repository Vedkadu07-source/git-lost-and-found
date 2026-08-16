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
// --- 10/10 SECURITY CONFIGURATION ---

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

// ------------------------------------
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

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

// 3. Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.listen(PORT, () => {
  console.log(`🚀 GIT Lost & Found API running on http://localhost:${PORT}`);

});
// Start background automation
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 GIT Lost & Found API running on http://localhost:${PORT}`);
});