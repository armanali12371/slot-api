const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
const { db, auth } = require("./firebase"); // Import Firebase Admin SDK for auth and Firestore
const taskRoutes = require('./routes/taskRoutes');  // Import task routes


app.use(express.json());

app.use('/auth', authRoutes);  // Auth routes
app.use('/user', userRoutes);  // User routes
app.use('/task', taskRoutes);  // Task routes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
