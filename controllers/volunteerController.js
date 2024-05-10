const Volunteer = require('../models/Volunteer');


// IMP note - we will make a small change in the get user profle controller we will also send them their volunteer status if possible or volunteer details so they can see that in their profile. 
// Controller to become a volunteer
const becomeVolunteer = async (req, res) => {
  try {
    const { name, email, phone, organization, organizationType, address, note } = req.body;

    // Check if the user is logged in
    let user;
    if (req.user) {
      user = req.user._id;
    }

    // Create a new volunteer instance
    const newVolunteer = new Volunteer({
      name,
      email,
      phone,
      user,
      organization,
      organizationType,
      address,
      note
    });

    // Save the volunteer
    await newVolunteer.save();

    res.status(201).json({ message: 'Successfully became a volunteer', volunteer: newVolunteer });
  } catch (error) {
    console.error('Error becoming a volunteer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to update volunteer status
const updateVolunteerStatus = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update volunteer status' });
    }

    const volunteerId = req.params.volunteerId;
    const { volunteerStatus } = req.body;

    // Update the volunteer status
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(volunteerId, { $set: { volunteerStatus } }, { new: true });

    if (!updatedVolunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.status(200).json({ message: 'Volunteer status updated successfully', volunteer: updatedVolunteer });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get all volunteers
const getAllVolunteers = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view all volunteers' });
    }

    const volunteers = await Volunteer.find();
    res.status(200).json({ volunteers });
  } catch (error) {
    console.error('Error getting all volunteers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get volunteer by ID
const getVolunteerById = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view volunteer details' });
    }

    const volunteerId = req.params.volunteerId;
    const volunteer = await Volunteer.findById(volunteerId);

    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    res.status(200).json({ volunteer });
  } catch (error) {
    console.error('Error getting volunteer by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get all pending volunteers
const getPendingVolunteers = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to view pending volunteers' });
    }

    const pendingVolunteers = await Volunteer.find({ volunteerStatus: 'pending' });
    res.status(200).json({ pendingVolunteers });
  } catch (error) {
    console.error('Error getting pending volunteers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  becomeVolunteer,
  updateVolunteerStatus,
  getAllVolunteers,
  getVolunteerById,
  getPendingVolunteers // Add this controller
};

