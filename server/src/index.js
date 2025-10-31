const path = require("path");
// Load environment variables with fallbacks. Prefer environment-specific files.
const dotenv = require("dotenv");
function loadEnv() {
  const candidates = [];
  // If NODE_ENV is set, try .env.<env> first (e.g. .env.production)
  if (process.env.NODE_ENV) {
    candidates.push(path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`));
  }
  // Project-level .env in repo root and server folder
  candidates.push(path.resolve(__dirname, "../.env"));
  candidates.push(path.resolve(__dirname, ".env"));

  for (const p of candidates) {
    try {
      const result = dotenv.config({ path: p });
      if (!result || result.error) continue;
      console.log(`Loaded env from ${p}`);
      return p;
    } catch (e) {
      // continue to next
    }
  }

  console.warn('No .env file loaded from candidates:', candidates);
  return null;
}

loadEnv();


const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")

const app = express()

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)

// Rate limiting - Exclude safe GET requests and OPTIONS requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: "Too many requests from this IP, please try again later.",
  skip: (req) => {
    // Skip rate limiting for safe GET requests and OPTIONS requests
    return (req.method === 'GET' && (
      req.path.startsWith('/api/enrollments/progress/') ||
      req.path === '/api/enrollments/me' ||
      req.path === '/api/certificates/me'
    )) || req.method === 'OPTIONS';
  },
  handler: (req, res) => {
    console.log(`Rate limit reached for IP: ${req.ip}, path: ${req.path}, method: ${req.method}`);
    res.status(429).json({ message: "Too many requests from this IP, please try again later." });
  }
})
app.use(limiter)

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan("combined"))
} else {
  app.use(morgan("dev"))
}

// Enhanced CORS configuration for both development and production
const developmentOrigins = [
  'http://localhost:5173',  // Vite default
  'http://localhost:3000',  // Alternative dev port
  'http://127.0.0.1:5173', // Local IP variant
  'http://127.0.0.1:3000'  // Local IP variant
];

const productionOrigins = [
  'https://online.rymaacademy.cloud',    // Main production domain
  process.env.CLIENT_URL,                // Production URL from env
  process.env.FRONTEND_URL               // Alternative production URL
].filter(Boolean); // Remove undefined/null values

// Add custom allowed origins from environment
const customOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [...productionOrigins, ...customOrigins]
  : [...developmentOrigins, ...productionOrigins, ...customOrigins];

// CORS middleware configuration - Enhanced for multiple IPs and origins
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // In production, check allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: [
      "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "Cache-Control",
      "Pragma",
      "X-Real-IP",
      "X-Forwarded-For"
    ],
    exposedHeaders: [
      'Content-Disposition',
      'Content-Length',
      'X-Total-Count',
      'X-Rate-Limit-Remaining'
    ],
    maxAge: process.env.NODE_ENV === 'production' ? 86400 : 1 // 24 hours in production, 1 second in development
  })
);

// Enhanced headers middleware for file uploads and preflight
app.use((req, res, next) => {
  // Set vary header to help with caching
  res.vary('Origin');
  
  // Additional security headers for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.header('Access-Control-Max-Age', process.env.NODE_ENV === 'production' ? '86400' : '1');
    return res.status(200).json({});
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/certificates", express.static(path.join(__dirname, "public/certificates")))
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// MongoDB connection (original code)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
  
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  })
})
// Route imports
const authRoutes = require("../routes/auth")
const courseRoutes = require("../routes/courses")
const contactRoutes = require("../routes/contact")
const enrollmentRoutes = require("../routes/enrollment")
const paymentRoutes = require("../routes/payments")
const certificateRoutes = require("../routes/certificates")
const adminRoutes = require("../routes/admin")
const instructorRoutes = require("../routes/instructor")
const uploadRoutes = require("../routes/upload")
const courseReviewsRoutes = require("../routes/courseReviews")
const referralRoutes = require("../routes/referral")

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/certificates", certificateRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/instructor", instructorRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/courseReviews", courseReviewsRoutes)
app.use("/api/referral", referralRoutes)

app.use("/api/*splat", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "/api/auth",
      "/api/courses",
      "/api/contact",
      "/api/enrollments",
      "/api/payments",
      "/api/certificates",
      "/api/courseReviews",
    ],
  })
})


// Health check


// API info
app.get("/api", (req, res) => {
  res.json({
    message: "MERN LMS API Server with Razorpay",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      courses: "/api/courses",
      contact: "/api/contact",
      enrollments: "/api/enrollments",
      payments: "/api/payments",
      certificates: "/api/certificates",
      health: "/api/health",
    },
  })
})
 


// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err)

  // Handle ECONNRESET (client closed connection) - don't try to send response
  if (err.code === 'ECONNRESET') {
    console.log('Connection reset by client - skipping response');
    return;
  }

  // Check if response can be sent
  if (!res.headersSent && res.writable) {
    try {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message)
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid input data",
          details: errors,
        })
      }

      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({
          error: "Duplicate Error",
          message: `${field} already exists`,
          field: field,
        })
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Authentication Error",
          message: "Invalid token",
        })
      }

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Authentication Error",
          message: "Token expired",
        })
      }

      if (err.code === "ENOENT") {
        return res.status(404).json({
          error: "File Not Found",
          message: "Requested file does not exist",
        })
      }

      res.status(err.status || 500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      })
    } catch (sendErr) {
      console.error('Failed to send error response:', sendErr);
    }
  } else {
    console.log('Response already sent or connection closed - skipping error response');
  }
})

// Process error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to exit, but for now, log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log and continue
});

// Graceful shutdown

// Start server
const PORT = process.env.PORT || 2000
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 MERN LMS API Server with Razorpay`)
  console.log(`📖 Docs: http://localhost:${PORT}/api`)
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`)
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`)
  } else {
    console.error("❌ Server error:", err)
  }
  process.exit(1)
})

module.exports = app
