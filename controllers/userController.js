const User = require('../models/User');
const multer = require('multer');
const storage = require('../config/firebase');
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
const Member = require('../models/Member');
const Membership = require('../models/Membership');

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).single('image');

const signup = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;
    const newUser = new User({ firstName, lastName, phone, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const signin = async (req, res) => {
  try {
    let user;
    const { emailOrPhone, password } = req.body;

    if (emailOrPhone.includes('@')) {
      user = await User.findOne({ email: emailOrPhone });
    } else {
      user = await User.findOne({ phone: emailOrPhone });
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '29d' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updateFields = req.body;

    // Check membership status
    const membership = await Membership.findOne({ user: userId });

    if (!membership) {
      // If membership doesn't exist, update the user profile normally
      const validUserFields = Object.keys(User.schema.paths);

      for (const field in updateFields) {
        if (!validUserFields.includes(field)) {
          return res.status(400).json({ error: `Invalid field: ${field}` });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

      return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    }

    // Declare updatedUser and updatedMember variables outside the switch statement
    let updatedUser;
    let updatedMember;

    // Determine the behavior based on the membership status
    switch (membership.status) {
      case 'applied':
        // If membership status is "applied", update the user profile only
        const validUserFields = Object.keys(User.schema.paths);

        for (const field in updateFields) {
          if (!validUserFields.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });

      case 'active':
      case 'about to expire':
        // If membership status is "active" or "about to expire", update both user and member profiles
        const validMemberFields = Object.keys(Member.schema.paths);
        const validHouseholdFields = Object.keys(Household.schema.paths);

        // Validate update fields for both member and household
        for (const field in updateFields) {
          if (!validMemberFields.includes(field) && !validHouseholdFields.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        // Update user profile
        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        // Update member profile
        updatedMember = await Member.findOneAndUpdate(
          { user: userId },
          updateFields,
          { new: true }
        );

        // Update household profile (if applicable)
        if ('member' in updateFields) {
          const updatedHousehold = await Household.findOneAndUpdate(
            { member: updatedMember._id },
            updateFields,
            { new: true }
          );

          return res.status(200).json({ message: 'User, member, and household profiles updated successfully', user: updatedUser, member: updatedMember, household: updatedHousehold });
        }

        return res.status(200).json({ message: 'User and member profiles updated successfully', user: updatedUser, member: updatedMember });

      case 'denied':
      case 'expired':
        // If membership status is "denied" or "expired", update only the user profile
        const validUserFieldsDenied = Object.keys(User.schema.paths);

        for (const field in updateFields) {
          if (!validUserFieldsDenied.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });

      default:
        return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error in updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error in deleting account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadProfileImage = (req, res) => {
  try {
    multerUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else if (err) {
        console.error('Error in uploading profile image:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
      }

      const imageName = `${req.user.userId}-${Date.now()}-${req.file.originalname}`;
      const imageRef = storage.bucket().file(imageName);
      const fileBuffer = req.file.buffer;

      await imageRef.save(fileBuffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      const imageUrl = `https://storage.googleapis.com/${storage.bucket().name}/${imageName}`;

      await User.findByIdAndUpdate(req.user.userId, { $set: { imageUrl } });

      res.status(200).json({ message: 'Profile image uploaded successfully', imageUrl });
    });
  } catch (error) {
    console.error('Error in uploading profile image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// images are optional it shouldnt make the images url array empty if no images are provided it should keep the state of images url array as it is. please update only those fields which are provided by the user do not change the previous state of the fields which are not provided by the user.


const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = req.user.userId;

    // Find the user's membership status
    const membership = await Membership.findOne({ user: userId });

    if (!membership) {
      // If membership doesn't exist, return the user profile without any membership-related information
      const user = await User.findById(userId);
      return res.status(200).json({ profile: user });
    }

    // Determine the behavior based on the membership status
    switch (membership.status) {
      case 'applied':
        // If membership status is "applied", return a message indicating that the profile access is applied
        return res.status(200).json({ message: 'applied' });
      case 'active':
      case 'about to expire':
      case 'expired':
        // If membership status is "active", "about to expire", or "expired", return user, member, and household profiles
        const user = await User.findById(userId);
        const member = await Member.findOne({ user: userId });
        const household = await Household.findOne({ member: member._id });
        return res.status(200).json({ user: user, member: member, household: household });
      case 'denied':
        // If membership status is "denied", return a message indicating that the profile access is denied
        return res.status(403).json({ error: 'Access to profile is denied' });
      default:
        return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error in getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getAllUserForAdmin = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view this resource' });
    }

    const users = await User.find();

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error getting all users for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserByIdForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view this resource' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check membership status
    const membership = await Membership.findOne({ user: userId });

    // If membership status is active or about to expire, fetch member details and household details
    if (membership && (membership.status === 'active' || membership.status === 'about to expire')) {
      const member = await Member.findOne({ user: userId });
      const household = await Household.findOne({ member: member._id });

      return res.status(200).json({ user, member, household });
    }

    // If membership doesn't exist or status is not active/about to expire, return only user details
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting user by ID for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const createUserForAdmin = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to create users' });
    }

    const newUser = new User({ firstName, lastName, phone, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUserProfileForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateFields = req.body;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update user profiles' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check membership status
    const membership = await Membership.findOne({ user: userId });

    if (!membership) {
      // If membership doesn't exist, update the user profile normally
      const validUserFields = Object.keys(User.schema.paths);

      for (const field in updateFields) {
        if (!validUserFields.includes(field)) {
          return res.status(400).json({ error: `Invalid field: ${field}` });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

      return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    }

    // Declare updatedUser and updatedMember variables outside the switch statement
    let updatedUser;
    let updatedMember;

    // Determine the behavior based on the membership status
    switch (membership.status) {
      case 'applied':
        // If membership status is "applied", update the user profile only
        const validUserFields = Object.keys(User.schema.paths);

        for (const field in updateFields) {
          if (!validUserFields.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });

      case 'active':
      case 'about to expire':
        // If membership status is "active" or "about to expire", update both user and member profiles
        const validMemberFields = Object.keys(Member.schema.paths);

        // Validate update fields for member
        for (const field in updateFields) {
          if (!validMemberFields.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        // Update user profile
        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        // Update member profile
        updatedMember = await Member.findOneAndUpdate(
          { user: userId },
          updateFields,
          { new: true }
        );

        return res.status(200).json({ message: 'User and member profiles updated successfully', user: updatedUser, member: updatedMember });

      case 'denied':
      case 'expired':
        // If membership status is "denied" or "expired", update only the user profile
        const validUserFieldsDenied = Object.keys(User.schema.paths);

        for (const field in updateFields) {
          if (!validUserFieldsDenied.includes(field)) {
            return res.status(400).json({ error: `Invalid field: ${field}` });
          }
        }

        updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });

      default:
        return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error in updating user profile for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const deleteUserForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete users' });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user for admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
  

// users can post blog, users can signup for events, they can like, comment (limited), update their own record

module.exports = {
  signup,
  signin,
  updateUserProfile,
  deleteAccount,
  uploadProfileImage,
  getUserProfile,
  getAllUserForAdmin,
  getUserByIdForAdmin,
  createUserForAdmin,
  updateUserProfileForAdmin,
  deleteUserForAdmin
};

