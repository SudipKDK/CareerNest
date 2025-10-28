import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && 
      req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  //  Check if token exists
  if (!token) { 
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token"
    });
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    //  Get user from database (without password)
    req.user = await User.findById(decoded.id).select("-password");

    // Check if user still exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Continue to next middleware/route
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid"
    });
  }
};