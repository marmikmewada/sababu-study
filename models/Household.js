const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Household schema
const HouseholdSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  spouse: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    email: {
      type: String
    },
    birthdate: {
      type: Date
    },
    sex: {
      type: String
    },
    nationality: {
      type: String
    },
    address: {
      street: {
        type: String
      },
      apt: {
        type: String 
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      zip: {
        type: String
      }
    }
  },
  children: [{
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    email: {
      type: String
    },
    birthdate: {
      type: Date
    },
    sex: {
      type: String
    },
    nationality: {
      type: String
    },
    address: {
      street: {
        type: String
      },
      apt: {
        type: String 
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      zip: {
        type: String
      }
    }
  }],
  adultDependents: [{
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    email: {
      type: String
    },
    birthdate: {
      type: Date
    },
    sex: {
      type: String
    },
    nationality: {
      type: String
    },
    address: {
      street: {
        type: String
      },
      apt: {
        type: String 
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      zip: {
        type: String
      }
    }
  }]
});

// Create and export the Household model
module.exports = mongoose.model('Household', HouseholdSchema);
