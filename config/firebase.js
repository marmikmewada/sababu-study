// config/firebase.js

const admin = require('firebase-admin');
// const path = require('path');

// Load Firebase service account key
const serviceAccount = require("../firebase.json");;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://sababufund-541e1.appspot.com' 
});

// Get a reference to the Firebase Storage service
const storage = admin.storage();  

module.exports = storage;
