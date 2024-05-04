const Donor = require('../models/Donor');
const Donation = require('../models/Donations');
const { validationResult } = require('express-validator');

// Controller to donate
const donate = async (req, res) => {
  try {
    const { name, email, phone, organization, organizationType, donationsType, donationAmount, address, note } = req.body;
    let donorId;

    // Check if the user is logged in
    if (req.user) {
      // If the user is logged in, create or update donor info
      const existingDonor = await Donor.findOne({ user: req.user._id });
      if (existingDonor) {
        // Update existing donor info
        await Donor.findByIdAndUpdate(existingDonor._id, { $set: { name, email, phone, organization, organizationType, donationsType, donationAmount, address, note } });
        donorId = existingDonor._id;
      } else {
        // Create new donor info
        const newDonor = new Donor({ name, email, phone, user: req.user._id, organization, organizationType, donationsType, donationAmount, address, note });
        const savedDonor = await newDonor.save();
        donorId = savedDonor._id;
      }
    } else {
      // If the user is not logged in, create donor info without user reference
      const newDonor = new Donor({ name, email, phone, organization, organizationType, donationsType, donationAmount, address, note });
      const savedDonor = await newDonor.save();
      donorId = savedDonor._id;
    }

    // Create donation
    const newDonation = new Donation({ donor: donorId });
    await newDonation.save();

    res.status(201).json({ message: 'Donation successful', donation: newDonation });
  } catch (error) {
    console.error('Error donating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to update donation status
const updateDonationStatus = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update donation status' });
    }

    const donationId = req.params.donationId;
    const { donationStatus } = req.body;

    // Update donation status
    const updatedDonation = await Donation.findByIdAndUpdate(donationId, { $set: { donationStatus } }, { new: true });

    if (!updatedDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.status(200).json({ message: 'Donation status updated successfully', donation: updatedDonation });
  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller to get all donations
const getAllDonations = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to access this resource' });
    }

    // Retrieve all donations from the database
    const donations = await Donation.find().populate('donor'); // Populate the donor field

    res.status(200).json({ donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller to toggle donation status
const toggleDonationStatus = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to toggle donation status' });
    }

    const donationId = req.params.donationId;

    // Find the donation by ID
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Toggle donation status
    donation.donationStatus = donation.donationStatus === 'pending' ? 'donated' : 'pending';
    await donation.save();

    res.status(200).json({ message: 'Donation status toggled successfully', donation });
  } catch (error) {
    console.error('Error toggling donation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = {
  donate,
  updateDonationStatus,
  getAllDonations,
  toggleDonationStatus
};
