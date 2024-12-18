const admin = require('firebase-admin');
const serviceAccount = require('../slot-173c0-firebase-adminsdk-4ktha-2d4f55f4f8.json'); // Adjust path if necessary

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'slot-173c0.appspot.com', // Ensure this is correct
  });
}

// Initialize Firestore, Auth, and Storage
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage().bucket();  // Firebase Storage service instance

// Test Storage - Upload a test file
// const testStorage = async () => {
//     try {
//       const file = await storage.file('testfile.txt').save('Hello, Firebase Storage!');
//       console.log('File uploaded successfully:', file);
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     }
// };

// testStorage();

module.exports = { db, auth, storage };
