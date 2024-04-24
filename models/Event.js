const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Event schema
const EventSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  venue: {
    type: String
  },
  capacity: {
    type: Number
  },
  address: {
    type: String
  },
  images: [{
    type: String // Array of image URLs
  }],
  cost: {
    type: Number,
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Reference to the User who posted the event
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Organiser details
  organiser: {
    type: String
  },
  // Organization details
  organization: {
    type: String
  },
  // Event status
  eventStatus: {
    type: String,
    enum: ['active', 'full', 'finished'],
    default: 'active'
  },
  // Indicates whether the event is approved or not
  isApproved: {
    type: Boolean,
    default: false
  },
  // Number of visitors
  visitors: {
    type: Number
  }
});

// Add a custom validator to limit the number of images to two
EventSchema.path('images').validate(function(value) {
  return value.length <= 2;
}, 'Only two images are allowed per event');

module.exports = mongoose.model('Event', EventSchema);
