import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // ✅ Check cookie first (normal mode)
    let token = req.cookies?.jwt;
    
    // ✅ If no cookie, check Authorization header (incognito mode fallback)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // ✅ If still no token, return 401
    if (!token) {
      console.log("⚠️ No token found - check headers:", {
        hasCookie: !!req.cookies?.jwt,
        hasAuthHeader: !!req.headers.authorization,
      });
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("❌ User not found for token");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed", error: err.message });
  }
};