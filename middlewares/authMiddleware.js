

// Import necessary modules
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { User, UserSchema } = require("../models/User");
const User = require("../models/User");



const authenticateUser = async (req, res, next) => {
  try {
    // Get token from request headers
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.error('Authorization token is missing or invalid');
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    // Extract the token part from the Authorization header
    const token = authorizationHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token:', decoded);
    console.log('User ID:', decoded.userId);

    // Find user by ID from the token payload
    const user = await User.findById(decoded.userId);

    console.log('User found:', user);

    if (!user) {
      console.error('User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach the user object to the request
    req.user = user;

    console.log('User attached to request:', req.user);

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Export the middleware
module.exports = authenticateUser;



