const express = require('express');
const router = express.Router();
const eventSignupsController = require('../controllers/eventSignupsController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Route to sign up for an event
router.post('/signup', authenticateUser, eventSignupsController.signupForEvent);

module.exports = router;
