const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") }); // ✅ Load from correct path

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Compression middleware
app.use(compression())

// Logging middleware
app.use(morgan("combined"))

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/certificates", express.static(path.join(__dirname, "public/certificates")))
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));
  
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
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
const uploadRoutes = require("../routes/upload")

// Use routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/enrollments", enrollmentRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/certificates", certificateRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)

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
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? '*****' : 'MISSING!');

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
})

// Graceful shutdown


app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true, // if you need cookies/auth
}));



// Start server
const PORT = process.env.PORT || 5000
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
