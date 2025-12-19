const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// 1. Environment Configuration
function loadEnv() {
  const candidates = [];
  if (process.env.NODE_ENV) {
    candidates.push(path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`));
  }
  candidates.push(path.resolve(__dirname, "../.env"), path.resolve(__dirname, ".env"));

  for (const p of candidates) {
    try {
      const result = dotenv.config({ path: p });
      if (result && !result.error) {
        console.log(`Loaded env from ${p}`);
        return p;
      }
    } catch (e) { /* ignore and move to next */ }
  }
  console.warn("No .env file loaded from candidates");
  return null;
}
loadEnv();

// 2. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();
app.set("trust proxy", true);

// 3. Security Middleware (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 4. CORS CONFIGURATION (Fix for "Refused to get unsafe header")
const developmentOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
const productionOrigins = ["https://online.rymaacademy.cloud", process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean);
const customOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];

const allowedOrigins = process.env.NODE_ENV === "production"
  ? [...productionOrigins, ...customOrigins]
  : [...developmentOrigins, ...productionOrigins, ...customOrigins];

app.use(cors({
  exposedHeaders: ["x-rtb-fingerprint-id"],
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if origin is allowed or is a subdomain of rymaacademy.cloud
    if (allowedOrigins.includes(origin) || origin.endsWith("rymaacademy.cloud")) {
      return callback(null, true);
    }

    // During dev, be permissive. In prod, you may want to be stricter.
    if (process.env.NODE_ENV !== "production") return callback(null, true);
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
    "x-rtb-fingerprint-id" // Allows the client to SEND the header
  ],
  exposedHeaders: [
    "Content-Disposition",
    "Content-Length",
    "X-Total-Count",
    "x-rtb-fingerprint-id" // CRITICAL: Allows the browser to READ the header
  ],
  maxAge: 86400, // Cache preflight response for 24 hours
}));

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  skip: (req) => {
    const isSafeGet = req.method === 'GET' && req.path.startsWith('/api/');
    const isPayment = req.path.startsWith('/api/payments/');
    const isOptions = req.method === 'OPTIONS';
    return isSafeGet || isPayment || isOptions;
  }
});
app.use(limiter);

// 6. Global Middlewares
app.use(compression());
app.use(process.env.NODE_ENV === "production" ? morgan("combined") : morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 7. Static Files
app.use("/uploads", express.static(path.join(__dirname, "../src/uploads"), {
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

// 8. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 9. Routes
const uploadRoutes = require("../routes/upload");
app.use("/api/auth", require("../routes/auth"));
app.use("/api/courses", require("../routes/courses"));
app.use("/api/contact", require("../routes/contact"));
app.use("/api/enrollments", require("../routes/enrollment"));
app.use("/api/payments", require("../routes/payments"));
app.use("/api/certificates", require("../routes/certificates"));
app.use("/api/admin", require("../routes/admin"));
app.use("/api/instructor", require("../routes/instructor"));
app.use("/api/upload", uploadRoutes);
app.use("/api/courseReviews", require("../routes/courseReviews"));
app.use("/api/referral", require("../routes/referral"));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime(), environment: process.env.NODE_ENV });
});

// 10. Global Error Handling
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);
  if (err.code === "ECONNRESET") return;

  if (!res.headersSent) {
    res.status(err.status || 500).json({
      error: err.name || "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
    });
  }
});

// 11. Server Initialization
const PORT = process.env.PORT || 2000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));

module.exports = app;