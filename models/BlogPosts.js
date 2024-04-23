const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the BlogPost schema
const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100 // Limit title to 100 characters
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who authored the blog post
    required: true
  },
  tags: [{
    type: String
  }],
  images: [{
    type: String // Array of image URLs
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

// Middleware to check the daily blog post limit
BlogPostSchema.pre('save', async function(next) {
  try {
    const user = this.author; // Assuming the author is a reference to the User model
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the beginning of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set time to the beginning of the next day
    
    // Count the number of blog posts by the user created today
    const count = await this.constructor.countDocuments({
      author: user,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Check if the user has reached the daily limit (assuming 2 posts per day)
    if (count >= 2) {
      throw new Error('You have reached the daily limit of blog posts.');
    }
    
    // If the user has not reached the limit, continue with saving the blog post
    next();
  } catch (error) {
    next(error);
  }
});

// Create and export the BlogPost model
module.exports = mongoose.model('BlogPost', BlogPostSchema);
