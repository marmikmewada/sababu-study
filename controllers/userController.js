require("dotenv").config();
// const {User} = require("../models/User");
const mongoose = require('mongoose'); 
const User = require("../models/User");
// const User = require("../models/User").default;

const multer = require("multer");
const storage = require("../config/firebase");
const jwt = require("jsonwebtoken");
// const User = require('../models/User');
const Member = require("../models/Member");
const { ObjectId } = require("mongoose").Types;
const Household = require("../models/Household");
const Membership = require("../models/Membership");
const xss = require("xss");

const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage }).single("image");

const signup = async (req, res) => {
  try {
    // Sanitize input data to prevent script injection
    const sanitizedFirstName = xss(req.body.firstName);
    const sanitizedMiddleName = xss(req.body.middleName);
    const sanitizedLastName = xss(req.body.lastName);
    const sanitizedPhone = xss(req.body.phone);
    const sanitizedEmail = xss(req.body.email);
    const sanitizedPassword = xss(req.body.password);
    const sanitizedGender = xss(req.body.gender);
    const sanitizedDob = xss(req.body.dob);
    const sanitizedStreet = xss(req.body.address.street);
    const sanitizedCity = xss(req.body.address.city);
    const sanitizedState = xss(req.body.address.state);
    const sanitizedZip = xss(req.body.address.zip);

    // Parse the date of birth in the USA format (month-date-year)
    const [year, month, date] = sanitizedDob.split("-").map(Number);

    // Calculate age based on date of birth
    const userDob = new Date(year, month - 1, date); // Months are 0-indexed in JavaScript
    const today = new Date();
    let age = today.getFullYear() - userDob.getFullYear();

    // Calculate the difference in months between birth date and today
    const monthDiff = today.getMonth() - userDob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < userDob.getDate())) {
      age--;
    }

    // Check if user is 16 or older
    if (age < 16) {
      return res
        .status(400)
        .json({ error: "You must be at least 16 years old to sign up." });
    }

    const newUser = new User({
      firstName: sanitizedFirstName,
      middleName: sanitizedMiddleName,
      lastName: sanitizedLastName,
      phone: sanitizedPhone,
      email: sanitizedEmail,
      password: sanitizedPassword,
      gender: sanitizedGender,
      dob: userDob,
      address: {
        street: sanitizedStreet,
        city: sanitizedCity,
        state: sanitizedState,
        zip: sanitizedZip
      }
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const signin = async (req, res) => {
  try {
    let user;
    const { emailOrPhone, password } = req.body;

    // Sanitize input data to prevent script injection
    const sanitizedEmailOrPhone = xss(emailOrPhone);

    if (sanitizedEmailOrPhone.includes("@")) {
      user = await User.findOne({ email: sanitizedEmailOrPhone });
    } else {
      user = await User.findOne({ phone: sanitizedEmailOrPhone });
    }

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ message: "Invalid email/phone or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "29d",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateFields = req.body;

    // Check if userId is provided
    if (!userId) {
      console.error("User ID is missing in the request");
      return res.status(400).json({ error: "User ID is missing in the request" });
    }

    // Find the user by ID and update the fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields }, // Update all fields provided in the request body
      { new: true } // Return the updated document
    );

    // If user not found, return error
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Log the fields saved in the database
    console.log("Fields saved in the database:", updatedUser);

    // If user updated successfully, return success message and updated user data
    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const updateMemberProfile = async (req, res) => {
  const userId = req.user._id;  // Assuming req.user is populated by your authentication middleware
  const updates = req.body;

  try {
    // Find the member by user ID and update
    const member = await Member.findOneAndUpdate({ user: userId }, { $set: updates }, { new: true, runValidators: true });

    if (!member) {
      return res.status(404).send({ message: 'Member not found' });
    }

    res.send({ message: 'Profile updated successfully', member });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update member profile', error: error.message });
  }
};

// const updateHouseholdProfile = async (req, res) => {
//   const userId = req.user._id;  // Assuming req.user is populated by your authentication middleware

//   try {
//     // First find the member to get the household ID
//     const member = await Member.findOne({ user: userId });
//     if (!member) {
//       return res.status(404).send({ message: 'Member not found' });
//     }

//     // Now find and update the associated household
//     const updates = req.body;
//     const household = await Household.findOneAndUpdate({ member: member._id }, { $set: updates }, { new: true, runValidators: true });
    
//     if (!household) {
//       return res.status(404).send({ message: 'Household not found' });
//     }

//     res.send({ message: 'Household profile updated successfully', household });
//   } catch (error) {
//     res.status(500).send({ message: 'Failed to update household profile', error: error.message });
//   }
// };


const updateHouseholdProfile = async (req, res) => {
  const userId = req.user._id;  // Assuming req.user is populated by your authentication middleware

  try {
    // First find the member to get the household ID
    const member = await Member.findOne({ user: userId });
    if (!member) {
      return res.status(404).send({ message: 'Member not found' });
    }

    // Define the updates
    const updates = req.body;

    // Find the household associated with the member or create it if it does not exist
    const household = await Household.findOneAndUpdate(
      { member: member._id }, 
      { $set: updates }, 
      { new: true, upsert: true, runValidators: true }  // Using upsert option
    );

    // Send the updated or newly created household back to the client
    res.send({ message: 'Household profile updated successfully', household });
  } catch (error) {
    console.error('Failed to update or create household:', error);
    res.status(500).send({ message: 'Failed to update or create household profile', error: error.message });
  }
};



const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error in deleting account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    // No need for multer middleware here, as it's already applied in the routes file
    // Multer middleware has already parsed the uploaded file and stored it in req.file
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Log information about the uploaded file
    console.log("Uploaded file:", req.file);

    const imageName = `${req.user._id}-${Date.now()}-${req.file.originalname}`;
    const imageRef = storage.bucket().file(imageName);
    const fileBuffer = req.file.buffer;

    // Save the file to Firebase Storage
    await imageRef.save(fileBuffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Get the public URL of the uploaded file
    const [url] = await imageRef.getSignedUrl({
      action: "read",
      expires: "01-01-2100", // Set the expiration date far in the future
    });

    // Update the user document with the public URL
    await User.findByIdAndUpdate(req.user._id, { $set: { imageUrl: url } });

    res
      .status(200)
      .json({ message: "Profile image uploaded successfully", imageUrl: url });
  } catch (error) {
    console.error("Error in uploading profile image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// images are optional it shouldnt make the images url array empty if no images are provided it should keep the state of images url array as it is. please update only those fields which are provided by the user do not change the previous state of the fields which are not provided by the user.

const getUserProfile = async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = req.user._id;

    // Find the user's membership status
    const membership = await Membership.findOne({ user: userId });

    if (!membership) {
      // If membership doesn't exist, return the user profile without any membership-related information
      const user = await User.findById(userId);
      return res.status(200).json({ profile: user });
    }

    // Determine the behavior based on the membership status
    switch (membership.status) {
      case "applied":
        // If membership status is "applied", return a message indicating that the profile access is applied
        return res.status(200).json({ message: "applied" });
      case "active":
      case "about to expire":
      case "expired":
        // If membership status is "active", "about to expire", or "expired", return user, member, and household profiles
        const user = await User.findById(userId);
        const member = await Member.findOne({ user: userId });
        const household = await Household.findOne({ member: member._id });
        return res
          .status(200)
          .json({ user: user, member: member, household: household });
      case "denied":
        // If membership status is "denied", return a message indicating that the profile access is denied
        return res.status(403).json({ error: "Access to profile is denied" });
      default:
        return res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Error in getting user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUserForAdmin = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this resource" });
    }

    const users = await User.find();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error getting all users for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserByIdForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You are not authorized to view this resource" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check membership status
    const membership = await Membership.findOne({ user: userId });

    // If membership status is active or about to expire, fetch member details and household details
    if (
      membership &&
      (membership.status === "active" ||
        membership.status === "about to expire")
    ) {
      const member = await Member.findOne({ user: userId });
      const household = await Household.findOne({ member: member._id });

      return res.status(200).json({ user, member, household });
    }

    // If membership doesn't exist or status is not active/about to expire, return only user details
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user by ID for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUserForAdmin = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You are not authorized to create users" });
    }

    const newUser = new User({ firstName, lastName, phone, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// const updateUserProfileForAdmin = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const updateFields = req.body;

//     // Check if the user is an admin
//     if (req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ error: "You are not authorized to update user profiles" });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check membership status
//     const membership = await Membership.findOne({ user: userId });

//     // Declare updatedUser and updatedMember variables outside the switch statement
//     let updatedUser;
//     let updatedMember;

//     // Determine the behavior based on the membership status
//     switch (membership ? membership.status : null) {
//       case "active":
//       case "about to expire":
//         // If membership status is "active" or "about to expire", update both user and member profiles
//         const validMemberFields = Object.keys(Member.schema.paths);

//         // Validate update fields for member
//         for (const field in updateFields) {
//           if (!validMemberFields.includes(field)) {
//             return res.status(400).json({ error: `Invalid field: ${field}` });
//           }
//         }

//         // Update user profile
//         updatedUser = await User.findByIdAndUpdate(
//           userId,
//           { $set: updateFields },
//           { new: true }
//         );

//         // Update member profile
//         updatedMember = await Member.findOneAndUpdate(
//           { user: userId },
//           updateFields,
//           { new: true }
//         );

//         return res.status(200).json({
//           message: "User and member profiles updated successfully",
//           user: updatedUser,
//           member: updatedMember,
//         });

//       case "denied":
//       case "expired":
//         // If membership status is "denied" or "expired", update only the user profile
//         const validUserFieldsDenied = Object.keys(User.schema.paths);

//         for (const field in updateFields) {
//           if (!validUserFieldsDenied.includes(field)) {
//             return res.status(400).json({ error: `Invalid field: ${field}` });
//           }
//         }

//         updatedUser = await User.findByIdAndUpdate(
//           userId,
//           { $set: updateFields },
//           { new: true }
//         );

//         return res.status(200).json({
//           message: "User profile updated successfully",
//           user: updatedUser,
//         });

//       case "applied":
//         // If membership status is "applied", update the user profile only
//         const validUserFields = Object.keys(User.schema.paths);

//         for (const field in updateFields) {
//           if (!validUserFields.includes(field)) {
//             return res.status(400).json({ error: `Invalid field: ${field}` });
//           }
//         }

//         updatedUser = await User.findByIdAndUpdate(
//           userId,
//           { $set: updateFields },
//           { new: true }
//         );

//         return res.status(200).json({
//           message: "User profile updated successfully",
//           user: updatedUser,
//         });

//       default:
//         return res.status(500).json({ error: "Internal server error" });
//     }
//   } catch (error) {
//     console.error("Error in updating user profile for admin:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
const updateUserProfileForAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const userId = req.params.userId;
  const updateFields = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const updateMemberProfileForAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const userId = req.params.userId;
  try {
    const member = await Member.findOneAndUpdate({ user: userId }, { $set: req.body }, { new: true, runValidators: true });

    if (!member) {
      return res.status(404).send({ message: 'Member not found' });
    }

    res.send({ message: 'Member profile updated successfully', member });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update member profile', error: error.message });
  }
};

const updateHouseholdProfileForAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const userId = req.params.userId;
  try {
    const member = await Member.findOne({ user: userId });
    if (!member) {
      return res.status(404).send({ message: 'Member not found' });
    }

    const household = await Household.findOneAndUpdate(
      { member: member._id }, 
      { $set: req.body }, 
      { new: true, upsert: true, runValidators: true }
    );

    if (!household) {
      return res.status(404).send({ message: 'Household not found' });
    }

    res.send({ message: 'Household profile updated successfully', household });
  } catch (error) {
    res.status(500).send({ message: 'Failed to update household profile', error: error.message });
  }
};




const deleteUserForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete users" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// users can post blog, users can signup for events, they can like, comment (limited), update their own record

module.exports = {
  signup,
  signin,
  updateUserProfile,
  updateMemberProfile,
  updateHouseholdProfile,
  deleteAccount,
  uploadProfileImage,
  getUserProfile,
  getAllUserForAdmin,
  getUserByIdForAdmin,
  createUserForAdmin,
  updateUserProfileForAdmin,
  updateMemberProfileForAdmin,
  updateHouseholdProfileForAdmin,
  deleteUserForAdmin,
};
