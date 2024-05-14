const BlogPost = require('../models/BlogPosts');
const multer = require('multer');
const storage = require('../config/firebase');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).array('images', 5); // Limiting to 5 images


const createBlogPost = async (req, res) => {
  try {
      const { title, content, tags } = req.body;
      const uploadedImageUrls = [];

      if (req.files && req.files.length > 0) {
          const bucket = storage.bucket();

          const uploadPromises = req.files.map(file => {
              const blob = bucket.file(`${Date.now()}_${file.originalname}`);
              const blobStream = blob.createWriteStream({
                  metadata: {
                      contentType: file.mimetype,
                  },
              });

              return new Promise((resolve, reject) => {
                  blobStream.on('error', error => reject(error));
                  blobStream.on('finish', async () => {
                  //     try {
                  //         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                  //         uploadedImageUrls.push(publicUrl);
                  //         resolve(publicUrl);
                  //     } catch (error) {
                  //         reject(error);
                  //     }
                  // });
                  blob.makePublic().then(() => {
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    uploadedImageUrls.push(publicUrl);
                    resolve(publicUrl);
                  }).catch(error => reject(error));
                });
                  blobStream.end(file.buffer);
              });
          });

          // Wait for all uploads to complete
          await Promise.all(uploadPromises);
      }

      const newBlogPost = new BlogPost({
          title,
          content,
          tags: tags.split(',').map(tag => tag.trim()),
          images: uploadedImageUrls,
          author: req.user._id
      });

      await newBlogPost.save();

      res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
  } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};



// const createBlogPost = async (req, res) => {
//   try {
//     const { title, content, tags } = req.body;
//     const uploadedImageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       const uploadPromises = req.files.map(file => {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         return new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               uploadedImageUrls.push(publicUrl);
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       });

//       // Wait for all uploads to complete
//       await Promise.all(uploadPromises);
//     }

//     const newBlogPost = new BlogPost({
//       title,
//       content,
//       tags: tags.split(',').map(tag => tag.trim()),
//       images: uploadedImageUrls,
//       author: req.user._id
//     });

//     await newBlogPost.save();

//     res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
//   } catch (error) {
//     console.error('Error creating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const updateBlogPost = async (req, res) => {
  try {
    const blogPostId = req.params.blogPostId;
    const blogPost = await BlogPost.findById(blogPostId);

    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blogPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const updatedFields = {
      title: req.body.title || blogPost.title,
      content: req.body.content || blogPost.content,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : blogPost.tags
    };

    // Clear existing image URLs from the document if new images are uploaded
    if (req.files && req.files.length > 0) {
      blogPost.images = []; // Clear out old images from the document

      const bucket = storage.bucket(); // Use the Firebase storage bucket

      const uploadPromises = req.files.map(file => {
        const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise((resolve, reject) => {
          blobStream.on('error', error => reject(error));
          blobStream.on('finish', async () => {
            try {
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              blogPost.images.push(publicUrl);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
          blobStream.end(file.buffer);
        });
      });

      // Wait for all new images to be uploaded
      await Promise.all(uploadPromises);
      updatedFields.images = blogPost.images; // Update image array with new URLs
    }

    // Update the blog post with new fields and possibly new images
    await BlogPost.findByIdAndUpdate(blogPostId, { $set: updatedFields }, { new: true });

    res.status(200).json({ message: 'Blog post updated successfully', blogPost: updatedFields });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// const createBlogPost = async (req, res) => {
//   try {
//     const { title, content, tags } = req.body;
//     const uploadedImageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       for (const file of req.files) {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         await new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               uploadedImageUrls.push(publicUrl); // Push the URL into the uploadedImageUrls array
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       }
//     }

//     const newBlogPost = new BlogPost({
//       title,
//       content,
//       tags: tags.split(',').map(tag => tag.trim()),
//       images: uploadedImageUrls, // Assign the uploadedImageUrls array to the images field
//       author: req.user._id
//     });

//     await newBlogPost.save();

//     res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
//   } catch (error) {
//     console.error('Error creating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const updateBlogPost = async (req, res) => {
//   try {
//     const blogPostId = req.params.blogPostId;
//     const blogPost = await BlogPost.findById(blogPostId);

//     if (!blogPost) {
//       return res.status(404).json({ error: 'Blog post not found' });
//     }

//     if (blogPost.author.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Unauthorized access' });
//     }

//     blogPost.images = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       for (const file of req.files) {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         await new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               blogPost.images.push(publicUrl); // Push the URL into the blogPost.images array
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       }
//     }

//     blogPost.title = req.body.title || blogPost.title;
//     blogPost.content = req.body.content || blogPost.content;
//     blogPost.tags = req.body.tags.split(',').map(tag => tag.trim());

//     await blogPost.save();

//     res.status(200).json({ message: 'Blog post updated successfully', blogPost });
//   } catch (error) {
//     console.error('Error updating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// const createBlogPost = async (req, res) => {
//   try {
//     const { title, content, tags } = req.body;
//     const uploadedImageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       // Map each file to a promise that uploads it to Firebase Storage
//       const uploadPromises = req.files.map(file => {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         return new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               uploadedImageUrls.push(publicUrl);
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       });

//       // Wait for all uploads to complete before proceeding
//       await Promise.all(uploadPromises);
//     }

//     const newBlogPost = new BlogPost({
//       title,
//       content,
//       tags: tags.split(',').map(tag => tag.trim()),
//       images: uploadedImageUrls,
//       author: req.user._id
//     });

//     await newBlogPost.save();

//     res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
//   } catch (error) {
//     console.error('Error creating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const updateBlogPost = async (req, res) => {
//   try {
//     const blogPostId = req.params.blogPostId;
//     const blogPost = await BlogPost.findById(blogPostId);

//     if (!blogPost) {
//       return res.status(404).json({ error: 'Blog post not found' });
//     }

//     if (blogPost.author.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Unauthorized access' });
//     }

//     blogPost.images = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       // Map each file to a promise that uploads it to Firebase Storage
//       const uploadPromises = req.files.map(file => {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         return new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               blogPost.images.push(publicUrl);
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       });

//       // Wait for all uploads to complete before proceeding
//       await Promise.all(uploadPromises);
//     }

//     blogPost.title = req.body.title || blogPost.title;
//     blogPost.content = req.body.content || blogPost.content;
//     blogPost.tags = req.body.tags.split(',').map(tag => tag.trim());

//     await blogPost.save();

//     res.status(200).json({ message: 'Blog post updated successfully', blogPost });
//   } catch (error) {
//     console.error('Error updating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };






// const createBlogPost = async (req, res) => {
//   try {
//     const { title, content, tags } = req.body;
//     const uploadedImageUrls = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       for (const file of req.files) {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         await new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               uploadedImageUrls.push(publicUrl);
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       }
//     }

//     const newBlogPost = new BlogPost({
//       title,
//       content,
//       tags: tags.split(',').map(tag => tag.trim()),
//       images: uploadedImageUrls,
//       author: req.user._id
//     });

//     await newBlogPost.save();

//     res.status(201).json({ message: 'Blog post created successfully', blogPost: newBlogPost });
//   } catch (error) {
//     console.error('Error creating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const updateBlogPost = async (req, res) => {
//   try {
//     const blogPostId = req.params.blogPostId;
//     const blogPost = await BlogPost.findById(blogPostId);

//     if (!blogPost) {
//       return res.status(404).json({ error: 'Blog post not found' });
//     }

//     if (blogPost.author.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Unauthorized access' });
//     }

//     blogPost.images = [];

//     if (req.files && req.files.length > 0) {
//       const bucket = storage.bucket();

//       for (const file of req.files) {
//         const blob = bucket.file(`blog/${Date.now()}_${file.originalname}`);
//         const blobStream = blob.createWriteStream({
//           metadata: {
//             contentType: file.mimetype,
//           },
//         });

//         await new Promise((resolve, reject) => {
//           blobStream.on('error', error => reject(error));
//           blobStream.on('finish', async () => {
//             try {
//               const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//               blogPost.images.push(publicUrl);
//               resolve(publicUrl);
//             } catch (error) {
//               reject(error);
//             }
//           });
//           blobStream.end(file.buffer);
//         });
//       }
//     }

//     blogPost.title = req.body.title || blogPost.title;
//     blogPost.content = req.body.content || blogPost.content;
//     blogPost.tags = req.body.tags.split(',').map(tag => tag.trim());

//     await blogPost.save();

//     res.status(200).json({ message: 'Blog post updated successfully', blogPost });
//   } catch (error) {
//     console.error('Error updating blog post:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };




// Helper function to extract subfields from form data
const extractSubFields = (field) => {
  const subFields = {};
  for (const key in field) {
    if (field.hasOwnProperty(key)) {
      const parts = key.split('.');
      if (parts.length > 1) {
        const subField = parts[1];
        subFields[subField] = field[key];
      }
    }
  }
  return subFields;
};




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
  
  //get blogs in descending order. 
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
  