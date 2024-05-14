const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware
const multer = require('multer');
const storage = require('../config/firebase');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

// Route to create a blog post
router.post('/create', authenticateUser, multerUpload.array('images', 5), blogController.createBlogPost);

// Route to update a blog post
router.put('/:blogPostId/update', authenticateUser, multerUpload.array('images', 5), blogController.updateBlogPost);

// Route to delete a blog post
router.delete('/:blogPostId/delete', authenticateUser, blogController.deleteBlogPost);

// Route to get all blog posts
router.get('/all', blogController.getAllBlogPosts);

// Route to get a blog post by ID
router.get('/:blogPostId', blogController.getBlogPostById);

// Routes accessible only to admin
// Route to toggle blog post approval status
router.put('/:blogPostId/toggle-approval', authenticateUser, blogController.toggleBlogPostApproval);

// Route to delete multiple blog posts
router.delete('/admin/delete-multiple', authenticateUser, blogController.deleteMultipleBlogPosts);

module.exports = router;
