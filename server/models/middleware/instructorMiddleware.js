const instructorMiddleware = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please log in to access this resource",
      })
    }

    // Check if user has instructor or admin role
    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied",
        message: "Instructor or admin privileges required to access this resource",
        userRole: req.user.role,
        requiredRoles: ["instructor", "admin"],
      })
    }

    // User has appropriate role, proceed
    next()
  } catch (error) {
    console.error("Instructor middleware error:", error)
    res.status(500).json({
      error: "Authorization error",
      message: "Failed to verify instructor privileges",
    })
  }
}

module.exports = instructorMiddleware
