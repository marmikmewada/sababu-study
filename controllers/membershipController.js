// apply for membership 
// update member status


const Membership = require('../models/Membership');
// const MembershipSchema = require("../models/Membership")

const applyForMembership = async (req, res) => {
  try {
    // Extract user ID from the request object
    const userId = req.user._id;
    // Extract membershipType from request body
    const { membershipType } = req.body;

    // Create a new membership instance
    const newMembership = new Membership({
      user: userId, // Use the extracted user ID
      membershipType
    });

    // Save the membership to the database
    await newMembership.save();

    res.status(201).json({ message: 'Membership application submitted successfully' });
  } catch (error) {
    console.error('Error applying for membership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to update member status
// Controller to update member status
const updateMemberStatus = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update membership status' });
    }

    // Extract data from request body
    const { userStatusUpdates } = req.body;

    // Validate request body
    if (!Array.isArray(userStatusUpdates) || userStatusUpdates.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Iterate over each user status update object in the array
    for (const update of userStatusUpdates) {
      const { userId, newStatus } = update;

      // Find the membership by user ID
      const membership = await Membership.findOne({ user: userId });

      // Check if membership exists
      if (!membership) {
        return res.status(404).json({ error: `Membership not found for user ID: ${userId}` });
      }

      // Update the membership status
      membership.status = newStatus;

      // Save the updated membership to the database
      await membership.save();
    }

    res.status(200).json({ message: 'Membership status updated successfully' });
  } catch (error) {
    console.error('Error updating member status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {
  applyForMembership,
  updateMemberStatus
};
