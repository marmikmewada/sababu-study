const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Route to create a comment
router.post('/create', authenticateUser, commentController.createComment);

// Route to edit a comment
router.put('/:commentId/edit', authenticateUser, commentController.editComment);

// Route to delete a comment
router.delete('/:commentId/delete', authenticateUser, commentController.deleteComment);

// Route to get all comments by blog post ID
router.get('/post/:blogPostId', commentController.getAllCommentsByPostId);

// Routes accessible only to admin
// Route to get all comments
router.get('/admin/all', authenticateUser, commentController.getAllComments);

// Route to delete multiple comments
router.delete('/admin/delete-multiple', authenticateUser, commentController.deleteMultipleComments);

module.exports = router;
