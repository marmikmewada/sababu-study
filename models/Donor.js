const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Donor schema
const DonorSchema = new Schema({
  name: {
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
  // Optional reference to the User schema
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  organization: {
    type: String
  },
  organizationType: {
    type: String
  },
  donationsType: {
    type: String
  },
  donationAmount: {
    type: Number
  },
  address: {
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    zip: {
      type: String
    }
  },
  note: {
    type: String,
    maxlength: 200 // Maximum 200 characters
  }
});

// Create and export the Donor model
module.exports = mongoose.model("Donor", DonorSchema);
