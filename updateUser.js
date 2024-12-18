const express = require("express");
const { db, auth } = require("./firebase"); // Import Firebase Admin SDK for auth and Firestore
const multer = require("multer"); // For file upload handling (like profile pictures)
const { Storage } = require('@google-cloud/storage'); // For Google Cloud Storage handling (optional, if you're using it for profile pictures)
const jwt = require("jsonwebtoken"); // For JWT verification
const app = express();

app.use(express.json()); // Middleware for parsing JSON

// Secret key for JWT signing (store securely in environment variable)
const JWT_SECRET_KEY = "your_jwt_secret_key"; // You should move this to an environment variable

// Middleware to verify Firebase ID Token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token is missing or invalid." });
  }

  try {
    // Verify JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decodedToken; // Attach decoded user data to request object
    next(); // Proceed to the next middleware (in this case, the route handler)
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Define storage for file uploads (profile pictures)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update user route
app.put("/updateUser", verifyToken, upload.single("profilePicture"), async (req, res) => {
  const { userId, name, age } = req.body;
  const profilePicture = req.file; // Get the uploaded profile picture file

  // Ensure the logged-in user has the appropriate role (e.g., "user")
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "You do not have permission to update your profile." });
  }

  if (!userId || !name || !age) {
    return res.status(400).json({ error: "userId, name, and age are required." });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    // If a new profile picture is uploaded, handle the image upload
    let updatedProfilePictureURL = userDoc.data().profilePictureURL;

    if (profilePicture) {
      // Upload profile picture to Firebase Storage or Google Cloud Storage (or your chosen storage solution)
      const bucket = new Storage().bucket(); // You can configure the bucket for your storage
      const file = bucket.file(`profilePictures/${userId}`);
      await file.save(profilePicture.buffer, {
        metadata: { contentType: profilePicture.mimetype },
      });

      updatedProfilePictureURL = `https://storage.googleapis.com/${bucket.name}/profilePictures/${userId}`; // Or generate a signed URL if needed
    }

    // Update user data in Firestore
    await userRef.update({
      name,
      age,
      profilePictureURL: updatedProfilePictureURL,
    });

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
