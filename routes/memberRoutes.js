// const express = require('express');
// const router = express.Router();
// const { getAllMembers, getMemberProfileById, getMemberProfileByIdForAdmin } = require('../controllers/memberController');

// // Routes for members
// router.get('/', getAllMembers);
// router.get('/:userId', getMemberProfileById);

// // Route for admin to get member profile by ID
// router.get('/admin/:userId', getMemberProfileByIdForAdmin);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllMembers, getMemberProfileById, getMemberProfileByIdForAdmin } = require('../controllers/memberController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Routes for members
router.get('/', authenticateUser, getAllMembers);
router.get('/:userId', authenticateUser, getMemberProfileById);

// Route for admin to get member profile by ID
router.get('/admin/:userId', authenticateUser, getMemberProfileByIdForAdmin);

module.exports = router;
