const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Comment schema
const CommentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User who authored the comment
    required: true
  },
  blogPost: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost', // Reference to the BlogPost the comment is associated with
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Middleware to limit one user from commenting more than 5 times on the same blog post
CommentSchema.pre('save', async function(next) {
  try {
    const user = this.author;
    const blogPost = this.blogPost;

    // Count the number of comments by the user on the same blog post
    const count = await this.constructor.countDocuments({
      author: user,
      blogPost: blogPost
    });

    // Check if the user has exceeded the limit (assuming 5 comments per user per blog post)
    if (count >= 5) {
      throw new Error('You have exceeded the limit of comments on this blog post.');
    }

    // If the user has not exceeded the limit, continue with saving the comment
    next();
  } catch (error) {
    next(error);
  }
});

// Export the Comment model
module.exports = mongoose.model('Comment', CommentSchema);
