// const { db, storage } = require('../models/firebase'); // Import Firebase connection
// const { verifyToken } = require('../middleware/authMiddleware');
// const { uploadBytes, getDownloadURL, ref } = require("firebase/storage");

// // Update user profile controller
// const updateUserProfile = async (req, res) => {
//   const { userId, name, age, profilePicture } = req.body;

//   // Validate input
//   if (!userId || !name || !age) {
//     return res.status(400).json({ error: "User ID, name, and age are required." });
//   }

//   // Check if the logged-in user has permission to update the profile
//   if (req.user.role !== "admin" && req.user.uid !== userId) {
//     return res.status(403).json({ error: "You do not have permission to update this profile." });
//   }

//   try {
//     // Fetch the user document from Firestore
//     const userDoc = await db.collection("users").doc(userId).get();

//     if (!userDoc.exists) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     const userData = userDoc.data();

//     // If a new profile picture is provided, upload it to Firebase Storage
//     let updatedProfilePictureURL = userData.profilePictureURL;

//     if (profilePicture) {
//       const storageRef = ref(storage, `profilePictures/${userId}`);
//       await uploadBytes(storageRef, profilePicture);
//       updatedProfilePictureURL = await getDownloadURL(storageRef);
//     }

//     // Update user data in Firestore
//     await db.collection("users").doc(userId).update({
//       name,
//       age,
//       profilePictureURL: updatedProfilePictureURL,
//     });

//     // Respond with success message
//     res.status(200).json({
//       message: "Profile updated successfully.",
//       userId: userId,
//       updatedProfilePictureURL: updatedProfilePictureURL,
//     });
//   } catch (error) {
//     console.error("Error updating profile:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { updateUserProfile };
