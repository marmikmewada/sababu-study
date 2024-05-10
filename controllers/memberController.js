const Member = require('../models/Member');
const User = require("../models/User")
const { Membership }= require('../models/Membership');



const getAllMembers = async (req, res) => {
  try {
    console.log("Requester:", req.user);

    // If the requester is just a visitor or a user who is not logged in
    if (!req.user) {
      console.log("Requester is not logged in or a visitor");
      const members = await Member.find({});
      console.log("Members found:", members);
      return res.status(200).json({ members });
    }

    // If the requester is a user but not a member
    if (req.user.role === 'user') {
      console.log("Requester is a user");

      // Check if the user exists
      const user = await User.findById(req.user._id);
      if (!user) {
        console.log("User does not exist");
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the user has a membership
      const membership = await Membership.findOne({ user: req.user._id });
      if (!membership) {
        console.log("User is not a member");
        return res.status(200).json({ message: 'You are not a member' });
      }

      // If the membership is active or about to expire, fetch member details
      if (membership.status === 'active' || membership.status === 'about to expire') {
        const members = await Member.find({}, 'firstName lastName phone');
        console.log("Members found:", members);

        // Fetch additional details for members using user._id
        const membersWithUserDetails = await Promise.all(
          members.map(async (member) => {
            try {
              // Populate the user field with user details
              return {
                _id: member._id,
                firstName: member.firstName,
                lastName: member.lastName,
                phone: member.phone,
                user: user.toObject() // Convert to object to include all user details
              };
            } catch (error) {
              console.error('Error fetching user details:', error);
              return null; // Handle error
            }
          })
        );
        return res.status(200).json({ members: membersWithUserDetails });
      }
    }

    // If the requester is an admin, send all user details, member details, and household details
    if (req.user.role === 'admin') {
      console.log("Requester is an admin");
      const members = await Member.find().populate('user').populate({ 
        path: 'user', 
        populate: { path: 'household' } // Populate household details for each user
      });
      console.log("Admin found members:", members);
      return res.status(200).json({ members });
    }

    // Default response for other cases
    console.log("Unauthorized access");
    return res.status(403).json({ error: 'You are not authorized to view this list of members' });
  } catch (error) {
    console.error('Error getting all members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





const getMemberProfileById = async (req, res) => {
  try {
      const userId = req.params.userId;

      // Check if the logged-in member's status is active or about to expire
      const membership = await Membership.findOne({ user: req.user._id });
      if (!membership || (membership.status !== 'active' && membership.status !== 'about to expire')) {
          return res.status(403).json({ error: 'You are not authorized to view this profile' });
      }

      const member = await Member.findOne({ user: userId }).populate('household');

      if (!member) {
          return res.status(404).json({ error: 'Member not found' });
      }

      // Check if the user is trying to access their own profile
      if (userId === req.user._id.toString()) {
          return res.status(403).json({ error: 'You can\'t view your own profile' });
      }

      res.status(200).json({ member });
  } catch (error) {
      console.error('Error getting member by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

const getMemberProfileByIdForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view this profile' });
    }

    const member = await Member.findOne({ user: userId }).populate('household');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json({ member });
  } catch (error) {
    console.error('Error getting member by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {
  getAllMembers,
  getMemberProfileById,
  getMemberProfileByIdForAdmin
};
