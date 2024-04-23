const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Donation schema
const DonationSchema = new Schema({
  donor: {
    type: Schema.Types.ObjectId,
    ref: "Donor",
    required: true
  },
  donationStatus: {
    type: String,
    enum: ["pending", "donated"],
    default: "pending"
  }
});

// Create and export the Donation model
module.exports = mongoose.model("Donation", DonationSchema);
