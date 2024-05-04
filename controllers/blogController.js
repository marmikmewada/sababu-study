const BlogPost = require('../models/BlogPosts');
const multer = require('multer');
const storage = require('../config/firebase');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).array('images', 5); // Limiting to 5 images

// Controller to create a blog post
const createBlogPost = async (req, res) => {
  try {
    // Upload images to Firebase Storage if provided
    multerUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else if (err) {
        console.error('Error uploading images:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      try {
        // Extract uploaded image URLs
        const images = req.files ? req.files.map(file => file.location) : [];

        // Extract data from request body
        const { title, content, author, tags } = req.body;

        // Create a new blog post instance
        const newBlogPost = new BlogPost({
          title,
          content,
          author,
          tags,
          images: images || [] // If no images are provided, set it to an empty array
        });

        // Save the blog post to the database
        await newBlogPost.save();

        res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
      } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 

const updateBlogPost = async (req, res) => {
    try {
      const blogPostId = req.params.blogPostId;
      const updateFields = req.body;
  
      // Reset isApproved status to false on update
      updateFields.isApproved = false;
  
      // Upload images to Firebase Storage if provided
      multerUpload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        } else if (err) {
          console.error('Error uploading images:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  
        try {
          // Extract uploaded image URLs
          const images = req.files ? req.files.map(file => file.location) : [];
  
          // If new images are uploaded, delete previously stored image URLs
          if (images.length > 0) {
            const blogPost = await BlogPost.findById(blogPostId);
            // Delete previous images from Firebase Storage
            for (const imageUrl of blogPost.images) {
              // Your code to delete images from Firebase Storage goes here
            }
            // Update the blog post with new images
            updateFields.images = images;
          } else {
            // If no new images are uploaded, do not modify the images field in updateFields
            delete updateFields.images;
          }
  
          // Update the blog post
          const updatedBlogPost = await BlogPost.findByIdAndUpdate(
            blogPostId,
            { $set: updateFields },
            { new: true }
          );
  
          if (!updatedBlogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
          }
  
          res.status(200).json({ message: 'Blog post updated successfully', blogPost: updatedBlogPost });
        } catch (error) {
          console.error('Error updating blog post:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }; 
  
 
  // Controller to delete a blog post
const deleteBlogPost = async (req, res) => {
    try {
      const blogPostId = req.params.blogPostId;
  
      // Delete the blog post
      await BlogPost.findByIdAndDelete(blogPostId);
  
      res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Controller to get all blog posts
  const getAllBlogPosts = async (req, res) => {
    try {
      const blogPosts = await BlogPost.find();
  
      res.status(200).json({ blogPosts });
    } catch (error) {
      console.error('Error getting all blog posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Controller to get a blog post by ID
  const getBlogPostById = async (req, res) => {
    try {
      const blogPostId = req.params.blogPostId;
      const blogPost = await BlogPost.findById(blogPostId);
  
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      res.status(200).json({ blogPost });
    } catch (error) {
      console.error('Error getting blog post by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // admin can get all blogs no matter which user, all blogs
  // admin can get a single blog
  // admin can update a single blog
  // admin can delete multiple blogs
  // admin can Toggle approve status of multiple blogs - we dont have toggle for blog for admin. 

  const toggleBlogPostApproval = async (req, res) => {
    try {
      // Check if user is an admin
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      const blogPostId = req.params.blogPostId;
      const blogPost = await BlogPost.findById(blogPostId);
  
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      // Toggle the isApproved field
      blogPost.isApproved = !blogPost.isApproved;
      await blogPost.save();
  
      res.status(200).json({ message: 'Blog post approval status toggled successfully', blogPost });
    } catch (error) {
      console.error('Error toggling blog post approval status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const deleteMultipleBlogPosts = async (req, res) => {
    try {
      // Check if user is an admin
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
  
      const { blogPostIds } = req.body;
  
      // Validate if blogPostIds is an array
      if (!Array.isArray(blogPostIds)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }
  
      // Delete the blog posts
      await BlogPost.deleteMany({ _id: { $in: blogPostIds } });
  
      res.status(200).json({ message: 'Blog posts deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  module.exports = {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    toggleBlogPostApproval,
    deleteMultipleBlogPosts
  };
  