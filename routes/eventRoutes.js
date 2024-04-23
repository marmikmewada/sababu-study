const express = require('express');
const router = express.Router();
const { createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

// Controller to create an event
router.post('/create', createEvent);

// Controller to update an event
router.put('/:eventId/update', updateEvent);

// Controller to delete an event
router.delete('/:eventId/delete', deleteEvent);

module.exports = router;
