// a user can create an event, if user provides images they should first get stored in firebase storage like we did earlier and then the event can be created. we use async await here. a user can update on every update request, the isApproved status will go false, a user can delete event. 


const Event = require('../models/Event');
const multer = require('multer');
const storage = require('../config/firebase');
// const { getSignedUrl } = require('firebase-admin/storage');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).array('images', 2); // Limiting to 2 images

// Controller to create an event
// Controller to create an event

const createEvent = async (req, res) => {
  try {
    console.log(req.body); // Initial log to inspect the raw body

    // Parse address fields from form data into a structured object
    const parsedAddress = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('address.')) {
        const subKey = key.split('.')[1];
        parsedAddress[subKey] = req.body[key];
      }
    });

    // Replace flat address fields with the structured object
    req.body.address = parsedAddress;

    const { name, type, description, venue, capacity, cost, startTime, endTime, startDate, endDate, organiser, organization, address } = req.body;

    if (!address || Object.keys(address).length === 0) {
      return res.status(400).json({ error: "Address field is missing or incomplete" });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      const bucket = storage.bucket(); // Use the Firebase storage bucket

      const uploadPromises = req.files.map(file => {
        const blob = bucket.file(`events/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise((resolve, reject) => {
          blobStream.on('error', error => reject(error));
          blobStream.on('finish', () => {
            blob.makePublic().then(() => {
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              images.push(publicUrl);
              resolve(publicUrl);
            }).catch(error => reject(error));
          });
          blobStream.end(file.buffer);
        });
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    }

    // Create a new event instance with the processed data
    const newEvent = new Event({
      name,
      type,
      description,
      venue,
      capacity,
      address,
      images,
      cost,
      startTime,
      endTime,
      startDate,
      endDate,
      organiser,
      organization,
      postedBy: req.user._id
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Automatically reset isApproved to false on every update
    const updateFields = req.body;
    updateFields.isApproved = false;

    // Parse and update address fields
    const parsedAddress = {};
    if (req.body.address) {
      Object.keys(req.body.address).forEach(key => {
        parsedAddress[key] = req.body.address[key];
      });
      updateFields.address = parsedAddress;
    }

    // Clear existing image URLs from the document if new images are uploaded
    if (req.files && req.files.length > 0) {
      existingEvent.images = []; // Clear out old images from the document

      const bucket = storage.bucket(); // Use the Firebase storage bucket
      const uploadPromises = req.files.map(file => {
        const blob = bucket.file(`events/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise((resolve, reject) => {
          blobStream.on('error', error => reject(error));
          blobStream.on('finish', () => {
            blob.makePublic().then(() => {
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              existingEvent.images.push(publicUrl);
              resolve();
            }).catch(error => reject(error));
          });
          blobStream.end(file.buffer);
        });
      });

      // Wait for all new images to be uploaded
      await Promise.all(uploadPromises);
      updateFields.images = existingEvent.images; // Update image array with new URLs
    }

    // Update the event with new fields and possibly new images
    const updatedEvent = await Event.findByIdAndUpdate(eventId, { $set: updateFields }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Failed to update event' });
    }

    res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
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
