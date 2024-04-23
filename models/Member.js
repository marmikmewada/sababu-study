const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Member schema
const MemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  maritalStatus: {
    type: String,
  },
  hometown: {
    type: String,
  },
  nationality: {
    type: String,
  },
  origin: { 
    type: String,
  },
  employment: {
    company: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    workAddress: {
      type: String,
    },
    workPhone: {
      type: String,
    },
    workEmail: {
      type: String,
    },
    employmentStatus: {
      type: String,
    },
  },
  documents: {
    passport: {
      number: {
        type: String,
      },
      expirationDate: {
        type: Date,
      },
    },
    driverLicense: {
      number: {
        type: String,
      },
      expirationDate: {
        type: Date,
      },
      state: { 
        type: String,
      },
    },
  },
  emergencyContact: [
    {
      relation: {
        type: String,
      },
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
      address: {
        apt: {
          type: String,
        },
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        zip: {
          type: String,
        },
      },
    },
  ],
  address: { 
    apt: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zip: {
      type: String,
    },
  },

});

module.exports = mongoose.model("Member", MemberSchema);
