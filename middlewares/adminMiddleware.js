// adminMiddleware.js

// Middleware function to authorize admin access
const authorizeAdmin = (req, res, next) => {
    try {
      // Check if the user is an admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
  
      // Proceed to the next middleware
      next();
    } catch (error) {
      console.error('Error authorizing admin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Export the middleware
  module.exports = authorizeAdmin;
  