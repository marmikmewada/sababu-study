const mongoose = require('mongoose');

const { Schema } = mongoose;

// Define Membership schema
const membershipSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'about to expire', 'active','denied', 'expired'],
    // about to expire on dec 31st
    // expired on jan 31st
    default: 'applied'
  },
  membershipType: {
    type: String,
    enum: ['single', 'singlefamily', 'family', 'seniorcitizen'],
    required: true
  },
  membershipID: {
    type: String,
    unique: true
  },
  dateOfApplication: {
    type: Date,
    default: Date.now
  },
  dateOfActive: {
    type: Date
  }
}, { timestamps: true });

// Create Membership model
const Membership = mongoose.model('Membership', membershipSchema);

// Pre-save hook to generate and assign membership ID
membershipSchema.pre("save", async function (next) {
  try {
    if (this.status === 'active' && !this.membershipID) {
      // Find the last membership in the database
      const lastMembership = await Membership.findOne({}, {}, { sort: { createdAt: -1 } });
      let lastMembershipNumber = 0;
      if (lastMembership && lastMembership.membershipID) {
        // Extract the last membership number
        const lastMembershipNumberStr = lastMembership.membershipID.match(/\d+/);
        if (lastMembershipNumberStr) {
          lastMembershipNumber = parseInt(lastMembershipNumberStr[0]);
        }
      }
      // Increment the last membership number
      const newMembershipNumber = lastMembershipNumber + 1;
      // Assign the new membership ID
      this.membershipID = `SB${newMembershipNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = Membership;
