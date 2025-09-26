const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null
      return next()
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      req.user = null
      return next()
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    req.user = null
    next()
  }
}

module.exports = auth
