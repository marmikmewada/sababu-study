
const rateLimit = require('express-rate-limit');
const Like = require('../models/Like');

// Define rate limiting options
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Max 10 requests per hour
  message: 'Too many requests from this IP, please try again later.'
});

// // Controller to like a blog post
// const likeBlogPost = async (req, res) => {
//   try {
//     const { blogPostId, userId } = req.body;

//     // Check if the like is by a user or a visitor
//     const user = userId ? userId : null;

//     // Create a new like instance
//     const newLike = new Like({
//       user,
//       blogPost: blogPostId
//     });

//     // Save the like to the database
//     await newLike.save();

//     // Send a response indicating the successful like
//     res.status(201).json({ message: 'Blog post liked successfully', like: newLike });

//     // If the like is by a visitor, set a cookie or store the like state in client-side storage
//     if (!user) {
//       // Example: Set a cookie named 'likedPosts' or store in local storage
//       res.cookie('likedPosts', { [blogPostId]: true }, { maxAge: 24 * 60 * 60 * 1000 }); // Expires in 24 hours
//     }
//   } catch (error) {
//     console.error('Error liking blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Controller to unlike a blog post
// const unlikeBlogPost = async (req, res) => {
//   try {
//     const { blogPostId, userId } = req.body;

//     // Check if the unlike is by a user or a visitor
//     const user = userId ? userId : null;

//     // Find and delete the like based on blog post ID and user ID (if provided)
//     const deletedLike = await Like.findOneAndDelete({ user, blogPost: blogPostId });

//     if (!deletedLike) {
//       return res.status(404).json({ error: 'Like not found' });
//     }

//     // Send a response indicating the successful unlike
//     res.status(200).json({ message: 'Blog post unliked successfully', like: deletedLike });

//     // If the unlike is by a visitor, remove the like state from the cookie or client-side storage
//     if (!user) {
//       // Example: Remove the blog post ID from the 'likedPosts' cookie or local storage
//       res.clearCookie('likedPosts');
//     }
//   } catch (error) {
//     console.error('Error unliking blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// Controller to get all likes by blog post ID

// Controller to like or unlike a blog post
const toggleLike = async (req, res, isLike) => {
  try {
    const { blogPostId } = req.body;
    const userId = req.user._id; // Retrieve userId from the request object

    let message, statusCode;
    let like = null;

    if (isLike) {
      // Create a new like instance
      like = new Like({ user: userId, blogPost: blogPostId });
      await like.save();
      message = 'Blog post liked successfully';
      statusCode = 201;
    } else {
      // Find and delete the like based on blog post ID and user ID (if provided)
      like = await Like.findOneAndDelete({ user: userId, blogPost: blogPostId });
      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }
      message = 'Blog post unliked successfully';
      statusCode = 200;
    }

    // Send a response indicating the successful like/unlike
    res.status(statusCode).json({ message, like });
  } catch (error) {
    console.error(`Error ${isLike ? 'liking' : 'unliking'} blog post:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to like a blog post
const likeBlogPost = async (req, res) => {
  await toggleLike(req, res, true);
};

// Controller to unlike a blog post
const unlikeBlogPost = async (req, res) => {
  await toggleLike(req, res, false);
};







const getLikesByBlogId = async (req, res) => {
  try {
    const blogPostId = req.params.blogPostId;

    // Find all likes associated with the given blog post ID
    const likes = await Like.find({ blogPost: blogPostId });

    res.status(200).json({ message: 'Likes retrieved successfully', likes });
  } catch (error) {
    console.error('Error getting likes by blog post ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export the controllers
module.exports = {
  likeBlogPost,
  unlikeBlogPost,
  getLikesByBlogId
};
