const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env; // Get from environment variable

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing or invalid." });
  }

  try {
    // Verify JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decodedToken; // Attach decoded user data to the request object
    console.log('Decoded Token:', decodedToken); // Log the decoded token
    req.userId = decodedToken.uid;
    req.userRole = decodedToken.role; // If you store role in the token
    next(); // Proceed to the next middleware (in this case, the route handler)
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = { verifyToken };
