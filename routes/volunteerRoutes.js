const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

// Route to become a volunteer
router.post('/become', volunteerController.becomeVolunteer);

// Route to update volunteer status
router.put('/:volunteerId/status', volunteerController.updateVolunteerStatus);

module.exports = router;
