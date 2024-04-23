const EventSignups = require('../models/EventSignups');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Controller to sign up for an event
const signupForEvent = async (req, res) => {
  try {
    const eventId = req.body.eventId;
    const numberOfVisitors = req.body.numberOfVisitors || 1; // Default to 1 visitor

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.capacity && event.capacity < numberOfVisitors) {
      return res.status(400).json({ error: 'Event capacity reached, cannot sign up' });
    }

    // Check if the total number of visitors for the event exceeds capacity
    if (event.visitors && event.visitors + numberOfVisitors > event.capacity) {
      return res.status(400).json({ error: 'Event capacity reached, cannot sign up' });
    }

    // Create a new event signup
    const newSignup = new EventSignups({
      eventId: event._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      numberOfVisitors
    });

    // If user is logged in, add their user ID to the signup
    if (req.user) {
      newSignup.user = req.user._id;
    }

    // Save the signup
    await newSignup.save();

    // Update the visitors count in the event
    await Event.findByIdAndUpdate(eventId, { $inc: { visitors: numberOfVisitors } });

    res.status(201).json({ message: 'Successfully signed up for the event', signup: newSignup });
  } catch (error) {
    console.error('Error signing up for event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signupForEvent
};
