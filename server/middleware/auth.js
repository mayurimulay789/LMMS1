const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" })
    }
    const token = authHeader.replace("Bearer ", "")
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error("Auth middleware error (token verify):", err)
      return res.status(401).json({ message: "Invalid or expired token" })
    }
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }
    req.user = user
    return next()
  } catch (error) {
    console.error("Auth middleware unexpected error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
module.exports = auth
