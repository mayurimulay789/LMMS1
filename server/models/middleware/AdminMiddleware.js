const adminMiddleware = (req, res, next) => {
  try {
    // Check if user is authenticated (auth middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please log in to access this resource",
      })
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "Admin privileges required to access this resource",
        userRole: req.user.role,
        requiredRole: "admin",
      })
    }

    // User is admin, proceed to next middleware
    next()
  } catch (error) {
    console.error("Admin middleware error:", error)
    res.status(500).json({
      error: "Authorization error",
      message: "Failed to verify admin privileges",
    })
  }
}

module.exports = adminMiddleware
