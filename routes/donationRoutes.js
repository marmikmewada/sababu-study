const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Route to donate
router.post('/donate', authenticateUser, donationController.donate);

// Route to update donation status
router.put('/:donationId/status', authenticateUser, donationController.updateDonationStatus);

// Route to get all donations (admin only)
router.get('/all', authenticateUser, donationController.getAllDonations);

// Route to toggle donation status (admin only)
router.put('/:donationId/toggle-status', authenticateUser, donationController.toggleDonationStatus);

module.exports = router;
