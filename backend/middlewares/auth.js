// /middlewares/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  console.log("Auth middleware triggered for:", req.method, req.path);

  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Received token:", token ? "exists" : "missing");

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token payload:", decoded);

    // Make sure we're attaching the user ID correctly
    req.user = {
      _id: decoded.userId, // Ensure this matches your JWT payload structure
      // ...decoded,
      userId: decoded.userId, // Add this for compatibility
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

module.exports = auth;
