const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Like schema
const LikeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who liked the blog post
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost', // Reference to the BlogPost the like is associated with
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Export the Like model
module.exports = mongoose.model('Like', LikeSchema);
