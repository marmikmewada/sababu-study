// a user can create an event, if user provides images they should first get stored in firebase storage like we did earlier and then the event can be created. we use async await here. a user can update on every update request, the isApproved status will go false, a user can delete event. 


const Event = require('../models/Event');
const multer = require('multer');
const storage = require('../config/firebase');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).array('images', 2); // Limiting to 2 images

// Controller to create an event
// Controller to create an event
const createEvent = async (req, res, next) => {
  try {
    // Upload images to Firebase Storage if provided
    multerUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        // Extract uploaded image URLs
        const images = req.files ? req.files.map(file => file.location) : [];

        // Extract data from request body
        const { name, type, description, venue, capacity, cost, startTime, endTime, startDate, endDate, organiser, organization } = req.body;
        
        // Extract address data
        const { street, unit, city, state, zip } = req.body.address;

        // Create a new event instance
        const newEvent = new Event({
          name,
          type,
          description,
          venue,
          capacity,
          address: {
            street,
            unit,
            city,
            state,
            zip
          },
          images,
          cost,
          startTime,
          endTime,
          startDate,
          endDate,
          organiser,
          organization,
          postedBy: req.user._id // Assuming req.user contains the authenticated user's data
        });

        // Save the event to the database
        await newEvent.save();

        res.status(201).json({ message: 'Event created successfully', event: newEvent });
      } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Controller to update an event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const updateFields = req.body;

    // Reset isApproved status to false on update
    updateFields.isApproved = false;

    // Check if the user making the request is the same as the one who posted the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (String(event.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Extract address data
    const { street, unit, city, state, zip } = req.body.address;

    // Update the address fields in updateFields
    updateFields.address = {
      street,
      unit,
      city,
      state,
      zip
    };

    // Upload images to Firebase Storage if provided
    multerUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        // Extract uploaded image URLs
        const images = req.files ? req.files.map(file => file.location) : [];

        // If new images are uploaded, delete previously stored image URLs
        if (images.length > 0) {
          // Delete previous images from Firebase Storage
          for (const imageUrl of event.images) {
            // Your code to delete images from Firebase Storage goes here
          }
          // Update the event with new images
          updateFields.images = images;
        } else {
          // If no new images are uploaded, remove the images field from updateFields
          delete updateFields.images;
        }

        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(eventId, { $set: updateFields }, { new: true });

        if (!updatedEvent) {
          return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Controller to delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id; // Assuming req.user contains the logged-in user's information

    // Find the event by ID and check if the organiser is the logged-in user
    const event = await Event.findOne({ _id: eventId, organiser: userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to get all events created by the logged-in user
const getMyAllEvents = async (req, res) => {
  try {
    // Fetch all events where the organiser is the logged-in user
    const events = await Event.find({ organiser: req.user._id });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




// Controller to get a single event by event ID for the logged-in user
const getMyEventByEventId = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    // Find the event by ID and ensure that the organiser is the logged-in user
    const event = await Event.findOne({ _id: eventId, organiser: req.user._id });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to get all events in descending order
const getAllEvents = async (req, res) => {
  try {
    // Fetch all events in descending order of creation date
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get a single event by event ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// admin can change isApproved - eventApproveForAdmin, eventDeleteForAdmin

// Controller to approve or disapprove an event for admin
const eventApproveForAdmin = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const eventId = req.params.eventId;
    const { isApproved } = req.body;
    
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update the isApproved status
    event.isApproved = isApproved;

    // Save the updated event
    await event.save();

    res.status(200).json({ message: 'Event approval status updated successfully', event });
  } catch (error) {
    console.error('Error updating event approval status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to delete an event for admin
const eventDeleteForAdmin = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const eventId = req.params.eventId;

    // Find the event by ID and delete it
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// delete muiltple events for admin 
// Controller to delete multiple events for admin
const deleteMultipleEventsForAdmin = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const eventIds = req.body.eventIds;

    // Delete the events by IDs
    const deletedEvents = await Event.deleteMany({ _id: { $in: eventIds } });

    if (!deletedEvents) {
      return res.status(404).json({ error: 'Events not found' });
    }

    res.status(200).json({ message: 'Events deleted successfully' });
  } catch (error) {
    console.error('Error deleting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyAllEvents,
  getMyEventByEventId,
  getAllEvents,
  getEventById,
  eventApproveForAdmin,
  eventDeleteForAdmin,
  deleteMultipleEventsForAdmin
};
