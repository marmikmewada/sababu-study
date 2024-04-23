// authMiddleware.js

// Import necessary modules
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware function to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from the token payload
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach the user object to the request
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export the middleware
module.exports = authenticateUser;
