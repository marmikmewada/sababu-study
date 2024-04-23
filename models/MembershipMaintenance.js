const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the MembershipMaintenance schema
const MembershipMaintenanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create and export the MembershipMaintenance model
module.exports = mongoose.model('MembershipMaintenance', MembershipMaintenanceSchema);
