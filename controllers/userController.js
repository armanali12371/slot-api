// const { db, auth } = require('../models/firebase');
const { db, auth, storage } = require('../models/firebase');
const bcrypt = require('bcrypt');
const { verifyToken } = require('../middleware/authMiddleware');
// const { storage } = require('../models/firebase');  // Import storage if using Firebase Storage for profile pictures

// Create User function
const createUser = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Email, password, name, and role are required." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "You do not have permission to create new users." });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (userRecord) {
      return res.status(400).json({ error: "Email is already in use. Please choose another email." });
    }
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      return res.status(500).json({ error: error.message });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userRecord = await auth.createUser({ email, password });
    
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: `User ${email} created successfully with role: ${role}`,
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update Profile function
const updateProfile = async (req, res) => {
  const { userId, name, age, profilePicture } = req.body;

  // Validate input fields
  if (!userId || !name || !age) {
    return res.status(400).json({ error: "UserId, name, and age are required." });
  }

  // Ensure that the logged-in user is trying to update their own profile
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "You are not authorized to update this profile." });
  }

  try {
    let updatedProfilePictureURL = null;

    // Handle profile picture upload (if provided)
    if (profilePicture) {
      const storageRef = storage.bucket().file(`profilePictures/${userId}`);
      const buffer = Buffer.from(profilePicture, 'base64');  // Convert the base64 string to a buffer
      const uploadResult = await storageRef.save(buffer);
      updatedProfilePictureURL = `https://storage.googleapis.com/${storage.bucket().name}/profilePictures/${userId}`;
    }

    // Update user data in Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    // Prepare the update data, only include the profilePictureURL if it's defined
    const updateData = {
      name,
      age,
    };

    if (updatedProfilePictureURL) {
      updateData.profilePictureURL = updatedProfilePictureURL;
    }

    await userRef.update(updateData);

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserList = async (req, res) => {
  const userRole = req.user.role; // Role of the user (admin)

  // Check if the logged-in user is an admin
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can access this resource.' });
  }

  try {
    const usersSnapshot = await db.collection('users').get();

    // Extract and format user data
    const users = [];
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      users.push({
        UserID: doc.id,
        Name: user.name,
        Email: user.email,
        Role: user.role,
        // CreatedAt: new Date(user.createdAt.toDate()).toLocaleString(),
      });
    });

    res.status(200).json({
      message: 'Users retrieved successfully!',
      users,
    });
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// New endpoint to get data for a specific user by UserID
const getUserById = async (req, res) => {


  const userId = req.params.id; // Get user ID from the URL parameter

  try {
    const userDoc = await db.collection('users').doc(userId).get();

    // If the user is not found
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userDoc.data();
    res.status(200).json(
      user
    );
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    res.status(500).json({ error: error.message });
  }
};
module.exports = { createUser, updateProfile , getUserList,getUserById};
