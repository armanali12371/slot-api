// const { auth } = require('../models/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config(); // Load environment variables from .env file

// Now you can access them
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { db, auth } = require("../models/firebase"); // Adjust if needed

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);

    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User data not found. Please contact support." });
    }

    const userData = userDoc.data();

    if (!userData.passwordHash) {
      return res.status(500).json({ error: "Password hash not found for the user." });
    }

    const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please try again." });
    }

    const { role } = userData;

    const token = jwt.sign(
      { uid: userRecord.uid, role: role },
      JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login successful",
      role,
      uid: userRecord.uid,
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login };
