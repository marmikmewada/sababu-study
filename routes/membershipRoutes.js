const express = require('express');
const router = express.Router();
const { applyForMembership, updateMemberStatus } = require('../controllers/membershipController');

// Route to apply for membership
router.post('/apply', applyForMembership);

// Route to update member status
router.put('/updateStatus', updateMemberStatus);

module.exports = router;
