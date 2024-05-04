// const express = require('express');
// const router = express.Router();
// const volunteerController = require('../controllers/volunteerController');


// // Route to become a volunteer
// router.post('/become', volunteerController.becomeVolunteer);

// // Route to update volunteer status
// router.put('/:volunteerId/status', volunteerController.updateVolunteerStatus);

// // Route to get all volunteers (admin only)
// router.get('/', volunteerController.getAllVolunteers);

// // Route to get volunteer by ID (admin only)
// router.get('/:volunteerId', volunteerController.getVolunteerById);



// module.exports = router;

const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Route to become a volunteer
router.post('/become', volunteerController.becomeVolunteer);

// Route to update volunteer status
router.put('/:volunteerId/status', authenticateUser, volunteerController.updateVolunteerStatus);

// Route to get all volunteers (admin only)
router.get('/', authenticateUser, volunteerController.getAllVolunteers);

// Route to get volunteer by ID (admin only)
router.get('/:volunteerId', authenticateUser, volunteerController.getVolunteerById);

// Route to get all pending volunteers (admin only)
router.get('/pending', authenticateUser, volunteerController.getPendingVolunteers);

module.exports = router;

