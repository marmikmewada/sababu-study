  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  // Define the EventSignups schema
  const EventSignupsSchema = new Schema({
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    numberOfVisitors: {
      type: Number,
      required: true,
      default: 1 // Default to 1 visitor
    },
    // Reference to the User (optional)
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  });

  // Create and export the EventSignups model
  module.exports = mongoose.model('EventSignups', EventSignupsSchema);
