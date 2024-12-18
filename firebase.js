const admin = require('firebase-admin');
const serviceAccount = require('./slot-173c0-firebase-adminsdk-4ktha-2d4f55f4f8.json'); // Adjust the path

// Initialize Firebase Admin SDK
if (!admin.apps.length) { // Prevent reinitialization during hot reloads (for local development)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "slot-173c0.appspot.com", // Firebase storage bucket
  });
}

const db = admin.firestore(); // Firestore instance
const auth = admin.auth();    // Firebase Auth instance
const storage = admin.storage().bucket(); // Storage instance

module.exports = { db, auth, storage };

