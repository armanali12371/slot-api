const express = require('express');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { db, auth } = require("./firebase"); // Import Firebase Admin SDK for auth and Firestore
const taskRoutes = require('./routes/taskRoutes');  // Import task routes

const app = express();

// Enable CORS with specific configurations
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL (can be updated if necessary)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(express.json());

app.use('/auth', authRoutes);  // Auth routes
app.use('/user', userRoutes);  // User routes
app.use('/task', taskRoutes);  // Task routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
