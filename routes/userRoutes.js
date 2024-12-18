const express = require('express');
const { createUser, updateProfile, getUserList } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { updateUserProfile } = require("../controllers/profileController");
const router = express.Router();

router.post('/createUser', verifyToken, createUser);
router.post("/updateProfile", verifyToken, updateProfile);
router.get('/list', verifyToken, getUserList); // Get User List


module.exports = router;
