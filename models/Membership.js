
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
  dateOfApplication: {
    type: Date,
    default: Date.now
  },
  dateOfActive: {
    type: Date
  }
}, { timestamps: true });

// Create Membership model
// const Membership = mongoose.model('Membership', membershipSchema);

// module.exports = { Membership, membershipSchema };
module.exports = mongoose.model('Membership', membershipSchema);












// const mongoose = require('mongoose');

// const { Schema } = mongoose;

// // Define Membership schema
// const membershipSchema = new Schema({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['applied', 'about to expire', 'active','denied', 'expired'],
//     // about to expire on dec 31st
//     // expired on jan 31st
//     default: 'applied'
//   },
//   membershipType: {
//     type: String,
//     enum: ['single', 'singlefamily', 'family', 'seniorcitizen'],
//     required: true
//   },
//   dateOfApplication: {
//     type: Date,
//     default: Date.now
//   },
//   dateOfActive: {
//     type: Date
//   }
// }, { timestamps: true });

// // Create Membership model
// const Membership = mongoose.model('Membership', membershipSchema);

// // Pre-save hook to generate and assign membership ID
// // Pre-save hook to generate and assign membership ID when updating
// // membershipSchema.pre("save", async function (next) {
// //   try {
// //     if (this.isNew && this.status === 'active' && !this.membershipID) {
// //       let newMembershipNumber = 1;
// //       const lastMembership = await Membership.findOne({}, {}, { sort: { createdAt: -1 } });
// //       if (lastMembership && lastMembership.membershipID) {
// //         const lastMembershipNumberStr = lastMembership.membershipID.match(/\d+/);
// //         if (lastMembershipNumberStr) {
// //           newMembershipNumber = parseInt(lastMembershipNumberStr[0]) + 1;
// //         }
// //       }
// //       this.membershipID = `SB${newMembershipNumber}`;
// //     }
// //     next();
// //   } catch (error) {
// //     next(error);
// //   }
// // });


// module.exports = { Membership, membershipSchema };
