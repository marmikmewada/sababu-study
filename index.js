// index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); // Import the connectDB function
const multer = require('multer');
const path = require('path');
const firebaseStorage = require('./config/firebase');
const userRoutes = require("./routes/userRoutes"); // Correct path to userRoutes.js

const app = express();
const port = 3000;

// Set up CORS middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors());

app.use('/api/users', userRoutes); // Mount user routes under /api/users

// Connect to MongoDB and start the server
connectDB().then(() => {
  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
