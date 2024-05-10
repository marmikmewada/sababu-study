// // userRoutes.js
// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');
// const multer = require('multer');

// // Set up multer storage engine
// const storageEngine = multer.memoryStorage(); // Store file in memory
// const multerUpload = multer({ storage: storageEngine }).single('image');

// // User signup route
// router.post('/signup', userController.signup);

// // User signin route
// router.post('/signin', userController.signin);

// // Update user profile route
// router.put('/profile', userController.updateUserProfile);

// // Delete user account route
// router.delete('/profile', userController.deleteAccount);

// // Upload profile image route
// router.post('/profile/image',multerUpload, userController.uploadProfileImage);

// // Get user profile route
// router.get('/profile', userController.getUserProfile);

// // Admin routes
// // Get all users route for admin
// router.get('/admin/users', userController.getAllUserForAdmin);

// // Get user by ID route for admin
// router.get('/admin/users/:userId', userController.getUserByIdForAdmin);

// // Create user route for admin
// router.post('/admin/users', userController.createUserForAdmin);

// // Update user profile route for admin
// router.put('/admin/users/:userId', userController.updateUserProfileForAdmin);

// // Delete user route for admin
// router.delete('/admin/users/:userId', userController.deleteUserForAdmin);

// module.exports = router; // Ensure router object is exported


const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const authenticateUser = require('../middlewares/authMiddleware'); // Import the authentication middleware

// Set up multer storage engine
const storageEngine = multer.memoryStorage(); // Store file in memory
const multerUpload = multer({ storage: storageEngine }).single('image');

// User signup route
router.post('/signup', userController.signup);

// User signin route
router.post('/signin', userController.signin);

// Update user profile route
router.put('/profile', authenticateUser, userController.updateUserProfile);
router.put('/member', authenticateUser, userController.updateMemberProfile);
router.put('/household', authenticateUser, userController.updateHouseholdProfile);

// Delete user account route
router.delete('/profile', authenticateUser, userController.deleteAccount);

// Upload profile image route
router.post('/profile/image', authenticateUser, multerUpload, userController.uploadProfileImage);

// Get user profile route
router.get('/profile', authenticateUser, userController.getUserProfile);

// Admin routes
// Get all users route for admin
router.get('/admin/users', authenticateUser, userController.getAllUserForAdmin);

// Get user by ID route for admin
router.get('/admin/users/:userId', authenticateUser, userController.getUserByIdForAdmin);

// Create user route for admin
router.post('/admin/users', authenticateUser, userController.createUserForAdmin);

// Update user profile route for admin
router.put('/admin/user/:userId', authenticateUser, userController.updateUserProfileForAdmin);
router.put('/admin/member:userId', authenticateUser, userController.updateMemberProfileForAdmin);
router.put('/admin/household/:userId', authenticateUser, userController.updateHouseholdProfileForAdmin);

// Delete user route for admin
router.delete('/admin/users/:userId', authenticateUser, userController.deleteUserForAdmin);

module.exports = router; // Ensure router object is exported
