const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    /*
    ================================================
    GET TOKEN FROM AUTHORIZATION HEADER
    ================================================
    
    Expected:

    Authorization: Bearer YOUR_TOKEN
    */

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    /*
    ================================================
    VERIFY TOKEN
    ================================================
    */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
    ================================================
    STORE USER INFORMATION IN REQUEST
    ================================================
    */

    req.user = decoded;

    // Continue to controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;
