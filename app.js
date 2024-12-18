const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use(express.json());  // Middleware for JSON parsing

// Register all routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
