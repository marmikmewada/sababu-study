// const express = require('express');
// const router = express.Router();
// const { createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

// // Controller to create an event
// router.post('/create', createEvent);

// // Controller to update an event
// router.put('/:eventId/update', updateEvent);

// // Controller to delete an event
// router.delete('/:eventId/delete', deleteEvent);

// module.exports = router;


const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware
const multer = require('multer');
const storage = require('../config/firebase');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).array('images', 2); // Limiting to 2 images

// Route to create an event
router.post('/create', authenticateUser, multerUpload, eventController.createEvent);

// Route to update an event
router.put('/:eventId', authenticateUser, multerUpload, eventController.updateEvent);

// Route to delete an event
router.delete('/:eventId', authenticateUser, eventController.deleteEvent);

// Route to get all events created by the logged-in user
router.get('/my-events', authenticateUser, eventController.getMyAllEvents);

// Route to get a single event by event ID for the logged-in user
router.get('/my-events/:eventId', authenticateUser, eventController.getMyEventByEventId);

// Route to get all events in descending order
router.get('/', eventController.getAllEvents);

// Route to get a single event by event ID
router.get('/:eventId', eventController.getEventById);

// Route to approve or disapprove an event for admin
router.put('/:eventId/approve', authenticateUser, eventController.eventApproveForAdmin);

// Route to delete an event for admin
router.delete('/:eventId/admin', authenticateUser, eventController.eventDeleteForAdmin);

// Route to delete multiple events for admin
router.delete('/admin/delete-multiple', authenticateUser, eventController.deleteMultipleEventsForAdmin);

module.exports = router;
