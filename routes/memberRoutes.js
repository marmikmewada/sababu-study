const express = require('express');
const router = express.Router();
const { getAllMembers, getMemberProfileById, getMemberProfileByIdForAdmin } = require('../controllers/memberController');

// Routes for members
router.get('/', getAllMembers);
router.get('/:userId', getMemberProfileById);

// Route for admin to get member profile by ID
router.get('/admin/:userId', getMemberProfileByIdForAdmin);

module.exports = router;
