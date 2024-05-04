



const express = require('express');
const router = express.Router();
const { applyForMembership, updateMemberStatus } = require('../controllers/membershipController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Route to apply for membership
router.post('/apply', authenticateUser, applyForMembership);

// Route to update member status
router.put('/updateStatus', authenticateUser, updateMemberStatus);

module.exports = router;
