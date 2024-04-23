const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Newsletter Subscription schema
const NewsletterSubsSchema = new Schema({
  email: {
    type: String,
    required: true
  }
});

// Create and export the Newsletter Subscription model
module.exports = mongoose.model("NewsletterSubs", NewsletterSubsSchema);
