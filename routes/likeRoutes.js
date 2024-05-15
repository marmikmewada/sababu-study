
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { likeBlogPost, unlikeBlogPost, getLikesByBlogId } = require('../controllers/likeController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Define rate limiting options
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Max 10 requests per hour
  message: 'Too many requests, please try again later.'
});

// Routes for handling likes
router.post('/', limiter, authenticateUser, likeBlogPost);
// router.post('/unlike', limiter, authenticateUser, unlikeBlogPost);
router.get('/:blogPostId/likes', authenticateUser, getLikesByBlogId);

module.exports = router;
