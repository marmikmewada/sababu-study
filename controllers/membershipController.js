// apply for membership 
// update member status


const Membership = require('../models/Membership');

// Controller to apply for membership
const applyForMembership = async (req, res) => {
  try {
    // Extract data from request body
    const { user, membershipType } = req.body;

    // Create a new membership instance
    const newMembership = new Membership({
      user,
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
const updateMemberStatus = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update membership status' });
    }

    // Extract data from request body
    const { userId, newStatus } = req.body;

    // Find the membership by user ID
    const membership = await Membership.findOne({ user: userId });

    // Check if membership exists
    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    // Update the membership status
    membership.status = newStatus;

    // Save the updated membership to the database
    await membership.save();

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
