const express = require("express");
const { db, auth } = require("./firebase"); // Import Firebase Admin SDK for auth and Firestore
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating JWT
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

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Authenticate user with Firebase Authentication
    const userRecord = await auth.getUserByEmail(email);

    // Fetch user data from Firestore
    const userDoc = await db.collection("users").doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User data not found. Please contact support." });
    }

    const userData = userDoc.data();

    // Log Firestore data for debugging
    console.log("User data from Firestore:", userData);

    // Check if passwordHash exists
    if (!userData.passwordHash) {
      return res.status(500).json({ error: "Password hash not found for the user." });
    }

    // Verify hashed password
    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please try again." });
    }

    // Fetch the user's role
    const { role } = userData;

    // Generate a JWT token with user UID and role as the payload
    const token = jwt.sign(
      { uid: userRecord.uid, role: role },
      JWT_SECRET_KEY,
      { expiresIn: "1h" } // Token expires in 1 hour (adjust as necessary)
    );

    // Respond with the token and user details
    res.status(200).json({
      message: "Login successful",
      role,
      uid: userRecord.uid,
      token, // Include the token in the response
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Protected route example (only accessible with valid JWT)
app.post("/createUser", verifyToken, async (req, res) => {
  const { email, password, name, role } = req.body;

  // Validate input
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Email, password, name, and role are required." });
  }

  // Ensure the logged-in user has the appropriate role to create new users
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "You do not have permission to create new users." });
  }

  try {
    // Step 1: Check if the email is already in use in Firebase Authentication
    const userRecord = await auth.getUserByEmail(email);
    if (userRecord) {
      return res.status(400).json({ error: "Email is already in use. Please choose another email." });
    }
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      return res.status(500).json({ error: error.message });
    }
  }

  // Step 2: Hash the password before saving it to Firestore
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Step 3: Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password
    });

    // Step 4: Save user data (name, role, hashed password) in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role,
      passwordHash: hashedPassword,
      createdAt: new Date()
    });

    // Step 5: Respond with success message
    res.status(201).json({
      message: `User ${email} created successfully with role: ${role}`,
      userId: userRecord.uid
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
