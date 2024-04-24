const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { getAllDonations } = require('../controllers/donationController');
const { createComment, editComment, deleteComment, getAllCommentsByPostId } = require('../controllers/commentController');

// Route to become a volunteer
router.post('/become', volunteerController.becomeVolunteer);

// Route to update volunteer status
router.put('/:volunteerId/status', volunteerController.updateVolunteerStatus);

// Route to get all volunteers (admin only)
router.get('/', volunteerController.getAllVolunteers);

// Route to get volunteer by ID (admin only)
router.get('/:volunteerId', volunteerController.getVolunteerById);

// Route to get all donations (admin only)
router.get('/donations', getAllDonations);

// Route to create a comment
router.post('/comments', createComment);

// Route to edit a comment
router.put('/comments/:commentId', editComment);

// Route to delete a comment
router.delete('/comments/:commentId', deleteComment);

// Route to get all comments by blog post ID
router.get('/comments/:blogPostId', getAllCommentsByPostId);

module.exports = router;
