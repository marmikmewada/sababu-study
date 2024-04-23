const Member = require('../models/Member');
const Membership = require('../models/Membership');

const getAllMembers = async (req, res) => {
  try {
    // If the requester is just a visitor or a user who is not logged in
    if (!req.user) {
      const members = await Member.find({}, 'firstName lastName');
      return res.status(200).json({ members });
    }

    // If the requester is a user but not a member
    if (req.user && req.user.role === 'user') {
      const membership = await Membership.findOne({ user: req.user._id });
      if (!membership) {
        const members = await Member.find({}, 'firstName lastName');
        return res.status(200).json({ members });
      }
      if (membership && (membership.status === 'active' || membership.status === 'about to expire')) {
        const members = await Member.find({}, 'firstName lastName phone');
        return res.status(200).json({ members });
      }
    }

    // If the requester is an admin, send all user details, member details, and household details
    if (req.user.role === 'admin') {
      const members = await Member.find().populate('user').populate('household');
      return res.status(200).json({ members });
    }

    // Default response for other cases
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
