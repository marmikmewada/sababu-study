// Import necessary modules
const Comment = require('../models/Comment');
const badWords = require('bad-words'); // Assuming you're using a library like 'bad-words' to filter bad language

// Function to sanitize comment content
const sanitizeContent = (content) => {
  const filter = new badWords();
  return filter.clean(content);
};

// Controller to create a comment
const createComment = async (req, res) => {
  try {
    // Extract data from request body
    const { content, author, blogPost } = req.body;

    // Sanitize comment content
    const sanitizedContent = sanitizeContent(content);

    // Create a new comment instance
    const newComment = new Comment({
      content: sanitizedContent,
      author,
      blogPost
    });

    // Save the comment to the database
    await newComment.save();

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to edit a comment
const editComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const updateFields = req.body;

    // Sanitize comment content if it's provided
    if (updateFields.content) {
      updateFields.content = sanitizeContent(updateFields.content);
    }

    // Find the comment by ID and update it
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { $set: updateFields }, { new: true });

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment updated successfully', comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to delete a comment
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find the comment by ID and delete it
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Controller to get all comments by blog post ID
const getAllCommentsByPostId = async (req, res) => {
    try {
      const blogPostId = req.params.blogPostId;
  
      // Find all comments associated with the given blog post ID
      const comments = await Comment.find({ blogPost: blogPostId });
  
      res.status(200).json({ comments });
    } catch (error) {
      console.error('Error retrieving comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  // functions for admin

  // Controller to get all comments (accessible only to admin)
const getAllComments = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to access this resource' });
    }

    // Retrieve all comments from the database
    const comments = await Comment.find();

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to delete multiple comments (accessible only to admin)
const deleteMultipleComments = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to access this resource' });
    }

    const commentIds = req.body.commentIds;

    // Delete multiple comments by their IDs
    const deletedComments = await Comment.deleteMany({ _id: { $in: commentIds } });

    res.status(200).json({ message: 'Comments deleted successfully', deletedComments });
  } catch (error) {
    console.error('Error deleting comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export the controllers
module.exports = {
  createComment,
  editComment,
  deleteComment,
  getAllCommentsByPostId,
  //for admin
  getAllComments,
  deleteMultipleComments
};
