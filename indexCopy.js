const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); // Import the connectDB function
const userRoutes = require("./routes/userRoutes"); // Correct path to userRoutes.js
const Event = require("./models/Event"); // Import the Event model
const cron = require('node-cron');
const moment = require('moment-timezone');

const app = express();
const port = 3000;

// Set up CORS middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());

app.use('/users', userRoutes); // Mount user routes under /api/users

// Define the updateEventStatus function...
// (Your existing updateEventStatus function here)
// Define the updateEventStatus function
const updateEventStatus = async () => {
  try {
    // Retrieve events from the database where eventStatus is active and isApproved is true
    const events = await Event.find({ eventStatus: 'active', isApproved: true });

    // Loop through each event and update its status based on conditions
    for (const event of events) {
      // Get the current time in the city's timezone
      const cityTimeZone = event.address.cityTimeZone; // Assuming the Event model has a cityTimeZone field
      const currentTimeCityTZ = moment.tz(new Date(), cityTimeZone);

      // Check if the event has finished
      if (event.endTime && moment.tz(event.endTime, cityTimeZone) <= currentTimeCityTZ) {
        event.eventStatus = 'finished';
      } else {
        // Reset event status to active if it's not finished
        event.eventStatus = 'active';
        
        // Check if the event is full
        if (event.visitors && event.capacity && event.visitors >= event.capacity) {
          event.eventStatus = 'full';
        }
      }

      // Save the updated event
      await event.save();
    }

    console.log('Event statuses updated successfully.'); // Log success message
  } catch (error) {
    console.error('Error updating event statuses:', error); // Log error message
  }
};



// Define the markAsAboutToExpire function
// Define the markAsAboutToExpire function
const markAsAboutToExpire = async () => {
  try {
    // Find all memberships where status is not "expired"
    const memberships = await Membership.find({ status: { $ne: 'expired' } });

    // Update the status of each membership to "about to expire"
    for (const membership of memberships) {
      membership.status = 'about to expire';
      await membership.save();
    }

    console.log('Marked memberships as about to expire successfully.');
  } catch (error) {
    console.error('Error marking memberships as about to expire:', error);
  }
};

// Define the markAsExpired function
const markAsExpired = async () => {
  try {
    // Find all memberships where status is "about to expire"
    const memberships = await Membership.find({ status: 'about to expire' });

    // Update the status of each membership to "expired"
    for (const membership of memberships) {
      membership.status = 'expired';
      await membership.save();
    }

    console.log('Marked memberships as expired successfully.');
  } catch (error) {
    console.error('Error marking memberships as expired:', error);
  }
};


// Schedule markAsAboutToExpire to run on December 31st at midnight (New York time)
cron.schedule('0 0 31 12 *', async () => {
  // Ensure the function runs only once a year
  if (moment().month() === 11 && moment().date() === 31) {
    await markAsAboutToExpire();
  }
}, {
  timezone: 'America/New_York' // Set the timezone to New York
});

// Schedule markAsExpired to run on January 31st at midnight (New York time)
cron.schedule('0 0 31 1 *', async () => {
  // Ensure the function runs only once a year
  if (moment().month() === 0 && moment().date() === 31) {
    await markAsExpired();
  }
}, {
  timezone: 'America/New_York' // Set the timezone to New York
});

// Connect to MongoDB and start the server
connectDB().then(() => {
  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

  // Call updateEventStatus function every 2 hours (in milliseconds)
  setInterval(updateEventStatus, 2 * 60 * 60 * 1000);
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
