const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Volunteer schema
const VolunteerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  // Optional reference to the User schema
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  organization: {
    type: String,
  },
  organizationType: {
    type: String,
  },
  address: {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zip: {
      type: String,
    },
  },
  note: {
    type: String,
    maxlength: 200, // Maximum 200 characters
  },
  volunteerStatus: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
});

// Create and export the Volunteer model
module.exports = mongoose.model("Volunteer", VolunteerSchema);
